# Source Priority

Quy tắc ưu tiên nguồn tài liệu khi xảy ra xung đột thông tin trong Project Vault:

1. **Business rules/requirements:** Những yêu cầu đã được giảng viên hoặc nhóm xác nhận (phiên bản mới nhất).
2. **ADR (Architecture Decision Records):** Các quyết định kỹ thuật đã được Approved.
3. **PRD (Product Requirements Document):** Phiên bản current.
4. **User Story/Acceptance Criteria:** Các đầu việc trong sprint hiện tại.
5. **Prototype/Figma:** Dùng để minh họa hành vi người dùng, không được tự ý tạo thêm business rule từ design.
6. **Chat/AI Working Notes:** Chỉ là nháp, không có giá trị pháp lý nếu chưa được integrate vào các file trên.

**Quy tắc xử lý:** 
Khi hai nguồn xung đột:
- Không được phép tự chọn nguồn thấp hơn để trả lời.
- Phải nêu rõ sự xung đột của cả hai nguồn trong câu trả lời.
- Ghi lại vào Decision Log (hoặc mở Open Question) để xác nhận lại với nhóm/giảng viên.