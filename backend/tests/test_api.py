from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi.testclient import TestClient

from backend.app.main import (
    PostgresStore,
    create_app,
    hash_password,
    read_session_token,
    sign_session,
    verify_password,
)

SECRET = "test-secret-that-is-at-least-32-characters"


def _user(user_id: str, role: str, active: bool = True) -> dict[str, Any]:
    return {
        "id": user_id,
        "email": f"{role.lower()}@example.test",
        "passwordHash": hash_password("correct horse battery", salt="00112233445566778899aabbccddeeff"),
        "displayName": f"{role.title()} User",
        "role": role,
        "isActive": active,
    }


class FakeStore:
    def __init__(self) -> None:
        self.users = {
            role: _user(role.lower(), role)
            for role in ("READER", "AUTHOR", "REVIEWER", "ADMIN")
        }
        self.users["inactive"] = _user("inactive", "READER", active=False)
        self.users["inactive"]["email"] = "inactive@example.test"
        self.sessions: dict[str, dict[str, Any]] = {}
        self.documents: dict[str, dict[str, Any]] = {}
        self.reviews: dict[str, dict[str, Any]] = {}
        self.audits: list[dict[str, Any]] = []
        self.next_document = 1
        self.next_review = 1

    def health_check(self) -> None:
        return None

    def find_user_by_email(self, email: str) -> dict[str, Any] | None:
        return next((user for user in self.users.values() if user["email"] == email), None)

    def find_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        return next((user for user in self.users.values() if user["id"] == user_id), None)

    def create_session(self, user_id: str, expires_at: datetime) -> dict[str, Any]:
        session = {
            "id": f"session-{len(self.sessions) + 1}",
            "userId": user_id,
            "expiresAt": expires_at,
            "revokedAt": None,
        }
        self.sessions[session["id"]] = session
        return session

    def find_session(self, session_id: str) -> dict[str, Any] | None:
        return self.sessions.get(session_id)

    def revoke_session(self, session_id: str) -> None:
        self.sessions[session_id]["revokedAt"] = datetime.now(timezone.utc)

    def record_audit(self, event: dict[str, Any]) -> None:
        self.audits.append(dict(event))

    def list_documents(self, role: str, actor_id: str) -> list[dict[str, Any]]:
        return [
            document
            for document in self.documents.values()
            if role in {"ADMIN", "REVIEWER"}
            or document["status"] == "PUBLISHED"
            or (role == "AUTHOR" and document["authorId"] == actor_id)
        ]

    def create_document(self, data: dict[str, Any]) -> dict[str, Any]:
        document_id = f"doc-{self.next_document}"
        self.next_document += 1
        document = {
            "id": document_id,
            "title": data["title"],
            "description": data["description"],
            "content": data["content"],
            "category": data["category"],
            "tags": data["tags"],
            "status": "DRAFT",
            "reviewerComment": None,
            "currentVersion": "Draft",
            "authorId": data["actorId"],
            "versions": [],
            "reviewRequests": [],
            "author": {"displayName": self.find_user_by_id(data["actorId"])["displayName"]},
        }
        self.documents[document_id] = document
        self.record_audit(
            {
                "actorId": data["actorId"],
                "action": "CREATE",
                "objectType": "DOCUMENT",
                "objectId": document_id,
                "result": "SUCCESS",
            }
        )
        return document

    def update_document_draft(self, data: dict[str, Any]) -> dict[str, Any]:
        document = self.documents.get(data["documentId"])
        if document is None:
            from backend.app.main import WorkflowError

            raise WorkflowError("NOT_FOUND", "Document not found")
        if document["authorId"] != data["actorId"] or document["status"] not in {"DRAFT", "REJECTED"}:
            from backend.app.main import WorkflowError

            raise WorkflowError("INVALID_STATE", "Document cannot be edited")
        for key in ("title", "description", "content", "category", "tags"):
            document[key] = data[key]
        document["status"] = "DRAFT"
        document["reviewerComment"] = None
        document["currentVersion"] = "Draft"
        self.record_audit(
            {
                "actorId": data["actorId"],
                "action": "EDIT",
                "objectType": "DOCUMENT",
                "objectId": document["id"],
                "result": "SUCCESS",
            }
        )
        return document

    def submit_document_for_review(self, document_id: str, actor_id: str) -> dict[str, Any]:
        from backend.app.main import WorkflowError

        document = self.documents.get(document_id)
        if document is None:
            raise WorkflowError("NOT_FOUND", "Document not found")
        if document["authorId"] != actor_id or document["status"] not in {"DRAFT", "REJECTED"}:
            raise WorkflowError("INVALID_STATE", "Document cannot be submitted")
        document["status"] = "REVIEWING"
        review_id = f"review-{self.next_review}"
        self.next_review += 1
        review = {
            "id": review_id,
            "documentId": document_id,
            "title": document["title"],
            "status": "PENDING",
            "submittedAt": datetime.now(timezone.utc),
        }
        self.reviews[review_id] = review
        self.record_audit(
            {
                "actorId": actor_id,
                "action": "SUBMIT_REVIEW",
                "objectType": "DOCUMENT",
                "objectId": document_id,
                "result": "SUCCESS",
            }
        )
        return review

    def find_document_by_id(self, document_id: str) -> dict[str, Any] | None:
        return self.documents.get(document_id)

    def publish_document(self, document_id: str, actor_id: str) -> dict[str, Any]:
        from backend.app.main import WorkflowError

        document = self.documents.get(document_id)
        if document is None:
            raise WorkflowError("NOT_FOUND", "Document not found")
        if document["status"] != "APPROVED":
            raise WorkflowError("INVALID_STATE", "Document not approved")
        document["status"] = "PUBLISHED"
        document["currentVersion"] = "v1.0"
        document["reviewerComment"] = None
        document["versions"] = [
            {
                "version": "v1.0",
                "title": document["title"],
                "content": document["content"],
                "publishedAt": datetime.now(timezone.utc),
                "publisher": {"displayName": self.find_user_by_id(actor_id)["displayName"]},
            }
        ]
        self.record_audit(
            {
                "actorId": actor_id,
                "action": "PUBLISH",
                "objectType": "DOCUMENT",
                "objectId": document_id,
                "result": "SUCCESS",
            }
        )
        return document

    def list_pending_reviews(self) -> list[dict[str, Any]]:
        result = []
        for review in self.reviews.values():
            if review["status"] != "PENDING":
                continue
            document = self.documents[review["documentId"]]
            submitter = self.find_user_by_id(document["authorId"])
            result.append(
                {
                    "id": review["id"],
                    "title": review["title"],
                    "documentId": review["documentId"],
                    "submittedBy": {"displayName": submitter["displayName"]},
                    "submittedAt": review["submittedAt"],
                    "document": {
                        "category": document["category"],
                        "author": {"displayName": submitter["displayName"]},
                    },
                }
            )
        return result

    def decide_review(self, data: dict[str, Any]) -> dict[str, Any]:
        from backend.app.main import WorkflowError

        review = self.reviews.get(data["reviewId"])
        if review is None:
            raise WorkflowError("NOT_FOUND", "Review not found")
        if review["status"] != "PENDING":
            raise WorkflowError("INVALID_STATE", "Review no longer pending")
        review.update(
            {
                "status": data["decision"],
                "reviewerId": data["reviewerId"],
                "decisionReason": data["reason"],
                "reviewedAt": datetime.now(timezone.utc),
            }
        )
        document = self.documents[review["documentId"]]
        document["status"] = data["decision"]
        document["reviewerComment"] = data["reason"]
        self.record_audit(
            {
                "actorId": data["reviewerId"],
                "action": "APPROVE" if data["decision"] == "APPROVED" else "REJECT",
                "objectType": "REVIEW_REQUEST",
                "objectId": review["id"],
                "result": "SUCCESS",
            }
        )
        return review

    def list_audit_events(self) -> list[dict[str, Any]]:
        return self.audits[-200:]

    def list_published_documents(self) -> list[dict[str, Any]]:
        return [
            document
            for document in self.documents.values()
            if document["status"] == "PUBLISHED"
        ]


