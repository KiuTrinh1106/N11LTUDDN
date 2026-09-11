# PRD - AI Document & Knowledge Management System

_Trạng thái: Draft_

## 1. Problem

Trong tổ chức, tài liệu và kiến thức nội bộ nằm rải rác, khiến người dùng khó tìm đúng tài liệu, khó xác định phiên bản mới nhất và phải đối chiếu thông tin thủ công. Quy trình Create - Review - Publish - Version thường phụ thuộc vào email hoặc bảng tính nên Author khó theo dõi trạng thái, Reviewer khó quản lý danh sách chờ và lịch sử phê duyệt khó truy vết.

Khi dùng AI để khai thác kho tri thức, nếu hệ thống truy xuất sai nguồn hoặc dùng tài liệu ngoài quyền truy cập, câu trả lời có thể thiếu chính xác và làm lộ dữ liệu. AI KMS cần cung cấp một kho tài liệu tập trung, kiểm soát truy cập theo quyền, quy trình Review rõ ràng, version hiện hành và citation để người dùng kiểm tra lại nguồn.

## 2. Goals

- Tập trung hóa việc tạo, chỉnh sửa, xem và tổ chức tài liệu nội bộ bằng Folder và Tag.
- Vận hành quy trình Create -> Review -> Publish -> Version với trạng thái và version hiện hành rõ ràng.
- Bảo đảm người dùng chỉ xem, tìm kiếm và khai thác tài liệu phù hợp với quyền được cấp.
- Cho phép Reader hỏi AI bằng văn bản về nội dung trong kho tri thức được phép truy cập.
- Hiển thị và lưu lại tài liệu/version được dùng làm nguồn cho câu trả lời AI.
- Lưu lịch sử các hoạt động quan trọng để hỗ trợ truy vết tài liệu và hệ thống.
- Đáp ứng quy mô MVP khoảng 10 người dùng và 100 tài liệu nội bộ mà không mất dữ liệu trong các luồng MVP.

## 3. Non-goals

- Trợ lý AI bằng giọng nói.
- Xác thực sinh trắc học.
- Chỉnh sửa tài liệu thời gian thực hoặc chỉnh sửa đồng thời nhiều người.
- Tìm kiếm thông tin trên Internet.
- Tích hợp sâu với hệ thống bên ngoài.
- AI tự động phê duyệt tài liệu.
- Các tính năng AI nâng cao trong MVP.

## 4. Users

| Người dùng | Trách nhiệm/ngữ cảnh                                               | JTBD - Jobs-to-be-Done                                                                                                                                          |
| ---------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Author     | Tạo, cập nhật và gửi tài liệu để kiểm duyệt.                       | Khi cần đưa kiến thức vào kho, tôi muốn tạo hoặc cập nhật tài liệu, tổ chức bằng Folder/Tag và gửi đúng version vào Review để tài liệu được xử lý có kiểm soát. |
| Reviewer   | Kiểm tra, phê duyệt hoặc từ chối tài liệu.                         | Khi có tài liệu chờ xử lý, tôi muốn xem Review queue gắn với đúng tài liệu, version và người gửi để Approve hoặc Reject và để lại dấu vết xử lý.                |
| Reader     | Tìm kiếm, đọc và hỏi đáp với kho tri thức.                         | Khi cần thông tin, tôi muốn tìm và đọc đúng tài liệu mình được phép xem, sau đó hỏi AI và kiểm tra nguồn trả lời.                                               |
| Admin      | Quản lý người dùng, vai trò, quyền truy cập và hoạt động hệ thống. | Khi cần kiểm soát hệ thống, tôi muốn quản lý quyền và xem lịch sử hoạt động để bảo vệ dữ liệu và truy vết thao tác.                                             |

Mô hình chi tiết để cấp, sửa và thu hồi quyền tài liệu (RBAC, ABAC hoặc kết hợp), cũng như phạm vi thao tác cụ thể của Admin, là **UNKNOWN**.

## 5. Functional Scope

Các tính năng dưới đây chỉ bao gồm những tính năng đã có Requirement ID trong Requirement Inventory.

