import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPermissionBackend } from "./backend.mjs";
import { hashPassword, hasPermission } from "./security.mjs";

const secret = "unit-test-secret-with-more-than-thirty-two-characters";
const users = [
  { id: "reader-1", email: "reader@example.test", displayName: "Demo Reader", role: "READER", isActive: true, passwordHash: hashPassword("Demo@2026!", "reader-salt") },
  { id: "author-1", email: "author@example.test", displayName: "Demo Author", role: "AUTHOR", isActive: true, passwordHash: hashPassword("Demo@2026!", "author-salt") },
  { id: "reviewer-1", email: "reviewer@example.test", displayName: "Demo Reviewer", role: "REVIEWER", isActive: true, passwordHash: hashPassword("Demo@2026!", "reviewer-salt") },
  { id: "admin-1", email: "admin@example.test", displayName: "Demo Admin", role: "ADMIN", isActive: true, passwordHash: hashPassword("Demo@2026!", "admin-salt") },
];
const sessions = new Map();
const audit = [];
const documents = new Map();
const reviewDocuments = new Map();
const reviewStates = new Map();
let reviewStatus = "PENDING";
let createdDocumentId = 0;
let createdReviewId = 0;
let server;
let baseUrl;

const store = {
  findUserByEmail: async (email) => users.find((user) => user.email === email) ?? null,
  findUserById: async (id) => users.find((user) => user.id === id) ?? null,
  createSession: async ({ userId, expiresAt }) => {
    const session = { id: `session-${sessions.size + 1}`, userId, expiresAt, revokedAt: null };
    sessions.set(session.id, session);
    return session;
  },
  findSession: async (id) => sessions.get(id) ?? null,
  revokeSession: async (id) => { sessions.get(id).revokedAt = new Date(); },
  listPendingReviews: async () => reviewStatus === "PENDING" ? [{ id: "review-1", title: "Demo review" }] : [],
  listDocuments: async ({ role, actorId }) => [...documents.values()].filter((document) => (
    role === "READER"
      ? document.status === "PUBLISHED"
      : role === "AUTHOR"
        ? document.status === "PUBLISHED" || document.authorId === actorId
        : true
  )),
  findDocumentById: async (id) => documents.get(id) ?? null,
  createDocument: async ({ actorId, ...data }) => {
    const document = {
      id: `doc-${++createdDocumentId}`,
      ...data,
      authorId: actorId,
      status: "DRAFT",
      currentVersion: "Draft",
      author: { displayName: users.find((user) => user.id === actorId).displayName },
      reviewRequests: [],
      versions: [],
      reviewerComment: null,
    };
    documents.set(document.id, document);
    audit.push({ actorId, action: "CREATE", objectType: "DOCUMENT", objectId: document.id, result: "SUCCESS" });
    return document;
  },
  updateDocumentDraft: async ({ documentId, actorId, ...data }) => {
    const document = documents.get(documentId);
    if (!document) throw Object.assign(new Error("not found"), { code: "NOT_FOUND" });
    if (document.authorId !== actorId || !["DRAFT", "REJECTED"].includes(document.status)) {
      throw Object.assign(new Error("invalid state"), { code: "INVALID_STATE" });
    }
    Object.assign(document, data, { status: "DRAFT", reviewerComment: null });
    audit.push({ actorId, action: "EDIT", objectType: "DOCUMENT", objectId: documentId, result: "SUCCESS" });
    return document;
  },
  submitDocumentForReview: async ({ documentId, actorId }) => {
    const document = documents.get(documentId);
    if (!document) throw Object.assign(new Error("not found"), { code: "NOT_FOUND" });
    if (document.authorId !== actorId || !["DRAFT", "REJECTED"].includes(document.status)) {
      throw Object.assign(new Error("invalid state"), { code: "INVALID_STATE" });
    }
    document.status = "REVIEWING";
    const review = { id: `workflow-review-${++createdReviewId}`, documentId, title: document.title, status: "PENDING" };
    reviewDocuments.set(review.id, documentId);
    reviewStates.set(review.id, "PENDING");
    document.reviewRequests = [{ id: review.id }];
    audit.push({ actorId, action: "SUBMIT_REVIEW", objectType: "DOCUMENT", objectId: documentId, result: "SUCCESS" });
    return review;
  },
  listPublishedDocuments: async () => [...documents.values()].filter((document) => document.status === "PUBLISHED"),
  recordAudit: async (event) => { audit.push(event); },
  decideReview: async ({ reviewId, reviewerId, decision, reason }) => {
    if (reviewId !== "review-1" && !reviewDocuments.has(reviewId)) throw Object.assign(new Error("missing"), { code: "NOT_FOUND" });
    const currentStatus = reviewId === "review-1" ? reviewStatus : reviewStates.get(reviewId);
    if (currentStatus !== "PENDING") throw Object.assign(new Error("decided"), { code: "INVALID_STATE" });
    if (reviewId === "review-1") reviewStatus = decision;
    else reviewStates.set(reviewId, decision);
    const documentId = reviewDocuments.get(reviewId);
    if (documentId) {
      const document = documents.get(documentId);
      if (document.status !== "REVIEWING") throw Object.assign(new Error("invalid document state"), { code: "INVALID_STATE" });
      document.status = decision;
      document.reviewerComment = reason;
    }
    audit.push({ actorId: reviewerId, action: decision === "APPROVED" ? "APPROVE" : "REJECT", objectType: "REVIEW_REQUEST", objectId: reviewId, result: "SUCCESS" });
    return { id: reviewId, status: decision, decisionReason: reason };
  },
  publishDocument: async ({ documentId, actorId }) => {
    const document = documents.get(documentId);
    if (!document) throw Object.assign(new Error("not found"), { code: "NOT_FOUND" });
    if (document.status !== "APPROVED") throw Object.assign(new Error("invalid state"), { code: "INVALID_STATE" });
    document.status = "PUBLISHED";
    document.currentVersion = "v1.0";
    document.versions.push({ version: "v1.0", title: document.title, content: document.content, publishedAt: new Date().toISOString(), publisher: { displayName: "Demo Admin" } });
    audit.push({ actorId, action: "PUBLISH", objectType: "DOCUMENT", objectId: documentId, result: "SUCCESS" });
    return document;
  },
  listAuditEvents: async () => audit,
};

