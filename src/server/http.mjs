import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { Console } from "node:console";
import { randomUUID } from "node:crypto";
import { extname, resolve, sep } from "node:path";
import process from "node:process";
import { URL } from "node:url";
import { hasPermission, readSessionToken, signSession, verifyPassword } from "./security.mjs";

const logger = new Console(process.stdout, process.stderr);

const MAX_BODY_BYTES = 256 * 1024;
const SESSION_SECONDS_DEFAULT = 86_400;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;

function sendJson(response, status, value) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

function sendError(response, status, code, message) {
  sendJson(response, status, { error: { code, message } });
}

async function readJson(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) throw Object.assign(new Error("Request body too large"), { status: 413 });
    chunks.push(chunk);
  }
  if (length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
  }
}

function publicUser(user) {
  return { id: user.id, email: user.email, displayName: user.displayName, role: user.role, isActive: user.isActive };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validDocumentInput(body) {
  return typeof body.title === "string"
    && body.title.trim().length > 0
    && body.title.trim().length <= 200
    && typeof body.content === "string"
    && body.content.trim().length > 0
    && typeof body.category === "string"
    && body.category.trim().length > 0
    && body.category.trim().length <= 80
    && (body.description === undefined || typeof body.description === "string")
    && (body.tags === undefined || (Array.isArray(body.tags) && body.tags.length <= 20 && body.tags.every((tag) => typeof tag === "string" && tag.trim().length <= 80)));
}

function permissionDeniedResponse(response, message = "You do not have permission to perform this action") {
  return sendError(response, 403, "FORBIDDEN", message);
}

function normalizeError(error) {
  const message = typeof error?.message === "string" ? error.message : "";
  if (error?.status) {
    return {
      status: error.status,
      code: error.code ?? "INVALID_REQUEST",
      message: error.message ?? "The request could not be completed",
    };
  }
  if (message.includes("Can't reach database server") || message.includes("ECONNREFUSED") || message.includes("database server")) {
    return {
      status: 503,
      code: "DATABASE_UNAVAILABLE",
      message: "Database is unavailable. Start PostgreSQL and verify your DATABASE_URL settings.",
    };
  }
  if (message.includes("DATABASE_URL") || message.includes("Environment variable")) {
    return {
      status: 500,
      code: "CONFIG_ERROR",
      message: "Database configuration is invalid. Check DATABASE_URL and the local environment file.",
    };
  }
  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "The request could not be completed",
  };
}

function searchTerms(value) {
  return value.toLocaleLowerCase("vi").split(/[^a-zA-ZÀ-ỹ0-9]+/).filter((term) => term.length >= 2);
}

function excerptFor(document, terms) {
  const text = `${document.title}. ${document.description} ${document.content}`;
  const normalized = text.toLocaleLowerCase("vi");
  const match = terms.find((term) => normalized.includes(term));
  if (!match) return text.slice(0, 240).replace(/\s+/g, " ").trim();
  const position = normalized.indexOf(match);
  return text.slice(Math.max(0, position - 90), position + 220).replace(/\s+/g, " ").trim();
}

function documentForRole(document, role) {
  if (role === "REVIEWER" || role === "ADMIN") return document;
  return {
    ...document,
    reviewRequests: [],
    versions: document.versions.filter((version) => version.version === document.currentVersion),
    ...(role === "READER" ? { reviewerComment: null } : {}),
  };
}

