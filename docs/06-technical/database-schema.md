# Database Schema

## 1. Phạm vi

PostgreSQL là Operational Database và source-of-truth của User, Document, Draft,
Review, Version, Permission, AI source và AuditEvent. Search Index nếu được triển
khai chỉ là bản sao tối ưu truy vấn, không thay thế các ràng buộc hoặc kiểm tra
permission trong PostgreSQL.

## 2. Quy ước chung

- Khóa chính dùng `uuid`; thời gian dùng `timestamptz` ở UTC.
- Các cột bắt buộc dùng `NOT NULL`; `updated_at` được cập nhật bởi application khi
	bản ghi thay đổi.
- Enum trong tài liệu là logical enum; migration có thể triển khai bằng PostgreSQL
	`CREATE TYPE` hoặc `CHECK constraint`, nhưng phải giữ đúng tập giá trị dưới đây.
- Không hard-delete User, DocumentVersion hoặc AuditEvent đã phát sinh dữ liệu
	nghiệp vụ. Các thao tác xóa phải được kiểm soát bởi Domain Service và audit.

## 3. Enum

| Enum | Giá trị |
| --- | --- |
| `user_role` | `READER`, `AUTHOR`, `REVIEWER`, `ADMIN` |
| `document_status` | `DRAFT`, `REVIEWING`, `PUBLISHED` |
| `draft_status` | `DRAFT`, `REVIEWING`, `APPROVED`, `REJECTED` |
| `review_status` | `PENDING`, `APPROVED`, `REJECTED` |
| `document_permission` | `VIEW`, `EDIT`, `ORGANIZE`, `ASK_AI` |
| `ai_conversation_status` | `ACTIVE`, `COMPLETED`, `FAILED` |
| `ai_message_role` | `USER`, `ASSISTANT`, `TOOL` |
| `tool_validation_status` | `PENDING`, `ACCEPTED`, `REJECTED`, `EXECUTED`, `FAILED` |
| `audit_result` | `SUCCESS`, `FAILURE`, `DENIED` |

## 4. Bảng nghiệp vụ

### `users`

| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `email` | `citext` | NOT NULL, UNIQUE |
| `password_hash` | `text` | NULL nếu dùng identity provider bên ngoài |
| `display_name` | `text` | NOT NULL |
| `role` | `user_role` | NOT NULL |
| `is_active` | `boolean` | NOT NULL, default `true` |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL |

### `folders`

`name` là duy nhất trong toàn hệ thống, không phân biệt hoa thường.

| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `created_by` | `uuid` | FK -> `users.id` |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL |

Constraint: `UNIQUE (lower(name))`.

### `documents`

| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `title` | `text` | NOT NULL |
| `folder_id` | `uuid` | FK -> `folders.id`, NOT NULL |
| `status` | `document_status` | NOT NULL, default `DRAFT` |
| `owner_id` | `uuid` | FK -> `users.id`, NOT NULL |
| `current_version_id` | `uuid` | FK -> `document_versions.id`, NULL |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL |

`current_version_id` phải trỏ tới version cùng Document và có `is_current = true`.
Publish và thay thế current version phải thực hiện trong một transaction.

### `document_drafts`

| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `document_id` | `uuid` | FK -> `documents.id`, NOT NULL |
| `content` | `text` | NOT NULL |
| `title_snapshot` | `text` | NOT NULL |
| `folder_id` | `uuid` | FK -> `folders.id`, NOT NULL |
| `status` | `draft_status` | NOT NULL, default `DRAFT` |
| `created_by`, `updated_by` | `uuid` | FK -> `users.id`, NOT NULL |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL |

Chỉ một Draft đang hoạt động cho mỗi Document. Có thể dùng partial unique index:
`UNIQUE (document_id) WHERE status IN ('DRAFT', 'REVIEWING', 'REJECTED', 'APPROVED')`.

### `tags` và `document_tags`

`tags` gồm `id uuid PK`, `name citext NOT NULL UNIQUE`, `created_by uuid FK -> users.id`,
`created_at` và `updated_at`. `document_tags` gồm `document_id uuid`, `tag_id uuid`,
`created_at` và `updated_at`, với PK/UNIQUE `(document_id, tag_id)` và hai FK tương ứng.

### `document_permissions`