| Tên tính năng                         | Mô tả hành vi                                                                                                       | Requirement ID liên kết          | Mức độ ưu tiên Must/Should/Could |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------- |
| Kiểm soát quyền truy cập theo vai trò | Kiểm soát quyền truy cập tài liệu và chức năng cho Reader, Author, Reviewer và Admin.                               | REQ-FR-01, REQ-ASM-01            | Must                             |
| Tạo tài liệu                          | Author tạo tài liệu với tên, nội dung, Folder, Tag, trạng thái và version ban đầu.                                  | REQ-FR-02                        | Must                             |
| Chỉnh sửa tài liệu                    | Author hoặc người có quyền chỉnh sửa tài liệu; Reader chỉ có quyền xem không được chỉnh sửa.                        | REQ-FR-03                        | Must                             |
| Xem tài liệu theo quyền               | Người có quyền xem được nội dung và metadata; người không có quyền không nhận được nội dung hoặc metadata nhạy cảm. | REQ-FR-04                        | Must                             |
| Folder và Tag                         | Người có quyền tổ chức tài liệu bằng cách gắn hoặc bỏ gắn Folder và Tag.                                            | REQ-FR-05                        | Must                             |
| Quy trình trạng thái tài liệu         | Quản lý tối thiểu Draft, Reviewing và Published theo luồng Create -> Review -> Publish -> Version.                  | REQ-FR-06                        | Must                             |
| Gửi Review                            | Author gửi một version Draft vào Review; yêu cầu gắn đúng tài liệu, version và người gửi.                           | REQ-FR-07                        | Must                             |
| Review queue                          | Reviewer xem queue tập trung, trong đó mỗi mục có tài liệu, version, người gửi và trạng thái xử lý.                 | REQ-FR-08                        | Must                             |
| Approve/Reject                        | Reviewer Approve hoặc Reject yêu cầu Review; lưu người thực hiện và thời điểm.                                      | REQ-FR-09                        | Must                             |
| Publish có điều kiện                  | Chỉ Publish version đã được Reviewer Approve; từ chối version chưa hoàn tất Review.                                 | REQ-FR-10, REQ-BR-01             | Must                             |
| Quản lý version hiện hành             | Khi nội dung cập nhật, tạo version mới và đánh dấu version hiện hành; version bị thay thế không còn là hiện hành.   | REQ-FR-11, REQ-BR-03, REQ-BR-05  | Must                             |
| Tìm kiếm theo quyền                   | Chỉ tìm kiếm trong tập tài liệu phù hợp với quyền hiện tại và chỉ mở được tài liệu được phép.                       | REQ-FR-12, REQ-BR-02             | Must                             |
| Hỏi AI bằng văn bản                   | Reader đặt câu hỏi về nội dung tài liệu trong kho tri thức mà Reader được phép truy cập.                            | REQ-FR-13                        | Must                             |
| Citation cho câu trả lời              | Hiển thị và lưu định danh tài liệu/version đã được dùng làm nguồn cho mỗi câu trả lời cần kiểm chứng.               | REQ-FR-14, REQ-NFR-04            | Must                             |
| Permission-aware retrieval            | Search và Q&A chỉ truy xuất tài liệu mà người dùng hiện tại có quyền xem.                                           | REQ-FR-15, REQ-NFR-02, REQ-BR-02 | Must                             |
| Audit log hoạt động quan trọng        | Lưu Create, Edit, Review, Approve, Publish và Ask AI cùng đối tượng liên quan, người thực hiện và thời điểm.        | REQ-FR-16, REQ-NFR-05            | Must                             |
| Xem lịch sử version                   | Admin, Reviewer và Author xem lịch sử version; Reader chỉ xem version gần nhất.                                     | REQ-FR-17                        | Should                           |
| Gợi ý Tag có xác nhận                 | Có thể gợi ý Tag dựa trên nội dung hoặc metadata, nhưng chỉ lưu sau khi người dùng xác nhận.                        | REQ-FR-18                        | Could                            |

Các mục “Tìm kiếm nâng cao”, “So sánh các Version”, “Gợi ý tài liệu liên quan” và “Thống kê sử dụng” có trong Scope nhưng chưa có Requirement ID tương ứng trong Requirement Inventory. Chúng chưa được đưa vào bảng Functional Scope và cần được đặc tả trước khi cam kết triển khai.

## 6. Business Rules

