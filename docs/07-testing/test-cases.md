# Test Cases

## Business workflow state transitions

The cases below define the expected business behavior. An `Automation status` of `Planned` means the case is not yet evidence of a passing implementation.

| ID | Scenario | Expected result | Requirement | Automation status |
| --- | --- | --- | --- | --- |
| TC-WF-01 | Author creates a document. | State is `Draft`; no official version exists. | REQ-FR-02, REQ-FR-06 | Creation is covered; explicit no-version assertion planned. |
| TC-WF-02 | Author submits an editable draft, then retries submission. | First submission creates one pending request and changes state to `Reviewing`; retry does not create a duplicate. | REQ-FR-06, REQ-FR-07 | Happy path partly covered; duplicate retry planned. |
| TC-WF-03 | Reviewer/Admin opens the review queue. | Pending requests show the document, draft/version, submitter and review status; unauthorized role is denied. | REQ-FR-08 | Planned. |
| TC-WF-04 | Reviewer/Admin approves a pending request. | State becomes `Approved`; actor and time are recorded; no official version is created yet. | REQ-FR-09, REQ-FR-11 | Happy path partly covered; no-version and audit assertions planned. |
| TC-WF-05 | Reviewer/Admin rejects a pending request. | A missing reason is rejected; a valid reason is stored with actor and time and the draft remains available. | REQ-FR-09, REQ-FR-11 | Missing-reason test exists; stored reason/actor/time assertion planned. |
| TC-WF-06 | Author edits and resubmits a rejected draft. | The same draft is retained, moves through review again, and no official version is added before publish. | REQ-FR-07, REQ-FR-11 | Planned. |
| TC-WF-07 | Author attempts approve, reject or publish; or an authorized actor publishes a draft that is not approved. | Each action is denied with no state or version change. | REQ-FR-09, REQ-FR-10, REQ-BR-01 | Planned. |
| TC-WF-08 | Reviewer/Admin publishes an approved draft; retry the publish command. | Exactly one official version is created and becomes current; retry does not duplicate it. | REQ-FR-10, REQ-FR-11, REQ-BR-05 | First-publish happy path exists; retry assertion planned. |
| TC-WF-09 | A second approved draft is published for a document that already has a current version. | The later version becomes the only current version; the prior version becomes non-current. | REQ-FR-11, REQ-BR-03, REQ-BR-05 | Planned. |
| TC-WF-10 | Search or Q&A runs after a new version is published. | Only the current published version is eligible, and only for callers with current view permission. | REQ-FR-12, REQ-FR-15, REQ-BR-02, REQ-BR-03 | Planned. |

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
