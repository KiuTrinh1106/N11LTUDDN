from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import time
import uuid
from collections.abc import Callable, Mapping
from contextlib import closing
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Protocol
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, Response

logger = logging.getLogger(__name__)

SESSION_SECONDS_DEFAULT = 86_400
MAX_BODY_BYTES = 256 * 1024
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_MAX_FAILURES = 5
ROLES: dict[str, frozenset[str]] = {
    "READER": frozenset({"VIEW_DOCUMENT", "SEARCH_DOCUMENTS", "ASK_AI"}),
    "AUTHOR": frozenset(
        {
            "VIEW_DOCUMENT",
            "SEARCH_DOCUMENTS",
            "ASK_AI",
            "CREATE_DOCUMENT",
            "EDIT_DOCUMENT",
            "SUBMIT_REVIEW",
        }
    ),
    "REVIEWER": frozenset(
        {
            "VIEW_DOCUMENT",
            "SEARCH_DOCUMENTS",
            "ASK_AI",
            "READ_REVIEW_QUEUE",
            "APPROVE_REVIEW",
            "REJECT_REVIEW",
            "READ_VERSION_HISTORY",
        }
    ),
    "ADMIN": frozenset(
        {
            "VIEW_DOCUMENT",
            "SEARCH_DOCUMENTS",
            "ASK_AI",
            "READ_REVIEW_QUEUE",
            "APPROVE_REVIEW",
            "REJECT_REVIEW",
            "PUBLISH_DOCUMENT",
            "READ_VERSION_HISTORY",
            "MANAGE_USERS",
            "READ_AUDIT",
        }
    ),
}


class Store(Protocol):
    """Operations the HTTP API needs from either PostgreSQL or a test fake."""

    def find_user_by_email(self, email: str) -> dict[str, Any] | None: ...
    def find_user_by_id(self, user_id: str) -> dict[str, Any] | None: ...
    def create_session(self, user_id: str, expires_at: datetime) -> dict[str, Any]: ...
    def find_session(self, session_id: str) -> dict[str, Any] | None: ...
    def revoke_session(self, session_id: str) -> None: ...
    def record_audit(self, event: dict[str, Any]) -> None: ...
    def list_documents(self, role: str, actor_id: str) -> list[dict[str, Any]]: ...
    def create_document(self, data: dict[str, Any]) -> dict[str, Any]: ...
    def update_document_draft(self, data: dict[str, Any]) -> dict[str, Any]: ...
    def submit_document_for_review(self, document_id: str, actor_id: str) -> dict[str, Any]: ...
    def find_document_by_id(self, document_id: str) -> dict[str, Any] | None: ...
    def publish_document(self, document_id: str, actor_id: str) -> dict[str, Any]: ...
    def list_pending_reviews(self) -> list[dict[str, Any]]: ...
    def decide_review(self, data: dict[str, Any]) -> dict[str, Any]: ...
    def list_audit_events(self) -> list[dict[str, Any]]: ...
    def list_published_documents(self) -> list[dict[str, Any]]: ...


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.code = code


class WorkflowError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


def hash_password(password: str, salt: str | None = None) -> str:
    """Produce the same scrypt$<hex salt>$<hex digest> value as Node scryptSync."""
    salt_hex = salt if salt is not None else secrets.token_hex(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt_hex.encode("utf-8"),
        n=2**14,
        r=8,
        p=1,
        dklen=64,
        maxmem=64 * 1024 * 1024,
    )
    return f"scrypt${salt_hex}${digest.hex()}"


def verify_password(password: str, encoded_hash: str) -> bool:
    parts = encoded_hash.split("$")
    if len(parts) != 3 or parts[0] != "scrypt" or not parts[1] or not parts[2]:
        return False
    try:
        expected = bytes.fromhex(parts[2])
    except ValueError:
        return False
    if len(expected) == 0:
        return False
    actual = hashlib.scrypt(
        password.encode("utf-8"),
        salt=parts[1].encode("utf-8"),
        n=2**14,
        r=8,
        p=1,
        dklen=len(expected),
        maxmem=64 * 1024 * 1024,
    )
    return hmac.compare_digest(actual, expected)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def sign_session(session_id: str, expires_at: datetime, secret: str) -> str:
    epoch_ms = int(expires_at.timestamp() * 1000)
    payload = _b64url(
        json.dumps({"sid": session_id, "exp": epoch_ms}, separators=(",", ":")).encode("utf-8")
    )
    signature = _b64url(hmac.new(secret.encode("utf-8"), payload.encode("ascii"), hashlib.sha256).digest())
    return f"{payload}.{signature}"


