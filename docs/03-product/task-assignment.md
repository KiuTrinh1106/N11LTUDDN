# Phân công task dự án

## Nguyên tắc

- **Trinh**: BA, BE và AI; đồng thời nhận các task `FE/BE` có phần backend hoặc tích hợp lớn.
- **Thơ**: UI/UX, FE và QA; đồng thời nhận các task `FE/BE` còn lại.
- Các task `FE/BE` được chia thêm để tổng ước lượng của hai người gần cân bằng.

## Phân công

| Thành viên | Task                                                                                                                                                                                                                           | Tổng ước lượng |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------: |
| Trinh      | T-101, T-102, T-105, T-106, T-201, T-203, T-205, T-207, T-209, T-301, T-303, T-307, T-308, T-311, T-312, T-401, T-402, T-404, T-406, T-408, T-501, T-503, T-506, T-508, T-601, T-602, T-603, T-607, T-609, T-701, T-702, T-703 |           119h |
| Thơ        | T-103, T-104, T-107, T-202, T-204, T-206, T-208, T-210, T-302, T-304, T-305, T-306, T-309, T-310, T-313, T-314, T-403, T-405, T-502, T-504, T-505, T-507, T-509, T-604, T-605, T-606, T-608, T-610, T-611, T-704, T-705, T-706 |           103h |

## Ngoại lệ `FE/BE`

- Trinh: `T-205`, `T-209`, `T-307`, `T-408`, `T-508`.
- Thơ: `T-705`.

Bản phân công này dùng làm tài liệu nội bộ cho dự án và không phụ thuộc vào bất kỳ hệ thống quản lý backlog bên ngoài nào.

## Taiga Backlog v1

Backlog nằm trong project `kiutrinh1106-ai-document-knowledge-management-system` (Taiga project ID `1805780`). Snapshot board đọc được ngày 2026-10-16 có 7 Epic, 12 User Story và 77 Task; 76 Task ở `New`, riêng `T-101` ở `Needs Info`. Đây là snapshot trạng thái tại thời điểm kiểm tra, cần kiểm tra lại trước khi dùng làm bằng chứng nghiệm thu hoặc báo cáo Viva.

- Hồ sơ trước đây ghi 7 Epic, 12 User Story và 77 Task; con số này chưa được kiểm tra lại trên board.
- Mỗi User Story có Epic, estimate, acceptance criteria và Definition of Ready trong Taiga.
- Hồ sơ trước đây ghi mỗi Task có đúng một parent User Story, status `New`, owner, estimate trong mô tả và artifact link; status `New` không được xem là trạng thái hiện tại nếu chưa đối chiếu board.
- Owner Taiga: `kiutrinh1106` là Trinh; `phamthianhtho` là Thơ.
- Các task bổ sung cho phạm vi đầy đủ: `T-801..T-806` cho AI, `T-901..T-904` cho Citation và `T-1001..T-1002` cho Audit.
- Trace end-to-end và artifact index: `docs/06-technical/TRACEABILITY.md`.

**Sai khác cần đối soát:** bảng phân công hiện liệt kê 32 ID cho Trinh và 32 ID cho Thơ (64 ID); các nhóm task bổ sung liệt kê thêm 12 ID, tổng cộng 76 ID. Như vậy còn thiếu định danh của 1 Task so với con số 77 đã ghi trước đây. Không tự tạo ID hoặc gán Task giả định; xác minh trên Taiga rồi cập nhật bảng và traceability.

### Rà soát trạng thái theo bằng chứng repository (2026-10-16)

Đã chạy `backend/tests/test_api.py`: **10 passed**. Đây là bằng chứng cho các hành vi được test trong suite hiện tại, không đồng nghĩa toàn bộ Story/Epic hoặc các Task tương ứng đã Done. Traceability hiện chỉ gắn các khoảng Task với Epic, chưa có bảng đối chiếu từng Task -> Story/AC; vì vậy trạng thái dưới đây là **đánh giá Epic/nhóm việc**, không phải thay đổi trạng thái Task trong Taiga.

