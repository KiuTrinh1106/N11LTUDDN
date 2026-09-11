# Vertical Slice MVP - US-AI-12

## Quyết định

Chọn **US-AI-12 - Hỏi AI về các tài liệu được phép truy cập** làm User Story trọng tâm cho vertical slice đầu tiên.

> Với vai trò là Reader, tôi muốn hỏi AI về nội dung các tài liệu mà tôi được phép truy cập, để nhận được câu trả lời có thể kiểm chứng từ kho tri thức nội bộ.

## Lý do chọn

US-AI-12 là lát cắt có giá trị sản phẩm cao nhất và đi xuyên qua các lớp chính của hệ thống:

`Reader UI -> API Gateway/Auth -> Permission-aware Retrieval -> Assistant Orchestrator -> LLM Adapter -> Citation/Source Record -> Audit Log -> Response UI`

Story này kiểm chứng trực tiếp các nguyên tắc kiến trúc quan trọng:

- Reader chỉ được sử dụng tài liệu có quyền `VIEW`.
- LLM không truy cập trực tiếp Database.
- Backend/Domain Service là source-of-truth cho quyền, DocumentVersion và citation.
- Câu trả lời phải có document ID/version ID hoặc citation tương đương.
- Lượt `Ask AI` phải có AuditEvent.

## Phạm vi tối thiểu của slice

### In scope

- Một Reader đã đăng nhập.
- Một tài liệu `Published` có một current `DocumentVersion`.
- Một tài liệu Reader không có quyền `VIEW` để kiểm chứng permission-aware retrieval.
- Màn hình hoặc component `Ask AI` nhận câu hỏi bằng text.
- API tạo conversation và gửi message.
- Backend kiểm tra identity và quyền `VIEW` trước khi lấy context.
- Retrieval chỉ lấy current version được phép.
- Assistant Orchestrator gọi LLM qua adapter; LLM chỉ trả answer hoặc Structured Tool Call hợp lệ.
- Backend trả answer kèm document ID/version ID hoặc citation.
- Ghi AuditEvent cho lượt hỏi thành công và thất bại/trái quyền.
- Trạng thái UI tối thiểu: `Default`, `AI processing`, `AI answer`, `Insufficient data`, `Error`.

### Out of scope của slice đầu tiên

- VoiceControl.
- Tạo, chỉnh sửa, Review, Approve và Publish từ giao diện trong cùng E2E.
- Quản lý role bằng UI.
- Search nâng cao, ranking và recommendation.
- Streaming answer, multi-agent và tool ngoài allowlist.
- Internet retrieval.
- So sánh version và retention job.

Các dependency bị rút gọn bằng fixture/seed hợp lệ; việc rút gọn không được bỏ qua kiểm tra quyền ở Backend.

## Điều kiện dữ liệu test

| Fixture      | Dữ liệu tối thiểu                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `Reader A`   | User active, role `READER`, có `VIEW` trên `Quy trình nghỉ phép`.                                   |
| `Document X` | `status = PUBLISHED`, có đúng một current version, nội dung chứa câu trả lời cho câu hỏi mẫu.       |
| `Document Y` | Tài liệu `Published` nhưng Reader A không có `VIEW`; không được xuất hiện trong retrieval/citation. |
| Câu hỏi      | `Nhân viên được nghỉ phép bao nhiêu ngày?`                                                          |
| Source       | `Document X` + current `DocumentVersion`; source ID phải tồn tại trong response và record lưu trữ.  |

## E2E tối thiểu

### E2E-01 - Reader nhận câu trả lời có citation

**Given** Reader A đã đăng nhập và có quyền `VIEW` trên Document X.

**When** Reader A mở `Ask AI`, nhập câu hỏi mẫu và gửi request.

**Then**:

1. UI chuyển từ `Default` sang `AI processing`.
2. API xác thực Reader A và kiểm tra quyền trước khi retrieval.
3. Backend chỉ lấy current version của Document X.
4. LLM không nhận Database credential và không được gọi trực tiếp Database.
5. UI nhận `AI answer`.
6. Response có `documentId` và `versionId` hoặc citation tương đương trỏ tới Document X/current version.
7. Database có AuditEvent `ASK_AI` với actor, object/request, thời điểm và kết quả `SUCCESS`.
8. Không có Document Y trong context, response hoặc citation.

### E2E-02 - Reader không nhận dữ liệu ngoài quyền

**Given** Reader A không có quyền `VIEW` trên Document Y.

**When** Reader A hỏi cùng câu hỏi hoặc request cố truy cập Document Y.

**Then**:

1. Document Y không xuất hiện trong Search/Retrieval context.
2. Document Y không xuất hiện trong answer, citation hoặc metadata trả về.
3. Hệ thống trả `Insufficient data` hoặc thông báo không tiết lộ sự tồn tại tài liệu.
4. AuditEvent ghi nhận kết quả phù hợp, tối thiểu `DENIED` hoặc `SUCCESS` với source rỗng theo policy.
5. Không có truy vấn Internet được phát sinh.

## Definition of Done

- [ ] Có fixture `Reader A`, Document X và Document Y.
- [ ] Frontend hiển thị được các state `Default`, `AI processing`, `AI answer`, `Insufficient data`, `Error`.
- [ ] API trả error contract cho `401`, `403`, `404`/not-visible, `429` và `503` khi phù hợp.
- [ ] Permission check nằm ở Backend/Domain Service, không chỉ nằm ở UI.
- [ ] Assistant Orchestrator chỉ gọi LLM qua adapter và validate Structured Tool Call bằng allowlist/schema.
- [ ] Không có Database credential trong prompt, request tới LLM hoặc bundle frontend.
- [ ] Citation luôn trỏ tới document/version tồn tại và người hỏi được phép xem.
- [ ] AuditEvent được ghi cho happy path và permission-denied/error path.
- [ ] E2E-01 và E2E-02 chạy pass trong môi trường test cô lập.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` và `npm run build` pass.

## Thứ tự triển khai đề xuất

1. Seed User/Document/DocumentVersion/DocumentPermission và AuditEvent test helper.
2. Implement policy check cho `VIEW` và current version retrieval.
3. Implement Assistant Orchestrator với mock LLM adapter trước, sau đó nối provider thật qua environment variable.
4. Implement API conversation/message và response có citation.
5. Implement UI Ask AI và toàn bộ state cần thiết.
6. Viết integration test cho policy/retrieval và E2E-01/E2E-02.
7. Chạy quality gate và kiểm tra log/audit trước khi mở rộng sang US-AI-03, US-AI-05, US-AI-06 và US-AI-07.
