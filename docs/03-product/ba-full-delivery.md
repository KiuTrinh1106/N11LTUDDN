# Vai trò Product/Business Analyst trong Giai đoạn 3 - Full Delivery

Theo thông tin được cung cấp về học phần, Bài cuối chiếm **60%** điểm đánh giá. Vì vậy, phần việc của BA cần được trình bày bằng artifact và evidence kiểm chứng được, thay vì chỉ mô tả quy trình trên lý thuyết. Tỷ trọng chi tiết theo từng artifact cần đối chiếu với sheet `Output_BaoCao`; không tự phân bổ điểm khi chưa xem được rubric gốc.

## 1. Mục tiêu và trách nhiệm tổng thể

Trong Giai đoạn 3, Product/Business Analyst (BA) là người bảo vệ giá trị nghiệp vụ và tính nhất quán của sản phẩm từ yêu cầu đến bản release. BA không chỉ hoàn thiện tài liệu mà còn phối hợp với Product Owner/nhóm dự án, Developer và QA để bảo đảm:

- Nhóm triển khai đúng phạm vi đã thống nhất, ưu tiên luồng nghiệp vụ quan trọng và có thể bàn giao một bản chạy được trước hạn.
- Mỗi yêu cầu được diễn giải thành tiêu chí nghiệm thu có thể kiểm thử; quy tắc nghiệp vụ, phân quyền, trạng thái và các trường hợp lỗi được làm rõ trước khi nghiệm thu.
- Mọi hạng mục được tuyên bố `Done` có bằng chứng xuyên suốt từ requirement đến test và release; không dùng placeholder thay cho bằng chứng thực tế.
- Bản release phản ánh đúng hành vi đã kiểm thử, các lỗi còn tồn tại được công khai, và nội dung báo cáo/Viva truy vết được ngay tại repository hoặc hệ thống quản lý dự án.

BA điều phối và đưa ra khuyến nghị nghiệp vụ; các quyết định thay đổi phạm vi, ưu tiên hoặc tiêu chí release cần được nhóm có thẩm quyền thống nhất và ghi nhận. BA không tự xác nhận một tính năng là hoàn thành chỉ dựa trên tài liệu thiết kế hoặc lời mô tả của người thực hiện.

## 2. Phạm vi công việc và sản phẩm đầu ra

| Nhóm công việc | Trách nhiệm của BA | Sản phẩm/bằng chứng cần có |
| --- | --- | --- |
| Quản trị phạm vi | Rà soát Must/Should, phân loại Done/In Progress/Blocked/Deferred, kiểm soát yêu cầu phát sinh và đề xuất triage theo giá trị, rủi ro, phụ thuộc và thời gian còn lại. | Danh sách phạm vi release được nhóm xác nhận; quyết định thay đổi phạm vi được ghi trong backlog/decision log. |
| Quản trị backlog | Giữ liên kết giữa Requirement, User Story, Acceptance Criteria và Task; kiểm tra owner, trạng thái, estimate, phụ thuộc và điều kiện sẵn sàng. | Backlog Taiga được cập nhật; mỗi task có parent story và liên kết artifact/evidence phù hợp. |
| Làm rõ nghiệp vụ | Trả lời câu hỏi của Developer/QA, chốt luồng chuẩn, quy tắc phân quyền, trạng thái, validation, ngoại lệ và thông báo lỗi. | AC Given/When/Then, business rules, workflow và API/UI contract đồng nhất. |
| Đặc tả AI | Làm rõ nguồn được phép, quyền truy cập, citation, câu trả lời thiếu dữ liệu, lỗi dịch vụ và cách đánh giá chất lượng. | AI feature specification, bộ đánh giá và kết quả chạy có thể tái lập. |
| Truy vết | Duy trì ma trận truy vết và kiểm tra bằng chứng hai chiều cho phạm vi release. | Ma trận tại [TRACEABILITY.md](../TRACEABILITY.md), có ID và URL/SHA/test result thực tế. |
| UAT và lỗi | Xây dựng kịch bản UAT theo vai trò; kiểm thử trên build/demo release; ghi lỗi, triage, retest và regression. | Test result có ngày, build/commit, người chạy và evidence; bug log; QA report với blocker được xử lý rõ ràng. |
| Phát hành | Đối chiếu tính năng thực tế, kiểm thử, lỗi còn tồn tại và source code/tag; chuẩn bị nội dung release và hỗ trợ buổi Viva. | Release notes/changelog, checklist, URL demo, tag/commit và hồ sơ trình bày đã xác thực. |