Gồm `id uuid PK`, `document_id uuid NOT NULL FK`, `user_id uuid NOT NULL FK`,
`permission document_permission NOT NULL`, `granted_by uuid NOT NULL FK`,
`created_at` và `updated_at`. Dùng `UNIQUE (document_id, user_id, permission)`.

### `document_versions`

| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `document_id` | `uuid` | FK -> `documents.id`, NOT NULL |
| `version_number` | `integer` | NOT NULL, CHECK > 0 |
| `content` | `text` | NOT NULL |
| `title_snapshot` | `text` | NOT NULL |
| `folder_snapshot` | `jsonb` | NOT NULL |
| `tag_snapshot` | `jsonb` | NOT NULL |
| `published_by` | `uuid` | FK -> `users.id`, NOT NULL |
| `published_at` | `timestamptz` | NOT NULL |
| `replaced_at` | `timestamptz` | NULL |
| `is_current` | `boolean` | NOT NULL, default `true` |
| `created_at`, `updated_at` | `timestamptz` | NOT NULL |

Dùng `UNIQUE (document_id, version_number)` và partial unique index
`UNIQUE (document_id) WHERE is_current = true`. Version đã Publish là immutable.

### `review_requests`

Gồm `id uuid PK`, `document_id uuid NOT NULL FK`, `draft_id uuid NOT NULL FK`,
`submitted_by uuid NOT NULL FK`, `status review_status NOT NULL`, `reviewer_id uuid NULL FK`,
`decision_reason text NULL`, `submitted_at timestamptz NOT NULL`, `reviewed_at timestamptz NULL`,
`created_at` và `updated_at`. Dùng partial unique index
`UNIQUE (draft_id) WHERE status = 'PENDING'`.

Application hoặc trigger phải bảo đảm `draft_id` thuộc `document_id`; Approve/Reject
bắt buộc có `reviewer_id` và `reviewed_at`.

### AI và audit

- `ai_conversations`: `id`, `user_id FK`, `document_id FK NULL`, `status`, timestamps.
- `ai_messages`: `id`, `conversation_id FK`, `role`, `content`, `request_id`, timestamps;
	append-only sau khi ghi nhận.
- `ai_sources`: `id`, `message_id FK`, `document_id FK`, `version_id FK`, `citation_label`,
	timestamps. `document_id` và `version_id` phải cùng thuộc một Document.
- `tool_calls`: `id`, `message_id FK`, `tool_name`, `arguments_json jsonb`,
	`validation_status`, `executed_at`, timestamps.
- `audit_events`: `id`, `actor_id FK NULL`, `action`, `object_type`, `object_id`,
	`result`, `metadata_json jsonb`, `correlation_id`, `occurred_at`, timestamps.

`audit_events` append-only; tối thiểu phải có action `CREATE`, `EDIT`, `REVIEW`,
`APPROVE`, `REJECT`, `PUBLISH`, `SEARCH`, `ASK_AI`, `PERMISSION_CHANGE`.

## 5. Quan hệ chính

```text
users 1--* documents
folders 1--* documents
documents 1--* document_drafts
documents 1--* document_versions
documents 1--* review_requests
documents *--* tags (through document_tags)
documents 1--* document_permissions
users 1--* ai_conversations 1--* ai_messages 1--* ai_sources
documents 1--* ai_sources
```

## 6. Index và transaction bắt buộc

- Index `documents(owner_id, status)`, `documents(folder_id, status)` và
	`document_permissions(user_id, document_id, permission)`.
- Index `review_requests(status, submitted_at)` cho Review Queue.
- Index `ai_messages(conversation_id, created_at, id)` để lấy đúng thứ tự message.
- Index `audit_events(object_type, object_id, occurred_at)` và
	`audit_events(actor_id, occurred_at)`.
- Transaction Publish phải khóa Document, kiểm tra Draft `APPROVED`, tạo version kế tiếp,
	đặt version cũ `is_current = false` và `replaced_at`, đặt version mới current, cập nhật
	`documents.current_version_id/status`, rồi ghi audit. Nếu một bước lỗi thì rollback toàn bộ.

Retention chỉ xóa version không current có `replaced_at` quá một năm; không xóa current
version hoặc bản ghi cần giữ cho audit.
