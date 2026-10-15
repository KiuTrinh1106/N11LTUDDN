import { PrismaClient } from "@prisma/client";
import process from "node:process";
import { Console } from "node:console";
import { hashPassword } from "../src/server/security.mjs";

const prisma = new PrismaClient();
const logger = new Console(process.stdout, process.stderr);
const demoPassword = process.env.DEMO_PASSWORD;
if (!demoPassword || demoPassword.length < 12 || demoPassword.includes("replace_with")) {
  throw new Error("Set DEMO_PASSWORD to a local password of at least 12 characters before seeding");
}

const demoUsers = [
  { id: "00000000-0000-4000-8000-000000000001", email: "reader@demo.local", displayName: "Demo Reader", role: "READER" },
  { id: "00000000-0000-4000-8000-000000000002", email: "author@demo.local", displayName: "Demo Author", role: "AUTHOR" },
  { id: "00000000-0000-4000-8000-000000000003", email: "reviewer@demo.local", displayName: "Demo Reviewer", role: "REVIEWER" },
  { id: "00000000-0000-4000-8000-000000000004", email: "admin@demo.local", displayName: "Demo Admin", role: "ADMIN" },
];

try {
  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { displayName: user.displayName, role: user.role, isActive: true, passwordHash: hashPassword(demoPassword) },
      create: { ...user, isActive: true, passwordHash: hashPassword(demoPassword) },
    });
  }
  const publishedDocument = await prisma.document.upsert({
    where: { id: "demo-doc-inventory" },
    update: {
      title: "Quy trình tiếp nhận hàng hóa nhập kho",
      description: "Hướng dẫn kiểm tra và ghi nhận hàng hóa khi nhập kho.",
      content: "1. Kiểm tra phiếu giao hàng và đơn đặt hàng.\n2. Đối chiếu số lượng, mã hàng và tình trạng.\n3. Ghi nhận sai lệch và báo người phụ trách.\n4. Xác nhận nhập kho sau khi hoàn tất kiểm tra.",
      category: "Vận hành",
      tags: ["nhập kho", "hàng hóa", "quy trình"],
      status: "PUBLISHED",
      currentVersion: "v1.0",
      authorId: demoUsers[1].id,
    },
    create: {
      id: "demo-doc-inventory",
      title: "Quy trình tiếp nhận hàng hóa nhập kho",
      description: "Hướng dẫn kiểm tra và ghi nhận hàng hóa khi nhập kho.",
      content: "1. Kiểm tra phiếu giao hàng và đơn đặt hàng.\n2. Đối chiếu số lượng, mã hàng và tình trạng.\n3. Ghi nhận sai lệch và báo người phụ trách.\n4. Xác nhận nhập kho sau khi hoàn tất kiểm tra.",
      category: "Vận hành",
      tags: ["nhập kho", "hàng hóa", "quy trình"],
      status: "PUBLISHED",
      currentVersion: "v1.0",
      authorId: demoUsers[1].id,
    },
  });
  await prisma.documentVersion.upsert({
    where: { documentId_version: { documentId: publishedDocument.id, version: "v1.0" } },
    update: {
      title: publishedDocument.title,
      content: publishedDocument.content,
      publishedBy: demoUsers[3].id,
    },
    create: {
      documentId: publishedDocument.id,
      version: "v1.0",
      title: publishedDocument.title,
      content: publishedDocument.content,
      publishedBy: demoUsers[3].id,
    },
  });
  const reviewDocument = await prisma.document.upsert({
    where: { id: "demo-doc-review" },
    update: {
      title: "Quy trình xử lý hàng hóa lỗi",
      description: "Bản nháp mẫu đang chờ Reviewer quyết định.",
      content: "1. Cách ly hàng hóa lỗi.\n2. Ghi nhận mã hàng và tình trạng.\n3. Thông báo quản lý kho để xử lý.",
      category: "Vận hành",
      tags: ["hàng lỗi", "kiểm duyệt"],
      status: "REVIEWING",
      currentVersion: "Draft",
      authorId: demoUsers[1].id,
    },
    create: {
      id: "demo-doc-review",
      title: "Quy trình xử lý hàng hóa lỗi",
      description: "Bản nháp mẫu đang chờ Reviewer quyết định.",
      content: "1. Cách ly hàng hóa lỗi.\n2. Ghi nhận mã hàng và tình trạng.\n3. Thông báo quản lý kho để xử lý.",
      category: "Vận hành",
      tags: ["hàng lỗi", "kiểm duyệt"],
      status: "REVIEWING",
      authorId: demoUsers[1].id,
    },
  });
  await prisma.reviewRequest.upsert({
    where: { id: "00000000-0000-4000-8000-000000000010" },
    update: { title: reviewDocument.title, documentId: reviewDocument.id, status: "PENDING", submittedById: demoUsers[1].id, reviewerId: null, decisionReason: null, reviewedAt: null, submittedAt: new Date() },
    create: { id: "00000000-0000-4000-8000-000000000010", title: reviewDocument.title, documentId: reviewDocument.id, status: "PENDING", submittedById: demoUsers[1].id },
  });
  logger.log(`Seeded ${demoUsers.length} demo users, two documents and one pending review.`);
} finally {
  await prisma.$disconnect();
}