# Stakeholder Personas

Các persona/stakeholder chính và mục tiêu của họ.

## Persona 1: Reader

**Vai trò:** Reader - Người khai thác thông tin

**Mô tả:** Nhân viên các phòng ban cần khai thác tài liệu quy trình, quy định, hướng dẫn của công ty để phục vụ công việc hàng ngày.

### Mục tiêu & Kỳ vọng

- Tìm kiếm thông tin chính xác, nhanh chóng mà không cần đọc hết các tài liệu dài hàng chục trang nhờ vào trợ lý AI.
- Đảm bảo câu trả lời từ AI có trích dẫn nguồn (citation) rõ ràng để đối chiếu khi cần.
- Chỉ tiếp cận các tài liệu trong phạm vi quyền hạn của mình một cách tự động, không mất thời gian gửi yêu cầu xin quyền thủ công.

### Nỗi đau

- Mất hàng giờ tìm kiếm file trong các thư mục lộn xộn hoặc phải đi hỏi đồng nghiệp.
- Đọc nhầm tài liệu cũ/hết hạn dẫn đến áp dụng sai quy trình.

## Persona 2: Author

**Vai trò:** Author - Người biên soạn

**Mô tả:** Chuyên viên quy trình, kỹ sư viết tài liệu kỹ thuật, hoặc nhân viên hành chính chịu trách nhiệm soạn thảo và cập nhật tài liệu nội bộ.

### Mục tiêu & Kỳ vọng

- Dễ dàng tạo mới, cập nhật tài liệu và tổ chức phân mục khoa học bằng Folder/Tag.
- Gửi yêu cầu phê duyệt (Review) đến đúng người quản lý một cách tự động theo quy trình.
- Quản lý các phiên bản (Version) tài liệu rõ ràng, dễ dàng khôi phục phiên bản cũ khi có lỗi phát sinh.

### Nỗi đau

- Khó khăn khi theo dõi các phản hồi, sửa đổi từ nhiều bên dẫn đến lỗi chồng chéo phiên bản.
- Quy trình chuyển giao tài liệu từ nháp sang phê duyệt bị chậm trễ do trao đổi qua email/chat thủ công.

## Persona 3: Reviewer

**Vai trò:** Reviewer - Người kiểm duyệt & Quản lý

**Mô tả:** Trưởng phòng, Quản lý dự án hoặc Giám đốc bộ phận - những người có chuyên môn và thẩm quyền phê duyệt nội dung trước khi ban hành.

### Mục tiêu & Kỳ vọng

- Có một danh sách tập trung các tài liệu đang chờ phê duyệt (Review queue) để duyệt nhanh chóng.
- Dễ dàng phê duyệt (Approve) hoặc từ chối kèm lý do (Reject) trực tiếp trên hệ thống.
- Kiểm soát việc phân quyền tiếp cận (Permission) ban đầu cho tài liệu trước khi xuất bản rộng rãi.

### Nỗi đau

- Quá tải tin nhắn/email nhắc nhở duyệt bài thủ công từ cấp dưới.
- Vô tình xuất bản tài liệu chưa hoàn thiện hoặc chưa được kiểm chứng độ chính xác ra toàn công ty.

## Persona 4: Admin

**Vai trò:** Admin - Quản trị hệ thống & Bảo mật

**Mô tả:** Nhân viên IT hoặc Quản trị viên hệ thống thông tin của doanh nghiệp.

### Mục tiêu & Kỳ vọng

- Cấu hình và kiểm soát phân quyền động (Role-based / Attribute-based Access Control) chặt chẽ cho toàn bộ hệ thống.
- Đảm bảo hệ thống hỏi đáp AI (RAG) hoạt động an toàn, không hiển thị hoặc trả lời thông tin vượt quá quyền hạn của người hỏi (Permission-aware retrieval).
- Giám sát hoạt động hệ thống thông qua nhật ký hoạt động (Audit log) để phát hiện sự cố rò rỉ dữ liệu.

### Nỗi đau (Pain points)

- Hệ thống RAG thông thường dễ làm lộ thông tin mật của ban giám đốc cho nhân viên thường khi truy vấn.
- Không có công cụ truy vết khi xảy ra sự cố rò rỉ thông tin hoặc mất mát tài liệu quan trọng.
