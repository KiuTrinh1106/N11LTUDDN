# AI Usage Log

Tóm tắt các thay đổi và công việc có sử dụng AI trong dự án. Nhật ký chi tiết, gồm bối cảnh, công cụ, đề xuất, xác minh và quyết định, được duy trì tại [`docs/ai-usage-log.md`](docs/ai-usage-log.md).

## 2026-10-12

| # | Công việc |
| --- | --- |
| 1 | Đổi nhãn nút đăng nhập thành “Đăng nhập” và giữ biểu tượng mũi tên `→`. |
| 2 | Xóa card “Quy trình tài liệu” khỏi Dashboard; mở rộng “Tài liệu gần đây” toàn chiều rộng. |
| 3 | Điều chỉnh quyền theo vai trò: Admin không chỉnh sửa tài liệu; Reviewer không tạo hoặc chỉnh sửa; Author được tạo tài liệu. |
| 4 | Tăng cỡ chữ cho tiêu đề, card, biểu mẫu và nội dung phụ để dễ đọc hơn. |
| 5 | Xóa hướng dẫn phím “Enter để tìm kiếm · Shift + Enter để xuống dòng”. |
| 6 | Giới hạn câu trả lời của trợ lý AI ở tài liệu người dùng được phép truy cập và đã xuất bản; yêu cầu dẫn nguồn và phản hồi phù hợp khi không có quyền hoặc dữ liệu. |

## 2026-10-16

| # | Công việc |
| --- | --- |
| 1 | Ghi lại quy ước tiếp tục cập nhật AI Usage Log theo ngày, tập trung vào các quyết định và chỉ đạo của người dùng. |
| 2 | Soạn tài liệu trách nhiệm Product/Business Analyst cho Giai đoạn 3 – Full Delivery; đối chiếu artifacts hiện có và nêu rõ evidence còn thiếu hoặc chưa xác minh. |
| 3 | Chuẩn hóa quy ước backlog Taiga trong `docs/03-product/task-assignment.md` và liên kết với tài liệu BA. Không cập nhật board khi phiên Taiga chưa đăng nhập. |
| 4 | Rà soát trạng thái theo bằng chứng ở cấp EP1–EP7. Không đổi trạng thái Task khi thiếu mapping Task–Story–AC hoặc chưa xác minh được thao tác trên board. |
| 5 | Chuẩn hóa `docs/ai-usage-log.md` thành bảng, backfill A-01–A-06 và thêm các phiên A-07/A-08 có thể xác minh; nêu rõ prompt lịch sử là tóm tắt, không phải transcript nguyên văn. |
| 6 | Bổ sung A-09: xác minh 7 Epic, 12 User Story và 8 Task thuộc US-AI-03 đang `New`; đây chưa phải kiểm tra toàn bộ Task và không có trạng thái nào được thay đổi. |
| 7 | Dịch `docs/ai-usage-log.md` và `docs/TRACEABILITY.md` sang tiếng Việt, giữ nguyên mã và định danh phục vụ truy vết. |
| 8 | Kiểm tra T-404 (Task #55): có test happy path gửi Review và lấy Review Queue, nhưng thao tác đổi trạng thái trên Taiga chưa xác minh được; không ghi nhận Task là Done/Closed. |
