CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'REVIEWING', 'APPROVED', 'REJECTED', 'PUBLISHED');

CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewer_comment" TEXT,
    "current_version" TEXT NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "author_id" UUID NOT NULL,
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published_by" UUID NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "review_requests" ADD COLUMN "document_id" TEXT;

CREATE INDEX "documents_status_updated_at_idx" ON "documents"("status", "updated_at");
CREATE INDEX "documents_author_id_status_idx" ON "documents"("author_id", "status");
CREATE UNIQUE INDEX "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");
CREATE INDEX "document_versions_document_id_published_at_idx" ON "document_versions"("document_id", "published_at");
CREATE INDEX "review_requests_document_id_idx" ON "review_requests"("document_id");

ALTER TABLE "documents" ADD CONSTRAINT "documents_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
