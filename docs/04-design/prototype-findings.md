# Prototype Brief - AI Document & Knowledge Management System

> Trạng thái: Prototype brief - chưa có kết quả validation

## 1. Critical User Flows

### FLOW 01 - Author tạo và gửi tài liệu Review

**Mục tiêu:** Author đưa một tài liệu mới vào quy trình Review.

**Requirement liên quan:** REQ-FR-02, REQ-FR-05, REQ-FR-06, REQ-FR-07.

### FLOW 02 - Reviewer/Admin Review và Publish tài liệu

**Mục tiêu:** Reviewer kiểm tra tài liệu; Reviewer hoặc Admin Publish tài liệu sau khi version đã được Approve.

**Requirement liên quan:** REQ-FR-08, REQ-FR-09, REQ-FR-10, REQ-FR-11, REQ-BR-01, REQ-BR-05.

### FLOW 03 - Reader tìm kiếm và hỏi AI

**Mục tiêu:** Reader tìm được tài liệu được phép truy cập và hỏi AI dựa trên nguồn dữ liệu nội bộ được phép.

**Requirement liên quan:** REQ-FR-04, REQ-FR-12, REQ-FR-13, REQ-FR-14, REQ-FR-15, REQ-BR-02, REQ-BR-04.

## 2. Prototype Goal

Kiểm chứng ba flow có rủi ro cao của AI Knowledge Management System:

- Tạo tài liệu và gửi đúng version vào Review.
- Reviewer kiểm tra, Approve/Reject; chỉ Reviewer hoặc Admin được Publish version đã Approve.
- Reader Search và Ask AI trong phạm vi tài liệu được cấp quyền, với citation rõ ràng.

## 3. Personas

| Persona  | Mục tiêu trong prototype                                                                         |
| -------- | ------------------------------------------------------------------------------------------------ |
| Author   | Tạo, chỉnh sửa, tổ chức và gửi tài liệu vào Review. Không được Approve hoặc Publish.             |
| Reviewer | Xem Review queue, kiểm tra version, Approve/Reject và Publish version đã Approve.                |
| Admin    | Có quyền Review, Approve, Reject và Publish; các quyền Admin khác là UNKNOWN nếu chưa có đặc tả. |
| Reader   | Search, mở tài liệu được phép và Ask AI bằng câu hỏi văn bản.                                    |

## 4. Flow Details

### FLOW A - Author tạo và gửi Review

**Sample scenario:** Tạo tài liệu `Quy trình nghỉ phép`.

1. Author mở màn hình tạo tài liệu.
2. Author nhập tên, nội dung, Folder `Nhân sự` và Tag `Nghỉ phép`.
3. Author lưu tài liệu. Tài liệu bắt đầu ở trạng thái `Draft`, version ban đầu là `v1.0`.
4. Author chọn `Gửi Review`.
5. Prototype hiển thị confirmation; Author xác nhận.
6. Tài liệu chuyển sang trạng thái `Reviewing`. Nhãn hiển thị cho người dùng có thể là `Pending Review`, nhưng phải được hiểu là trạng thái nghiệp vụ `Reviewing`.

### FLOW B - Reviewer/Admin Review và Publish

**Sample scenario:** Kiểm tra tài liệu `Quy trình nghỉ phép`.

1. Reviewer hoặc Admin mở Review queue.
2. Người xử lý chọn tài liệu và xem chi tiết nội dung, Folder, Tag, version, Author và trạng thái.
3. Người xử lý chọn `Approve` hoặc `Reject`. Người xử lý có thể là Reviewer hoặc Admin.
4. Prototype lưu người xử lý, thời điểm và kết quả Review.

**Nhánh Approve:**

1. Prototype hiển thị confirmation.
2. Sau khi Reviewer hoặc Admin Approve, chỉ Reviewer hoặc Admin mới được chọn `Publish`.
3. Prototype từ chối thao tác Publish của Author và mọi version chưa được Approve.
4. Sau khi Publish, version được đánh dấu là version hiện hành và tài liệu hiển thị trạng thái `Published`.

**Nhánh Reject:**

1. Prototype có thể hiển thị trường nhập lý do Reject để kiểm chứng UX; việc bắt buộc lý do Reject trong hệ thống thật chưa được đặc tả.
2. Prototype hiển thị confirmation và lưu kết quả Reject.
3. Version bị Reject không được Publish.
4. Version bị Reject được giữ nguyên. Khi Author chỉnh sửa, prototype tạo version mới để gửi Review lại; version bị Reject không được sửa trực tiếp hoặc Publish.

**Tình huống version tiếp theo:**

1. Author chỉnh sửa nội dung khi có quyền.
2. Nếu nội dung đang chỉnh sửa bắt nguồn từ version bị Reject, hệ thống tạo version mới và giữ nguyên version bị Reject.
3. Version mới phải đi lại qua Review trước khi Publish.
4. Version cũ được giữ theo chính sách retention: 1 năm kể từ khi bị thay thế, sau đó tự động xóa; version hiện hành không bị xóa bởi chính sách này.

### FLOW C - Reader Search và Ask AI

**Sample scenario:** Tìm thông tin về quy trình nghỉ phép.

