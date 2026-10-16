# AI Usage Log

## 2026-10-12

- Cập nhật label nút đăng nhập từ "Vào không gian làm việc" thành "Đăng nhập" và giữ nguyên icon mũi tên `→`.
- Xóa card "Quy trình tài liệu" khỏi Dashboard và mở rộng "Tài liệu gần đây" lên full width.
- Chỉnh sửa quyền: Admin không được chỉnh sửa tài liệu; Reviewer không được tạo/chỉnh sửa tài liệu; chỉ Author được tạo tài liệu.
- Tăng cỡ chữ trên giao diện để dễ đọc hơn, bao gồm các phần tiêu đề, card, form và text phụ.
- Xóa câu hướng dẫn "Enter để tìm kiếm · Shift + Enter để xuống dòng".
- Cập nhật logic AI trong trợ lý tri thức: chỉ trả lời dựa trên tài liệu có quyền truy cập/đã xuất bản, có dẫn chứng file/tài liệu và trả về thông báo không có quyền hoặc không có dữ liệu phù hợp khi không đủ điều kiện.

## 2026-10-16

- Theo yêu cầu của người dùng, ghi lại các quyết định và chỉ đạo người dùng yêu cầu thực hiện vào AI Usage Log; tiếp tục bổ sung mục mới theo ngày trong các lần làm việc tiếp theo.
- Soạn tài liệu chi tiết về trách nhiệm Product/Business Analyst trong Giai đoạn 3 - Full Delivery, gồm scope/backlog governance, làm rõ AC và đặc tả AI, traceability 100% cho phạm vi Done, UAT/bug/release gate và chuẩn bị Viva lần 2; đối chiếu với tài liệu dự án hiện có và nêu rõ các evidence còn thiếu/chưa xác minh.
- Theo yêu cầu người dùng, chuẩn hóa quy ước backlog Taiga trong `docs/03-product/task-assignment.md` (Epic/Story/Task, DoR/DoD, trạng thái, evidence và kiểm tra orphan) và liên kết từ tài liệu BA. Chưa cập nhật board trực tiếp vì tab Taiga trong browser tích hợp vẫn hiển thị trạng thái đăng xuất; không thay đổi dữ liệu Taiga.
- Theo yêu cầu rà soát task Done/đang xử lý: chạy `backend/tests/test_api.py` (10 passed), cập nhật đánh giá trạng thái theo bằng chứng ở cấp EP1–EP7 trong `docs/03-product/task-assignment.md` và liên kết từ tài liệu BA. Không đổi status từng task trên Taiga vì phiên browser hiện đăng xuất và chưa có mapping task-to-Story/AC; không tự nhận task Done khi chưa xác minh mapping/evidence.
- Chuẩn hóa `docs/ai-usage-log.md` thành bảng tóm tắt 6 cột, backfill A-01–A-06 từ log chi tiết có sẵn, thêm các phiên làm việc A-07/A-08 có thể xác minh và sửa liên kết AI Usage Log trong Project Index. Ghi rõ prompt lịch sử là tóm tắt, không phải transcript nguyên văn; không tạo ảnh hoặc case lỗi giả.
- Ghi bổ sung A-09 trong `docs/ai-usage-log.md`: sau khi người dùng chia sẻ project Taiga đã đăng nhập, xác minh 7 Epic và 12 User Story đều đang `New`, cùng 8 task của US-AI-03 đang `New`; ghi rõ đây chưa phải kiểm tra toàn bộ Task và chưa có thay đổi trạng thái trên board.
- Theo yêu cầu người dùng, dịch `docs/ai-usage-log.md` và `docs/TRACEABILITY.md` sang tiếng Việt; giữ nguyên mã yêu cầu/story/task, tên endpoint, đường dẫn và ID kiểm thử để không làm hỏng truy vết.
- Tiếp tục đối chiếu yêu cầu chuyển các Task đã hoàn thành sang Done với board Taiga và test hiện có. Xác minh T-404 (Task #55) có test happy path gửi Review rồi lấy Review Queue; tuy nhiên thao tác mở menu trạng thái trên trang Task không hoạt động trong phiên hiện tại, nên không có Task nào được đổi sang `Closed`/Done. Không ghi nhận T-404 là Done trên Taiga khi cập nhật chưa được xác minh.