def read_session_token(
    token: str, secret: str, now_ms: int | None = None
) -> dict[str, Any] | None:
    pieces = token.split(".")
    if len(pieces) != 2 or not all(pieces):
        return None
    payload, signature = pieces
    try:
        supplied = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
        raw_payload = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
    except (ValueError, base64.binascii.Error):
        return None
    expected = hmac.new(secret.encode("utf-8"), payload.encode("ascii"), hashlib.sha256).digest()
    if not hmac.compare_digest(expected, supplied):
        return None
    try:
        claims = json.loads(raw_payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None
    current_ms = int(time.time() * 1000) if now_ms is None else now_ms
    if (
        not isinstance(claims, dict)
        or not isinstance(claims.get("sid"), str)
        or not isinstance(claims.get("exp"), (float, int))
        or isinstance(claims.get("exp"), bool)
        or claims["exp"] <= current_ms
    ):
        return None
    return {"sessionId": claims["sid"], "expiresAt": datetime.fromtimestamp(claims["exp"] / 1000, timezone.utc)}


def _has_permission(role: str, permission: str) -> bool:
    return permission in ROLES.get(role, frozenset())


def _public_user(user: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "displayName": user["displayName"],
        "role": user["role"],
        "isActive": user["isActive"],
    }


def _document_for_role(document: dict[str, Any], role: str) -> dict[str, Any]:
    if role in {"REVIEWER", "ADMIN"}:
        return document
    safe_document = dict(document)
    safe_document["reviewRequests"] = []
    safe_document["versions"] = [
        version
        for version in document.get("versions", [])
        if version.get("version") == document.get("currentVersion")
    ]
    if role == "READER":
        safe_document["reviewerComment"] = None
    return safe_document


def _valid_document_input(body: Any) -> bool:
    if not isinstance(body, dict):
        return False
    title = body.get("title")
    content = body.get("content")
    category = body.get("category")
    description = body.get("description")
    tags = body.get("tags")
    return (
        isinstance(title, str)
        and bool(title.strip())
        and len(title.strip()) <= 200
        and isinstance(content, str)
        and bool(content.strip())
        and isinstance(category, str)
        and bool(category.strip())
        and len(category.strip()) <= 80
        and ("description" not in body or isinstance(description, str))
        and ("description" not in body or len(description) <= 500)
        and (
            "tags" not in body
            or (
                isinstance(tags, list)
                and len(tags) <= 20
                and all(isinstance(tag, str) and len(tag.strip()) <= 80 for tag in tags)
            )
        )
    )


async def _read_json(request: Request) -> Any:
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise ApiError(413, "INVALID_REQUEST", "Request body too large")
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ApiError(400, "INVALID_REQUEST", "Invalid JSON body") from None


def _error(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message}},
        headers={"cache-control": "no-store"},
    )


def _normalize_exception(error: Exception) -> tuple[int, str, str]:
    if isinstance(error, ApiError):
        return error.status, error.code, str(error)
    message = str(error)
    if any(text in message for text in ("Can't reach database server", "ECONNREFUSED", "database server")):
        return (
            503,
            "DATABASE_UNAVAILABLE",
            "Database is unavailable. Start PostgreSQL and verify your DATABASE_URL settings.",
        )
    if "DATABASE_URL" in message or "Environment variable" in message:
        return (
            500,
            "CONFIG_ERROR",
            "Database configuration is invalid. Check DATABASE_URL and the local environment file.",
        )
    return 500, "INTERNAL_ERROR", "The request could not be completed"


def _clean_database_url(database_url: str) -> str:
    parts = urlsplit(database_url)
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key != "schema"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


