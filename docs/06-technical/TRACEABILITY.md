# Ma trận truy vết v1

## Cấu trúc backlog

`Epic -> User Story -> Tiêu chí chấp nhận -> Task -> Tài liệu liên quan -> Kiểm thử`

## Definition of Ready - Điều kiện sẵn sàng

Một User Story chỉ được xem là sẵn sàng khi:

- actor, mục tiêu và giá trị mang lại được mô tả rõ;
- các requirement liên quan đã được xác định;
- tiêu chí chấp nhận bao phủ luồng thành công và các trường hợp từ chối/lỗi quan trọng;
- dependency và nội dung ngoài phạm vi đã được nêu;
- màn hình, API, dữ liệu và tài liệu kiểm thử đã được xác định;
- User Story đã được gán Epic và estimate.

Mỗi Task phải có đúng một User Story cha, người phụ trách, estimate, trạng thái và liên kết tài liệu. Task được tạo trên Taiga bên dưới User Story tương ứng; không được có Task vô chủ.

## Truy vết end-to-end cho REQ-FR-13

| Tầng truy vết | Nội dung |
| --- | --- |
| Requirement | `REQ-FR-13`: Reader có thể đặt câu hỏi bằng văn bản về các tài liệu được phép trong kho tri thức. |
| Epic | `EP6 - Trợ lý tri thức AI` |
| User Story | `US-AI-10 - Hỏi AI về tài liệu được phép` |
| Tiêu chí chấp nhận | Reader nhận được câu trả lời từ version hiện hành được phép; tài liệu trái quyền bị loại khỏi context, câu trả lời và citation; khi không đủ context, hệ thống trả thông báo đã quy định, không tự đoán và không dùng Internet. |
| Màn hình | Hỏi AI, Câu trả lời AI, Đang xử lý, Lỗi, Không đủ dữ liệu, Citation |
| API | `POST /api/ai/conversations`; `POST /api/ai/conversations/:conversationId/messages`; `GET /api/ai/requests/:requestId` |
| Dữ liệu | Conversation, AiMessage, AiRequest, AiSource, Document, DocumentVersion, Permission |
| Task | T-801, T-802, T-803, T-804, T-805, T-806 |
| Phạm vi code | Màn hình Hỏi AI/Câu trả lời trong `src/app/App.tsx`; các module retrieval và Q&A trong `src/modules/knowledge/` |
| Kiểm thử | Hỏi đáp bằng version hiện hành được phép; loại nguồn trái quyền; thiếu dữ liệu; không dùng Internet; benchmark Q&A >= 80%; kiểm tra tính hợp lệ của citation |
| Bằng chứng nghiệm thu | `docs/07-testing/test-strategy.md`, `docs/02-requirements/vault-qa-benchmark.md.md`, `docs/08-release/release-checklist.md` |

## Phạm vi bao phủ User Story

| Epic | User Story | Nhóm Task |
| --- | --- | --- |
| EP1 - Quản lý quyền truy cập | US-AI-01, US-AI-02 | T-101..T-210 |
| EP2 - Quản lý và tổ chức tài liệu | US-AI-03, US-AI-04 | T-301..T-314 |
| EP3 - Quy trình Review và Publish | US-AI-05, US-AI-06, US-AI-07 | T-401..T-509 |
| EP4 - Quản lý Version và lịch sử | US-AI-08 | T-601..T-611 |
| EP5 - Tìm kiếm và khám phá tri thức | US-AI-09 | T-701..T-706 |
| EP6 - Trợ lý tri thức AI | US-AI-10, US-AI-11 | T-801..T-904 |
| EP7 - Audit hoạt động quan trọng | US-AI-12 | T-1001..T-1002 |

## Danh mục tài liệu liên quan

- Requirements: `docs/02-requirements/requirements.md`
- User Story và tiêu chí chấp nhận: `docs/04-backlog/user-stories.md`
- Phân công Task: `docs/03-product/task-assignment.md`
- Kiến trúc: `docs/06-technical/architecture.md`
- API: `docs/06-technical/api-contract.md`
- Mô hình dữ liệu/schema: `docs/06-technical/data-model.md`, `docs/06-technical/database-schema.md`
- Thiết kế: `docs/05-design/`
- Kiểm thử: `docs/07-testing/`
- Phát hành: `docs/08-release/`

## Bằng chứng trên Taiga

Dự án: `kiutrinh1106-ai-document-knowledge-management-system`  
Mã dự án Taiga: `1805780`  
12 User Story đều đã được liên kết với một Epic. Tất cả Task đã tạo đều có User Story cha và trạng thái `New`.