## 3. Quản trị phạm vi và backlog

### 3.1. Scope freeze và triage

Trước khi bước vào giai đoạn code nước rút, BA cùng nhóm rà lại Requirements Inventory, PRD, quyết định đã duyệt và tình trạng triển khai. Mỗi hạng mục phải được phân loại rõ:

- **Must - release-critical:** cần thiết để hoàn thành giá trị cốt lõi hoặc điều kiện nghiệm thu; thiếu hạng mục này khiến luồng chính không dùng được hoặc có rủi ro nghiệp vụ/an toàn nghiêm trọng.
- **Should - quan trọng nhưng có thể triage:** mang lại giá trị rõ ràng nhưng có thể dời nếu rủi ro trễ hạn cao và nhóm thống nhất phương án.
- **Could / Future:** có giá trị bổ sung nhưng không cần để đạt mục tiêu release hiện tại.
- **Out of scope:** không triển khai trong release; không được đưa lén vào backlog đang thực hiện.

Ưu tiên xử lý theo thứ tự: luồng Must end-to-end và tính toàn vẹn dữ liệu/phân quyền; kiểm thử và sửa lỗi blocker; bằng chứng release; sau đó mới nhận Should/Could nếu còn năng lực. Trước khi loại hoặc hoãn một hạng mục, BA ghi rõ lý do, tác động, phụ thuộc, người phê duyệt và release/phiên bản dự kiến. Không tự chuyển Must thành Should chỉ để làm đẹp trạng thái hoàn thành.

Sau khi nhóm thống nhất **scope freeze**, yêu cầu mới phải qua triage thay vì được thêm trực tiếp vào sprint. BA ghi nhận yêu cầu, giá trị, effort, rủi ro, ảnh hưởng đến lịch và lựa chọn `accept`, `defer` hoặc `reject`; thay đổi được chấp thuận phải cập nhật đồng bộ Requirement, Story/AC, Taiga, traceability, test và release note liên quan.

### 3.2. Chuẩn hóa backlog Taiga

BA kiểm tra backlog Taiga theo các điều kiện sau:

1. Mỗi Story có Epic phù hợp, người dùng/mục tiêu nghiệp vụ, Requirement ID, AC kiểm thử được, estimate, phụ thuộc và điều kiện Definition of Ready.
2. Mỗi Task có đúng một parent Story, mô tả đầu ra, owner, estimate, trạng thái, phụ thuộc và link đến tài liệu/code/test có liên quan.
3. Trạng thái Taiga phản ánh tình hình thật. `Done` chỉ được đặt khi AC liên quan đã được kiểm tra, code đã được tích hợp vào nhánh/release mục tiêu và có evidence; tài liệu hoặc task “đã tạo” không đồng nghĩa tính năng đã xong.
4. Story/Task bị chặn phải nêu rõ blocker, người xử lý và điều kiện để mở lại; hạng mục bị hoãn phải được gắn nhãn hoặc chuyển phiên bản rõ ràng.
5. Cuối mỗi vòng rà soát, đối chiếu tổng hợp Taiga với ma trận truy vết và kết quả build/test để phát hiện task mồ côi, story không có task hoặc code không gắn với yêu cầu.

