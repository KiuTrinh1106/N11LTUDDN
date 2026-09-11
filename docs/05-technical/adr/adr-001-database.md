# ADR-001 - Chọn PostgreSQL làm hệ quản trị cơ sở dữ liệu

Status: Accepted

Context:
AI Document & Knowledge Management System cần lưu trữ dữ liệu có quan hệ chặt chẽ giữa User, Document, DocumentDraft, ReviewRequest, DocumentVersion, quyền truy cập, AI source và AuditEvent. Các luồng `Create -> Review -> Publish -> Version -> Search/Ask` yêu cầu kiểm soát chuyển trạng thái, liên kết khóa ngoại, chỉ một version hiện hành và ghi audit đầy đủ. Publish phải tạo version chính thức và cập nhật current version trong cùng một giao dịch; dữ liệu snapshot của version đã Publish phải bất biến.

Decision:
Chọn PostgreSQL làm hệ quản trị cơ sở dữ liệu chính cho Operational Database và các dữ liệu nghiệp vụ chuẩn của hệ thống. Sử dụng schema quan hệ với primary key, foreign key, unique constraint, check constraint, transaction và index phù hợp cho permission-aware retrieval. PostgreSQL là source-of-truth cho quyền truy cập, trạng thái tài liệu, Review, version hiện hành, source record và AuditEvent; Search Index nếu có chỉ là lớp tối ưu truy vấn, không thay thế dữ liệu chuẩn.

Consequences:

- Hỗ trợ ACID transaction để thực hiện atomic việc Publish, tạo DocumentVersion, thay thế current version và cập nhật Document.
- Foreign key, unique constraint và check constraint giúp bảo vệ toàn vẹn dữ liệu ở tầng cơ sở dữ liệu, không phụ thuộc hoàn toàn vào Backend.
- Phù hợp với mô hình quan hệ của User, Document, ReviewRequest, Version, Permission và AuditEvent; thuận lợi cho truy vết và báo cáo.
- Hỗ trợ append-only AuditEvent, index và transaction isolation để kiểm soát concurrency trong các thao tác Review/Publish.

* Cần thiết kế migration, index và transaction boundary cẩn thận; schema thay đổi phải được version hóa.
* Cấu trúc quan hệ có thể cần thêm thiết kế index hoặc Search Index riêng khi nhu cầu tìm kiếm nội dung tăng.
* Cần vận hành backup, restore, connection pool và kiểm tra phục hồi để đáp ứng yêu cầu không mất dữ liệu.

Rejected alternative:
MongoDB bị từ chối vì mô hình document linh hoạt không đem lại lợi thế đủ lớn cho các quan hệ và ràng buộc chặt giữa Document, Draft, ReviewRequest, Version, Permission và AuditEvent; các invariant như một current version và liên kết khóa ngoại sẽ phải bảo vệ chủ yếu ở application layer. MySQL cũng không được chọn vì nhóm cần chuẩn hóa một nền tảng PostgreSQL cho các constraint, transaction và thiết kế dữ liệu quan hệ của MVP; việc dùng MySQL không tạo lợi ích cần thiết để bù chi phí phân nhánh tooling và vận hành.
