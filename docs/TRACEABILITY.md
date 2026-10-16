# Ma trận truy vết yêu cầu đầu-cuối

**Chủ sở hữu:** BA / Product.
**Trạng thái:** Bản làm việc; chưa phải hồ sơ ký duyệt cho đến khi các khoảng trống và bằng chứng `TBD` được xử lý.
**Nguồn chuẩn:** [Danh mục yêu cầu](02-requirements/requirements.md), [User Stories](04-backlog/user-stories.md) và ma trận này.

## Cách sử dụng ma trận

Truy vết từng yêu cầu theo chuỗi `REQ -> Story/AC -> Task -> UI/API/thiết kế -> Test -> Commit/PR`. Mọi ID yêu cầu trong danh mục đều phải có mặt bên dưới. Các khoảng mã Story/Task kế thừa từ phần tổng hợp backlog hiện tại và mới xác định nhóm Task theo Epic; cần xác nhận liên kết Taiga cụ thể giữa từng Task và Story trước khi tuyên bố Task hoàn tất.

`TBD` có nghĩa là bằng chứng còn thiếu, không phải đạt. Khi có thay đổi triển khai, cập nhật hàng tương ứng bằng ID/kết quả kiểm thử và URL commit/PR chính xác. Không kết luận một yêu cầu đã hoàn thành chỉ dựa trên tài liệu thiết kế.

## Yêu cầu chức năng

| Yêu cầu | Story / AC | Nhóm Epic / Task | UI / API / thiết kế | Bằng chứng kiểm thử | Commit / PR |
| --- | --- | --- | --- | --- | --- |
| REQ-FR-01 | US-AI-01 AC1–AC4 | EP1 T-101..T-210 | Chính sách vai trò và truy cập; các route xác thực trong `backend/app/main.py`; API quản trị vai trò: TBD | Kiểm thử vai trò/phân quyền trong `backend/tests/test_api.py`; ma trận đầy đủ bốn vai trò: TBD | TBD |
| REQ-FR-02 | US-AI-03 | EP2 T-301..T-314 | Trình soạn tài liệu; `POST /api/documents` | Kiểm thử tạo tài liệu trong `backend/tests/test_api.py`; `TC-WF-01` | TBD |
| REQ-FR-03 | US-AI-03 | EP2 T-301..T-314 | Giao diện tài liệu; `PATCH /api/documents/{document_id}` | Bao phủ Author chỉnh sửa và Reader bị từ chối: TBD; `TC-WF-06` | TBD |
| REQ-FR-04 | US-AI-02 AC1–AC2 | EP1 T-101..T-210 | Chi tiết tài liệu; `GET /api/documents/{document_id}` | Kiểm thử truy cập tài liệu được/không được phép trong `backend/tests/test_api.py`; ma trận đầy đủ chống lộ metadata: TBD | TBD |
| REQ-FR-05 | US-AI-04 | EP2 T-301..T-314 | Hợp đồng UI/API Folder và Tag; `docs/06-technical/api-contract.md` | Kiểm thử chấp nhận thêm/bỏ Folder và Tag: TBD | TBD |
| REQ-FR-06 | US-AI-05 AC1 | EP3 T-401..T-509 | Trạng thái workflow trong [business-workflow.md](03-product/business-workflow.md); `/api/documents/{document_id}/review` | `test_document_review_approval_publish_and_version_history`; `TC-WF-01..TC-WF-03` | TBD |
| REQ-FR-07 | US-AI-05 AC1–AC4 | EP3 T-401..T-509 | Gửi Review và giao diện/API Draft | Đã có kiểm thử luồng chính; kiểm thử gửi trùng và gửi lại Draft bị Reject: `TC-WF-02`, `TC-WF-06` (chưa tự động hóa) | TBD |
| REQ-FR-08 | US-AI-06 AC1 | EP3 T-401..T-509 | Hàng đợi Review; `GET /api/reviews` | Bao phủ trường dữ liệu hàng đợi/phân quyền: TBD; `TC-WF-03` | TBD |
| REQ-FR-09 | US-AI-06 AC2–AC5 | EP3 T-401..T-509 | Chi tiết Review và route quyết định; `/api/reviews/{review_id}/{decision}` | `test_review_rejection_requires_reason_and_inactive_user_cannot_login` kiểm tra thiếu lý do; ma trận quyết định/audit: TBD; `TC-WF-04..TC-WF-05` | TBD |
| REQ-FR-10 | US-AI-07 AC1–AC4 | EP3 T-401..T-509 | Thao tác Publish; `POST /api/documents/{document_id}/publish` | Đã có kiểm thử luồng chính; kiểm thử từ chối trạng thái không hợp lệ và Author: `TC-WF-07..TC-WF-08` (chưa tự động hóa đầy đủ) | TBD |
| REQ-FR-11 | US-AI-08 AC1–AC4 | EP4 T-601..T-611 | Lịch sử version và chỉ báo version hiện hành; route publish/version | Luồng chính xác minh version đầu tiên; Reject/gửi lại và publish hai lần: `TC-WF-06`, `TC-WF-09` (chưa tự động hóa) | TBD |
| REQ-FR-12 | US-AI-09 | EP5 T-701..T-706 | Giao diện Search; route hiện tại `GET /api/documents?q=...`; hợp đồng thiết kế cũng nêu `/api/search` | Ma trận truy vấn theo quyền/không có kết quả: TBD; `TC-AI-EVAL-11` | TBD |
| REQ-FR-13 | US-AI-10 | EP6 T-801..T-904 | Giao diện AI Assistant; `POST /api/ai/ask` | Có kiểm tra luồng chính trong `test_document_review_approval_publish_and_version_history`; đánh giá 20 trường hợp trong [AI Feature Specification](07-ai/ai-feature-spec.md) chưa chạy | TBD |
| REQ-FR-14 | US-AI-11 | EP6 T-801..T-904 | Giao diện citation và lưu nguồn; yêu cầu có ID tài liệu/version ổn định | Response hiện được kiểm tra chỉ có ID tài liệu; lưu và hiển thị version ID: TBD; `TC-AI-EVAL-09` | TBD |
| REQ-FR-15 | US-AI-02 AC3–AC4; US-AI-10 | EP1 T-101..T-210; EP6 T-801..T-904 | Search và retrieval có xét quyền; `GET /api/documents`, `POST /api/ai/ask` | Ma trận đối kháng giữa người dùng/tài liệu: TBD; `TC-AI-EVAL-03`, `TC-AI-EVAL-08`, `TC-AI-EVAL-15` | TBD |
| REQ-FR-16 | US-AI-12 | EP7 T-1001..T-1002 | Audit cho Create/Edit/Review/Approve/Publish/Ask; API audit trong backend | Đã có kiểm thử login/audit; bao phủ đủ sáu thao tác với actor/object/time/result: TBD | TBD |
| REQ-FR-17 | US-AI-08 AC6 | EP4 T-601..T-611 | Giao diện lịch sử version; `GET /api/documents/{document_id}/versions` | Bao phủ Reader/chỉ xem version hiện hành và các trường lịch sử: TBD | TBD |
| REQ-FR-18 | US-AI-04, cần xác nhận AC của Story | EP2 T-301..T-314 | Giao diện/dịch vụ gợi ý Tag: TBD | Yêu cầu xác nhận rõ gợi ý; kiểm thử: TBD | TBD |