def _client(store: FakeStore) -> TestClient:
    return TestClient(create_app(store=store, secret=SECRET))


def _token(client: TestClient, role: str) -> str:
    response = client.post(
        "/api/auth/login",
        json={"email": f"{role.lower()}@example.test", "password": "correct horse battery"},
    )
    assert response.status_code == 200
    return response.json()["accessToken"]


def test_node_compatible_scrypt_and_hmac_session_tokens() -> None:
    encoded = hash_password("password", salt="ab" * 16)
    assert encoded.startswith(f"scrypt${'ab' * 16}$")
    assert len(encoded.rsplit("$", 1)[1]) == 128
    assert verify_password("password", encoded)
    assert not verify_password("wrong", encoded)
    assert not verify_password("password", "pbkdf2$bad$value")

    expires_at = datetime(2026, 1, 2, tzinfo=timezone.utc)
    # Node JSON.stringify emits this compact claim shape before base64url encoding.
    import base64
    import hmac
    import hashlib

    payload = base64.urlsafe_b64encode(
        b'{"sid":"session-1","exp":1767312000000}'
    ).rstrip(b"=").decode()
    signature = base64.urlsafe_b64encode(
        hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).digest()
    ).rstrip(b"=").decode()
    expected_token = f"{payload}.{signature}"
    assert sign_session("session-1", expires_at, SECRET) == expected_token
    claims = read_session_token(expected_token, SECRET, now_ms=1_767_312_000_000 - 1)
    assert claims is not None and claims["sessionId"] == "session-1"
    assert read_session_token(expected_token, SECRET, now_ms=1_767_312_000_000) is None
    assert read_session_token(f"{expected_token}x", SECRET) is None
    cleaned = PostgresStore(
        "postgresql://user:pass@localhost:5432/kms?schema=public&application_name=demo"
    ).database_url
    assert cleaned == "postgresql://user:pass@localhost:5432/kms?application_name=demo"


