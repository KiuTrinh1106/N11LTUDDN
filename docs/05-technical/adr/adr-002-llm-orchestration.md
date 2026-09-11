# ADR-002 - Điều phối LLM bằng Structured Tool Calls qua Backend

Status: Accepted

Context:
AI KMS cho phép Reader đặt câu hỏi về tài liệu nội bộ được phép và cần trả lời kèm document ID/version ID hoặc citation tương đương. LLM không phải source-of-truth cho quyền truy cập, trạng thái Document, version hiện hành hoặc dữ liệu nghiệp vụ. Nếu LLM được truy cập trực tiếp Database hoặc tự sinh lệnh không kiểm soát, hệ thống có nguy cơ prompt injection, truy cập trái quyền, thực thi thao tác ngoài phạm vi và hallucinate dữ liệu. Mọi hoạt động `Ask AI` cũng phải được lưu vết để kiểm tra.

Decision:
Sử dụng Assistant Orchestrator ở Backend làm lớp duy nhất giao tiếp với LLM Provider. LLM chỉ được phép trả về câu trả lời hoặc Structured Tool Call theo JSON Schema và allowlist đã định nghĩa. Backend phải validate schema, tool name, arguments, identity và permission trước khi thực thi qua Domain/Search Services. Assistant Orchestrator không query Database trực tiếp; LLM không nhận Database credentials và không có network access tới Database. Domain Services/Database cung cấp context đã permission-filter và là source-of-truth. Backend chỉ trả câu trả lời khi có nguồn hợp lệ; nếu không đủ dữ liệu, trả thông báo `Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.` và không cho LLM tự suy đoán hoặc dùng Internet.

Consequences:

- Tách LLM khỏi Database và business rules, giảm rủi ro prompt injection, arbitrary SQL/tool execution và truy cập dữ liệu ngoài quyền.
- Domain Services giữ quyền quyết định đối với permission, trạng thái, version hiện hành và dữ liệu nghiệp vụ; kết quả dễ kiểm thử và truy vết.
- JSON Schema, allowlist và validation tạo contract rõ ràng giữa LLM và Backend, cho phép thay đổi LLM Provider qua adapter.
- Có thể lưu request ID, Structured Tool Call, source IDs, citation và kết quả vào AuditEvent để giám sát Q&A.

* Thêm một lớp Orchestrator và bước validate/permission check, làm tăng độ phức tạp triển khai và latency.
* Cần quản lý schema tool, prompt version, timeout, retry có giới hạn và các trường hợp LLM trả output không hợp lệ.
* Context phải được lọc quyền trước khi gửi tới Provider; việc đồng bộ current version và Search Index cần được kiểm thử riêng.

Rejected alternative:
Cho phép LLM truy cập trực tiếp Database hoặc tự sinh SQL/API command bị từ chối vì làm mất ranh giới bảo mật, khó kiểm soát permission, tăng rủi ro prompt injection và có thể khiến AI tự bịa hoặc sử dụng dữ liệu không phải source-of-truth. Kiến trúc gọi LLM trực tiếp từ Frontend cũng bị từ chối vì sẽ làm lộ credential/provider endpoint và bỏ qua validation, audit, rate limit cùng policy check của Backend.