| ID    | Quy tắc nghiệp vụ                                                                                                                                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 | Chỉ version đã qua Review và được Reviewer Approve mới được chuyển sang `Published`; version bị Reject hoặc chưa Approve không được Publish. (REQ-FR-10, REQ-BR-01)                                                                                |
| BR-02 | Quyền xem tài liệu là điều kiện bắt buộc cho việc xuất hiện trong tìm kiếm, đọc nội dung, nhận citation và sử dụng tài liệu trong Q&A. (REQ-FR-04, REQ-FR-12, REQ-FR-14, REQ-FR-15, REQ-BR-02)                                                     |
| BR-03 | Khi nội dung được cập nhật, hệ thống phải tạo version mới; version bị thay thế không được coi là version hiện hành. (REQ-FR-11)                                                                                                                    |
| BR-04 | Tại một thời điểm, mỗi tài liệu chỉ có một version hiện hành; version hiện hành là version được dùng cho Search/Q&A. (REQ-FR-11, REQ-BR-03, REQ-BR-05)                                                                                             |
| BR-05 | Q&A trong MVP chỉ khai thác kho tài liệu nội bộ được phép và không sử dụng nguồn Internet. (REQ-FR-13, REQ-FR-15, REQ-BR-04)                                                                                                                       |
| BR-06 | Hoạt động được định nghĩa là quan trọng phải có audit log gồm tài khoản, hành động, đối tượng, thời điểm và kết quả. Danh sách đầy đủ hoạt động quan trọng là UNKNOWN và phải được nhóm chốt trước nghiệm thu. (REQ-FR-16, REQ-NFR-05, REQ-ASM-04) |
| BR-07 | Version không hiện hành được lưu trong 1 năm kể từ khi bị thay thế rồi tự động xóa; version hiện hành luôn được giữ lại. Cách thực thi và thời điểm chạy tác vụ xóa là UNKNOWN. (REQ-FR-11)                                                        |
| BR-08 | Mọi nguồn dữ liệu chưa được xác nhận là được phép phải bị loại khỏi dữ liệu vận hành MVP. (REQ-CON-01)                                                                                                                                             |
| BR-09 | Bốn vai trò Reader, Author, Reviewer và Admin là tập vai trò tối thiểu để kiểm thử MVP. (REQ-ASM-01)                                                                                                                                               |
| BR-10 | Các luồng Create -> Review -> Publish -> Version -> Search/Ask và permission-aware retrieval phải hoàn tất kiểm thử E2E trước nghiệm thu MVP. (REQ-CON-02)                                                                                         |

## 7. UX Principles

- Luôn hiển thị rõ trạng thái tài liệu và version hiện hành để người dùng biết bước tiếp theo.
- Review queue phải gắn rõ tài liệu, version, người gửi và trạng thái xử lý.
- Mọi hành động bị từ chối do quyền hoặc do sai trạng thái phải có thông báo lỗi rõ ràng, không tiết lộ metadata nhạy cảm.
- Trước hành động quan trọng như Approve, Reject, Publish hoặc xóa theo retention, hệ thống cần yêu cầu xác nhận; cơ chế xác nhận cụ thể là **UNKNOWN**.
- Citation phải hiển thị cùng câu trả lời AI và có thể truy lại tài liệu/version nguồn.
- Không hiển thị tài liệu, trích đoạn hoặc citation ngoài quyền của người dùng, kể cả trong kết quả rỗng, lỗi hoặc màn hình trung gian.
- Phân biệt rõ thông tin chính thức, version bị thay thế và thông tin chưa được xác nhận.
- Khi AI không tìm thấy dữ liệu phù hợp trong kho được phép, nội dung phản hồi và trạng thái giao diện là **UNKNOWN**, cần được quyết định trước nghiệm thu.
- Giao diện MVP tập trung vào nền tảng web và phải hỗ trợ hiển thị trạng thái, lỗi và kết quả truy vết của các luồng chính.

## 8. Metrics / Acceptance Signals

