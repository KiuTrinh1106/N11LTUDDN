# **US-AI-01 - Quản lý vai trò và quyền truy cập của người dùng**

**Với vai trò là Admin, tôi muốn quản lý vai trò và quyền truy cập của
người dùng, để người dùng chỉ có thể thực hiện các chức năng và truy cập
tài liệu trong phạm vi quyền được cấp.**

**Bối cảnh:\
**Bao phủ REQ-FR-01 và ASM-01. Hệ thống có tối thiểu 4 vai trò: Reader,
Author, Reviewer và Admin. Mô hình phân quyền cụ thể vẫn **TBD**.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Tài khoản người dùng đã tồn tại\
**Khi:** Admin gán một trong các vai trò Reader, Author, Reviewer hoặc
Admin\
**Thì:** Hệ thống gán vai trò được chọn cho người dùng.

**AC2\
Cho:** Người dùng đã được gán một vai trò\
**Khi:** Người dùng truy cập hệ thống\
**Thì:** Hệ thống áp dụng các quyền tương ứng với vai trò của người
dùng.

**AC3\
Cho:** Người dùng không có quyền thực hiện một chức năng\
**Khi:** Người dùng cố gắng thực hiện chức năng đó\
**Thì:** Hệ thống phải ngăn hành động này.

**AC4\
Cho:** Mô hình phân quyền cụ thể chưa được thống nhất\
**Khi:** Hệ thống triển khai cơ chế phân quyền\
**Thì:** Không được tự giả định sử dụng RBAC, ABAC hoặc mô hình kết hợp
nếu chưa được phê duyệt.

**Ngoài phạm vi:\
**Xác định mô hình RBAC/ABAC/kết hợp; quy tắc cấp và thu hồi quyền chi
tiết; tích hợp hệ thống đăng nhập bên ngoài.

**Phụ thuộc:\
**Quản lý tài khoản người dùng; quyết định về mô hình phân quyền;
REQ-FR-16.

**Ước lượng:** 3 điểm

# **US-AI-02 - Kiểm soát quyền truy cập tài liệu**

**Với vai trò là người dùng, tôi muốn quyền truy cập tài liệu được kiểm
soát theo quyền của mình, để tôi không thể xem hoặc truy cập các tài
liệu nằm ngoài phạm vi được cấp quyền.**

**Bối cảnh:\
**Bao phủ REQ-FR-04, REQ-FR-16 và REQ-BR-02. Quyền xem tài liệu là điều kiện
để người dùng có thể xem tài liệu và để tài liệu được sử dụng trong
Search, Citation hoặc Q&A.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Người dùng có quyền xem tài liệu\
**Khi:** Người dùng mở tài liệu\
**Thì:** Hệ thống hiển thị nội dung và metadata được phép xem.

**AC2\
Cho:** Người dùng không có quyền xem tài liệu\
**Khi:** Người dùng cố gắng mở tài liệu\
**Thì:** Hệ thống ngăn truy cập nội dung và metadata nhạy cảm của tài
liệu.

**AC3\
Cho:** Người dùng không có quyền xem tài liệu\
**Khi:** Hệ thống thực hiện Search hoặc AI Retrieval\
**Thì:** Tài liệu đó không được đưa vào kết quả truy xuất.

**AC4\
Cho:** Một tài liệu nằm ngoài quyền truy cập của người dùng\
**Khi:** AI tạo câu trả lời\
**Thì:** Tài liệu không được xuất hiện trong nguồn hoặc Citation của câu
trả lời.

**Ngoài phạm vi:\
**Xác định mô hình phân quyền cụ thể; chia sẻ tài liệu ra bên ngoài; tài
liệu công khai; tìm kiếm Internet.

**Phụ thuộc:\
**US-AI-01; quản lý tài liệu; Search; AI Retrieval.

**Ước lượng:** 3 điểm

# **US-AI-03 - Tạo và chỉnh sửa tài liệu**

**Với vai trò là Author, tôi muốn tạo và chỉnh sửa tài liệu, để tôi có
thể xây dựng và cập nhật tri thức cho Knowledge Base.**

**Bối cảnh:\
**Bao phủ REQ-FR-02 và REQ-FR-03. Một tài liệu gồm Name, Content,
Folder, Tag, Status và Initial Version.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Người dùng có vai trò Author\
**Khi:** Author tạo tài liệu với Name, Content, Folder và Tag\
**Thì:** Hệ thống tạo tài liệu với Status Draft và Initial Version.

**AC2\
Cho:** Author đang tạo tài liệu\
**Khi:** Thiếu thông tin bắt buộc\
**Thì:** Hệ thống không tạo tài liệu và hiển thị thông báo yêu cầu bổ
sung thông tin.

**AC3\
Cho:** Author có quyền chỉnh sửa tài liệu\
**Khi:** Author cập nhật nội dung hoặc metadata được phép\
**Thì:** Hệ thống lưu thông tin đã cập nhật.

**AC4\
Cho:** Người dùng có vai trò Reader\
**Khi:** Reader cố gắng chỉnh sửa tài liệu\
**Thì:** Hệ thống ngăn thao tác chỉnh sửa và giữ nguyên tài liệu.

