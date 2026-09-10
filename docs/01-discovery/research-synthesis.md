# Research Synthesis

## Mục đích

> Tài liệu này tổng hợp các pain points và themes nổi bật từ `research-notes.md`. Nội dung tập trung vào vấn đề lặp lại, nguyên nhân và tác động đến người dùng, không chép lại toàn bộ transcript hoặc mô tả từng cuộc trao đổi.

## Tổng quan insight

Người dùng đang phải làm việc với tài liệu qua nhiều nguồn và nhiều kênh rời rạc. Điều này khiến họ khó tìm đúng tài liệu, khó biết đâu là phiên bản mới nhất và khó theo dõi tài liệu đang ở bước nào trong quy trình Create - Review - Publish - Version. Vấn đề xuất hiện ở cả người khai thác thông tin, người biên soạn và người kiểm duyệt, nhưng biểu hiện khác nhau theo vai trò.

## Themes chính

### Theme 1: Thông tin phân tán, khó tìm và khó đối chiếu

**Pain points**

- Tài liệu nằm ở nhiều phòng ban hoặc nhiều nguồn khác nhau nên người dùng không biết nên tìm ở đâu.
- Có trường hợp người dùng cần tài liệu nhưng không tìm thấy.
- Người dùng phải kiểm tra, đối chiếu thông tin thủ công từ nhiều nguồn trước khi có thể sử dụng.

**Tác động**

Việc tìm kiếm trở nên tốn thời gian và thiếu chắc chắn. Người dùng có nguy cơ bỏ sót tài liệu hoặc sử dụng thông tin chưa được kiểm chứng.

**Bằng chứng**

- Nhân viên kho được phỏng vấn cho biết đôi khi phải tìm tài liệu từ nhiều phòng ban và không tìm thấy tài liệu cần thiết.
- Sinh viên được phỏng vấn thường phải tra cứu đồng thời Google, GitHub, Zalo, ChatGPT và Gemini để tìm tài liệu học tập.

**Hàm ý**

Hệ thống cần tạo một điểm truy cập tập trung để tìm kiếm và khai thác tài liệu. Khả năng hiển thị nguồn giúp người dùng kiểm tra lại thông tin thay vì phải tự lần theo nhiều kênh.

### Theme 2: Quy trình Review phụ thuộc vào kênh thủ công

**Pain points**

- Phản hồi Review bị phân tán qua email.
- Người biên soạn khó biết tài liệu đang ở trạng thái nào và còn chờ ai xử lý.
- Người kiểm duyệt khó theo dõi danh sách tài liệu đang chờ Review và các công việc còn lại.

**Tác động**

Các bên phải tự tổng hợp thông tin từ email và spreadsheet. Khi số lượng tài liệu tăng, việc bỏ sót yêu cầu, chậm phản hồi hoặc xử lý sai thứ tự trở nên dễ xảy ra hơn.

**Bằng chứng**

- Case study Intelligex ghi nhận doanh nghiệp khoảng 85 nhân viên có khoảng 45 tài liệu mỗi tháng cần Review; quy trình cũ dùng email và Google Sheets.
- Case study Mobyte mô tả tổ chức gặp khó khăn khi theo dõi người phụ trách, trạng thái Review và các công việc còn lại do phụ thuộc vào email và spreadsheet.

**Hàm ý**

Review nên được quản lý trong một quy trình tập trung, có danh sách chờ, người phụ trách, trạng thái và hành động Approve/Reject rõ ràng.

### Theme 3: Thiếu khả năng truy vết phiên bản và lịch sử quyết định

**Pain points**

- Author khó xác định phiên bản mới nhất của tài liệu.
- Author và Reviewer khó kiểm soát phiên bản đang được chỉnh sửa hoặc phê duyệt.
- Lịch sử thay đổi và lịch sử phê duyệt không được theo dõi rõ ràng.

**Tác động**

Người dùng có thể review hoặc sử dụng nhầm phiên bản. Khi cần giải thích một thay đổi hay quyết định phê duyệt, họ cũng khó truy lại bối cảnh và trách nhiệm liên quan.

**Bằng chứng**

- Case study Intelligex nêu khó khăn trong quản lý phiên bản và trạng thái Review.
- Case study Mobyte nêu khó khăn trong kiểm soát phiên bản và lịch sử phê duyệt.

**Hàm ý**

Mỗi tài liệu cần có phiên bản hiện hành dễ nhận biết, lịch sử thay đổi và lịch sử Review/Approval có thể truy xuất. Trạng thái tài liệu cũng cần gắn với quy trình rõ ràng, chẳng hạn Draft, Reviewing và Published.

## So sánh theo vai trò

| Vai trò  | Nhu cầu cốt lõi                             | Pain point nổi bật                                     | Hệ quả                                        |
| -------- | ------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Reader   | Tìm và kiểm tra thông tin được phép sử dụng | Tài liệu phân tán, khó tìm, phải đối chiếu nhiều nguồn | Mất thời gian và thiếu chắc chắn về thông tin |
| Author   | Tạo, cập nhật và đưa tài liệu qua Review    | Khó quản lý phiên bản, phản hồi và trạng thái          | Dễ nhầm phiên bản, khó biết bước tiếp theo    |
| Reviewer | Kiểm tra và phê duyệt đúng tài liệu         | Khó theo dõi Review queue, người phụ trách và lịch sử  | Dễ chậm xử lý hoặc bỏ sót tài liệu            |

## Các vấn đề liên kết với nhau

Ba themes không độc lập. Việc lưu trữ và trao đổi tài liệu ở nhiều nguồn làm tăng số lượng kênh cần theo dõi. Khi Review diễn ra qua email và spreadsheet, phản hồi không còn gắn chặt với một tài liệu và một phiên bản cụ thể. Vì vậy, khó khăn trong tìm kiếm, quản lý quy trình và truy vết phiên bản tiếp tục củng cố lẫn nhau.

Có thể tóm tắt chuỗi vấn đề như sau:

```text
Nhiều nguồn lưu trữ
	-> khó tìm và khó đối chiếu
	-> trao đổi qua email/spreadsheet
	-> khó biết trạng thái và người phụ trách
	-> dễ nhầm phiên bản, khó truy lại lịch sử
```

## Ưu tiên xử lý từ discovery

1. **Tập trung hóa việc tìm kiếm và khai thác tài liệu:** giải quyết pain point xuất hiện trực tiếp ở Reader.
2. **Tập trung hóa quy trình Review:** cung cấp Review queue, trạng thái và người phụ trách để giảm phụ thuộc vào email/spreadsheet.
3. **Bảo đảm khả năng truy vết:** hiển thị phiên bản hiện hành, lịch sử thay đổi và lịch sử phê duyệt để các vai trò làm việc trên cùng một nguồn sự thật.

Đây là ưu tiên dựa trên các bằng chứng hiện có trong research notes. Cần nghiên cứu thêm với người dùng nội bộ để định lượng mức độ ảnh hưởng, tần suất xảy ra và xác nhận pain point về quyền truy cập trước khi xem đó là một pain point đã được kiểm chứng.

## Kết luận

Discovery cho thấy vấn đề trung tâm không chỉ là “khó tìm tài liệu”, mà là thiếu một hệ thống thống nhất để tìm, cập nhật, Review và xác định lịch sử của tài liệu. Một giải pháp phù hợp cần giúp người dùng làm việc trên cùng tài liệu, đúng phiên bản, đúng trạng thái và có thể kiểm tra lại nguồn gốc của thông tin.
