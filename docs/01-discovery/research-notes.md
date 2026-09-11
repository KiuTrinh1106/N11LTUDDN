## Persona 1: Người khai thác thông tin (Reader)

Đối tượng: Nhân viên cần tìm và sử dụng tài liệu phục vụ công việc.

Mục tiêu: Tìm đúng thông tin nhanh chóng, dễ kiểm tra và chỉ tiếp cận tài liệu được phép.

Pain points:
Tài liệu nằm ở nhiều nguồn nên khó tìm.
Có trường hợp cần tài liệu nhưng không tìm thấy.
Phải kiểm tra và đối chiếu thông tin từ nhiều nguồn.

Bằng chứng thực tế:
P01 – Nhân viên kho: Chị của thành viên nhóm làm nhân viên kho tại công ty CP Thép Hòa Phát Dung Quất. Qua trao đổi, chị cho biết công việc có lúc phải tìm tài liệu từ nhiều phòng ban khác nhau và đôi khi không tìm thấy tài liệu cần thiết.

P02 – Sinh viên: Bạn của thành viên nhóm, đang học tại trường đại học Kinh tế Đà Nẵng. Khi tìm tài liệu cho môn học, bạn thường tra cứu từ nhiều nguồn như Google, GitHub, Zalo, Chat GPT và Gemini.

→ Insight: Người dùng có thể mất thời gian khi thông tin cần tìm nằm ở nhiều nguồn hoặc không biết chính xác tài liệu cần tìm ở đâu.

## Persona 2: Người biên soạn tài liệu (Author)

Đối tượng: Nhân viên/chuyên viên chịu trách nhiệm tạo, chỉnh sửa và cập nhật tài liệu.

Bối cảnh thực tế:
Theo case study của Intelligex (09/08/2026), một doanh nghiệp sản xuất thiết bị công nghiệp có khoảng 85 nhân viên, với khoảng 45 tài liệu/tháng cần Review. Quy trình cũ sử dụng email và Google Sheets để gửi, chỉnh sửa và theo dõi tài liệu, gây khó khăn trong việc quản lý phiên bản và trạng thái Review.

Pain points:
Khó xác định phiên bản mới nhất.
Phản hồi Review bị phân tán qua email.
Khó theo dõi trạng thái và lịch sử tài liệu.

Mục tiêu:
Tạo và chỉnh sửa tài liệu dễ dàng.
Theo dõi phiên bản rõ ràng.
Theo dõi tài liệu trong quy trình Create → Review → Publish → Version.

Evidence: Secondary evidence – Representative case study, Intelligex, 09/08/2026.

Insight: Author cần một nơi tập trung để tạo, cập nhật và theo dõi tài liệu, giảm quản lý thủ công và nhầm lẫn phiên bản.

## Persona 3: Người kiểm duyệt tài liệu (Reviewer)

Đối tượng: Quản lý, trưởng bộ phận hoặc người chịu trách nhiệm kiểm tra và phê duyệt tài liệu.

Bối cảnh thực tế:
Theo case study của Mobyte, mô tả một tổ chức hàng không toàn cầu, quy trình Review và Approval trước đây phụ thuộc nhiều vào email và spreadsheet. Khi số lượng tài liệu và quy trình tăng, việc theo dõi người phụ trách, trạng thái Review và các công việc còn lại trở nên khó khăn. Case study được Mobyte công bố trên website vào năm 2026.

Pain points:
Khó theo dõi tài liệu đang chờ Review.
Khó kiểm soát phiên bản và lịch sử phê duyệt.
Thông tin Review bị phân tán qua email.

Mục tiêu:
Biết tài liệu nào cần Review.
Kiểm tra đúng phiên bản.
Approve/Reject và theo dõi trạng thái rõ ràng.

Evidence: Secondary evidence – Case study, Mobyte, 2026.

Insight: Reviewer cần một quy trình tập trung để theo dõi tài liệu, người phụ trách, trạng thái Review và lịch sử phê duyệt.

<!-- # Customer Brief

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

Hệ thống ban đầu dự kiến sẽ phục vụ khoảng 10 người dùng và quản lý khoảng 100 tài liệu nội bộ.
