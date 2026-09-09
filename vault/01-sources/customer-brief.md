# Customer Brief

## Mô tả tổng quan

Công ty cần một hệ thống quản lý tri thức và tài liệu tích hợp trí tuệ nhân tạo (AI Document & Knowledge Management System - KMS).

## Yêu cầu theo vai trò

### Thành viên công ty (Reader)

Reader phải có khả năng:

- Đăng nhập vào hệ thống.
- Tìm kiếm và đặt câu hỏi trực tiếp với Trợ lý AI (Knowledge Assistant) để khai thác thông tin từ tài liệu nội bộ mà không cần đọc thủ công các tài liệu dài.
- Nhận câu trả lời từ AI kèm trích dẫn nguồn (citation) rõ ràng để tự đối chiếu khi cần.
- Chỉ truy xuất và hỏi đáp trên các tài liệu nằm trong phạm vi quyền hạn được cấp phép (Permission-aware retrieval).

### Người biên soạn (Author)

Author phải có khả năng:

- Tạo mới và cập nhật tài liệu (Document).
- Tổ chức và phân mục tài liệu khoa học bằng Thư mục (Folder) và Nhãn (Tag).
- Tự động gửi yêu cầu phê duyệt (Review) đến đúng người quản lý.
- Quản lý, theo dõi lịch sử thay đổi của các phiên bản (Version) và khôi phục về phiên bản cũ khi cần.

### Người kiểm duyệt (Reviewer)

Reviewer phải có khả năng:

- Quản lý danh sách tập trung các tài liệu đang chờ phê duyệt (Review queue).
- Phê duyệt (Approve) hoặc từ chối kèm lý do (Reject) tài liệu trực tiếp trên hệ thống.
- Thiết lập và cấu hình phân quyền tiếp cận (Permission) ban đầu cho tài liệu trước khi xuất bản (Publish).

### Quản trị viên (Admin)

Admin phải có khả năng:

- Cấu hình và kiểm soát phân quyền động (Role-based / Attribute-based Access Control) chặt chẽ cho toàn bộ hệ thống.
- Giám sát hoạt động hệ thống và truy vết lịch sử thông qua nhật ký hệ thống (Audit log) để ngăn ngừa rò rỉ thông tin.

## Quy tắc truy xuất thông tin

Một tài liệu không được phép hiển thị hoặc trả về thông tin vượt quá quyền hạn của người hỏi trong quá trình AI RAG truy xuất (Permission-aware RAG).

## Thông tin của tài liệu

Mỗi tài liệu (Document) chứa các thông tin:

- Tên tài liệu (Document name).
- Trạng thái tài liệu (Status: Draft, Reviewing, Published).
- Phiên bản tài liệu (Version).
- Phân quyền tiếp cận (Permission).
- Thư mục lưu trữ (Folder) và Nhãn (Tag).

## Quy mô dự kiến

Hệ thống ban đầu dự kiến sẽ phục vụ khoảng 500 nhân viên và quản lý khoảng 1.000 tài liệu nội bộ.