| Epic / nhóm Task theo traceability | Trạng thái nhóm | Đã có bằng chứng trong repository | Còn thiếu trước khi nhóm có thể Done |
| --- | --- | --- | --- |
| EP1 - Quyền truy cập (`T-101..T-210`) | In Progress | Đăng nhập/đăng xuất, thu hồi session; hạn chế tạo tài liệu theo role; kiểm tra một số trường hợp truy cập trực tiếp. | Ma trận đủ bốn role cho chức năng/tài liệu; mô hình và thao tác quản trị quyền; kiểm thử không rò metadata đầy đủ. |
| EP2 - Tài liệu (`T-301..T-314`) | In Progress | Author tạo tài liệu; upload/download có kiểm tra role; validation một số loại file và trích xuất DOCX/PDF. | Bao phủ AC chỉnh sửa, Folder/Tag và các điều kiện nghiệp vụ còn lại bằng test/evidence; liên kết chính xác task với AC. |
| EP3 - Review/Publish (`T-401..T-509`) | In Progress | Test happy path gửi Review, lấy Review queue, Approve, Publish; test Reject thiếu lý do. | Reject hợp lệ và lưu thông tin; role/state bị từ chối; retry/duplicate; resubmit sau Reject và các nhánh ngoại lệ. |
| EP4 - Version (`T-601..T-611`) | In Progress | Test Publish đầu tiên tạo version `v1.0` và xem được version history. | Publish lần tiếp theo/current-version uniqueness; không tăng version trước Publish; retention và các case biên. |
| EP5 - Search (`T-701..T-706`) | In Progress | Có bề mặt API tìm/lọc tài liệu trong ứng dụng. | Test ma trận Search theo quyền, metadata leakage, trạng thái Loading/Error/Retry và kết quả chấp nhận. |
| EP6 - AI và Citation (`T-801..T-806`, `T-901..T-904`) | In Progress | Có endpoint hỏi AI; test happy path hiện kiểm tra response và document source ID. | Chạy đủ 20 case; kiểm soát quyền trước retrieval; citation document/version IDs và persistence; fallback/error contract; ngưỡng chất lượng và zero-leak. |
| EP7 - Audit (`T-1001..T-1002`) | In Progress | Test login/logout audit; implementation/test có ghi nhận một số thao tác tài liệu và kết quả. | Đối soát đầy đủ Create/Edit/Review/Approve/Publish/Ask AI với actor, object, time, result; kiểm tra denied/error paths và completeness. |

**Quyết định trạng thái:** hiện chưa có Epic nào đủ bằng chứng để tuyên bố toàn bộ nhóm việc Done. Các chức năng/test đã xác minh ở cột thứ ba có thể được chuyển thành Task Done **sau khi** đối chiếu đúng mô tả/AC và liên kết bằng chứng với từng Task trên Taiga. Những phần còn thiếu giữ In Progress; chỉ dùng Blocked nếu có blocker thực tế được ghi nhận, không dùng Blocked thay cho “chưa kiểm thử”.

