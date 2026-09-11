| Thuật ngữ                                          | Định nghĩa                                                                                                                                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Document & Knowledge Management System (AI KMS) | Hệ thống web tập trung để tạo, tổ chức, kiểm duyệt, xuất bản, tìm kiếm và khai thác tài liệu bằng AI trong phạm vi quyền được cấp.                                                                   |
| Kho tri thức                                       | Tập trung các tài liệu nội bộ được hệ thống quản lý và dùng làm nguồn cho tìm kiếm hoặc hỏi đáp AI.                                                                                                  |
| Document (Tài liệu)                                | Đối tượng nội dung chính trong hệ thống, có tên, nội dung, Folder, Tag, trạng thái, version và quyền truy cập.                                                                                       |
| Metadata (Siêu dữ liệu)                            | Thông tin mô tả tài liệu, chẳng hạn tên, Folder, Tag, trạng thái, version và thông tin liên quan đến quyền.                                                                                          |
| Reader                                             | Vai trò được phép tìm kiếm, xem và hỏi đáp về các tài liệu mà người dùng có quyền truy cập.                                                                                                          |
| Author                                             | Vai trò tạo, chỉnh sửa, tổ chức và gửi tài liệu hoặc version tài liệu vào quy trình Review.                                                                                                          |
| Reviewer                                           | Vai trò kiểm tra tài liệu, thực hiện Approve hoặc Reject và theo dõi các yêu cầu Review.                                                                                                             |
| Admin                                              | Vai trò quản lý người dùng, vai trò, quyền truy cập và hoạt động hệ thống trong phạm vi được cấp.                                                                                                    |
| Folder (Thư mục)                                   | Cách tổ chức tài liệu theo cấu trúc thư mục để hỗ trợ lưu trữ và tìm kiếm.                                                                                                                           |
| Tag (Nhãn)                                         | Nhãn gắn với tài liệu để phân loại và hỗ trợ tìm kiếm; tài liệu có thể được gắn hoặc bỏ gắn nhãn.                                                                                                    |
| Status (Trạng thái)                                | Trạng thái xử lý của tài liệu trong quy trình; MVP tối thiểu gồm `Draft`, `Reviewing` và `Published`.                                                                                                |
| Draft                                              | Trạng thái tài liệu hoặc version đang được tạo/chỉnh sửa và chưa hoàn tất Review để Publish.                                                                                                         |
| Reviewing                                          | Trạng thái tài liệu hoặc version đang chờ hoặc đang được Reviewer xử lý.                                                                                                                             |
| Published                                          | Trạng thái tài liệu hoặc version đã được Reviewer Approve và được phép trở thành nội dung chính thức.                                                                                                |
| Version (Phiên bản)                                | Một bản cụ thể của tài liệu được tạo khi nội dung được cập nhật. Version hiện hành được giữ lại; version không hiện hành được lưu trong thời hạn retention và có thể bị tự động xóa sau khi hết hạn. |
| Version hiện hành                                  | Version chính thức đang được dùng mặc định cho tìm kiếm và Q&A tại một thời điểm; mỗi tài liệu chỉ có một version hiện hành và version này không bị xóa bởi chính sách retention.                    |
| Retention version (Thời hạn lưu version)           | Version không hiện hành được lưu trong 1 năm kể từ thời điểm trở thành không hiện hành; sau thời hạn này, hệ thống được tự động xóa version đó. Version hiện hành không áp dụng thời hạn này.        |
| Review                                             | Quy trình Reviewer kiểm tra một tài liệu hoặc version trước khi tài liệu được Publish.                                                                                                               |
| Review queue                                       | Danh sách tập trung các yêu cầu Review, tối thiểu hiển thị tài liệu, version, người gửi và trạng thái xử lý.                                                                                         |
| Approve                                            | Hành động Reviewer chấp thuận tài liệu hoặc version sau Review, làm cơ sở để Publish theo quyền.                                                                                                     |
| Reject                                             | Hành động Reviewer từ chối tài liệu hoặc version; lý do từ chối cần được ghi nhận theo quy trình của hệ thống.                                                                                       |
| Publish                                            | Hành động đưa version đã được Approve thành version chính thức có trạng thái `Published`.                                                                                                            |
| Permission-aware retrieval                         | Cơ chế chỉ cho phép Search hoặc AI truy xuất các tài liệu mà người hỏi có quyền xem; tài liệu trái quyền không được xuất hiện trong kết quả, nội dung, citation hoặc Q&A.                            |
| Search (Tìm kiếm)                                  | Chức năng tìm tài liệu trong tập tài liệu người dùng được phép truy cập; tìm kiếm nâng cao ngoài từ khóa, Folder và Tag là `UNKNOWN/TBD`.                                                            |
| Q&A / Ask AI                                       | Chức năng cho phép người dùng đặt câu hỏi bằng văn bản về nội dung tài liệu được phép truy cập trong kho tri thức.                                                                                   |
| Citation (Nguồn trích dẫn)                         | Thông tin định danh tài liệu hoặc version được AI sử dụng để tạo câu trả lời, giúp người dùng kiểm tra lại nguồn. Mọi câu trả lời AI đều bắt buộc phải có citation.                                  |
| Audit log (Nhật ký hoạt động)                      | Lịch sử các hoạt động quan trọng trên tài liệu và hệ thống, gồm tối thiểu người thực hiện, hành động, đối tượng, thời điểm và kết quả. Danh sách đầy đủ hoạt động quan trọng là `UNKNOWN/TBD`.       |
| Mô hình phân quyền                                 | Cách hệ thống xác định người dùng được xem, sửa hoặc quản lý tài liệu. Việc dùng RBAC, ABAC hay kết hợp, cùng quy tắc cấp/thu hồi quyền, là `UNKNOWN/TBD`.                                           |

## VERIFY

- Không thấy thuật ngữ nào bị trùng hoàn toàn: `Status` mô tả trạng thái tổng quát, còn `Draft`, `Reviewing` và `Published` là các giá trị trạng thái cụ thể.
- `Version` là một bản tài liệu có vòng đời lưu giữ; `Version hiện hành` là bản chính thức đang được dùng mặc định, nên hai thuật ngữ này không đồng nghĩa.
- `Review queue` là danh sách yêu cầu; `Review` là quy trình kiểm tra. `Approve` và `Reject` là các kết quả/hành động trong quy trình đó.

### Cần nhóm dự án xác nhận

1. Mô hình phân quyền là RBAC, ABAC hay kết hợp; ai được cấp, sửa và thu hồi quyền tài liệu?
2. Version tăng ở mỗi lần sửa, gửi Review hay Publish; có cho phép khôi phục version đã lưu không?
3. Danh sách đầy đủ hoạt động phải ghi vào Audit log và thời gian lưu log là bao lâu?