| Chỉ số/tín hiệu        | Mục tiêu nghiệm thu                                                                                                   | Căn cứ                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Publish qua Review     | 100% tài liệu được Publish phải qua Review và được Approve trước đó.                                                  | REQ-FR-10, REQ-BR-01            |
| Vi phạm quyền truy cập | 0% ca kiểm thử để lộ tài liệu ngoài quyền qua màn hình, Search, citation hoặc câu trả lời AI.                         | REQ-NFR-02                      |
| Q&A accuracy           | Q&A benchmark đạt tối thiểu 80%; câu trả lời đúng do đoán không được tính.                                            | REQ-NFR-03                      |
| Q&A source record      | 100% lượt Q&A cần kiểm chứng có document ID và version ID hoặc định danh tương đương.                                 | REQ-NFR-04                      |
| Audit log              | 100% hoạt động quan trọng có tài khoản, hành động, đối tượng, thời điểm và kết quả.                                   | REQ-NFR-05                      |
| Tính toàn vẹn dữ liệu  | Với khoảng 10 người dùng và 100 tài liệu, tỷ lệ mất dữ liệu trong các luồng MVP bằng 0.                               | REQ-NFR-01                      |
| Version hiện hành      | Mỗi tài liệu chỉ có một version hiện hành; version bị thay thế không được dùng cho Search/Q&A.                        | REQ-FR-11, REQ-BR-03, REQ-BR-05 |
| E2E MVP                | Tất cả bước bắt buộc của Create -> Review -> Publish -> Version -> Search/Ask và permission-aware retrieval đều pass. | REQ-CON-02                      |

Số lượng, phạm vi, người phê duyệt và cách chấm bộ Q&A benchmark là **UNKNOWN**; nhóm phải cung cấp benchmark phiên bản hóa trước nghiệm thu. (REQ-ASM-02)

## 9. Risks

| Rủi ro                                               | Tác động                                                         | Cách giảm thiểu                                                                                                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lộ tài liệu trái quyền qua Search, citation hoặc Q&A | Vi phạm bảo mật và mất niềm tin vào hệ thống.                    | Áp dụng permission-aware retrieval ở cả Search và Q&A; kiểm thử ma trận User/Document/Permission cho 4 vai trò; mục tiêu vi phạm 0%.                           |
| AI trả lời sai hoặc bịa khi nguồn không đủ           | Người dùng đưa ra quyết định dựa trên thông tin không chính xác. | Chỉ dùng kho nội bộ được phép, bắt buộc citation, đo benchmark >= 80% và chốt quy tắc phản hồi khi không tìm thấy dữ liệu.                                     |
| Dùng nhầm version đã bị thay thế                     | Người dùng làm việc trên thông tin không còn chính thức.         | Đánh dấu một version hiện hành duy nhất, chặn version cũ khỏi Search/Q&A và kiểm thử sau khi Publish version mới.                                              |
| Mô hình cấp quyền chưa được quyết định               | Không thể triển khai hoặc kiểm thử nhất quán quyền tài liệu.     | Chốt RBAC, ABAC hoặc mô hình kết hợp; chốt quy trình cấp, sửa và thu hồi quyền trước nghiệm thu.                                                               |
| Audit log không đủ trường hoặc thiếu hoạt động       | Mất khả năng truy vết và khó điều tra sự cố.                     | Chốt danh sách “hoạt động quan trọng”, bắt buộc log tài khoản/hành động/đối tượng/thời điểm/kết quả và kiểm tra 100%.                                          |
| Retention version thực thi sai                       | Mất dữ liệu cần giữ hoặc giữ dữ liệu quá hạn.                    | Chốt quy tắc tăng version, định nghĩa version chính thức, thời điểm thay thế và cơ chế tự động xóa; không xóa version hiện hành.                               |
| Chất lượng nguồn tri thức không đủ                   | Q&A không đạt benchmark dù luồng kỹ thuật hoạt động.             | Chỉ nạp dữ liệu được phép, phân biệt thông tin chưa xác nhận và chuẩn bị benchmark cùng đáp án, nguồn chuẩn trước nghiệm thu.                                  |
| Scope tăng do các mục Should/Could chưa có đặc tả    | Trễ tiến độ và giảm khả năng hoàn thành MVP.                     | Chỉ cam kết các tính năng đã có Requirement ID; đặc tả và truy vết riêng cho tìm kiếm nâng cao, so sánh version, gợi ý tài liệu liên quan và thống kê sử dụng. |

## 10. Release Slice

### MVP-1 - Must: Nền tảng tài liệu và quyền

