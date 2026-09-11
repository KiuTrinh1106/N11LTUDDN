# Test Cases

## Reject và tạo version mới

| ID                   | Scenario                                              | Expected result                                                                                                                               | Requirement                     |
| -------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| TC-VERSION-REJECT-01 | Reviewer Reject một version đang `Reviewing`.         | Version bị Reject vẫn tồn tại với nội dung, version, trạng thái, người xử lý và thời điểm Reject được giữ nguyên; version không được Publish. | REQ-FR-09, REQ-FR-10, REQ-FR-11 |
| TC-VERSION-REJECT-02 | Author chỉnh sửa nội dung của version bị Reject.      | Hệ thống tạo một version mới gắn với cùng tài liệu; version bị Reject không bị thay đổi; version mới có thể được gửi Review lại.              | REQ-FR-07, REQ-FR-11            |
| TC-VERSION-REJECT-03 | Author hoặc người dùng thử Publish version bị Reject. | Hệ thống từ chối thao tác Publish và không đánh dấu version bị Reject là version hiện hành.                                                   | REQ-FR-10, REQ-FR-11            |

## Quyền Admin trong Review và Publish

| ID               | Scenario                                     | Expected result                                                                                                              | Requirement          |
| ---------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| TC-ROLE-ADMIN-01 | Admin Approve một version đang `Reviewing`.  | Admin thực hiện Approve thành công; hệ thống lưu người thực hiện, thời điểm và kết quả.                                      | REQ-FR-09            |
| TC-ROLE-ADMIN-02 | Admin Reject một version đang `Reviewing`.   | Admin thực hiện Reject thành công; hệ thống lưu người thực hiện, thời điểm và kết quả; version bị Reject không được Publish. | REQ-FR-09, REQ-FR-10 |
| TC-ROLE-ADMIN-03 | Admin Publish version đã được Admin Approve. | Admin Publish thành công; version trở thành version hiện hành và trạng thái là `Published`.                                  | REQ-FR-10, REQ-BR-01 |
| TC-ROLE-ADMIN-04 | Author thử Approve, Reject hoặc Publish.     | Hệ thống từ chối cả ba thao tác.                                                                                             | REQ-FR-09, REQ-FR-10 |
