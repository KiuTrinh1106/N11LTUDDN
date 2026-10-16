# AI Document & Knowledge Management System

Hệ thống quản lý tài liệu và tri thức nội bộ với workflow `Create -> Review -> Publish -> Version -> Search/Ask`. Hệ thống hỗ trợ bốn role tối thiểu: `Reader`, `Author`, `Reviewer` và `Admin`; AI chỉ sử dụng tài liệu nội bộ mà người dùng có quyền truy cập và phải trả về citation nguồn.

> Backend hiện dùng FastAPI + PostgreSQL; frontend phát triển bằng Vite/React. Prisma vẫn được dùng để quản lý schema, migration và dữ liệu seed.

## Stack

- Python + FastAPI cho backend
- TypeScript + React + Vite cho frontend
- PostgreSQL + Prisma ORM
- Vitest cho frontend/Node tooling; pytest cho backend Python
- ESLint cho lint
- Assistant Orchestrator qua Backend; LLM không truy cập trực tiếp Database

## Repository Structure

```text
backend/
  app/                 FastAPI application
  tests/               Python API tests
frontend/
  src/app/             React application, entry point, and styles
docs/                  Requirements, design, technical, test, and release documents
prisma/
  migrations/          Versioned PostgreSQL schema migrations
  schema.prisma        Database schema
  seed.mjs             Local demo data
public/                Static public assets and standalone demo
src/server/            Auth/backend integration and Vitest tests
vault/                 Project domain knowledge and glossary
.env.example           Safe local configuration template
requirements.txt       Python backend dependencies
package.json           Frontend, API, database, and quality commands
```

Generated files and local-only configuration (`.env`, `.venv`, `node_modules`, `dist`, Python caches) are excluded from Git. Commit source, migration files, tests, and safe example configuration instead.

## Quick Start

Yêu cầu: Python 3.10+, Node.js 20.6+, npm 10+ và PostgreSQL 15+ đang chạy cục bộ.

1. Clone repository và đi vào thư mục dự án:

   ```bash
   git clone https://github.com/KiuTrinh1106/N11LTUDDN.git
   cd N11LTUDDN
   ```

2. Cài dependency frontend/tooling và tạo môi trường Python cho backend. Frontend và API cùng được quản lý bởi `package.json` ở thư mục gốc:

   ```powershell
   npm ci
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   npm run api:install
   ```

3. Tạo file môi trường cục bộ từ template. Không commit file `.env`:

   ```bash
   cp .env.example .env
   ```

   Trên Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Cập nhật `DATABASE_URL`, `AUTH_SECRET` (tối thiểu 32 ký tự) và `DEMO_PASSWORD` (tối thiểu 12 ký tự) bằng giá trị local. API key trong template chỉ là placeholder; không dùng key thật trong file mẫu hoặc commit.

4. Khởi tạo schema và dữ liệu PostgreSQL:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. Chạy backend và frontend trong hai cửa sổ PowerShell riêng:

   ```bash
   # Terminal 1 - FastAPI, http://127.0.0.1:3000
   npm run dev:api
   ```

   ```bash
   # Terminal 2 - Vite, http://localhost:5173
   npm run dev
   ```

   Backend Monitoring Dashboard được FastAPI phục vụ tại `http://127.0.0.1:3000/`. Vite chuyển các request `/api` sang FastAPI tại cổng 3000. Kiểm tra backend bằng `http://127.0.0.1:3000/api/health`.

## Commands

| Command                  | Mục đích                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `npm run api:install`    | Cài dependencies backend từ `requirements.txt`.                |
| `npm run dev:api`        | Chạy FastAPI bằng Uvicorn ở cổng 3000, tự reload khi sửa code. |
| `npm run start`          | Chạy FastAPI ở chế độ production.                              |
| `npm run dev`               | Chạy Vite frontend trong `frontend/` ở cổng 5173.              |
| `npm run build`          | Type-check và build frontend vào `dist/`.                      |
| `npm run lint`           | Chạy ESLint và fail nếu còn warning.                           |
| `npm run typecheck`      | Chạy TypeScript compiler không phát sinh output.               |
| `npm test`               | Chạy Vitest một lần ở chế độ CI.                               |
| `npm run test:watch`     | Chạy Vitest ở chế độ watch khi phát triển.                     |
| `npm run db:generate`    | Sinh Prisma Client phục vụ migration/seed.                     |
| `npm run db:migrate`     | Apply migration cho môi trường local/deploy.                   |
| `npm run db:migrate:dev` | Tạo và apply migration trong development.                      |
| `npm run db:seed`        | Nạp dữ liệu demo bằng Prisma.                                  |
| `npm run check`          | Chạy lint, typecheck và test liên tiếp.                        |

## Upload tài liệu

Author có thể chọn tệp PDF, DOCX hoặc TXT khi tạo tài liệu. Hệ thống trích xuất
văn bản vào nội dung bản nháp và lưu bản gốc trong PostgreSQL để người có quyền
xem tài liệu có thể tải xuống. Giới hạn mỗi tệp là 10 MB; tệp PDF scan không có
lớp văn bản không được OCR. Các tệp được lưu trong database, không lưu trên ổ
đĩa tạm của web service Render.

Sau khi cập nhật mã nguồn, cài lại các dependency Python và áp dụng migration:

```powershell
npm run api:install
npm run db:migrate
```

Migration `20261015000000_document_attachments` tạo bảng lưu metadata và nội dung
nhị phân của tệp đính kèm.

## Testing and Quality Gate

Pull request phải pass các lệnh sau:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Các test quan trọng cần bao phủ permission-aware retrieval, chuyển trạng thái `Draft -> Reviewing -> Approved/Rejected -> Published`, chỉ một current version, citation đúng nguồn, Structured Tool Calls hợp lệ và AuditEvent cho `Create`, `Edit`, `Review`, `Approve`, `Publish`, `Ask AI`.

## GitHub Contribution Workflow

- Mỗi thành viên làm việc trên branch riêng, commit phần việc do mình thực hiện với message mô tả rõ thay đổi, sau đó mở Pull Request để review.
- Không tạo commit/PR thay người khác hoặc ghi contribution chưa có thật. Trước khi nộp, bổ sung URL repository GitHub thật và liên kết PR/commit của từng thành viên trong [hướng dẫn nộp bài](docs/08-release/final-submission-guide.md).
- Chỉ đẩy các file cần thiết; không `git add .env`, credential, API key, `.venv`, `node_modules` hoặc build output.

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

4. Cài dependencies Python và khởi động backend production:

   ```bash
   python -m pip install -r requirements.txt
   npm run start
   ```

5. Kiểm tra health endpoint, database connectivity, audit logging và một smoke test Search/Ask AI với tài liệu được phép.

## Rollback

- Nếu lỗi chỉ nằm ở application: chuyển traffic về artifact/commit trước đó, giữ nguyên migration tương thích và kiểm tra health/smoke test.
- Nếu migration gây lỗi: dừng rollout, bảo toàn database, khôi phục từ backup theo runbook vận hành và chỉ rollback schema bằng migration đã được review. Không dùng lệnh phá hủy dữ liệu trực tiếp trên production.
- Nếu LLM hoặc Search Provider lỗi: bật degraded behavior, trả lỗi rõ ràng hoặc `Insufficient data`; không cho AI tự suy đoán và không bypass permission check.
- Sau rollback, đối chiếu AuditEvent, current version và dữ liệu Draft để bảo đảm không mất dữ liệu.

## Known Limitations

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