**Thay đổi trực tiếp trên Taiga:** chưa thực hiện. Board đã truy cập được để đọc và đối chiếu mô tả Task. T-404 (`API Review Queue`, Taiga Task #55) có test happy path xác nhận Reviewer lấy được queue sau khi Author gửi Review; tuy nhiên, điều khiển trạng thái trên trang Task không mở được trong phiên hiện tại, nên trạng thái vẫn `New` và chưa có Task nào được chuyển sang `Closed`/Done. Không suy ra các Task còn lại là Done chỉ từ việc có code; cần đối chiếu từng DoD với test/evidence và xác minh trạng thái sau khi cập nhật.

### Quy ước chuẩn hóa backlog

Taiga là nơi theo dõi trạng thái thực thi; `docs/03-product/epics.md`, `docs/04-backlog/user-stories.md`, tài liệu này và `docs/TRACEABILITY.md` là các artifact đối chiếu trong repository. Khi thông tin khác nhau, không tự chọn một nguồn để ghi đè: BA ghi nhận sai khác, xác nhận với owner, rồi đồng bộ cả Taiga và tài liệu.

#### Epic

- Dùng các mã `EP1`–`EP7` và tên năng lực thống nhất với [epics.md](epics.md).
- Mỗi Epic chứa đúng các Story thuộc phạm vi năng lực đó; không dùng Epic làm nơi chứa task không có parent Story.
- Mỗi Story cần có liên kết ngược tới Requirement ID và liên kết xuôi đến các task thực thi.

#### User Story

Tiêu đề giữ ID ổn định, ví dụ `US-AI-05 - Gửi tài liệu vào quy trình Review`. Mô tả tối thiểu gồm:

1. **User/value:** “Với vai trò ..., tôi muốn ..., để ...”.
2. **Requirement:** ID `REQ-*`, `REQ-BR-*`, `REQ-NFR-*` liên quan.
3. **Acceptance Criteria:** các AC đánh số, có Given/When/Then và kết quả quan sát/đo được.
4. **Business rules / edge cases:** phân quyền, trạng thái, validation, retry, lỗi và dữ liệu cần giữ/không được lộ.
5. **Dependencies / out of scope:** Story hoặc quyết định phụ thuộc, cùng nội dung không thuộc Story.
6. **Evidence links:** tài liệu nghiệp vụ, design/API contract và test case tương ứng.

**Definition of Ready (DoR):** Story có mục tiêu và người dùng rõ; Requirement/priority được xác định; AC đủ để Developer và QA thống nhất cách kiểm thử; dependency và câu hỏi mở đã ghi; estimate do nhóm thực hiện thống nhất; các link nguồn mở được. Story chưa đạt DoR không được coi là sẵn sàng kéo vào vòng phát triển.

#### Task

Mỗi Task có ID duy nhất trong tiêu đề, ví dụ `T-408 - Validate publish permission`, và đúng một quan hệ parent Story trong Taiga. Mô tả dùng cấu trúc:

```text
Parent Story: US-AI-xx
Requirements: REQ-..., REQ-BR-...
Purpose / output:
Scope:
Acceptance / verification:
Dependencies:
Owner:
Estimate:
Evidence links:
```

Task phải mô tả đầu ra cụ thể, không chỉ ghi tên vai trò như “Backend” hoặc “Testing”. Nếu một task bao phủ nhiều AC, nêu rõ AC nào; nếu một AC cần nhiều task, giữ liên kết tất cả task trong traceability. Estimate dùng thống nhất đơn vị giờ cho Task và story point cho Story; không quy đổi story point thành số giờ nếu nhóm chưa chốt quy tắc đó.

#### Trạng thái và vận hành

- Không thay trạng thái hàng loạt chỉ để phản ánh kế hoạch. Dùng đúng workflow status đã cấu hình trên project; trước khi báo cáo cần ghi lại cách ánh xạ status Taiga sang `New/Ready/In Progress/Review/QA/Done/Blocked/Deferred` nếu tên cột khác nhau.
- `Done` chỉ khi output đã tích hợp vào nhánh/release mục tiêu, AC liên quan đã được kiểm tra và có test/evidence. Nếu chỉ hoàn tất code nhưng còn chờ QA, không đánh dấu Done.
- `Blocked` cần ghi blocker, owner xử lý và điều kiện mở lại. Nếu workflow Taiga không có status Blocked, giữ status hiện tại và thêm label/ghi chú blocker theo quy ước nhóm; không tạo status tùy tiện.
- Hạng mục bị hoãn khỏi release phải có nhãn/phiên bản đích và lý do được nhóm thống nhất; không xóa khỏi backlog để làm mất dấu vết.
- Sau scope freeze, yêu cầu mới phải được triage và phê duyệt trước khi tạo Story/Task thuộc release.

#### Definition of Done (DoD) và kiểm tra chất lượng

Story/Task chỉ được tính hoàn tất khi:

- Đạt toàn bộ AC thuộc phạm vi của nó; test case có kết quả thực tế, không chỉ có kế hoạch.
- Code/tài liệu đã được tích hợp vào nhánh mục tiêu và liên kết được tới PR/commit thật.
- Không còn blocker hoặc lỗi nghiêm trọng chưa được xử lý/chấp nhận theo release gate.
- Traceability cập nhật từ Requirement -> Story/AC -> Task -> design/API -> PR/commit -> test -> release.
- Evidence và trạng thái Taiga nhất quán với repository; các ngoại lệ được ghi và có người duyệt.

Trước khi nộp, BA cần kiểm tra trực tiếp trên board: số Epic/Story/Task; mọi Story có Epic và Requirement; mọi Task có đúng một parent Story, owner và estimate; không có ID trùng hoặc orphan; trạng thái/owner phản ánh thực tế; link artifact mở được; và mọi Story/Task Done có evidence. Lưu URL board, thời điểm rà soát và kết quả kiểm tra trong báo cáo. Các con số `7 Epic / 12 Story / 77 Task`, phân công và trạng thái nêu ở trên chưa được xác nhận lại trên board trong lần cập nhật tài liệu này; danh sách ID ở repository hiện đang lệch một Task so với tổng số đã ghi.
