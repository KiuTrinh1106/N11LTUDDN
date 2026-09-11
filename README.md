# AI Document & Knowledge Management System

Hệ thống quản lý tài liệu và tri thức nội bộ với workflow `Create -> Review -> Publish -> Version -> Search/Ask`. Hệ thống hỗ trợ bốn role tối thiểu: `Reader`, `Author`, `Reviewer` và `Admin`; AI chỉ sử dụng tài liệu nội bộ mà người dùng có quyền truy cập và phải trả về citation nguồn.

> Trạng thái repository: baseline tài liệu và cấu hình nền. Mã nguồn runtime, schema Prisma và test implementation cần được bổ sung trước khi chạy đầy đủ ứng dụng.

## Stack

- TypeScript + Node.js
- PostgreSQL + Prisma ORM
- Vitest cho unit/integration test
- ESLint cho lint
- Assistant Orchestrator qua Backend; LLM không truy cập trực tiếp Database

## Quick Start

Yêu cầu: Node.js 20+, npm 10+ và PostgreSQL 15+ đang chạy cục bộ.

1. Clone repository và đi vào thư mục dự án:

   ```bash
   git clone <repository-url>
   cd MIS3032
   ```

2. Cài dependency:

   ```bash
   npm install
   ```

3. Tạo file môi trường cục bộ từ template. Không commit file `.env`:

   ```bash
   cp .env.example .env
   ```

   Trên Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Cập nhật `DATABASE_URL` bằng database PostgreSQL cục bộ. Các API key trong template là placeholder và không dùng được cho production.

4. Kiểm tra Prisma schema và chạy migration:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Nạp dữ liệu mẫu dành cho local development:

   ```bash
   npm run db:seed
   ```

6. Chạy kiểm tra chất lượng trước khi mở môi trường phát triển:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

7. Chạy development server:

   ```bash
   npm run dev
   ```

   Mặc định server dùng `PORT=3000`. Khi implementation runtime được bổ sung, mở `http://localhost:3000`.

> Repository hiện chưa có `prisma/schema.prisma`, entrypoint runtime hoặc test implementation. Vì vậy bước 4-7 chỉ chạy hoàn chỉnh sau khi các module implementation tương ứng được thêm vào; đây là giới hạn hiện tại của baseline.

## Commands

| Command                  | Mục đích                                           |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | Chạy development server với file entry TypeScript. |
| `npm run build`          | Type-check và build TypeScript vào `dist/`.        |
| `npm run lint`           | Chạy ESLint và fail nếu còn warning.               |
| `npm run typecheck`      | Chạy TypeScript compiler không phát sinh output.   |
| `npm test`               | Chạy Vitest một lần ở chế độ CI.                   |
| `npm run test:watch`     | Chạy Vitest ở chế độ watch khi phát triển.         |
| `npm run db:generate`    | Sinh Prisma Client.                                |
| `npm run db:migrate`     | Apply migration cho môi trường local/deploy.       |
| `npm run db:migrate:dev` | Tạo và apply migration trong development.          |
| `npm run db:seed`        | Chạy seed script đã cấu hình trong Prisma.         |
| `npm run check`          | Chạy lint, typecheck và test liên tiếp.            |

## Testing and Quality Gate

Pull request phải pass các lệnh sau:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Các test quan trọng cần bao phủ permission-aware retrieval, chuyển trạng thái `Draft -> Reviewing -> Approved/Rejected -> Published`, chỉ một current version, citation đúng nguồn, Structured Tool Calls hợp lệ và AuditEvent cho `Create`, `Edit`, `Review`, `Approve`, `Publish`, `Ask AI`.

## Deploy

1. Tạo build artifact từ commit đã pass quality gate:

   ```bash
   npm ci
   npm run build
   ```

2. Cấu hình secret qua secret manager của môi trường deploy; không đặt secret trong image, log hoặc repository.
3. Chạy migration có kiểm soát:

   ```bash
   npm run db:migrate
   ```

4. Khởi động process production:

   ```bash
   npm run start
   ```

5. Kiểm tra health endpoint, database connectivity, audit logging và một smoke test Search/Ask AI với tài liệu được phép.

## Rollback

- Nếu lỗi chỉ nằm ở application: chuyển traffic về artifact/commit trước đó, giữ nguyên migration tương thích và kiểm tra health/smoke test.
- Nếu migration gây lỗi: dừng rollout, bảo toàn database, khôi phục từ backup theo runbook vận hành và chỉ rollback schema bằng migration đã được review. Không dùng lệnh phá hủy dữ liệu trực tiếp trên production.
- Nếu LLM hoặc Search Provider lỗi: bật degraded behavior, trả lỗi rõ ràng hoặc `Insufficient data`; không cho AI tự suy đoán và không bypass permission check.
- Sau rollback, đối chiếu AuditEvent, current version và dữ liệu Draft để bảo đảm không mất dữ liệu.

## Known Limitations

- Stack runtime, API contract implementation, Prisma schema và migrations chưa có trong repository baseline.
- Auth provider và mô hình RBAC/ABAC chi tiết chưa được chốt; hiện chỉ quy định bốn role tối thiểu.
- LLM provider, model, prompt version và Q&A benchmark chưa được cấu hình thật.
- VoiceControl không thuộc MVP text flow đã nghiệm thu; nếu bổ sung phải có text fallback.
- Search index, retention job 02:00 và external notification adapter chưa có implementation.
- Không commit `.env`, credential, API key thật hoặc dữ liệu production vào repository.

## Security Notes

- LLM không có Database credential và chỉ được gọi qua Assistant Orchestrator.
- Backend là nơi validate Structured Tool Calls, kiểm tra quyền và lấy dữ liệu source-of-truth.
- Search, citation và Q&A không được trả tài liệu hoặc metadata ngoài quyền người dùng.
- Audit log là append-only theo thiết kế và phải ghi actor, action, object, time và result.