def test_login_me_logout_and_audit() -> None:
    store = FakeStore()
    client = _client(store)
    token = _token(client, "AUTHOR")
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/me", headers=headers).json()["role"] == "AUTHOR"
    logout = client.post("/api/auth/logout", headers=headers)
    assert logout.status_code == 204
    assert client.get("/api/auth/me", headers=headers).status_code == 401
    assert [event["action"] for event in store.audits] == ["LOGIN", "LOGOUT"]


def test_login_attempt_limit_is_scoped_to_account() -> None:
    client = _client(FakeStore())
    for _ in range(5):
        failed = client.post(
            "/api/auth/login",
            json={"email": "lockout@example.test", "password": "wrong password"},
        )
        assert failed.status_code == 401

    blocked = client.post(
        "/api/auth/login",
        json={"email": "lockout@example.test", "password": "correct horse battery"},
    )
    assert blocked.status_code == 429

    other_account = client.post(
        "/api/auth/login",
        json={"email": "reader@example.test", "password": "correct horse battery"},
    )
    assert other_account.status_code == 200


def test_role_restrictions_and_author_document_creation() -> None:
    store = FakeStore()
    client = _client(store)
    reader = {"Authorization": f"Bearer {_token(client, 'READER')}"}
    denied = client.post(
        "/api/documents",
        headers=reader,
        json={"title": "Policy", "content": "Details", "category": "Ops"},
    )
    assert denied.status_code == 403
    assert store.audits[-1]["result"] == "DENIED"

    author = {"Authorization": f"Bearer {_token(client, 'AUTHOR')}"}
    created = client.post(
        "/api/documents",
        headers=author,
        json={
            "title": "  Receiving policy ",
            "content": " Inspect all items ",
            "category": " Operations ",
            "tags": ["warehouse", "warehouse", "  "],
        },
    )
    assert created.status_code == 201
    assert created.json()["title"] == "Receiving policy"
    assert created.json()["tags"] == ["warehouse"]
    assert created.json()["status"] == "DRAFT"
    assert client.get(f"/api/documents/{created.json()['id']}", headers=reader).status_code == 404


def test_document_review_approval_publish_and_version_history() -> None:
    store = FakeStore()
    client = _client(store)
    author = {"Authorization": f"Bearer {_token(client, 'AUTHOR')}"}
    reviewer = {"Authorization": f"Bearer {_token(client, 'REVIEWER')}"}
    admin = {"Authorization": f"Bearer {_token(client, 'ADMIN')}"}

    document = client.post(
        "/api/documents",
        headers=author,
        json={"title": "Inventory", "content": "Count inventory stock", "category": "Warehouse"},
    ).json()
    submitted = client.post(f"/api/documents/{document['id']}/review", headers=author)
    assert submitted.status_code == 201
    review_id = submitted.json()["id"]
    assert len(client.get("/api/reviews", headers=reviewer).json()["items"]) == 1
    approved = client.post(f"/api/reviews/{review_id}/approve", headers=reviewer, json={})
    assert approved.status_code == 200
    assert approved.json()["status"] == "APPROVED"
    published = client.post(f"/api/documents/{document['id']}/publish", headers=admin)
    assert published.status_code == 200
    assert published.json()["currentVersion"] == "v1.0"
    assert len(client.get(f"/api/documents/{document['id']}/versions", headers=reviewer).json()["items"]) == 1
    answer = client.post("/api/ai/ask", headers=author, json={"question": "inventory stock"})
    assert answer.status_code == 200
    assert answer.json()["sources"][0]["id"] == document["id"]


def test_review_rejection_requires_reason_and_inactive_user_cannot_login() -> None:
    store = FakeStore()
    client = _client(store)
    author = {"Authorization": f"Bearer {_token(client, 'AUTHOR')}"}
    reviewer = {"Authorization": f"Bearer {_token(client, 'REVIEWER')}"}
    created = client.post(
        "/api/documents",
        headers=author,
        json={"title": "Returns", "content": "Inspect return", "category": "Warehouse"},
    ).json()
    review = client.post(f"/api/documents/{created['id']}/review", headers=author).json()
    rejected = client.post(f"/api/reviews/{review['id']}/reject", headers=reviewer, json={})
    assert rejected.status_code == 400
    assert rejected.json()["error"]["code"] == "REASON_REQUIRED"
    inactive = client.post(
        "/api/auth/login",
        json={"email": "inactive@example.test", "password": "correct horse battery"},
    )
    assert inactive.status_code == 403
    inactive = client.post(
        "/api/auth/login",
        json={"email": "not-a-user@example.test", "password": "wrong"},
    )
    assert inactive.status_code == 401


def test_configured_frontend_is_served_with_backend_dashboard_available(
    tmp_path: Any, monkeypatch: Any
) -> None:
    assets = tmp_path / "assets"
    assets.mkdir()
    (tmp_path / "index.html").write_text("<main>Frontend</main>", encoding="utf-8")
    (assets / "app.js").write_text("console.log('frontend')", encoding="utf-8")
    monkeypatch.setenv("FRONTEND_DIST_DIR", str(tmp_path))
    client = _client(FakeStore())

    assert client.get("/").text == "<main>Frontend</main>"
    assert client.get("/assets/app.js").text == "console.log('frontend')"
    assert "Backend" in client.get("/backend-dashboard").text