- Quản lý bốn vai trò Reader, Author, Reviewer và Admin, cùng quyền truy cập tài liệu: REQ-FR-01, REQ-ASM-01.
- Tạo, chỉnh sửa và xem tài liệu theo quyền: REQ-FR-02, REQ-FR-03, REQ-FR-04.
- Tổ chức tài liệu bằng Folder và Tag: REQ-FR-05.
- Trạng thái tài liệu Draft, Reviewing, Published và luồng Create -> Review -> Publish -> Version: REQ-FR-06, REQ-FR-07, REQ-FR-08, REQ-FR-09, REQ-FR-10.
- Audit log cho các hoạt động quan trọng trong phạm vi đã chốt: REQ-FR-16, REQ-NFR-05, REQ-ASM-04.
- Quy mô mục tiêu khoảng 10 người dùng và 100 tài liệu, dữ liệu được phép: REQ-NFR-01, REQ-CON-01.

### MVP-2 - Must: Version, Search và AI Q&A

- Tạo version mới khi cập nhật, xác định version hiện hành và áp dụng retention cho version không hiện hành: REQ-FR-11, REQ-BR-03, REQ-BR-05.
- Tìm kiếm theo quyền được cấp: REQ-FR-12, REQ-BR-02.
- Reader hỏi AI bằng văn bản; AI chỉ dùng tài liệu được phép, hiển thị và lưu citation document/version: REQ-FR-13, REQ-FR-14, REQ-FR-15, REQ-NFR-02, REQ-NFR-03, REQ-NFR-04.
- Hoàn tất E2E các luồng cốt lõi trước nghiệm thu: REQ-CON-02.

### MVP-2 - Should: Khả năng truy vết mở rộng

- Xem lịch sử các version theo quyền của Admin, Reviewer, Author và Reader: REQ-FR-17.
- “Tìm kiếm nâng cao” và “So sánh các Version” thuộc Scope Should nhưng chưa có Requirement ID hoặc đặc tả hành vi; trạng thái phát hành là **UNKNOWN**, không cam kết trong bản nghiệm thu hiện tại.

### MVP-2 - Could: Hỗ trợ tổ chức tài liệu

- Gợi ý Tag sau khi người dùng xác nhận: REQ-FR-18.
- “Gợi ý tài liệu liên quan” và “Thống kê sử dụng” thuộc Scope Could nhưng chưa có Requirement ID; trạng thái phát hành là **UNKNOWN**.

### VERIFY - Self-check

1. Có yêu cầu nào mâu thuẫn hoặc chưa thể viết test case không?
   - Chưa thấy mâu thuẫn trực tiếp giữa quyền xem/chỉnh sửa, điều kiện Publish, permission-aware retrieval và version hiện hành; các cặp yêu cầu trùng chủ đề nhưng một bên mô tả hành vi, một bên mô tả luật hoặc chỉ tiêu nghiệm thu.
   - Một số yêu cầu chưa thể viết test case hoàn chỉnh nếu chưa có quyết định bổ sung: mô hình và quy trình cấp quyền; quy tắc tăng version và version chính thức; phạm vi benchmark Q&A; danh sách hoạt động quan trọng; phản hồi khi AI không tìm thấy dữ liệu; cơ chế xác nhận và thời điểm chạy xóa retention.
   - `Tìm kiếm nâng cao`, `So sánh các Version`, `Gợi ý tài liệu liên quan` và `Thống kê sử dụng` có trong Scope nhưng chưa có Requirement ID, nên chưa thể đưa vào Functional Scope với khả năng truy vết đầy đủ.

2. Ba câu hỏi quan trọng nhất cần con người quyết định:
   1. Mô hình quyền là RBAC, ABAC hay kết hợp; ai được cấp, sửa và thu hồi quyền tài liệu, và mỗi vai trò được phép thao tác cụ thể nào?
   2. Version tăng ở thời điểm nào (sửa, gửi Review hay Publish), version nào là version chính thức, và retention 1 năm được tính/chạy xóa như thế nào?
   3. Bộ benchmark Q&A gồm bao nhiêu câu, ai phê duyệt đáp án và nguồn chuẩn, thế nào là câu trả lời do đoán, và AI phải phản hồi ra sao khi không tìm thấy thông tin được phép?