## Yêu cầu phi chức năng

| Yêu cầu | Story / AC | Nhóm Epic / Task | Bề mặt thiết kế / triển khai | Bằng chứng kiểm thử | Commit / PR |
| --- | --- | --- | --- | --- | --- |
| REQ-NFR-01 | Xuyên suốt; tất cả Story MVP | EP1–EP7 | Kiến trúc, cơ sở dữ liệu và cấu hình release | Chạy kiểm tra toàn vẹn dữ liệu với 10 người dùng/100 tài liệu: TBD | TBD |
| REQ-NFR-02 | US-AI-02, US-AI-09, US-AI-10, US-AI-11 | Nhóm Task EP1, EP5, EP6 | Phân quyền trước khi đọc trực tiếp, Search, retrieval và citation | Ma trận không rò rỉ phải đạt 0%; bằng chứng hiện có chưa chứng minh được: TBD | TBD |
| REQ-NFR-03 | US-AI-10 | EP6 T-801..T-904 | [Bộ đánh giá AI và cách chấm](07-ai/ai-feature-spec.md) | Ít nhất 16/20 câu trả lời có căn cứ đúng; hiện chưa đính kèm kết quả chạy | TBD |
| REQ-NFR-04 | US-AI-11 | EP6 T-801..T-904 | Bản ghi nguồn được lưu cùng document ID và version ID | Kiểm tra tính đầy đủ 100%; bằng chứng triển khai hiện tại chưa đủ | TBD |
| REQ-NFR-05 | US-AI-12 | EP7 T-1001..T-1002 | Schema audit và các route ghi sự kiện | Bao phủ 100% sự kiện/trường bắt buộc: TBD | TBD |

## Quy tắc nghiệp vụ