class PostgresStore:
    """Direct SQL adapter for the existing Prisma PostgreSQL tables."""

    def __init__(self, database_url: str) -> None:
        self.database_url = _clean_database_url(database_url) if database_url else ""

    @classmethod
    def from_environment(cls) -> PostgresStore:
        return cls(os.environ.get("DATABASE_URL", ""))

    def _connection(self) -> Any:
        import psycopg2

        if not self.database_url:
            raise RuntimeError("DATABASE_URL is required")
        return psycopg2.connect(self.database_url)

    @staticmethod
    def _dict_row(cursor: Any, row: Any) -> dict[str, Any] | None:
        if row is None:
            return None
        return {column.name: value for column, value in zip(cursor.description, row)}

    def _query_one(self, sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
        with closing(self._connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(sql, params)
                    return self._dict_row(cursor, cursor.fetchone())

    def _query_all(self, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
        with closing(self._connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(sql, params)
                    return [self._dict_row(cursor, row) or {} for row in cursor.fetchall()]

    def _transaction(self, operation: Callable[[Any], Any]) -> Any:
        with closing(self._connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    return operation(cursor)

    @staticmethod
    def _audit(cursor: Any, event: Mapping[str, Any]) -> None:
        cursor.execute(
            """INSERT INTO audit_events (id, actor_id, action, object_type, object_id, result)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (
                str(uuid.uuid4()),
                event.get("actorId"),
                event["action"],
                event["objectType"],
                event["objectId"],
                event["result"],
            ),
        )

    def health_check(self) -> None:
        self._query_one("SELECT 1")

    def find_user_by_email(self, email: str) -> dict[str, Any] | None:
        return self._query_one(
            """SELECT id::text AS id, email, "password_hash" AS "passwordHash",
                      "display_name" AS "displayName", role::text AS role,
                      is_active AS "isActive"
               FROM users WHERE email = %s""",
            (email,),
        )

    def find_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        return self._query_one(
            """SELECT id::text AS id, email, "password_hash" AS "passwordHash",
                      "display_name" AS "displayName", role::text AS role,
                      is_active AS "isActive"
               FROM users WHERE id = %s::uuid""",
            (user_id,),
        )

    def create_session(self, user_id: str, expires_at: datetime) -> dict[str, Any]:
        return self._query_one(
            """INSERT INTO auth_sessions (id, user_id, expires_at)
               VALUES (%s::uuid, %s::uuid, %s)
               RETURNING id::text AS id, user_id::text AS "userId",
                         expires_at AS "expiresAt", revoked_at AS "revokedAt" """,
            (str(uuid.uuid4()), user_id, expires_at),
        ) or {}

    def find_session(self, session_id: str) -> dict[str, Any] | None:
        return self._query_one(
            """SELECT id::text AS id, user_id::text AS "userId",
                      expires_at AS "expiresAt", revoked_at AS "revokedAt"
               FROM auth_sessions WHERE id = %s::uuid""",
            (session_id,),
        )

    def revoke_session(self, session_id: str) -> None:
        self._query_one(
            """UPDATE auth_sessions SET revoked_at = now()
               WHERE id = %s::uuid RETURNING id""",
            (session_id,),
        )

    def record_audit(self, event: dict[str, Any]) -> None:
        self._transaction(lambda cursor: self._audit(cursor, event))

    @staticmethod
    def _load_document(cursor: Any, document_id: str) -> dict[str, Any] | None:
        cursor.execute(
            """SELECT d.id, d.title, d.description, d.content, d.category, d.tags,
                      d.status::text AS status, d.reviewer_comment AS "reviewerComment",
                      d.current_version AS "currentVersion", d.created_at AS "createdAt",
                      d.updated_at AS "updatedAt", d.author_id::text AS "authorId",
                      a."display_name" AS "authorDisplayName"
               FROM documents d JOIN users a ON a.id = d.author_id
               WHERE d.id = %s""",
            (document_id,),
        )
        document = PostgresStore._dict_row(cursor, cursor.fetchone())
        if document is None:
            return None
        cursor.execute(
            """SELECT v.version, v.title, v.content, v.published_at AS "publishedAt",
                      p."display_name" AS "publisherDisplayName"
               FROM document_versions v JOIN users p ON p.id = v.published_by
               WHERE v.document_id = %s ORDER BY v.published_at ASC""",
            (document_id,),
        )
        document["versions"] = [
            {
                "version": row["version"],
                "title": row["title"],
                "content": row["content"],
                "publishedAt": row["publishedAt"],
                "publisher": {"displayName": row["publisherDisplayName"]},
            }
            for row in (PostgresStore._dict_row(cursor, item) or {} for item in cursor.fetchall())
        ]
        cursor.execute(
            """SELECT id::text AS id, status::text AS status,
                      decision_reason AS "decisionReason"
               FROM review_requests WHERE document_id = %s
               ORDER BY submitted_at DESC LIMIT 1""",
            (document_id,),
        )
        latest_review = PostgresStore._dict_row(cursor, cursor.fetchone())
        document["reviewRequests"] = [] if latest_review is None else [latest_review]
        document["author"] = {"displayName": document.pop("authorDisplayName")}
        return document

    def _load_documents(self, document_ids: list[str]) -> list[dict[str, Any]]:
        with closing(self._connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    documents = [self._load_document(cursor, document_id) for document_id in document_ids]
                    return [item for item in documents if item is not None]

    def list_documents(self, role: str, actor_id: str) -> list[dict[str, Any]]:
        if role == "READER":
            where, params = "WHERE status = 'PUBLISHED'", ()
        elif role == "AUTHOR":
            where, params = "WHERE status = 'PUBLISHED' OR author_id = %s::uuid", (actor_id,)
        else:
            where, params = "", ()
        ids = self._query_all(
            f"""SELECT id FROM documents {where} ORDER BY updated_at DESC""",
            params,
        )
        return self._load_documents([str(row["id"]) for row in ids])

    def list_published_documents(self) -> list[dict[str, Any]]:
        rows = self._query_all(
            """SELECT id, title, description, content, category, tags,
                      current_version AS "currentVersion"
               FROM documents WHERE status = 'PUBLISHED' ORDER BY updated_at DESC"""
        )
        return rows

    def find_document_by_id(self, document_id: str) -> dict[str, Any] | None:
        with closing(self._connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    return self._load_document(cursor, document_id)

    def create_document(self, data: dict[str, Any]) -> dict[str, Any]:
        document_id = "c" + secrets.token_urlsafe(18)

        def operation(cursor: Any) -> dict[str, Any]:
            cursor.execute(
                """INSERT INTO documents
                   (id, title, description, content, category, tags, status,
                    current_version, author_id, created_at, updated_at)
                   VALUES (%s, %s, %s, %s, %s, %s, 'DRAFT', 'Draft', %s::uuid, now(), now())""",
                (
                    document_id,
                    data["title"],
                    data["description"],
                    data["content"],
                    data["category"],
                    data["tags"],
                    data["actorId"],
                ),
            )
            self._audit(
                cursor,
                {
                    "actorId": data["actorId"],
                    "action": "CREATE",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "SUCCESS",
                },
            )
            return self._load_document(cursor, document_id) or {}

        return self._transaction(operation)

    def update_document_draft(self, data: dict[str, Any]) -> dict[str, Any]:
        document_id, actor_id = data["documentId"], data["actorId"]

        def operation(cursor: Any) -> dict[str, Any]:
            cursor.execute("SELECT id FROM documents WHERE id = %s FOR UPDATE", (document_id,))
            if cursor.fetchone() is None:
                raise WorkflowError("NOT_FOUND", "Document not found")
            cursor.execute(
                """UPDATE documents SET title = %s, description = %s, content = %s,
                          category = %s, tags = %s, status = 'DRAFT',
                          reviewer_comment = NULL, current_version = 'Draft', updated_at = now()
                   WHERE id = %s AND author_id = %s::uuid AND status IN ('DRAFT', 'REJECTED')
                   RETURNING id""",
                (
                    data["title"],
                    data["description"],
                    data["content"],
                    data["category"],
                    data["tags"],
                    document_id,
                    actor_id,
                ),
            )
            if cursor.fetchone() is None:
                raise WorkflowError("INVALID_STATE", "Document cannot be edited")
            self._audit(
                cursor,
                {
                    "actorId": actor_id,
                    "action": "EDIT",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "SUCCESS",
                },
            )
            return self._load_document(cursor, document_id) or {}

        return self._transaction(operation)

    def submit_document_for_review(self, document_id: str, actor_id: str) -> dict[str, Any]:
        def operation(cursor: Any) -> dict[str, Any]:
            cursor.execute("SELECT title FROM documents WHERE id = %s FOR UPDATE", (document_id,))
            current = cursor.fetchone()
            if current is None:
                raise WorkflowError("NOT_FOUND", "Document not found")
            cursor.execute(
                """UPDATE documents SET status = 'REVIEWING', reviewer_comment = NULL, updated_at = now()
                   WHERE id = %s AND author_id = %s::uuid AND status IN ('DRAFT', 'REJECTED')
                   RETURNING title""",
                (document_id, actor_id),
            )
            updated = cursor.fetchone()
            if updated is None:
                raise WorkflowError("INVALID_STATE", "Document cannot be submitted")
            review_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO review_requests (id, title, document_id, submitted_by_id)
                   VALUES (%s::uuid, %s, %s, %s::uuid)
                   RETURNING id::text AS id, document_id AS "documentId",
                             title, status::text AS status, submitted_at AS "submittedAt" """,
                (review_id, updated[0], document_id, actor_id),
            )
            result = self._dict_row(cursor, cursor.fetchone()) or {}
            self._audit(
                cursor,
                {
                    "actorId": actor_id,
                    "action": "SUBMIT_REVIEW",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "SUCCESS",
                },
            )
            return result

        return self._transaction(operation)

    def publish_document(self, document_id: str, actor_id: str) -> dict[str, Any]:
        def operation(cursor: Any) -> dict[str, Any]:
            cursor.execute(
                """SELECT title, content, status::text AS status
                   FROM documents WHERE id = %s FOR UPDATE""",
                (document_id,),
            )
            document = self._dict_row(cursor, cursor.fetchone())
            if document is None:
                raise WorkflowError("NOT_FOUND", "Document not found")
            if document["status"] != "APPROVED":
                raise WorkflowError("INVALID_STATE", "Document is not approved")
            cursor.execute(
                """SELECT version FROM document_versions WHERE document_id = %s""",
                (document_id,),
            )
            previous = 0.0
            for row in cursor.fetchall():
                number = re.sub(r"^v", "", row[0], count=1, flags=re.IGNORECASE)
                try:
                    value = float(number)
                except ValueError:
                    continue
                if value == value and abs(value) != float("inf"):
                    previous = max(previous, value)
            next_version = "v1.0" if previous == 0 else f"v{previous + 0.1:.1f}"
            cursor.execute(
                """UPDATE documents SET status = 'PUBLISHED', current_version = %s,
                          reviewer_comment = NULL, updated_at = now()
                   WHERE id = %s AND status = 'APPROVED' RETURNING id""",
                (next_version, document_id),
            )
            if cursor.fetchone() is None:
                raise WorkflowError("INVALID_STATE", "Document is not approved")
            cursor.execute(
                """INSERT INTO document_versions
                   (id, document_id, version, title, content, published_by, published_at)
                   VALUES (%s, %s, %s, %s, %s, %s::uuid, now())""",
                ("c" + secrets.token_urlsafe(18), document_id, next_version, document["title"], document["content"], actor_id),
            )
            self._audit(
                cursor,
                {
                    "actorId": actor_id,
                    "action": "PUBLISH",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "SUCCESS",
                },
            )
            return self._load_document(cursor, document_id) or {}

        return self._transaction(operation)

    def list_pending_reviews(self) -> list[dict[str, Any]]:
        rows = self._query_all(
            """SELECT r.id::text AS id, r.title, r.document_id AS "documentId",
                      su."display_name" AS "submitterName", r.submitted_at AS "submittedAt",
                      d.category, au."display_name" AS "authorName"
               FROM review_requests r
               JOIN users su ON su.id = r.submitted_by_id
               LEFT JOIN documents d ON d.id = r.document_id
               LEFT JOIN users au ON au.id = d.author_id
               WHERE r.status = 'PENDING' ORDER BY r.submitted_at ASC"""
        )
        return [
            {
                "id": row["id"],
                "title": row["title"],
                "documentId": row["documentId"],
                "submittedBy": {"displayName": row["submitterName"]},
                "submittedAt": row["submittedAt"],
                "document": (
                    None
                    if row["category"] is None
                    else {"category": row["category"], "author": {"displayName": row["authorName"]}}
                ),
            }
            for row in rows
        ]

    def decide_review(self, data: dict[str, Any]) -> dict[str, Any]:
        def operation(cursor: Any) -> dict[str, Any]:
            cursor.execute(
                """SELECT document_id AS "documentId", status::text AS status
                   FROM review_requests WHERE id = %s::uuid FOR UPDATE""",
                (data["reviewId"],),
            )
            current = self._dict_row(cursor, cursor.fetchone())
            if current is None:
                raise WorkflowError("NOT_FOUND", "Review request not found")
            if current["status"] != "PENDING":
                raise WorkflowError("INVALID_STATE", "Review request is no longer pending")
            cursor.execute(
                """UPDATE review_requests SET status = %s, reviewer_id = %s::uuid,
                          decision_reason = %s, reviewed_at = now()
                   WHERE id = %s::uuid AND status = 'PENDING'
                   RETURNING id::text AS id, title, document_id AS "documentId",
                             status::text AS status, reviewer_id::text AS "reviewerId",
                             decision_reason AS "decisionReason", reviewed_at AS "reviewedAt" """,
                (data["decision"], data["reviewerId"], data["reason"], data["reviewId"]),
            )
            result = self._dict_row(cursor, cursor.fetchone())
            if result is None:
                raise WorkflowError("INVALID_STATE", "Review request is no longer pending")
            document_id = current["documentId"]
            if document_id:
                cursor.execute(
                    """UPDATE documents SET status = %s, reviewer_comment = %s, updated_at = now()
                       WHERE id = %s AND status = 'REVIEWING' RETURNING id""",
                    (data["decision"], data["reason"], document_id),
                )
                if cursor.fetchone() is None:
                    raise WorkflowError("INVALID_STATE", "Document is no longer in review")
            action = "APPROVE" if data["decision"] == "APPROVED" else "REJECT"
            self._audit(
                cursor,
                {
                    "actorId": data["reviewerId"],
                    "action": action,
                    "objectType": "REVIEW_REQUEST",
                    "objectId": data["reviewId"],
                    "result": "SUCCESS",
                },
            )
            return result

        return self._transaction(operation)

    def list_audit_events(self) -> list[dict[str, Any]]:
        rows = self._query_all(
            """SELECT e.id::text AS id, e.actor_id::text AS "actorId", e.action,
                      e.object_type AS "objectType", e.object_id AS "objectId",
                      e.result::text AS result, e.occurred_at AS "occurredAt",
                      u."display_name" AS "actorDisplayName"
               FROM audit_events e LEFT JOIN users u ON u.id = e.actor_id
               ORDER BY e.occurred_at DESC LIMIT 200"""
        )
        return [
            {
                "id": row["id"],
                "actorId": row["actorId"],
                "action": row["action"],
                "objectType": row["objectType"],
                "objectId": row["objectId"],
                "result": row["result"],
                "occurredAt": row["occurredAt"],
                "actor": None if row["actorDisplayName"] is None else {"displayName": row["actorDisplayName"]},
            }
            for row in rows
        ]


def _search_terms(value: str) -> list[str]:
    return [term for term in re.split(r"[^a-zA-ZÀ-ỹ0-9]+", value.lower()) if len(term) >= 2]


def _excerpt_for(document: Mapping[str, Any], terms: list[str]) -> str:
    text = f"{document['title']}. {document['description']} {document['content']}"
    normalized = text.lower()
    match = next((term for term in terms if term in normalized), None)
    if match is None:
        return re.sub(r"\s+", " ", text[:240]).strip()
    position = normalized.index(match)
    return re.sub(r"\s+", " ", text[max(0, position - 90) : position + 220]).strip()


def _map_workflow_error(error: WorkflowError, action: str) -> ApiError:
    if error.code == "NOT_FOUND":
        if action == "review":
            return ApiError(404, "REVIEW_NOT_FOUND", "Review request was not found")
        return ApiError(404, "DOCUMENT_NOT_FOUND", "Document was not found")
    if action == "edit":
        return ApiError(409, "DOCUMENT_NOT_EDITABLE", "Only your Draft or Rejected documents can be edited")
    if action == "submit":
        return ApiError(409, "DOCUMENT_NOT_SUBMITTABLE", "Only your Draft or Rejected documents can be submitted")
    if action == "publish":
        return ApiError(409, "DOCUMENT_NOT_APPROVED", "Only approved documents can be published")
    return ApiError(409, "REVIEW_NOT_PENDING", "Review request is no longer pending")


def create_app(
    store: Store | None = None,
    secret: str | None = None,
    session_ttl_seconds: int = SESSION_SECONDS_DEFAULT,
) -> FastAPI:
    """Build an API instance; inject a Store fake to exercise routes without PostgreSQL."""
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        pass
    auth_secret = secret if secret is not None else os.environ.get("AUTH_SECRET", "")
    if secret is not None and len(secret) < 32:
        raise ValueError("AUTH_SECRET must contain at least 32 characters")
    backend_store = store if store is not None else PostgresStore.from_environment()
    login_attempts: dict[tuple[str, str], tuple[int, float]] = {}
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

    @app.exception_handler(ApiError)
    async def handle_api_error(_request: Request, error: ApiError) -> JSONResponse:
        return _error(error.status, error.code, str(error))

    @app.exception_handler(Exception)
    async def normalize_unexpected_error(_request: Request, error: Exception) -> JSONResponse:
        status, code, message = _normalize_exception(error)
        if not isinstance(error, ApiError):
            logger.error("API request failed", exc_info=error)
        return _error(status, code, message)

    async def current_identity(request: Request) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
        authorization = request.headers.get("authorization", "")
        token = authorization[7:] if authorization.startswith("Bearer ") else ""
        claims = read_session_token(token, auth_secret) if len(auth_secret) >= 32 else None
        session = backend_store.find_session(claims["sessionId"]) if claims else None
        if session is None:
            return None, None
        expires_at = session["expiresAt"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if session.get("revokedAt") is not None or expires_at <= datetime.now(timezone.utc):
            return None, session
        user = backend_store.find_user_by_id(session["userId"])
        return (user if user and user["isActive"] else None), session

    def unauthenticated() -> ApiError:
        return ApiError(401, "UNAUTHENTICATED", "A valid session is required")

    def forbidden(message: str = "You do not have permission to perform this action") -> ApiError:
        return ApiError(403, "FORBIDDEN", message)

    @app.get("/", include_in_schema=False)
    async def backend_dashboard() -> FileResponse:
        dashboard_path = Path(__file__).with_name("backend_dashboard.html")
        return FileResponse(dashboard_path, media_type="text/html")

    @app.get("/api/health")
    async def health() -> dict[str, str]:
        health_check = getattr(backend_store, "health_check", None)
        if health_check is not None:
            health_check()
        return {"status": "ok"}

    @app.post("/api/auth/login")
    async def login(request: Request) -> Any:
        address = request.client.host if request.client else "unknown"
        body = await _read_json(request)
        if (
            not isinstance(body, dict)
            or not isinstance(body.get("email"), str)
            or not isinstance(body.get("password"), str)
            or not body["email"].strip()
            or not body["password"]
        ):
            raise ApiError(400, "INVALID_INPUT", "Email and password are required")
        email = body["email"].strip().lower()
        attempt_key = (address, email)
        now = time.monotonic()
        count, reset_at = login_attempts.get(attempt_key, (0, now + LOGIN_WINDOW_SECONDS))
        if reset_at <= now:
            count, reset_at = 0, now + LOGIN_WINDOW_SECONDS
        if count >= LOGIN_MAX_FAILURES:
            raise ApiError(429, "TOO_MANY_ATTEMPTS", "Too many login attempts")
        user = backend_store.find_user_by_email(email)
        if not user or not verify_password(body["password"], user["passwordHash"]):
            login_attempts[attempt_key] = (count + 1, reset_at)
            backend_store.record_audit(
                {
                    "actorId": user["id"] if user else None,
                    "action": "LOGIN",
                    "objectType": "AUTHENTICATION",
                    "objectId": user["id"] if user else "unknown",
                    "result": "DENIED",
                }
            )
            raise ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect")
        if not user["isActive"]:
            backend_store.record_audit(
                {
                    "actorId": user["id"],
                    "action": "LOGIN",
                    "objectType": "AUTHENTICATION",
                    "objectId": user["id"],
                    "result": "DENIED",
                }
            )
            raise ApiError(403, "USER_INACTIVE", "This account is inactive")
        login_attempts.pop(attempt_key, None)
        if len(auth_secret) < 32:
            raise ApiError(500, "CONFIG_ERROR", "AUTH_SECRET must contain at least 32 characters")
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=session_ttl_seconds)
        session = backend_store.create_session(user["id"], expires_at)
        backend_store.record_audit(
            {
                "actorId": user["id"],
                "action": "LOGIN",
                "objectType": "AUTHENTICATION",
                "objectId": session["id"],
                "result": "SUCCESS",
            }
        )
        return {
            "accessToken": sign_session(session["id"], expires_at, auth_secret),
            "expiresAt": expires_at.isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "user": _public_user(user),
        }

    @app.get("/api/auth/me")
    async def me(request: Request) -> Any:
        actor, _session = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        return _public_user(actor)

    @app.post("/api/auth/logout", status_code=204)
    async def logout(request: Request) -> Response:
        actor, session = await current_identity(request)
        if actor is None or session is None:
            raise unauthenticated()
        backend_store.revoke_session(session["id"])
        backend_store.record_audit(
            {
                "actorId": actor["id"],
                "action": "LOGOUT",
                "objectType": "AUTHENTICATION",
                "objectId": session["id"],
                "result": "SUCCESS",
            }
        )
        return Response(status_code=204)

    @app.get("/api/documents")
    async def list_documents(request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "VIEW_DOCUMENT"):
            raise forbidden()
        documents = backend_store.list_documents(actor["role"], actor["id"])
        return {"items": [_document_for_role(document, actor["role"]) for document in documents]}

    @app.post("/api/documents", status_code=201)
    async def create_document(request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "CREATE_DOCUMENT"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "CREATE_DOCUMENT",
                    "objectType": "DOCUMENT",
                    "objectId": "new",
                    "result": "DENIED",
                }
            )
            raise forbidden("Only Authors can create documents")
        body = await _read_json(request)
        if not _valid_document_input(body):
            raise ApiError(
                400,
                "VALIDATION_ERROR",
                "A valid title, content, category, description and tag list are required",
            )
        return backend_store.create_document(
            {
                "actorId": actor["id"],
                "title": body["title"].strip(),
                "description": (body.get("description") or "").strip(),
                "content": body["content"].strip(),
                "category": body["category"].strip(),
                "tags": list(dict.fromkeys(tag.strip() for tag in body.get("tags", []) if tag.strip())),
            }
        )

    @app.post("/api/ai/ask")
    async def ask_ai(request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "ASK_AI"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "ASK_AI",
                    "objectType": "AI_QUERY",
                    "objectId": str(uuid.uuid4()),
                    "result": "DENIED",
                }
            )
            raise forbidden("You do not have permission to ask questions")
        body = await _read_json(request)
        if (
            not isinstance(body, dict)
            or not isinstance(body.get("question"), str)
            or not body["question"].strip()
            or len(body["question"]) > 1000
        ):
            raise ApiError(400, "VALIDATION_ERROR", "Question is required and must be at most 1000 characters")
        terms = _search_terms(body["question"].strip())
        if not terms:
            raise ApiError(400, "VALIDATION_ERROR", "Question must contain a searchable term")
        candidates = backend_store.list_published_documents()
        matches = []
        for document in candidates:
            searchable = " ".join(
                [
                    document["title"],
                    document["description"],
                    document["content"],
                    document["category"],
                    *document["tags"],
                ]
            ).lower()
            score = sum(1 for term in terms if term in searchable)
            if score:
                matches.append((document, score))
        matches.sort(key=lambda item: -item[1])
        matches = matches[:3]
        backend_store.record_audit(
            {
                "actorId": actor["id"],
                "action": "ASK_AI",
                "objectType": "AI_QUERY",
                "objectId": str(uuid.uuid4()),
                "result": "SUCCESS",
            }
        )
        if not matches:
            return {
                "answer": "Không tìm thấy thông tin phù hợp trong các tài liệu đã xuất bản mà bạn có quyền truy cập. Hệ thống không sử dụng nguồn bên ngoài.",
                "sources": [],
            }
        best = matches[0][0]
        return {
            "answer": f'Theo tài liệu {best["id"]} - {best["title"]} ({best["currentVersion"]}), nội dung liên quan là: "{_excerpt_for(best, terms)}".',
            "sources": [
                {"id": document["id"], "title": document["title"], "version": document["currentVersion"]}
                for document, _score in matches
            ],
        }

    @app.get("/api/documents/{document_id}")
    async def get_document(document_id: str, request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "VIEW_DOCUMENT"):
            raise forbidden()
        document = backend_store.find_document_by_id(document_id)
        can_view = document is not None and (
            actor["role"] in {"REVIEWER", "ADMIN"}
            or document["status"] == "PUBLISHED"
            or (actor["role"] == "AUTHOR" and document["authorId"] == actor["id"])
        )
        if not can_view:
            raise ApiError(404, "DOCUMENT_NOT_FOUND", "Document was not found")
        return _document_for_role(document, actor["role"])

    @app.patch("/api/documents/{document_id}")
    async def edit_document(document_id: str, request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "EDIT_DOCUMENT"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "EDIT_DOCUMENT",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "DENIED",
                }
            )
            raise forbidden("Only the owning Author can edit a draft")
        body = await _read_json(request)
        if not _valid_document_input(body):
            raise ApiError(
                400,
                "VALIDATION_ERROR",
                "A valid title, content, category, description and tag list are required",
            )
        try:
            return backend_store.update_document_draft(
                {
                    "documentId": document_id,
                    "actorId": actor["id"],
                    "title": body["title"].strip(),
                    "description": (body.get("description") or "").strip(),
                    "content": body["content"].strip(),
                    "category": body["category"].strip(),
                    "tags": list(dict.fromkeys(tag.strip() for tag in body.get("tags", []) if tag.strip())),
                }
            )
        except WorkflowError as error:
            raise _map_workflow_error(error, "edit") from None

    @app.post("/api/documents/{document_id}/review", status_code=201)
    async def submit_review(document_id: str, request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "SUBMIT_REVIEW"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "SUBMIT_REVIEW",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "DENIED",
                }
            )
            raise forbidden("Only Authors can submit documents for review")
        try:
            return backend_store.submit_document_for_review(document_id, actor["id"])
        except WorkflowError as error:
            raise _map_workflow_error(error, "submit") from None

    @app.post("/api/documents/{document_id}/publish")
    async def publish_document(document_id: str, request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "PUBLISH_DOCUMENT"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "PUBLISH",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "DENIED",
                }
            )
            raise forbidden("Only Admin can publish approved documents")
        try:
            return backend_store.publish_document(document_id, actor["id"])
        except WorkflowError as error:
            raise _map_workflow_error(error, "publish") from None

    @app.get("/api/documents/{document_id}/versions")
    async def list_versions(document_id: str, request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "READ_VERSION_HISTORY"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "READ_VERSION_HISTORY",
                    "objectType": "DOCUMENT",
                    "objectId": document_id,
                    "result": "DENIED",
                }
            )
            raise forbidden("You do not have permission to read version history")
        document = backend_store.find_document_by_id(document_id)
        if document is None:
            raise ApiError(404, "DOCUMENT_NOT_FOUND", "Document was not found")
        return {"items": document.get("versions", [])}

    @app.get("/api/reviews")
    async def list_reviews(request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "READ_REVIEW_QUEUE"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "READ_REVIEW_QUEUE",
                    "objectType": "REVIEW_QUEUE",
                    "objectId": "all",
                    "result": "DENIED",
                }
            )
            raise forbidden("You do not have permission to access the review queue")
        return {"items": backend_store.list_pending_reviews()}

    @app.post("/api/reviews/{review_id}/{decision}")
    async def decide_review(review_id: str, decision: str, request: Request) -> Any:
        if decision not in {"approve", "reject"}:
            raise ApiError(404, "NOT_FOUND", "Route was not found")
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        permission = "APPROVE_REVIEW" if decision == "approve" else "REJECT_REVIEW"
        action = "APPROVE" if decision == "approve" else "REJECT"
        if not _has_permission(actor["role"], permission):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": action,
                    "objectType": "REVIEW_REQUEST",
                    "objectId": review_id,
                    "result": "DENIED",
                }
            )
            raise forbidden("You do not have permission to decide this review")
        body = await _read_json(request)
        if not isinstance(body, dict):
            raise ApiError(400, "INVALID_INPUT", "A JSON object is required")
        if decision == "reject" and (
            not isinstance(body.get("reason"), str) or not body["reason"].strip()
        ):
            raise ApiError(400, "REASON_REQUIRED", "A rejection reason is required")
        try:
            return backend_store.decide_review(
                {
                    "reviewId": review_id,
                    "reviewerId": actor["id"],
                    "decision": "APPROVED" if decision == "approve" else "REJECTED",
                    "reason": body["reason"].strip() if isinstance(body.get("reason"), str) else None,
                }
            )
        except WorkflowError as error:
            raise _map_workflow_error(error, "review") from None

    @app.get("/api/audit")
    async def list_audit(request: Request) -> Any:
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        if not _has_permission(actor["role"], "READ_AUDIT"):
            backend_store.record_audit(
                {
                    "actorId": actor["id"],
                    "action": "READ_AUDIT",
                    "objectType": "AUDIT_LOG",
                    "objectId": "all",
                    "result": "DENIED",
                }
            )
            raise forbidden("Only Admin can access audit logs")
        return {"items": backend_store.list_audit_events()}

    @app.api_route(
        "/api/{api_path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def unknown_api_route(api_path: str, request: Request) -> Any:
        del api_path
        actor, _ = await current_identity(request)
        if actor is None:
            raise unauthenticated()
        raise ApiError(404, "NOT_FOUND", "Route was not found")

    @app.middleware("http")
    async def api_not_found_handler(request: Request, call_next: Callable[..., Any]) -> Response:
        response = await call_next(request)
        if request.url.path.startswith("/api/"):
            response.headers["cache-control"] = "no-store"
        if response.status_code == 404 and request.url.path.startswith("/api/"):
            return _error(404, "NOT_FOUND", "Route was not found")
        return response

    app.state.store = backend_store
    app.state.login_attempts = login_attempts
    return app


configured_secret = os.environ.get("AUTH_SECRET", "")
app = create_app(secret=configured_secret if len(configured_secret) >= 32 else "x" * 32)


@app.on_event("startup")
async def validate_default_app_secret() -> None:
    if len(os.environ.get("AUTH_SECRET", "")) < 32 or "replace_with" in os.environ.get("AUTH_SECRET", ""):
        raise RuntimeError("Set AUTH_SECRET to a locally generated value of at least 32 characters")


if __name__ == "__main__":
    import uvicorn

    if len(os.environ.get("AUTH_SECRET", "")) < 32 or "replace_with" in os.environ.get("AUTH_SECRET", ""):
        raise RuntimeError("Set AUTH_SECRET to a locally generated value of at least 32 characters")
    uvicorn.run(
        "backend.app.main:app",
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", "3000")),
    )
