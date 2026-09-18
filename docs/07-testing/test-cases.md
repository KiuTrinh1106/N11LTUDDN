# Test Cases

## Version tăng tại Publish

| ID                    | Scenario                                                 | Expected result                                                                                                       | Requirement          |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------- |
| TC-VERSION-PUBLISH-01 | Author tạo Draft và gửi Review.                          | Draft có định danh bản nháp/Review request nhưng chưa có version chính thức.                                          | REQ-FR-02, REQ-FR-07 |
| TC-VERSION-PUBLISH-02 | Reviewer hoặc Admin Approve Draft nhưng chưa Publish.    | Approve thành công; chưa tăng version chính thức và chưa đánh dấu version hiện hành mới.                              | REQ-FR-09, REQ-FR-11 |
| TC-VERSION-PUBLISH-03 | Reviewer hoặc Admin Publish Draft đã Approve.            | Hệ thống tạo version chính thức tiếp theo, đánh dấu version đó là version hiện hành và chuyển trạng thái `Published`. | REQ-FR-10, REQ-FR-11 |
| TC-VERSION-PUBLISH-04 | Reviewer/Admin Reject, Author sửa cùng Draft và gửi lại. | Không tăng version chính thức trong các lần Reject/sửa/gửi lại; sau Approve và Publish mới tạo version chính thức.    | REQ-FR-07, REQ-FR-11 |

## Retention version

| ID              | Scenario                                               | Expected result                                                            | Requirement       |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------- |
| TC-RETENTION-01 | Chạy tác vụ retention lúc 02:00 theo múi giờ hệ thống. | Tác vụ tìm các version không hiện hành đã đủ 1 năm kể từ `replaced_at`.    | REQ-BR-03, DEC-12 |
| TC-RETENTION-02 | Version không hiện hành đã đủ 1 năm.                   | Version bị xóa sau lần chạy retention; không còn được dùng cho Search/Q&A. | REQ-BR-03, DEC-12 |
| TC-RETENTION-03 | Version hiện hành đã đủ hoặc quá 1 năm kể từ ngày tạo. | Version hiện hành vẫn được giữ, không bị xóa bởi retention.                | REQ-BR-03, DEC-12 |
