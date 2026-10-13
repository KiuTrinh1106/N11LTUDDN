import { resolve } from "node:path";
import process from "node:process";
import { Console } from "node:console";
import { PrismaClient } from "@prisma/client";
import { createApiServer } from "./http.mjs";

const logger = new Console(process.stdout, process.stderr);

const secret = process.env.AUTH_SECRET;
if (!secret || secret.length < 32 || secret.includes("replace_with")) {
  throw new Error("Set AUTH_SECRET to a locally generated value of at least 32 characters");
}

const prisma = new PrismaClient();
const documentInclude = {
  author: { select: { displayName: true } },
  versions: { orderBy: { publishedAt: "asc" }, select: { version: true, title: true, content: true, publishedAt: true, publisher: { select: { displayName: true } } } },
  reviewRequests: { orderBy: { submittedAt: "desc" }, take: 1, select: { id: true, status: true, decisionReason: true } },
};
const store = {
  healthCheck: () => prisma.$queryRaw`SELECT 1`,
  findUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findUserById: (id) => prisma.user.findUnique({ where: { id } }),
  createSession: ({ userId, expiresAt }) => prisma.authSession.create({ data: { userId, expiresAt } }),
  findSession: (id) => prisma.authSession.findUnique({ where: { id } }),
  revokeSession: (id) => prisma.authSession.update({ where: { id }, data: { revokedAt: new Date() } }),
  listPendingReviews: () => prisma.reviewRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true,
      title: true,
      documentId: true,
      submittedBy: { select: { displayName: true } },
      submittedAt: true,
      document: { select: { category: true, author: { select: { displayName: true } } } },
    },
  }),
  listDocuments: ({ role, actorId }) => prisma.document.findMany({
    where: role === "READER"
      ? { status: "PUBLISHED" }
      : role === "AUTHOR"
        ? { OR: [{ status: "PUBLISHED" }, { authorId: actorId }] }
        : {},
    orderBy: { updatedAt: "desc" },
    include: documentInclude,
  }),
  listPublishedDocuments: () => prisma.document.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, description: true, content: true, category: true, tags: true, currentVersion: true },
  }),
  findDocumentById: (id) => prisma.document.findUnique({ where: { id }, include: documentInclude }),
  createDocument: ({ actorId, ...data }) => prisma.$transaction(async (transaction) => {
    const document = await transaction.document.create({ data: { ...data, authorId: actorId }, include: documentInclude });
    await transaction.auditEvent.create({
      data: { actorId, action: "CREATE", objectType: "DOCUMENT", objectId: document.id, result: "SUCCESS" },
    });
    return document;
  }),
  updateDocumentDraft: ({ documentId, actorId, ...data }) => prisma.$transaction(async (transaction) => {
    const current = await transaction.document.findUnique({ where: { id: documentId } });
    if (!current) throw Object.assign(new Error("Document not found"), { code: "NOT_FOUND" });
    const changed = await transaction.document.updateMany({
      where: { id: documentId, authorId: actorId, status: { in: ["DRAFT", "REJECTED"] } },
      data: { ...data, status: "DRAFT", reviewerComment: null, currentVersion: "Draft" },
    });
    if (changed.count !== 1) throw Object.assign(new Error("Document cannot be edited"), { code: "INVALID_STATE" });
    await transaction.auditEvent.create({
      data: { actorId, action: "EDIT", objectType: "DOCUMENT", objectId: documentId, result: "SUCCESS" },
    });
    return transaction.document.findUniqueOrThrow({ where: { id: documentId }, include: documentInclude });
  }),
  submitDocumentForReview: ({ documentId, actorId }) => prisma.$transaction(async (transaction) => {
    const document = await transaction.document.findUnique({ where: { id: documentId } });
    if (!document) throw Object.assign(new Error("Document not found"), { code: "NOT_FOUND" });
    const changed = await transaction.document.updateMany({
      where: { id: documentId, authorId: actorId, status: { in: ["DRAFT", "REJECTED"] } },
      data: { status: "REVIEWING", reviewerComment: null },
    });
    if (changed.count !== 1) throw Object.assign(new Error("Document cannot be submitted"), { code: "INVALID_STATE" });
    const review = await transaction.reviewRequest.create({
      data: { title: document.title, documentId, submittedById: actorId },
      select: { id: true, documentId: true, title: true, status: true, submittedAt: true },
    });
    await transaction.auditEvent.create({
      data: { actorId, action: "SUBMIT_REVIEW", objectType: "DOCUMENT", objectId: documentId, result: "SUCCESS" },
    });
    return review;
  }),
  recordAudit: (event) => prisma.auditEvent.create({ data: event }),
  decideReview: ({ reviewId, reviewerId, decision, reason }) => prisma.$transaction(async (transaction) => {
    const current = await transaction.reviewRequest.findUnique({ where: { id: reviewId } });
    if (!current) throw Object.assign(new Error("Review request not found"), { code: "NOT_FOUND" });
    if (current.status !== "PENDING") throw Object.assign(new Error("Review request is no longer pending"), { code: "INVALID_STATE" });
    const changed = await transaction.reviewRequest.updateMany({
      where: { id: reviewId, status: "PENDING" },
      data: { status: decision, reviewerId, decisionReason: reason, reviewedAt: new Date() },
    });
    if (changed.count !== 1) throw Object.assign(new Error("Review request is no longer pending"), { code: "INVALID_STATE" });
    if (current.documentId) {
      const documentChanged = await transaction.document.updateMany({
        where: { id: current.documentId, status: "REVIEWING" },
        data: { status: decision, reviewerComment: reason },
      });
      if (documentChanged.count !== 1) throw Object.assign(new Error("Document is no longer in review"), { code: "INVALID_STATE" });
    }
    await transaction.auditEvent.create({
      data: { actorId: reviewerId, action: decision === "APPROVED" ? "APPROVE" : "REJECT", objectType: "REVIEW_REQUEST", objectId: reviewId, result: "SUCCESS" },
    });
    const review = await transaction.reviewRequest.findUniqueOrThrow({
      where: { id: reviewId },
      select: { id: true, title: true, documentId: true, status: true, reviewerId: true, decisionReason: true, reviewedAt: true },
    });
    return review;
  }),
  publishDocument: ({ documentId, actorId }) => prisma.$transaction(async (transaction) => {
    const document = await transaction.document.findUnique({ where: { id: documentId }, include: { versions: true } });
    if (!document) throw Object.assign(new Error("Document not found"), { code: "NOT_FOUND" });
    if (document.status !== "APPROVED") throw Object.assign(new Error("Document is not approved"), { code: "INVALID_STATE" });
    const previous = document.versions.reduce((max, item) => {
      const parsed = Number(item.version.replace(/^v/i, ""));
      return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
    }, 0);
    const version = previous === 0 ? "v1.0" : `v${(previous + 0.1).toFixed(1)}`;
    const changed = await transaction.document.updateMany({
      where: { id: documentId, status: "APPROVED" },
      data: { status: "PUBLISHED", currentVersion: version, reviewerComment: null },
    });
    if (changed.count !== 1) throw Object.assign(new Error("Document is not approved"), { code: "INVALID_STATE" });
    await transaction.documentVersion.create({
      data: { documentId, version, title: document.title, content: document.content, publishedBy: actorId },
    });
    await transaction.auditEvent.create({
      data: { actorId, action: "PUBLISH", objectType: "DOCUMENT", objectId: documentId, result: "SUCCESS" },
    });
    return transaction.document.findUniqueOrThrow({ where: { id: documentId }, include: documentInclude });
  }),
  listAuditEvents: () => prisma.auditEvent.findMany({
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { actor: { select: { displayName: true } } },
  }),
};

const server = createApiServer({
  store,
  secret,
  sessionTtlSeconds: Number(process.env.AUTH_SESSION_TTL_SECONDS ?? 86_400),
  demoPagePath: resolve("public/final-demo.html"),
  staticDir: resolve("dist"),
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
server.listen(port, host, () => logger.log(`AI KMS demo API listening at http://${host}:${port}`));

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);