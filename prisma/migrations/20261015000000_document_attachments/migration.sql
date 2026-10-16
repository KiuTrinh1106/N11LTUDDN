CREATE TABLE "document_attachments" (
    "id" UUID NOT NULL,
    "document_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_attachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_attachments_document_id_key" ON "document_attachments"("document_id");
CREATE INDEX "document_attachments_uploaded_by_created_at_idx" ON "document_attachments"("uploaded_by", "created_at");

ALTER TABLE "document_attachments" ADD CONSTRAINT "document_attachments_document_id_fkey"
    FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_attachments" ADD CONSTRAINT "document_attachments_uploaded_by_fkey"
    FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