| Yêu cầu | Story / AC | Nhóm Epic / Task | Bề mặt thiết kế / triển khai | Bằng chứng kiểm thử | Commit / PR |
| --- | --- | --- | --- | --- | --- |
| REQ-BR-01 | US-AI-05, US-AI-06, US-AI-07 | EP3 T-401..T-509 | [Bảng chuyển trạng thái workflow](03-product/business-workflow.md); route Review/Publish | `TC-WF-02..TC-WF-08`; chưa tự động hóa đầy đủ các chuyển trạng thái bị từ chối | TBD |
| REQ-BR-02 | US-AI-02, US-AI-09, US-AI-10, US-AI-11 | Nhóm Task EP1, EP5, EP6 | Chính sách quyền trên đọc/Search/retrieval/citation | Ma trận truy cập và kết quả không rò rỉ: TBD | TBD |
| REQ-BR-03 | US-AI-08 | EP4 T-601..T-611 | Version hiện hành và retention; [test cases](07-testing/test-cases.md) | `TC-VERSION-PUBLISH-01..04`, `TC-RETENTION-01..03`; bằng chứng chạy: TBD | TBD |
| REQ-BR-04 | US-AI-10 | EP6 T-801..T-904 | Chỉ retrieval nội bộ và phản hồi khi thiếu bằng chứng | `TC-AI-EVAL-14`, `TC-AI-EVAL-20`; chưa chạy kiểm tra cấm nguồn bên ngoài | TBD |
| REQ-BR-05 | US-AI-07, US-AI-08 | EP3 T-401..T-509; EP4 T-601..T-611 | Logic Publish và xác định version hiện hành | `TC-WF-08..TC-WF-10`; kiểm tra chỉ có một version hiện hành sau hai lần publish: TBD | TBD |

## Ràng buộc và giả định

| Yêu cầu | Story / AC | Nhóm Epic / Task | Bề mặt thiết kế / triển khai | Bằng chứng kiểm thử | Commit / PR |
| --- | --- | --- | --- | --- | --- |
| REQ-CON-01 | Xuyên suốt | EP1–EP7 | Nguồn dữ liệu được phép dùng trong môn học và ứng dụng web | Danh mục nguồn/phê duyệt dữ liệu: TBD | TBD |
| REQ-CON-02 | US-AI-05–US-AI-10 | EP3–EP6 | Luồng đầu-cuối Create → Review → Publish → Version → Search/Ask | Đã có một phần kiểm thử tự động luồng chính; kiểm thử đầy đủ và xét quyền: TBD | TBD |
| REQ-ASM-01 | US-AI-01, US-AI-02 | EP1 T-101..T-210 | Mô hình vai trò Reader, Author, Reviewer, Admin | Ma trận phân quyền đủ bốn vai trò: TBD | TBD |
| REQ-ASM-02 | US-AI-10, US-AI-11 | EP6 T-801..T-904 | Bộ câu hỏi/đáp án chuẩn trong [Vault QA benchmark](02-requirements/vault-qa-benchmark.md.md) | Đã có 20 câu trả lời kỳ vọng; chưa có kết quả đánh giá thực tế có thể tái lập | TBD |
| REQ-ASM-03 | US-AI-07, US-AI-08 | EP3 T-401..T-509; EP4 T-601..T-611 | Chính sách version chính thức và retention đã duyệt | Các trường hợp Publish/retention đã có; bằng chứng chạy: TBD | TBD |
| REQ-ASM-04 | US-AI-12 | EP7 T-1001..T-1002 | Định nghĩa đã duyệt về “hoạt động quan trọng” và các trường audit | Phê duyệt danh sách hoạt động và kiểm tra đầy đủ trường: TBD | TBD |

## Danh mục bằng chứng và phê duyệt

| Bằng chứng | Giá trị hiện tại |
| --- | --- |
| Nguồn yêu cầu | [requirements.md](02-requirements/requirements.md) |
| Nguồn Story/AC | [user-stories.md](04-backlog/user-stories.md) |
| Phân công Epic/Task | [epics.md](03-product/epics.md), [task-assignment.md](03-product/task-assignment.md); các nhóm Task cần liên kết đến Task Taiga cụ thể |
| Đặc tả workflow | [business-workflow.md](03-product/business-workflow.md) |
| Đặc tả AI/bộ đánh giá | [ai-feature-spec.md](07-ai/ai-feature-spec.md), [vault-qa-benchmark.md.md](02-requirements/vault-qa-benchmark.md.md) |
| Danh mục kiểm thử | [test-cases.md](07-testing/test-cases.md), `backend/tests/test_api.py` |
| Liên kết Commit / PR | TBD; bổ sung URL chính xác cho từng yêu cầu sau khi merge |
| Phê duyệt BA / Product | TBD |
| Phê duyệt Engineering / QA | TBD |

### Danh sách kiểm tra hoàn tất

- [ ] Mỗi REQ được liên kết tới tiêu chí nghiệm thu của Story đã duyệt và một Task Taiga cụ thể.
- [ ] Mỗi yêu cầu Must có kiểm thử chạy được hoặc kiểm thử thủ công đã duyệt kèm kết quả.
- [ ] UI/API contract khớp với bản đã phát hành; khoảng cách đã được xử lý hoặc chấp nhận chính thức.
- [ ] Đánh giá AI có thể tái lập với ít nhất 20 trường hợp; các cổng bảo mật/citation của NFR được kiểm tra độc lập.
- [ ] Mỗi hàng đã triển khai có bằng chứng commit/PR; không dùng placeholder như kết quả hoàn tất.
- [ ] Đã ghi nhận phê duyệt của BA, Engineering và QA.