async function login(email) {
  const response = await globalThis.fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "Demo@2026!" }),
  });
  return { response, body: await response.json() };
}

describe("backend authentication and authorization", () => {
  beforeAll(async () => {
    server = createPermissionBackend({ store, secret });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("keeps the role permission matrix consistent", () => {
    expect(hasPermission("READER", "ASK_AI")).toBe(true);
    expect(hasPermission("READER", "APPROVE_REVIEW")).toBe(false);
    expect(hasPermission("AUTHOR", "CREATE_DOCUMENT")).toBe(true);
    expect(hasPermission("AUTHOR", "EDIT_DOCUMENT")).toBe(true);
    expect(hasPermission("REVIEWER", "APPROVE_REVIEW")).toBe(true);
    expect(hasPermission("REVIEWER", "CREATE_DOCUMENT")).toBe(false);
    expect(hasPermission("REVIEWER", "EDIT_DOCUMENT")).toBe(false);
    expect(hasPermission("REVIEWER", "PUBLISH_DOCUMENT")).toBe(false);
    expect(hasPermission("ADMIN", "CREATE_DOCUMENT")).toBe(false);
    expect(hasPermission("ADMIN", "EDIT_DOCUMENT")).toBe(false);
    expect(hasPermission("ADMIN", "PUBLISH_DOCUMENT")).toBe(true);
    expect(hasPermission("ADMIN", "MANAGE_USERS")).toBe(true);
  });

  it("limits failed login attempts per account rather than per client address", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await globalThis.fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "lockout@example.test", password: "wrong password" }),
      });
      expect(response.status).toBe(401);
    }

    const blocked = await globalThis.fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "lockout@example.test", password: "Demo@2026!" }),
    });
    expect(blocked.status).toBe(429);

    const otherAccount = await login("reader@example.test");
    expect(otherAccount.response.status).toBe(200);
  });

  it("allows Author to create and submit a document, then Reviewer to reject with a reason", async () => {
    const { body: author } = await login("author@example.test");
    const createResponse = await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Workflow document", content: "Initial content", category: "Operations", tags: [] }),
    });
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    expect(created.status).toBe("DRAFT");

    const submitResponse = await globalThis.fetch(`${baseUrl}/api/documents/${created.id}/review`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}` },
    });
    expect(submitResponse.status).toBe(201);
    const review = await submitResponse.json();

    const { body: reviewer } = await login("reviewer@example.test");
    const rejected = await globalThis.fetch(`${baseUrl}/api/reviews/${review.id}/reject`, {
      method: "POST",
      headers: { authorization: `Bearer ${reviewer.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ reason: "Please add the responsible department." }),
    });
    expect(rejected.status).toBe(200);
    expect((await globalThis.fetch(`${baseUrl}/api/documents/${created.id}`, {
      headers: { authorization: `Bearer ${author.accessToken}` },
    })).status).toBe(200);
    expect(documents.get(created.id)).toMatchObject({ status: "REJECTED", reviewerComment: "Please add the responsible department." });
    const edited = await globalThis.fetch(`${baseUrl}/api/documents/${created.id}`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Workflow document revised", content: "Updated content", category: "Operations" }),
    });
    expect(edited.status).toBe(200);
    expect(documents.get(created.id)).toMatchObject({ status: "DRAFT", title: "Workflow document revised" });
  });

  it("denies Reviewer creation and Admin editing on the server", async () => {
    const { body: reviewer } = await login("reviewer@example.test");
    const createResponse = await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${reviewer.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Forbidden", content: "Forbidden", category: "Operations" }),
    });
    expect(createResponse.status).toBe(403);

    const { body: author } = await login("author@example.test");
    const createAllowed = await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Admin edit denial", content: "Draft", category: "Operations" }),
    });
    const document = await createAllowed.json();
    const reviewerEdit = await globalThis.fetch(`${baseUrl}/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${reviewer.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Changed", content: "Changed", category: "Operations" }),
    });
    expect(reviewerEdit.status).toBe(403);
    const { body: admin } = await login("admin@example.test");
    const editResponse = await globalThis.fetch(`${baseUrl}/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${admin.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Changed", content: "Changed", category: "Operations" }),
    });
    expect(editResponse.status).toBe(403);
    expect(documents.get(document.id).title).toBe("Admin edit denial");
  });

  it("rejects invalid document data and an invalid workflow transition", async () => {
    const { body: author } = await login("author@example.test");
    const invalid = await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "   ", content: "x", category: "Ops" }),
    });
    expect(invalid.status).toBe(400);

    const created = await (await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Still draft", content: "Draft", category: "Ops" }),
    })).json();
    const { body: admin } = await login("admin@example.test");
    const publish = await globalThis.fetch(`${baseUrl}/api/documents/${created.id}/publish`, {
      method: "POST",
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(publish.status).toBe(409);
    expect((await publish.json()).error.code).toBe("DOCUMENT_NOT_APPROVED");
  });

  it("requires a rejection reason and leaves the review pending when validation fails", async () => {
    const { body: author } = await login("author@example.test");
    const created = await (await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Reason required", content: "Text", category: "Ops" }),
    })).json();
    const review = await (await globalThis.fetch(`${baseUrl}/api/documents/${created.id}/review`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}` },
    })).json();
    const { body: reviewer } = await login("reviewer@example.test");
    const response = await globalThis.fetch(`${baseUrl}/api/reviews/${review.id}/reject`, {
      method: "POST",
      headers: { authorization: `Bearer ${reviewer.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ reason: "  " }),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("REASON_REQUIRED");
    expect(reviewStates.get(review.id)).toBe("PENDING");
  });

  it("allows only Admin to publish an approved document", async () => {
    const { body: author } = await login("author@example.test");
    const created = await (await globalThis.fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ title: "Publish workflow", content: "Approved text", category: "Ops" }),
    })).json();
    const review = await (await globalThis.fetch(`${baseUrl}/api/documents/${created.id}/review`, {
      method: "POST",
      headers: { authorization: `Bearer ${author.accessToken}` },
    })).json();
    const { body: reviewer } = await login("reviewer@example.test");
    await globalThis.fetch(`${baseUrl}/api/reviews/${review.id}/approve`, {
      method: "POST",
      headers: { authorization: `Bearer ${reviewer.accessToken}`, "content-type": "application/json" },
      body: "{}",
    });
    const reviewerPublish = await globalThis.fetch(`${baseUrl}/api/documents/${created.id}/publish`, {
      method: "POST",
      headers: { authorization: `Bearer ${reviewer.accessToken}` },
    });
    expect(reviewerPublish.status).toBe(403);

    const { body: admin } = await login("admin@example.test");
    const published = await globalThis.fetch(`${baseUrl}/api/documents/${created.id}/publish`, {
      method: "POST",
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    expect(published.status).toBe(200);
    expect((await published.json()).status).toBe("PUBLISHED");
  });

  it("limits Reader retrieval to published documents and returns citations from backend search", async () => {
    documents.set("published-inventory", {
      id: "published-inventory",
      title: "Inventory receiving procedure",
      description: "Warehouse process",
      content: "Check delivery documents and verify the quantity of incoming goods.",
      category: "Operations",
      tags: ["inventory"],
      status: "PUBLISHED",
      currentVersion: "v1.0",
      author: { displayName: "Demo Author" },
      reviewRequests: [],
      versions: [{ version: "v1.0" }],
    });
    documents.set("private-draft", {
      id: "private-draft",
      title: "Secret draft",
      description: "",
      content: "Private content",
      category: "Operations",
      tags: [],
      status: "DRAFT",
      currentVersion: "Draft",
      author: { displayName: "Demo Author" },
      reviewRequests: [],
      versions: [],
    });
    const { body: reader } = await login("reader@example.test");
    const headers = { authorization: `Bearer ${reader.accessToken}` };
    const list = await (await globalThis.fetch(`${baseUrl}/api/documents`, { headers })).json();
    expect(list.items.map((document) => document.id)).toContain("published-inventory");
    expect(list.items.map((document) => document.id)).not.toContain("private-draft");
    expect((await globalThis.fetch(`${baseUrl}/api/documents/private-draft`, { headers })).status).toBe(404);

    const answer = await globalThis.fetch(`${baseUrl}/api/ai/ask`, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ question: "How to check incoming inventory?" }),
    });
    expect(answer.status).toBe(200);
    expect((await answer.json()).sources).toContainEqual({
      id: "published-inventory",
      title: "Inventory receiving procedure",
      version: "v1.0",
    });
    const noMatch = await globalThis.fetch(`${baseUrl}/api/ai/ask`, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ question: "astronomy galaxies black holes" }),
    });
    const fallback = await noMatch.json();
    expect(fallback.sources).toEqual([]);
    expect(fallback.answer).toContain("không sử dụng nguồn bên ngoài");
  });

  it("allows a Reviewer to approve a pending review", async () => {
    const { body } = await login("reviewer@example.test");
    const response = await globalThis.fetch(`${baseUrl}/api/reviews/review-1/approve`, {
      method: "POST",
      headers: { authorization: `Bearer ${body.accessToken}`, "content-type": "application/json" },
      body: "{}",
    });

    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe("APPROVED");
    expect(audit.at(-1)).toMatchObject({ action: "APPROVE", result: "SUCCESS" });
  });

  it("denies a Reader at the backend and audits the denied action", async () => {
    reviewStatus = "PENDING";
    const { body } = await login("reader@example.test");
    const response = await globalThis.fetch(`${baseUrl}/api/reviews/review-1/approve`, {
      method: "POST",
      headers: { authorization: `Bearer ${body.accessToken}`, "content-type": "application/json" },
      body: "{}",
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("FORBIDDEN");
    expect(audit.at(-1)).toMatchObject({ actorId: "reader-1", action: "APPROVE", result: "DENIED" });
    expect(reviewStatus).toBe("PENDING");
  });

  it("revokes the session on logout", async () => {
    const { body } = await login("reader@example.test");
    const headers = { authorization: `Bearer ${body.accessToken}` };
    expect((await globalThis.fetch(`${baseUrl}/api/auth/logout`, { method: "POST", headers })).status).toBe(204);
    expect((await globalThis.fetch(`${baseUrl}/api/auth/me`, { headers })).status).toBe(401);
  });
});