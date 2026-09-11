# Epic Map - AI Document & Knowledge Management System

## Phần 1 - Bảng tổng quan các Epics

| Epic ID | Tên Epic                                | Mục tiêu / Giá trị mang lại                                                                                                  | Danh sách Requirement IDs liên kết                                                |
| ------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| EP-01   | Quản lý quyền truy cập & vai trò        | Bảo đảm đúng người được xem tài liệu và sử dụng chức năng phù hợp; ngăn lộ dữ liệu ngoài quyền.                              | REQ-FR-01, REQ-FR-04, REQ-NFR-02, REQ-BR-02, REQ-ASM-01                           |
| EP-02   | Quản lý nội dung & tổ chức tài liệu     | Giúp Author tạo, cập nhật và tổ chức tài liệu trong kho tri thức bằng Folder, Tag và hỗ trợ gợi ý Tag có xác nhận.           | REQ-FR-02, REQ-FR-03, REQ-FR-05, REQ-FR-18                                        |
| EP-03   | Quy trình Review & Publish              | Đưa tài liệu từ Draft đến Published qua quy trình kiểm duyệt có kiểm soát, minh bạch và truy được kết quả.                   | REQ-FR-06, REQ-FR-07, REQ-FR-08, REQ-FR-09, REQ-FR-10, REQ-BR-01                  |
| EP-04   | Quản lý vòng đời & lịch sử Version      | Bảo đảm mỗi tài liệu có version hiện hành rõ ràng, dùng đúng version chính thức và cho phép các vai trò phù hợp xem lịch sử. | REQ-FR-11, REQ-FR-17, REQ-BR-03, REQ-BR-05, REQ-ASM-03                            |
| EP-05   | Tìm kiếm & AI Q&A theo quyền            | Giúp Reader tìm đúng tài liệu được phép, hỏi AI về kho nội bộ và kiểm chứng câu trả lời bằng nguồn hợp lệ.                   | REQ-FR-12, REQ-FR-13, REQ-FR-14, REQ-FR-15, REQ-NFR-03, REQ-NFR-04, REQ-BR-04     |
| EP-06   | Quản trị truy vết & chất lượng vận hành | Cung cấp lịch sử hoạt động, bảo đảm dữ liệu MVP, nguồn dữ liệu hợp lệ và kiểm thử nghiệm thu xuyên suốt các luồng chính.     | REQ-FR-16, REQ-NFR-01, REQ-NFR-05, REQ-CON-01, REQ-CON-02, REQ-ASM-02, REQ-ASM-04 |

## Phần 2 - Chi tiết từng Epic

### EP-01 - Quản lý quyền truy cập & vai trò

- **Mô tả ngắn gọn:** Kiểm soát người dùng được xem tài liệu và sử dụng chức năng nào theo bốn vai trò MVP, đồng thời bảo vệ dữ liệu khỏi mọi điểm rò rỉ ngoài quyền.
- **Các yêu cầu chức năng (FR) thuộc Epic này:**
  - REQ-FR-01 - Kiểm soát quyền truy cập tài liệu và chức năng theo vai trò Reader, Author, Reviewer và Admin.
  - REQ-FR-04 - Người có quyền được xem nội dung và metadata; người không có quyền không được xem dữ liệu nhạy cảm.
- **Quy tắc nghiệp vụ (BR) & Ràng buộc (NFR/CON) liên quan:**
  - REQ-BR-02 - Quyền xem là điều kiện bắt buộc cho Search, Read, Citation và Q&A.
  - REQ-NFR-02 - Tỷ lệ lộ tài liệu ngoài quyền qua màn hình, Search, citation và AI Q&A phải bằng 0%.
  - REQ-ASM-01 - Bốn vai trò Reader, Author, Reviewer và Admin là tập vai trò tối thiểu để kiểm thử MVP.

### EP-02 - Quản lý nội dung & tổ chức tài liệu