**AC5\
Cho:** Tài liệu đã được tạo\
**Khi:** Author lưu tài liệu nhưng chưa gửi Review\
**Thì:** Tài liệu vẫn ở Status Draft.

**Ngoài phạm vi:\
**Gửi Review; Approve/Reject; Publish; AI Q&A; tự động gợi ý Tag.

**Phụ thuộc:\
**US-AI-01; quản lý Folder và Tag; mô hình dữ liệu Document.

**Ước lượng:** 3 điểm

# **US-AI-04 - Tổ chức tài liệu bằng Folder và Tag**

**Với vai trò là người dùng có quyền, tôi muốn tổ chức tài liệu bằng
Folder và Tag, để tài liệu được phân loại và dễ tìm kiếm hơn.**

**Bối cảnh:\
**Bao phủ REQ-FR-05. Người dùng có quyền có thể tổ chức tài liệu bằng
Folder và Tag, bao gồm thêm hoặc xóa Tag.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Người dùng có quyền tổ chức tài liệu\
**Khi:** Người dùng gán một Folder cho tài liệu\
**Thì:** Tài liệu được liên kết với Folder đó.

**AC2\
Cho:** Người dùng có quyền quản lý Tag\
**Khi:** Người dùng thêm Tag vào tài liệu\
**Thì:** Tag được liên kết với tài liệu.

**AC3\
Cho:** Tài liệu đang có một Tag\
**Khi:** Người dùng có quyền xóa Tag\
**Thì:** Tag được xóa khỏi tài liệu.

**AC4\
Cho:** Người dùng không có quyền tổ chức tài liệu\
**Khi:** Người dùng cố gắng thay đổi Folder hoặc Tag\
**Thì:** Hệ thống ngăn thay đổi.

**Ngoài phạm vi:\
**Tự động gợi ý Tag; gợi ý tài liệu liên quan; tìm kiếm nâng cao.

**Phụ thuộc:\
**US-AI-01; US-AI-03; quản lý Folder và Tag.

**Ước lượng:** 2 điểm

# **US-AI-05 - Gửi tài liệu vào quy trình Review**

**Với vai trò là Author, tôi muốn gửi một Version Draft vào quy trình
Review, để Reviewer có thể kiểm tra trước khi tài liệu được Publish.**

**Bối cảnh:\
**Bao phủ REQ-FR-06 và REQ-FR-07. Quy trình bắt buộc của hệ thống là:

**Create → Review → Publish → Version → Search/Ask**

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Author có một tài liệu đang ở Status Draft\
**Khi:** Author gửi Version vào Review\
**Thì:** Status của tài liệu chuyển sang Reviewing.

**AC2\
Cho:** Author gửi một Version vào Review\
**Khi:** Review Request được tạo\
**Thì:** Review Request được liên kết với Document, Version và người
gửi.

**AC3\
Cho:** Một Version đã có Review Request đang được xử lý\
**Khi:** Author cố gắng gửi lại cùng Version\
**Thì:** Hệ thống không tạo Review Request trùng lặp.

**AC4\
Cho:** Tài liệu chưa được gửi Review\
**Khi:** Author cố gắng Publish tài liệu\
**Thì:** Hệ thống không cho phép Publish.

**Ngoài phạm vi:\
**Reviewer Approve/Reject; Publish; triển khai Review Queue; so sánh
Version.

**Phụ thuộc:\
**US-AI-03; Review Request; Document Version.

**Ước lượng:** 2 điểm

# **US-AI-06 - Review và Approve hoặc Reject tài liệu**

**Với vai trò là Reviewer, tôi muốn Review tài liệu và Approve hoặc
Reject tài liệu, để chỉ những tài liệu đã được kiểm tra mới có thể tiếp
tục đến bước Publish.**

**Bối cảnh:\
**Bao phủ REQ-FR-08, REQ-FR-09 và hỗ trợ REQ-BR-01. Review Queue tối thiểu
phải hiển thị Document, Version, Sender và Status của Review Request.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Có các Review Request đã được gửi\
**Khi:** Reviewer mở Review Queue\
**Thì:** Hệ thống hiển thị Document, Version, Sender và Review Status.

**AC2\
Cho:** Một Review Request đang chờ xử lý\
**Khi:** Reviewer Approve Version\
**Thì:** Hệ thống lưu kết quả Approved, Reviewer thực hiện và thời gian
thực hiện.

**AC3\
Cho:** Một Review Request đang chờ xử lý\
**Khi:** Reviewer Reject Version\
**Thì:** Hệ thống lưu kết quả Rejected, Reviewer thực hiện và thời gian
thực hiện.

**AC4\
Cho:** Reviewer Reject một Version\
**Khi:** Kết quả Reject được ghi nhận\
**Thì:** Author có thể biết Version cần được chỉnh sửa trước khi gửi
Review lại.

**AC5\
Cho:** Review chưa hoàn tất\
**Khi:** Người dùng cố gắng Publish Version\
**Thì:** Hệ thống ngăn thao tác Publish.