1. Reader nhập từ khóa vào Search.
2. Prototype chỉ hiển thị kết quả Reader được phép truy cập.
3. Reader mở tài liệu được phép và chọn `Ask AI`.
4. Reader nhập câu hỏi: `Nhân viên được nghỉ phép bao nhiêu ngày?`
5. Prototype hiển thị trạng thái `AI processing`.
6. AI chỉ sử dụng tài liệu nội bộ được phép và version hiện hành để tạo câu trả lời.
7. Prototype hiển thị câu trả lời cùng document ID/version ID hoặc citation tương đương.
8. Nếu không tìm thấy dữ liệu phù hợp trong các tài liệu được phép, AI phải trả lời rõ: `Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.` AI không được tự suy đoán hoặc dùng nguồn Internet.

Tình huống kiểm tra quyền: `Quy định lương thưởng` không được xuất hiện trong kết quả Search, tên tài liệu, metadata, citation hoặc câu trả lời nếu Reader A không có quyền truy cập. Với Search, giao diện hiển thị `Không tìm thấy kết quả phù hợp`. Nếu Reader cố mở một tài nguyên đã biết nhưng không có quyền, giao diện có thể hiển thị `Access blocked` nhưng không được tiết lộ tên hoặc metadata nhạy cảm của tài liệu.

## 5. Required States

| Flow   | States cần prototype kiểm chứng                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flow A | Default, Loading, Error, Confirmation, Success, Draft, Reviewing/Pending Review                                                                         |
| Flow B | Default, Loading, Empty, Error, Confirmation, Success, Reviewing/Pending Review, Approved, Rejected, Published, Access blocked (Author bị chặn Publish) |
| Flow C | Default, Loading, Error, No result, Access blocked (chỉ khi mở tài nguyên đã biết), AI processing, AI answer, Insufficient data                         |

## 6. Sample Data

- Document: `Quy trình nghỉ phép`
- Folder: `Nhân sự`
- Tag: `Nghỉ phép`
- Initial version: `v1.0`
- Author: `Nguyễn Văn A`
- Reviewer: `Trần Văn B`
- Reader: `Reader A`
- AI question: `Nhân viên được nghỉ phép bao nhiêu ngày?`
- Unauthorized document: `Quy định lương thưởng` - Reader A không có quyền truy cập.

## 7. Design Constraints

- Giữ nguyên workflow: Create -> Review -> Publish -> Version -> Search/Ask.
- Author không được Approve hoặc Publish.
- Chỉ Reviewer hoặc Admin được Publish.
- Chỉ version đã được Reviewer Approve mới được Publish.
- Không được Publish version chưa Approve hoặc đã bị Reject.
- Khi nội dung được cập nhật, phải tạo version mới; version cũ không còn là version hiện hành nhưng được giữ theo retention.
- Search phải tuân thủ quyền truy cập hiện tại của người dùng.
- AI chỉ được sử dụng tài liệu nội bộ mà Reader có quyền truy cập.
- AI phải hiển thị và ghi lại document ID/version ID hoặc citation tương đương.
- Khi nguồn được phép không có đủ thông tin, AI phải báo không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu; không được suy đoán.
- Không được hiển thị tài liệu trái quyền trong kết quả, metadata, citation hoặc câu trả lời.
- Không thêm chức năng ngoài phạm vi Requirements đã được xác định.

## 8. Prototype Assumptions

Các mục dưới đây chỉ là giả định phục vụ prototype, không phải quy tắc backend đã được nghiệm thu:

- Sử dụng dữ liệu tài liệu mẫu thay cho dữ liệu thực tế.
- Author, Reviewer, Admin và Reader đã đăng nhập với đúng role tương ứng.
- Folder và Tag được tạo sẵn để giảm phạm vi setup của prototype.
- Các thao tác Create, Review, Publish và Version được mô phỏng; chưa cần triển khai đầy đủ logic backend.
- Câu trả lời AI và citation được mô phỏng bằng dữ liệu mẫu để kiểm chứng cách hiển thị.
- Confirmation là trạng thái giao diện dùng để kiểm chứng trải nghiệm; cách xác nhận trong backend chưa thuộc phạm vi prototype.
- Prototype mô phỏng việc chặn Publish của Author theo quyết định nghiệp vụ đã chốt.
- Prototype có thể dùng version ban đầu `v1.0` và dữ liệu Folder/Tag cố định trong sample data.
- Prototype mô phỏng câu trả lời AI, citation và trạng thái `Insufficient data`; chưa cần triển khai RAG/LLM thực tế.

## 9. Open Questions

1. Khi nào version tăng: lúc sửa, lúc gửi Review hay lúc Publish?
2. Hệ thống chạy tác vụ tự động xóa version hết hạn vào thời điểm nào?
3. Việc bắt buộc nhập lý do Reject có phải là yêu cầu chính thức hay chỉ là lựa chọn UX?

## 10. Prototype Findings

Chưa có kết quả validation. Phần này sẽ được cập nhật sau khi người dùng thử prototype và nhóm ghi nhận:

- Flow nào hoàn thành hoặc bị chặn.
- Người dùng có hiểu đúng trạng thái `Draft`, `Reviewing`, `Approved`, `Rejected` và `Published` hay không.
- Người dùng có nhận biết rõ Reviewer/Admin là người được Publish còn Author không được Publish hay không.
- Người dùng có nhận biết tài liệu/version nguồn của câu trả lời AI hay không.
- Người dùng có hiểu thông báo `Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này` hay không.