Áp dụng [quy ước chuẩn hóa backlog Taiga](task-assignment.md#quy-uoc-chuan-hoa-backlog) để thống nhất cấu trúc Epic/Story/Task, DoR/DoD, trạng thái và kiểm tra orphan. Taiga là nơi theo dõi thực thi backlog; tài liệu repository vẫn phải lưu đủ thông tin để giảng viên truy vết khi không có quyền truy cập project Taiga. Bảng [rà soát trạng thái theo bằng chứng repository](task-assignment.md#ra-soat-trang-thai-theo-bang-chung-repository-2026-10-16) hiện đánh giá ở cấp Epic; chưa đủ mapping để đổi trạng thái từng Task trên board. Vì vậy, báo cáo cần dùng URL Taiga thật hoặc cung cấp mã task và evidence thay thế có thể mở được, không chỉ ghi tên project.

## 4. Làm rõ nghiệp vụ và đồng bộ đặc tả kỹ thuật

### 4.1. Acceptance Criteria và edge cases

BA chuyển yêu cầu thành AC dạng Given/When/Then với tiền điều kiện, vai trò, hành động và kết quả quan sát được. AC phải bao gồm:

- Luồng thành công và kết quả dữ liệu/trạng thái sau thao tác.
- Từ chối do sai vai trò hoặc thiếu quyền; không để lộ nội dung hay metadata trái quyền.
- Validation, dữ liệu rỗng/không hợp lệ, trạng thái không cho phép thao tác và lỗi phụ thuộc dịch vụ.
- Thử lại thao tác, submit/publish trùng, xung đột cập nhật và đảm bảo không tạo record/version trùng.
- Audit: actor, đối tượng, thời gian, kết quả và lý do/nguồn cần ghi theo yêu cầu.

Khi Developer hoặc QA phát hiện một cách hiểu chưa được tài liệu quy định, BA ghi câu hỏi, đưa ra lựa chọn và tác động, sau đó xin quyết định của đúng người có thẩm quyền. Không giải quyết mơ hồ bằng cách để mỗi tầng (UI, API, test) tự hiểu khác nhau. Quyết định có ảnh hưởng scope hoặc business rule phải được cập nhật vào requirements, business workflow, decision log, API/UI contract và test case liên quan.

Đối với workflow tài liệu hiện tại, BA cần bảo đảm nhóm hiểu cùng một quy tắc: Author tạo/sửa Draft và gửi Review; Reviewer/Admin quyết định Approve hoặc Reject; Reject cần lý do; Approve chưa tạo version chính thức; chỉ Publish bản đã Approve mới tạo version tiếp theo và đặt làm current. Search và AI chỉ được dùng tài liệu hiện hành đã Publish, đồng thời vẫn phải áp dụng quyền xem của người gọi. Retry không được tạo review request hoặc version trùng.

### 4.2. Đặc tả và nghiệm thu tính năng AI

BA phối hợp với AI/Developer/QA để áp dụng [AI Feature Specification](../07-ai/ai-feature-spec.md) làm hợp đồng nghiệp vụ, đặc biệt:

- Chỉ truy xuất tài liệu nội bộ đã Publish, đang là version hiện hành và người gọi có quyền xem; lọc quyền trước khi xây dựng context, không chỉ ẩn citation sau khi sinh câu trả lời.
- Mỗi phát biểu sự kiện phải được nguồn trích dẫn hỗ trợ; citation phải xác định được document và version thật, hiện hành, người gọi được phép xem.
- Khi không có bằng chứng đủ dùng, trả đúng thông báo đã duyệt: “Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.” Không suy đoán và không tìm Internet.
- Phân biệt thiếu dữ liệu với lỗi hệ thống, timeout, lỗi quyền và input không hợp lệ; các lỗi vận hành không được biến thành câu trả lời thành công giả.
- Chạy bộ đánh giá tối thiểu 20 trường hợp; mục tiêu tối thiểu 16/20 câu đúng và có căn cứ. Ngưỡng này không thay thế hard gate: rò rỉ nguồn trái quyền bằng 0% và citation/source record bắt buộc phải hợp lệ.

BA không xem một bộ câu hỏi kỳ vọng hoặc response mẫu là kết quả kiểm thử. Cần lưu output thực tế, version/build được kiểm thử, cách chấm, kết quả từng case, lỗi phát hiện và kết luận đạt/không đạt.

## 5. Ma trận truy vết cuối kỳ - điều kiện 100%

Ma trận truy vết là bằng chứng trung tâm để chứng minh sản phẩm được xây dựng theo yêu cầu đã duyệt. BA chịu trách nhiệm duy trì ma trận chung tại [docs/TRACEABILITY.md](../TRACEABILITY.md), phối hợp với Developer và QA để điền bằng chứng chính xác.

### 5.1. Chuỗi truy vết bắt buộc

Với mỗi Requirement nằm trong phạm vi release, cần truy vết:

`REQ-xxx -> User Story / AC -> Taiga Task -> UI/Figma hoặc API Contract -> Git Commit/PR -> Test Case và kết quả -> Release v1.0.0-final`

Tùy loại yêu cầu, evidence UI/Figma có thể không áp dụng; khi đó ghi `N/A` kèm lý do và tham chiếu phù hợp, không để trống khiến người đọc không biết đã xem xét hay chưa. Tương tự, mỗi link phải mở được và dẫn đến đúng phiên bản nội dung, không phải placeholder.

### 5.2. Quy tắc hoàn tất và kiểm tra hai chiều

- **100%** được tính trên phạm vi đã tuyên bố `Done`/included in release, không phải trên toàn bộ backlog bất kể trạng thái. Tất cả Must đã cam kết trong release phải có trạng thái và kết luận minh bạch; hạng mục deferred/blocked không được trình bày như đã hoàn tất.
- Mỗi requirement Done phải có story/AC, task cụ thể, implementation evidence, test case với kết quả thực chạy và commit/PR chứa thay đổi.
- Mỗi Story Done phải truy ngược được tới requirement hoặc mục tiêu nghiệp vụ được duyệt; Story không có nguồn yêu cầu phải được giải thích, điều chỉnh hoặc loại khỏi phạm vi.
- Mỗi thay đổi code trong release phải liên kết ngược tới task/story/requirement và test; code không rõ nguồn gốc không được tính vào traceability pass.
- Dùng mã ID ổn định và URL/SHA chính xác. `TBD`, placeholder, tên nhánh hoặc mô tả chung không phải bằng chứng hoàn tất.
- Khi requirement chưa có test hoặc commit/PR, ghi thiếu evidence và chưa đánh dấu traceability hoàn tất.

Giảng viên có thể chọn ngẫu nhiên một requirement. BA cần trình diễn truy xuôi từ requirement đến story, task, design/API, commit, test, release và truy ngược từ test/commit về requirement. Người trình bày cần mở được từng bằng chứng ngay trong báo cáo hoặc hệ thống được phép truy cập.

### 5.3. Cột evidence khuyến nghị

| Cột | Nội dung cần ghi |
| --- | --- |
| Requirement | ID, mô tả ngắn, priority và trạng thái release |
| Story / AC | Story ID, số AC và link |
| Taiga Task | Task ID, parent story, owner, trạng thái và URL |
| Design / Contract | Figma screen/link nếu có; nếu không, API endpoint/contract hoặc `N/A` có lý do |
| Implementation | PR URL và commit SHA đã được tích hợp vào release |
| Verification | Test case ID, môi trường/build, ngày chạy, Pass/Fail/Blocked và link evidence |
| Release | Tag/commit release, URL demo nếu có và trạng thái triển khai |
| Gap / Sign-off | Thiếu sót, quyết định chấp nhận rủi ro, người duyệt và ngày |

## 6. UAT, bug triage và QA release gate

### 6.1. UAT trên bản build thực tế

BA lập UAT theo các mục tiêu và role trong PRD: Author tạo/sửa/gửi tài liệu; Reviewer/Admin xử lý Review và Publish; Reader tìm kiếm, mở tài liệu được phép và hỏi AI; quyền bị từ chối phải không làm lộ nội dung. UAT chạy trên URL demo hoặc build release xác định được, không chỉ trên mockup.

Mỗi lần chạy ghi: UAT ID, requirement/story/AC, tài khoản và role, URL/môi trường, build hoặc commit SHA, bước tái hiện, expected, actual, kết quả, người chạy, ngày giờ và ảnh/video/log evidence phù hợp. Không đưa mật khẩu hoặc secret vào báo cáo. Nếu chưa có URL deployment hoặc build xác định, đánh dấu UAT là chưa thực hiện; không suy diễn kết quả từ code review.

### 6.2. Bug log, severity và retest

Mỗi lỗi được ghi trong bug log với tối thiểu: Bug ID, title, severity, môi trường/build, điều kiện tiên quyết, steps to reproduce, expected, actual, evidence, requirement/AC liên quan, owner, trạng thái, commit fix và kết quả retest/regression.

BA phối hợp QA triage theo tác động nghiệp vụ và rủi ro:

- **Blocker/Critical:** luồng Must không dùng được, sai phân quyền/rò rỉ dữ liệu, hỏng/mất dữ liệu hoặc không thể phát hành an toàn. Không release khi còn blocker mở.
- **High:** ảnh hưởng nghiêm trọng tới chức năng Must hoặc nhiều người dùng; cần sửa hoặc có quyết định chấp nhận rủi ro minh bạch trước release.
- **Medium/Low:** tác động có giới hạn; ghi known issue, workaround và kế hoạch xử lý nếu được chấp thuận.

Sau khi Developer báo fix, QA/BA chạy lại đúng bước tái hiện và regression cho luồng liên quan. Chỉ đóng bug khi có kết quả retest và evidence; cập nhật trạng thái trong bug log và QA report. Release gate `Release Blockers = 0` chỉ được tuyên bố khi `docs/08-quality/QA_REPORT.md` có kết quả chạy, danh sách blocker và bằng chứng. Nếu file hoặc kết quả đó chưa tồn tại, gate vẫn chưa được chứng minh.

## 7. Release notes, changelog và xác nhận phát hành

Trước khi chốt release, BA đối chiếu implementation, traceability, test/QA report và Git tag để tổng kết:

- Tính năng thực sự được bàn giao và các requirement tương ứng.
- Lỗi đã sửa cùng Bug ID và commit/PR liên quan.
- Known issues còn mở, severity, tác động, workaround và quyết định chấp nhận.
- Các hạng mục không nằm trong release hoặc đã chuyển phiên bản.
- URL demo, hướng dẫn đăng nhập/role demo an toàn, version/tag, commit SHA và ngày phát hành.

`RELEASE.md`, `CHANGELOG.md` hoặc release notes phải khớp với nội dung của tag `v1.0.0-final`; không ghi một tính năng đã phát hành nếu không nằm trong commit được gắn tag và không có test evidence. Chỉ tạo/đẩy tag sau khi nhóm xác nhận build, kiểm thử, deployment và checklist. Mọi URL, SHA và kết quả cần là giá trị thật; không giữ placeholder trong hồ sơ nộp cuối.

## 8. Chuẩn bị Viva lần 2

BA chuẩn bị một kịch bản ngắn, có thể lặp lại trên đúng bản release:

1. Giới thiệu vấn đề nghiệp vụ, người dùng mục tiêu và giá trị sản phẩm.
2. Nêu phạm vi Must đã đóng băng, các hạng mục deferred và lý do triage.
3. Demo luồng Create -> Review -> Approve/Reject -> Publish -> version hiện hành; trình bày một trường hợp bị từ chối do role/state sai.
4. Demo Reader tìm kiếm/hỏi AI trong phạm vi được phép, citation và phản hồi thiếu dữ liệu; chứng minh tài liệu trái quyền không xuất hiện nếu test evidence có sẵn.
5. Nhận một Requirement bất kỳ và truy vết xuôi/ngược qua các mắt xích, mở link Taiga, contract/design, PR/commit, test result và release tag.
6. Trình bày kết quả UAT, tình trạng bug, Release Blockers, known issues và bằng chứng QA; phân biệt rõ đã kiểm thử với chưa kiểm thử.

Trước buổi Viva, kiểm tra URL, quyền truy cập, dữ liệu demo, tài khoản theo role, các bước reset/seed, links/QR hoặc tab trình duyệt cần mở và phương án dự phòng nếu mạng/demo lỗi. Không trình diễn dữ liệu nhạy cảm hoặc công bố credentials. Người trình bày cần nói rõ giới hạn hiện tại, không biến prototype, kế hoạch hoặc placeholder thành kết quả đã hoàn thành.

## 9. Căn cứ hiện có và các điểm phải xác nhận trước khi nộp

Nội dung vai trò BA này được đối chiếu với [PRD](PRD.md), [Requirements Inventory](../02-requirements/requirements.md), [User Stories](../04-backlog/user-stories.md), [Task Assignment và ghi nhận Taiga](task-assignment.md), [Business Workflow](business-workflow.md), [AI Feature Specification](../07-ai/ai-feature-spec.md), [Test Cases](../07-testing/test-cases.md), [Traceability Matrix](../TRACEABILITY.md), [Final Submission Guide](../08-release/final-submission-guide.md) và [Decision Log](../09-decisions/decisions-log.md).

Các tài liệu hiện tại còn nêu rõ một số evidence chưa hoàn tất: nhiều ô commit/PR và kết quả test trong traceability đang `TBD`; AI evaluation chưa có kết quả chạy được xác nhận; release guide ghi URL demo, PR/commit của từng thành viên và tag `v1.0.0-final` là các đầu việc cần cung cấp; `release-checklist.md` và `release-notes.md` hiện mới là tiêu đề; bug report hiện có không thay thế một bug log/QA report tổng hợp. Do đó, phần này là mô tả trách nhiệm và quy trình, không phải tuyên bố rằng các gate trên đã PASS.

Project Index hiện ghi vai trò BA/Product là Thơ trong khi [Task Assignment](task-assignment.md) ghi Trinh là BA. Nhóm cần xác nhận một owner/accountable BA thống nhất cho báo cáo cuối, hoặc mô tả đây là phân công theo giai đoạn/phạm vi; không nên để hai tài liệu nêu vai trò trái nhau.

Tệp môn học có sheet `Output_BaoCao` chưa có trong workspace tại thời điểm soạn. Vì vậy, nội dung này bám theo cấu trúc/rubric/Viva mà người dùng cung cấp cùng evidence repository hiện có; trước khi nộp cần đối chiếu lại tên artifact, trọng số và câu chữ chính xác trong workbook chính thức.