async function serveStatic(staticDir, pathname, response) {
  const root = resolve(staticDir);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const requestedPath = resolve(root, `.${decodedPath === "/" ? "/index.html" : decodedPath}`);
  if (!requestedPath.startsWith(`${root}${sep}`) && requestedPath !== root) return false;

  try {
    const body = await readFile(requestedPath);
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".ico": "image/x-icon",
    }[extname(requestedPath)] ?? "application/octet-stream";
    response.writeHead(200, { "content-type": contentType, "cache-control": "no-cache" });
    response.end(body);
    return true;
  } catch (error) {
    if (error.code === "ENOENT" && !extname(requestedPath)) {
      const body = await readFile(resolve(root, "index.html"));
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
      response.end(body);
      return true;
    }
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export function createApiServer({ store, secret, sessionTtlSeconds = SESSION_SECONDS_DEFAULT, demoPagePath, staticDir }) {
  if (!store || typeof secret !== "string" || secret.length < 32) {
    throw new Error("An auth store and AUTH_SECRET of at least 32 characters are required");
  }

  const loginAttempts = new Map();
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const pathname = requestUrl.pathname;

    try {
      if (pathname === "/final-demo.html" && demoPagePath) {
        const html = await readFile(demoPagePath);
        response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end(html);
        return;
      }
      if (request.method === "GET" && staticDir && !pathname.startsWith("/api/")) {
        if (await serveStatic(staticDir, pathname, response)) return;
      }
      if (pathname === "/api/health" && request.method === "GET") {
        if (store.healthCheck) await store.healthCheck();
        sendJson(response, 200, { status: "ok" });
        return;
      }

      if (pathname === "/api/auth/login" && request.method === "POST") {
        const address = request.socket.remoteAddress ?? "unknown";
        const body = await readJson(request);
        if (!isObject(body) || typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password) {
          sendError(response, 400, "INVALID_INPUT", "Email and password are required");
          return;
        }
        const email = body.email.trim().toLowerCase();
        const attemptKey = `${address}:${email}`;
        const attempts = loginAttempts.get(attemptKey) ?? { count: 0, resetAt: Date.now() + LOGIN_WINDOW_MS };
        if (attempts.resetAt <= Date.now()) {
          attempts.count = 0;
          attempts.resetAt = Date.now() + LOGIN_WINDOW_MS;
        }
        if (attempts.count >= LOGIN_MAX_FAILURES) {
          sendError(response, 429, "TOO_MANY_ATTEMPTS", "Too many login attempts");
          return;
        }

        const user = await store.findUserByEmail(email);
        if (!user || !verifyPassword(body.password, user.passwordHash)) {
          attempts.count += 1;
          loginAttempts.set(attemptKey, attempts);
          await store.recordAudit({
            actorId: user?.id ?? null,
            action: "LOGIN",
            objectType: "AUTHENTICATION",
            objectId: user?.id ?? "unknown",
            result: "DENIED",
          });
          sendError(response, 401, "INVALID_CREDENTIALS", "Email or password is incorrect");
          return;
        }
        if (!user.isActive) {
          await store.recordAudit({ actorId: user.id, action: "LOGIN", objectType: "AUTHENTICATION", objectId: user.id, result: "DENIED" });
          sendError(response, 403, "USER_INACTIVE", "This account is inactive");
          return;
        }

        loginAttempts.delete(attemptKey);
        const expiresAt = new Date(Date.now() + sessionTtlSeconds * 1000);
        const session = await store.createSession({ userId: user.id, expiresAt });
        await store.recordAudit({ actorId: user.id, action: "LOGIN", objectType: "AUTHENTICATION", objectId: session.id, result: "SUCCESS" });
        sendJson(response, 200, { accessToken: signSession(session.id, expiresAt, secret), expiresAt: expiresAt.toISOString(), user: publicUser(user) });
        return;
      }

      const authorization = request.headers.authorization;
      const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
      const claims = readSessionToken(token, secret);
      const session = claims ? await store.findSession(claims.sessionId) : null;
      const user = session && !session.revokedAt && session.expiresAt > new Date() ? await store.findUserById(session.userId) : null;
      const actor = user?.isActive ? user : null;

      if (pathname === "/api/auth/me" && request.method === "GET") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        return sendJson(response, 200, publicUser(actor));
      }
      if (pathname === "/api/auth/logout" && request.method === "POST") {
        if (!actor || !session) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        await store.revokeSession(session.id);
        await store.recordAudit({ actorId: actor.id, action: "LOGOUT", objectType: "AUTHENTICATION", objectId: session.id, result: "SUCCESS" });
        return response.writeHead(204).end();
      }

      if (pathname === "/api/documents" && request.method === "GET") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "VIEW_DOCUMENT")) return permissionDeniedResponse(response);
        const items = await store.listDocuments({ role: actor.role, actorId: actor.id });
        return sendJson(response, 200, { items: items.map((document) => documentForRole(document, actor.role)) });
      }

      if (pathname === "/api/documents" && request.method === "POST") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "CREATE_DOCUMENT")) {
          await store.recordAudit({ actorId: actor.id, action: "CREATE_DOCUMENT", objectType: "DOCUMENT", objectId: "new", result: "DENIED" });
          return permissionDeniedResponse(response, "Only Authors can create documents");
        }
        const body = await readJson(request);
        if (!isObject(body) || !validDocumentInput(body) || body.description?.length > 500) {
          return sendError(response, 400, "VALIDATION_ERROR", "A valid title, content, category, description and tag list are required");
        }
        const document = await store.createDocument({
          actorId: actor.id,
          title: body.title.trim(),
          description: body.description?.trim() ?? "",
          content: body.content.trim(),
          category: body.category.trim(),
          tags: [...new Set((body.tags ?? []).map((tag) => tag.trim()).filter(Boolean))],
        });
        return sendJson(response, 201, document);
      }

      if (pathname === "/api/ai/ask" && request.method === "POST") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "ASK_AI")) {
            await store.recordAudit({ actorId: actor.id, action: "ASK_AI", objectType: "AI_QUERY", objectId: randomUUID(), result: "DENIED" });
          return permissionDeniedResponse(response, "You do not have permission to ask questions");
        }
        const body = await readJson(request);
        if (!isObject(body) || typeof body.question !== "string" || !body.question.trim() || body.question.length > 1000) {
          return sendError(response, 400, "VALIDATION_ERROR", "Question is required and must be at most 1000 characters");
        }
        const terms = searchTerms(body.question.trim());
        if (terms.length === 0) return sendError(response, 400, "VALIDATION_ERROR", "Question must contain a searchable term");
        const candidates = await store.listPublishedDocuments();
        const matches = candidates
          .map((document) => {
            const searchable = [document.title, document.description, document.content, document.category, ...document.tags].join(" ").toLocaleLowerCase("vi");
            return { document, score: terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0) };
          })
          .filter((item) => item.score > 0)
          .sort((left, right) => right.score - left.score)
          .slice(0, 3);
        await store.recordAudit({ actorId: actor.id, action: "ASK_AI", objectType: "AI_QUERY", objectId: randomUUID(), result: "SUCCESS" });
        if (matches.length === 0) {
          return sendJson(response, 200, {
            answer: "Không tìm thấy thông tin phù hợp trong các tài liệu đã xuất bản mà bạn có quyền truy cập. Hệ thống không sử dụng nguồn bên ngoài.",
            sources: [],
          });
        }
        const best = matches[0].document;
        return sendJson(response, 200, {
          answer: `Theo tài liệu ${best.id} - ${best.title} (${best.currentVersion}), nội dung liên quan là: "${excerptFor(best, terms)}".`,
          sources: matches.map(({ document }) => ({ id: document.id, title: document.title, version: document.currentVersion })),
        });
      }

      const documentMatch = pathname.match(/^\/api\/documents\/([a-zA-Z0-9_-]+)(?:\/(review|publish|versions))?$/);
      if (documentMatch && request.method === "GET" && !documentMatch[2]) {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "VIEW_DOCUMENT")) return permissionDeniedResponse(response);
        const document = await store.findDocumentById(documentMatch[1]);
        const canView = document
          && (actor.role === "REVIEWER" || actor.role === "ADMIN"
            || document.status === "PUBLISHED"
            || (actor.role === "AUTHOR" && document.authorId === actor.id));
        if (!canView) {
          return sendError(response, 404, "DOCUMENT_NOT_FOUND", "Document was not found");
        }
        return sendJson(response, 200, documentForRole(document, actor.role));
      }

      if (documentMatch && request.method === "PATCH" && !documentMatch[2]) {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "EDIT_DOCUMENT")) {
          await store.recordAudit({ actorId: actor.id, action: "EDIT_DOCUMENT", objectType: "DOCUMENT", objectId: documentMatch[1], result: "DENIED" });
          return permissionDeniedResponse(response, "Only the owning Author can edit a draft");
        }
        const body = await readJson(request);
        if (!isObject(body) || !validDocumentInput(body) || body.description?.length > 500) {
          return sendError(response, 400, "VALIDATION_ERROR", "A valid title, content, category, description and tag list are required");
        }
        try {
          const document = await store.updateDocumentDraft({
            documentId: documentMatch[1],
            actorId: actor.id,
            title: body.title.trim(),
            description: body.description?.trim() ?? "",
            content: body.content.trim(),
            category: body.category.trim(),
            tags: [...new Set((body.tags ?? []).map((tag) => tag.trim()).filter(Boolean))],
          });
          return sendJson(response, 200, document);
        } catch (error) {
          if (error.code === "NOT_FOUND") return sendError(response, 404, "DOCUMENT_NOT_FOUND", "Document was not found");
          if (error.code === "INVALID_STATE") return sendError(response, 409, "DOCUMENT_NOT_EDITABLE", "Only your Draft or Rejected documents can be edited");
          throw error;
        }
      }

      if (documentMatch && request.method === "POST" && documentMatch[2] === "review") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "SUBMIT_REVIEW")) {
          await store.recordAudit({ actorId: actor.id, action: "SUBMIT_REVIEW", objectType: "DOCUMENT", objectId: documentMatch[1], result: "DENIED" });
          return permissionDeniedResponse(response, "Only Authors can submit documents for review");
        }
        try {
          const result = await store.submitDocumentForReview({ documentId: documentMatch[1], actorId: actor.id });
          return sendJson(response, 201, result);
        } catch (error) {
          if (error.code === "NOT_FOUND") return sendError(response, 404, "DOCUMENT_NOT_FOUND", "Document was not found");
          if (error.code === "INVALID_STATE") return sendError(response, 409, "DOCUMENT_NOT_SUBMITTABLE", "Only your Draft or Rejected documents can be submitted");
          throw error;
        }
      }

      if (documentMatch && request.method === "POST" && documentMatch[2] === "publish") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "PUBLISH_DOCUMENT")) {
          await store.recordAudit({ actorId: actor.id, action: "PUBLISH", objectType: "DOCUMENT", objectId: documentMatch[1], result: "DENIED" });
          return permissionDeniedResponse(response, "Only Admin can publish approved documents");
        }
        try {
          return sendJson(response, 200, await store.publishDocument({ documentId: documentMatch[1], actorId: actor.id }));
        } catch (error) {
          if (error.code === "NOT_FOUND") return sendError(response, 404, "DOCUMENT_NOT_FOUND", "Document was not found");
          if (error.code === "INVALID_STATE") return sendError(response, 409, "DOCUMENT_NOT_APPROVED", "Only approved documents can be published");
          throw error;
        }
      }

      if (documentMatch && request.method === "GET" && documentMatch[2] === "versions") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "READ_VERSION_HISTORY")) {
          await store.recordAudit({ actorId: actor.id, action: "READ_VERSION_HISTORY", objectType: "DOCUMENT", objectId: documentMatch[1], result: "DENIED" });
          return permissionDeniedResponse(response, "You do not have permission to read version history");
        }
        const document = await store.findDocumentById(documentMatch[1]);
        if (!document) return sendError(response, 404, "DOCUMENT_NOT_FOUND", "Document was not found");
        return sendJson(response, 200, { items: document.versions ?? [] });
      }

      if (pathname === "/api/reviews" && request.method === "GET") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "READ_REVIEW_QUEUE")) {
          await store.recordAudit({ actorId: actor.id, action: "READ_REVIEW_QUEUE", objectType: "REVIEW_QUEUE", objectId: "all", result: "DENIED" });
          return sendError(response, 403, "FORBIDDEN", "You do not have permission to access the review queue");
        }
        return sendJson(response, 200, { items: await store.listPendingReviews() });
      }

      const reviewMatch = pathname.match(/^\/api\/reviews\/([a-zA-Z0-9-]+)\/(approve|reject)$/);
      if (reviewMatch && request.method === "POST") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        const decision = reviewMatch[2];
        const permission = decision === "approve" ? "APPROVE_REVIEW" : "REJECT_REVIEW";
        const action = decision === "approve" ? "APPROVE" : "REJECT";
        if (!hasPermission(actor.role, permission)) {
          await store.recordAudit({ actorId: actor.id, action, objectType: "REVIEW_REQUEST", objectId: reviewMatch[1], result: "DENIED" });
          return sendError(response, 403, "FORBIDDEN", "You do not have permission to decide this review");
        }

        const body = await readJson(request);
        if (!isObject(body)) return sendError(response, 400, "INVALID_INPUT", "A JSON object is required");
        if (decision === "reject" && (typeof body.reason !== "string" || !body.reason.trim())) {
          return sendError(response, 400, "REASON_REQUIRED", "A rejection reason is required");
        }
        try {
          const review = await store.decideReview({ reviewId: reviewMatch[1], reviewerId: actor.id, decision: decision === "approve" ? "APPROVED" : "REJECTED", reason: body.reason?.trim() ?? null });
          return sendJson(response, 200, review);
        } catch (error) {
          if (error.code === "NOT_FOUND") return sendError(response, 404, "REVIEW_NOT_FOUND", "Review request was not found");
          if (error.code === "INVALID_STATE") return sendError(response, 409, "REVIEW_NOT_PENDING", "Review request is no longer pending");
          throw error;
        }
      }

      if (pathname === "/api/audit" && request.method === "GET") {
        if (!actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
        if (!hasPermission(actor.role, "READ_AUDIT")) {
          await store.recordAudit({ actorId: actor.id, action: "READ_AUDIT", objectType: "AUDIT_LOG", objectId: "all", result: "DENIED" });
          return permissionDeniedResponse(response, "Only Admin can access audit logs");
        }
        return sendJson(response, 200, { items: await store.listAuditEvents() });
      }

      if (pathname.startsWith("/api/") && !actor) return sendError(response, 401, "UNAUTHENTICATED", "A valid session is required");
      sendError(response, 404, "NOT_FOUND", "Route was not found");
    } catch (error) {
      const normalized = normalizeError(error);
      logger.error("API request failed", error);
      return sendError(response, normalized.status, normalized.code, normalized.message);
    }
  });

  return server;
}