- **Mô tả ngắn gọn:** Cho phép Author hoặc người có quyền đưa tri thức vào kho, cập nhật nội dung và tổ chức tài liệu để dễ quản lý, sử dụng.
- **Các yêu cầu chức năng (FR) thuộc Epic này:**
  - REQ-FR-02 - Tạo tài liệu với tên, nội dung, Folder, Tag, trạng thái và version ban đầu.
  - REQ-FR-03 - Chỉnh sửa tài liệu khi có quyền; Reader chỉ xem và không được chỉnh sửa.
  - REQ-FR-05 - Gắn hoặc bỏ gắn Folder và Tag khỏi tài liệu.
  - REQ-FR-18 - Gợi ý Tag theo nội dung hoặc metadata nhưng chỉ lưu sau khi người dùng xác nhận.
- **Quy tắc nghiệp vụ (BR) & Ràng buộc (NFR/CON) liên quan:** Không có BR/NFR/CON riêng ngoài các quy tắc quyền truy cập và audit log được quản lý tại EP-01 và EP-06.

### EP-03 - Quy trình Review & Publish

- **Mô tả ngắn gọn:** Điều phối vòng đời kiểm duyệt từ Draft đến Published, giúp Reviewer xử lý tập trung và ngăn công bố tài liệu chưa được phê duyệt.
- **Các yêu cầu chức năng (FR) thuộc Epic này:**
  - REQ-FR-06 - Quản lý các trạng thái Draft, Reviewing và Published theo luồng Create -> Review -> Publish -> Version.
  - REQ-FR-07 - Author gửi một version Draft vào Review với đúng tài liệu, version và người gửi.
  - REQ-FR-08 - Reviewer xem Review queue tập trung có tài liệu, version, người gửi và trạng thái.
  - REQ-FR-09 - Reviewer Approve hoặc Reject và hệ thống lưu người thực hiện, thời điểm và kết quả.
  - REQ-FR-10 - Chỉ cho Publish version đã được Reviewer Approve.
- **Quy tắc nghiệp vụ (BR) & Ràng buộc (NFR/CON) liên quan:**
  - REQ-BR-01 - Chỉ tài liệu đã qua Review và được Approve mới được chuyển sang Published.

### EP-04 - Quản lý vòng đời & lịch sử Version

- **Mô tả ngắn gọn:** Giữ cho tài liệu có một version chính thức, hiện hành và có thể truy lại lịch sử thay đổi theo quyền của từng vai trò.
- **Các yêu cầu chức năng (FR) thuộc Epic này:**
  - REQ-FR-11 - Tạo version mới khi nội dung cập nhật và đánh dấu rõ version hiện hành.
  - REQ-FR-17 - Admin, Reviewer và Author xem lịch sử version; Reader chỉ xem version gần nhất.
- **Quy tắc nghiệp vụ (BR) & Ràng buộc (NFR/CON) liên quan:**
  - REQ-BR-03 - Version cũ không được dùng cho Search hoặc Q&A như version hiện hành sau khi bị thay thế.
  - REQ-BR-05 - Mỗi tài liệu chỉ có một version hiện hành duy nhất tại một thời điểm.
  - REQ-ASM-03 - Nhóm phải chốt quy tắc tăng version và định nghĩa version chính thức trước nghiệm thu.

### EP-05 - Tìm kiếm & AI Q&A theo quyền

- **Mô tả ngắn gọn:** Giúp Reader khám phá tri thức được phép, đặt câu hỏi bằng văn bản và kiểm tra câu trả lời qua citation trỏ đến đúng tài liệu/version nội bộ.
- **Các yêu cầu chức năng (FR) thuộc Epic này:**
  - REQ-FR-12 - Tìm kiếm trong tập tài liệu phù hợp với quyền hiện tại và mở đúng tài liệu được phép.
  - REQ-FR-13 - Reader đặt câu hỏi bằng văn bản về nội dung tài liệu được phép truy cập.
  - REQ-FR-14 - Hiển thị và lưu định danh tài liệu hoặc version làm nguồn cho câu trả lời cần kiểm chứng.
  - REQ-FR-15 - Permission-aware retrieval áp dụng cho cả Search và Q&A.