**Ngoài phạm vi:\
**Chỉnh sửa tài liệu thay cho Author; Publish; xác định mô hình phân
quyền; quy trình phê duyệt bên ngoài hệ thống.

**Phụ thuộc:\
**US-AI-05; Review Queue; Audit Log; kiểm soát quyền truy cập.

**Ước lượng:** 3 điểm

# **US-AI-07 - Publish tài liệu đã được Approve**

**Với vai trò là người dùng có quyền, tôi muốn Publish một Version đã
được Approve, để Version đó trở thành Version chính thức của tài liệu.**

**Bối cảnh:\
**Bao phủ REQ-FR-10 và hỗ trợ REQ-BR-01, REQ-BR-05. Chỉ Version đã được Reviewer
Approve mới được phép Publish.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Version có kết quả Review là Approved\
**Khi:** Người dùng có quyền thực hiện Publish\
**Thì:** Status của tài liệu chuyển thành Published.

**AC2\
Cho:** Version chưa được Approve\
**Khi:** Người dùng cố gắng Publish Version\
**Thì:** Hệ thống ngăn thao tác Publish.

**AC3\
Cho:** Một tài liệu Published đang có một Current Version\
**Khi:** Một Version khác trở thành Current theo quy trình được xác
định\
**Thì:** Tài liệu chỉ có duy nhất một Current Version tại thời điểm đó.

**AC4\
Cho:** Một Version đã được Publish\
**Khi:** Người dùng xem tài liệu\
**Thì:** Hệ thống hiển thị rõ Status Published và Current Version.

**Ngoài phạm vi:\
**Xác định ai có quyền Publish nếu nhóm chưa thống nhất; tạo/chỉnh sửa
Version; quyết định Review; xếp hạng kết quả Search.

**Phụ thuộc:\
**US-AI-06; quản lý Version; kiểm soát quyền truy cập; Audit Log.

**Ước lượng:** 2 điểm

# **US-AI-08 - Tạo và quản lý Version tài liệu**

**Với vai trò là người dùng có quyền, tôi muốn hệ thống quản lý các
Version chính thức và Version hiện hành của tài liệu, để người dùng luôn
khai thác đúng nội dung đã được Publish và có thể truy vết lịch sử thay
đổi.**

**Bối cảnh:\
**Bao phủ REQ-FR-11, REQ-FR-17, REQ-BR-03 và REQ-BR-05. Draft bị Reject
được giữ để Author chỉnh sửa và gửi Review lại trên cùng Draft. Chỉ khi
Version được Approve và Publish thì hệ thống mới tạo Version chính thức
tiếp theo và đánh dấu Version đó là Version hiện hành.

**Tiêu chí chấp nhận:**

**AC1\
Cho:** Draft bị Reviewer hoặc Admin Reject\
**Khi:** Author chỉnh sửa Draft và gửi lại Review\
**Thì:** Hệ thống giữ nguyên Draft, không tạo thêm Version chính thức và
liên kết Review Request mới với đúng Draft đó.

**AC2\
Cho:** Draft đã được Reviewer hoặc Admin Approve nhưng chưa Publish\
**Khi:** Người dùng xem danh sách Version chính thức của tài liệu\
**Thì:** Hệ thống chưa tạo Version chính thức mới và chưa đánh dấu Draft
đó là Version hiện hành.

**AC3\
Cho:** Draft đã được Approve\
**Khi:** Reviewer hoặc Admin Publish Draft\
**Thì:** Hệ thống tạo Version chính thức tiếp theo, đánh dấu Version đó
là Version hiện hành và chuyển tài liệu sang Status Published.

**AC4\
Cho:** Tài liệu đã có một Version hiện hành\
**Khi:** Version chính thức mới được Publish\
**Thì:** Version mới trở thành Version hiện hành và tài liệu chỉ có duy
nhất một Version hiện hành; Version cũ được đánh dấu là không hiện hành.

**AC5\
Cho:** Tài liệu có các Version không hiện hành\
**Khi:** Tác vụ retention chạy lúc 02:00 theo múi giờ hệ thống\
**Thì:** Hệ thống xóa Version không hiện hành đã đủ 1 năm kể từ
`replaced_at` và không xóa Version hiện hành.

**AC6\
Cho:** Tài liệu có nhiều Version\
**Khi:** Admin, Reviewer hoặc Author xem lịch sử Version\
**Thì:** Hệ thống hiển thị Version, người tạo, thời điểm tạo và trạng
thái của từng Version; Reader chỉ được xem Version gần nhất.

**Ngoài phạm vi:\
**Tìm kiếm và Q&A trên Version; so sánh nội dung giữa các Version; chỉnh
sửa nội dung Draft; thay đổi quy tắc tăng Version hoặc thời hạn retention
đã được phê duyệt.

**Phụ thuộc:\
**US-AI-03; US-AI-05; US-AI-06; US-AI-07; kiểm soát quyền truy cập; mô
hình Document và Review Request.

**Ước lượng:** 3 điểm