- **Quy tắc nghiệp vụ (BR) & Ràng buộc (NFR/CON) liên quan:**
  - REQ-BR-04 - Q&A chỉ dùng kho tài liệu nội bộ được phép và không dùng nguồn Internet trong MVP.
  - REQ-NFR-03 - Q&A benchmark đạt tối thiểu 80% accuracy, không tính câu trả lời đúng do đoán.
  - REQ-NFR-04 - 100% lượt Q&A cần kiểm chứng có document ID và version ID hoặc định danh tương đương.
  - REQ-BR-02 - Quyền xem là điều kiện bắt buộc để tài liệu xuất hiện trong Search, citation và Q&A; yêu cầu này được sở hữu chính tại EP-01.

### EP-06 - Quản trị truy vết & chất lượng vận hành

- **Mô tả ngắn gọn:** Tạo bằng chứng vận hành đáng tin cậy qua audit log, dữ liệu được phép, tiêu chí benchmark và kiểm thử E2E trước khi nghiệm thu MVP.
- **Các yêu cầu chức năng (FR) thuộc Epic này:**
  - REQ-FR-16 - Lưu lịch sử các hoạt động quan trọng gồm Create, Edit, Review, Approve, Publish và Ask AI cùng đối tượng, người thực hiện và thời điểm.
- **Quy tắc nghiệp vụ (BR) & Ràng buộc (NFR/CON) liên quan:**
  - REQ-NFR-01 - Vận hành với khoảng 10 người dùng và 100 tài liệu mà không mất dữ liệu trong các luồng MVP.
  - REQ-NFR-05 - 100% hoạt động quan trọng có audit log với tài khoản, hành động, đối tượng, thời điểm và kết quả.
  - REQ-CON-01 - MVP là nền tảng web và chỉ sử dụng dữ liệu đã được xác nhận là được phép.
  - REQ-CON-02 - Các luồng Create -> Review -> Publish -> Version -> Search/Ask và permission-aware retrieval phải pass E2E trước nghiệm thu.
  - REQ-ASM-02 - Nhóm cung cấp benchmark Q&A, đáp án chuẩn, nguồn chuẩn và quy tắc loại câu trả lời do đoán.
  - REQ-ASM-04 - Nhóm chốt danh sách hoạt động được xem là quan trọng trước nghiệm thu audit log.

## VERIFY - Self-check

1. **Kiểm tra requirement mồ côi:** Không có requirement nào bị bỏ sót. Toàn bộ 34 mã trong Requirement Inventory đã được phân vào bảng tổng quan và phần chi tiết. `REQ-BR-02` là yêu cầu xuyên suốt nên được nhắc lại tại EP-05, nhưng được sở hữu chính tại EP-01 để tránh mất dấu trách nhiệm.
2. **Kiểm tra độ rộng của Epic:** Không có Epic nào được nhóm theo công nghệ hoặc vai trò kỹ thuật. EP-02, EP-03, EP-04 và EP-05 là các năng lực người dùng rõ ràng; EP-01 và EP-06 là hai năng lực quản trị cần thiết để bảo vệ và nghiệm thu sản phẩm. Không cần tách nhỏ thêm ở cấp Epic hiện tại; các FR trong từng Epic có thể tiếp tục được phân rã thành 8-15 User Stories.
3. **Điểm cần theo dõi khi viết User Stories:** Các quyết định còn UNKNOWN/TBD về mô hình quyền, quy tắc tăng version, benchmark Q&A, danh sách hoạt động quan trọng và dữ liệu được phép phải được thể hiện là acceptance criteria hoặc dependency, không được tự suy diễn thành hành vi mới.
