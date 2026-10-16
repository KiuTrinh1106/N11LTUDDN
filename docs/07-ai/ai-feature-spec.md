# Đặc tả tính năng AI - Hỏi đáp tri thức theo quyền truy cập

**Trạng thái:** Đặc tả nghiệp vụ và tiêu chí nghiệm thu. Endpoint hiện tại chỉ là bản mẫu ban đầu; việc chạy benchmark và một số tiêu chí nghiệm thu vẫn chưa được xác minh.

## Vấn đề nghiệp vụ và giá trị cho người dùng

Reader cần câu trả lời nhanh dựa trên tri thức nội bộ đã được phê duyệt, thay vì phải tự mở nhiều tài liệu. Câu trả lời phải có thể kiểm chứng, chỉ sử dụng nội dung mà người hỏi được phép xem và phải từ chối rõ ràng khi kho tri thức được phép truy cập không đủ căn cứ. Một câu trả lời nghe có vẻ hợp lý nhưng không có nguồn hỗ trợ được xem là thất bại, không phải phản hồi thành công.

**Người dùng chính:** Reader.
**Người dùng hỗ trợ:** Author xuất bản và duy trì nội dung nguồn; Reviewer/Admin phê duyệt nội dung; Admin hỗ trợ quản lý quyền và khả năng kiểm toán.

## Phạm vi

### Trong phạm vi

- Nhận câu hỏi dạng văn bản và tìm kiếm trong các phiên bản tài liệu nội bộ hiện hành đã được xuất bản.
- Áp dụng quyền `ASK_AI` của người hỏi và quyền `VIEW` trên tài liệu trước khi bất kỳ nguồn nào được đưa vào bước truy xuất, tạo câu trả lời, log hiển thị cho người dùng hoặc trích dẫn.
- Trả lời dựa trên các đoạn nội dung được truy xuất và hiển thị thông tin nhận diện nguồn đủ để mở và kiểm chứng nguồn đó.
- Lưu câu hỏi/kết quả và mã định danh nguồn để phục vụ kiểm toán, kiểm chứng hoạt động hỏi đáp.
- Từ chối câu hỏi không có nguồn hỗ trợ, không đoán và không tra cứu Internet.
- Đánh giá độ chính xác nghiệp vụ, mức độ bám sát nguồn, tính hợp lệ của trích dẫn và kiểm soát truy cập trên bộ ít nhất 20 trường hợp đã được phê duyệt.

### Ngoài phạm vi

- Tìm kiếm Internet, giọng nói, tự động phê duyệt tài liệu, đề xuất không có căn cứ và sử dụng tài liệu chưa được phê duyệt/không còn hiện hành làm nguồn trả lời.
- Xem một câu trả lời là đúng chỉ vì cách diễn đạt gần giống đáp án kỳ vọng trong khi nguồn được trích dẫn không hỗ trợ câu trả lời đó.

## Quy tắc nghiệp vụ

1. Người hỏi phải được xác thực và có quyền `ASK_AI`. Mọi tài liệu được truy xuất cũng phải đang hiển thị được với người hỏi đó.
2. Chỉ truy xuất các phiên bản hiện hành ở trạng thái `Published`. Các phiên bản `Draft`, `Reviewing`, `Approved` nhưng chưa xuất bản, `Rejected`, đã bị thay thế và người hỏi không được phép truy cập đều không đủ điều kiện.
3. Phải áp dụng kiểm soát truy cập trước khi xếp hạng kết quả/tạo ngữ cảnh; chỉ xóa trích dẫn sau khi tạo câu trả lời là không đủ.
4. Mọi câu trả lời chứa thông tin thực tế phải được nguồn được trích dẫn hỗ trợ. Trích dẫn phải trỏ đến tài liệu và phiên bản đang tồn tại, còn hiện hành và người hỏi có quyền xem tại thời điểm phản hồi.
5. Nếu không có nguồn được phép nào hỗ trợ câu trả lời, trả về phản hồi thiếu bằng chứng đã được phê duyệt và danh sách trích dẫn rỗng. Không suy diễn thông tin, tiết lộ sự tồn tại/tiêu đề của tài liệu bị hạn chế hoặc chuyển sang tra cứu Internet.
6. Nếu dịch vụ hoặc lớp truy xuất gặp lỗi, trả về trạng thái lỗi tường minh. Không biểu diễn lỗi hạ tầng như một câu trả lời thành công kiểu “không có dữ liệu”.
7. Lưu người thực hiện, định danh câu hỏi/yêu cầu, thời điểm, kết quả và ID tài liệu/phiên bản nguồn cho mọi yêu cầu hỏi đáp cần kiểm chứng. Không lưu bí mật hoặc dữ liệu cá nhân không liên quan trong kết quả đánh giá.
8. Ngưỡng benchmark là ít nhất 80% câu trả lời có căn cứ và chính xác (`>=16/20` đối với bộ 20 trường hợp ban đầu). Ngưỡng này không làm giảm các điều kiện an toàn bắt buộc: tỷ lệ rò rỉ nguồn trái phép phải là 0%, mọi trích dẫn/bản ghi nguồn bắt buộc phải hợp lệ và đầy đủ.

## Hợp đồng đầu vào và đầu ra

### Đầu vào

| Trường | Bắt buộc | Quy tắc |
| --- | --- | --- |
| `question` | Có | Văn bản UTF-8 không rỗng, tối đa 1.000 ký tự. Từ chối nội dung chỉ có khoảng trắng hoặc không thể dùng để tìm kiếm bằng lỗi kiểm tra dữ liệu. |
| Danh tính người gọi | Có | Lấy từ phiên đã xác thực; không chấp nhận user ID do người gọi tự cung cấp. |
| Ngữ cảnh quyền | Có | Phân giải phía máy chủ cho người gọi và áp dụng trước khi truy xuất. |

### Đầu ra bắt buộc của sản phẩm

```json
{
  "answer": "Câu trả lời dựa trên nguồn được phép, hoặc thông báo thiếu bằng chứng đã được phê duyệt.",
  "status": "ANSWERED",
  "citations": [
    {
      "documentId": "document-id",
      "versionId": "version-id",
      "title": "Tiêu đề tài liệu người gọi được phép xem",
      "versionNumber": "v1.0"
    }
  ]
}
```

Khi thiếu bằng chứng, `status` là `INSUFFICIENT_EVIDENCE` và `citations` là danh sách rỗng. Mỗi trích dẫn phải có mã định danh tài liệu và phiên bản ổn định; chỉ có nhãn hiển thị là không đủ cho kiểm toán hoặc truy vết. Với lỗi kiểm tra dữ liệu, lỗi phân quyền hoặc lỗi dịch vụ, sử dụng phản hồi lỗi tường minh theo quy ước của repository và mã HTTP phù hợp; không trả về câu trả lời rỗng có hình thức giống phản hồi thành công.

### Hiện trạng triển khai (không phải tiêu chí nghiệm thu)

Backend hiện cung cấp `POST /api/ai/ask` với `{ "question": "..." }`; phản hồi thành công có dạng `{ "answer": "...", "sources": [{ "id", "title", "version" }] }`. Phần triển khai dùng đối sánh từ khóa và đoạn trích, chưa chứng minh có quy trình tạo câu trả lời dựa trên mô hình và đánh giá. Cấu trúc phản hồi không có `versionId` hoặc trạng thái tường minh; route đã được rà soát cũng chưa chứng minh có bản ghi nguồn được lưu cho từng câu trả lời. Hãy xem đây là các khoảng trống so với REQ-FR-14 và REQ-NFR-04 cho đến khi triển khai và kiểm thử chứng minh được điều ngược lại.

Đồng thời, cần xác minh và khắc phục việc lọc quyền theo từng người gọi trước khi xem REQ-FR-15 là đã đáp ứng: giao diện liệt kê tài liệu đã xuất bản hiện không nhận danh tính người gọi, vì vậy riêng hợp đồng route chưa chứng minh được bảo đảm phân quyền đầu cuối.

## Hành vi dự phòng và xử lý lỗi

| Điều kiện | Hành vi bắt buộc |
| --- | --- |
| Không có nguồn hiện hành đã xuất bản phù hợp mà người hỏi được phép truy cập | Trả về `INSUFFICIENT_EVIDENCE`, thông báo “Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.” và không có trích dẫn. |
| Nội dung phù hợp không đủ hoặc còn mơ hồ | Không hoàn thiện câu trả lời bằng suy luận; trả về phản hồi thiếu bằng chứng hoặc chỉ trả lời một phần có giới hạn rõ ràng nếu mọi thông tin thực tế đều có trích dẫn hợp lệ. |
| Người gọi chưa được xác thực | Trả về `401`; không tìm kiếm hoặc tiết lộ liệu nguồn có tồn tại hay không. |
| Người gọi không có `ASK_AI` hoặc `VIEW` đối với nguồn tiềm năng | Áp dụng hành vi từ chối truy cập tiêu chuẩn; loại nguồn đó trước khi truy xuất và tuyệt đối không tiết lộ siêu dữ liệu của nguồn. |
| Câu hỏi không hợp lệ, rỗng hoặc vượt giới hạn | Trả về lỗi kiểm tra dữ liệu; không tạo câu trả lời giả dạng thành công. |
| Lớp truy xuất/mô hình/cơ sở dữ liệu không khả dụng hoặc hết thời gian chờ | Trả về lỗi dịch vụ có thể hoặc không thể thử lại tùy trường hợp; không chuyển lỗi vận hành thành “không tìm thấy tài liệu”. |
| Người dùng yêu cầu tìm kiếm Internet hoặc yêu cầu dữ liệu ẩn/bị hạn chế | Giải thích rằng chỉ có thể dùng nguồn nội bộ đã xuất bản mà người dùng được phép truy cập; không lấy hoặc trích dẫn thông tin bên ngoài/bị hạn chế. |

## Tiêu chí nghiệm thu tối thiểu

- Câu hỏi có căn cứ của Reader trả về câu trả lời dựa trên nguồn và trích dẫn phiên bản hiện hành đã xuất bản mà Reader được phép xem.
- Cùng câu hỏi đó, khi được gửi bởi người không có quyền xem nguồn, không được làm lộ nội dung, tiêu đề, đoạn trích, phần đóng góp vào câu trả lời hoặc trích dẫn của nguồn.
- Các phiên bản `Draft`, `Reviewing`, `Approved` nhưng chưa xuất bản, `Rejected` và đã bị thay thế không bao giờ được dùng làm bằng chứng hiện hành cho hỏi đáp.
- Câu hỏi không có bằng chứng trả về đúng hành vi thiếu bằng chứng đã nêu và không kích hoạt truy xuất bên ngoài.
- Mã định danh trong trích dẫn phân giải đến đúng tài liệu/phiên bản thực tế và người gọi vẫn có quyền truy cập.
- Có bản ghi yêu cầu cho mọi hoạt động hỏi đáp cần kiểm chứng, gồm người thực hiện, thời điểm, kết quả và ID nguồn.
- Benchmark đã phê duyệt đạt ít nhất 16/20 trường hợp đầu tiên chính xác và có căn cứ; các điều kiện bắt buộc về bảo mật và trích dẫn được đánh giá độc lập và đều phải đạt.

## Bộ đánh giá và cách chấm điểm

[Benchmark hỏi đáp Vault hiện có](../02-requirements/vault-qa-benchmark.md.md) gồm 20 câu hỏi/đáp án chuẩn (`Q1`–`Q20`). Dùng toàn bộ 20 trường hợp làm bộ đánh giá tối thiểu ban đầu. Đáp án chuẩn là câu trả lời kỳ vọng, không phải đầu ra thực tế của mô hình hoặc bằng chứng rằng một lần chạy đã đạt.

| Trường hợp | Phạm vi | Điều kiện đạt |
| --- | --- | --- |
| Q1, Q4–Q7, Q12–Q13, Q19 | Review, phê duyệt, xuất bản và vòng đời phiên bản | Quyết định và thời điểm trong vòng đời chính xác; không tạo phiên bản trước khi xuất bản; thông tin về phiên bản/lưu giữ khớp với quy tắc đã phê duyệt. |
| Q2–Q3, Q8, Q15–Q16 | Vai trò, quyền xem và nội dung bị hạn chế | Từ chối truy cập trái phép chính xác; không làm lộ nội dung hoặc siêu dữ liệu bị hạn chế trong câu trả lời hay nguồn. |
| Q9–Q10 | Hỏi đáp và truy vết nguồn | Nêu chính xác hỏi đáp có được hỗ trợ hay không và yêu cầu định danh nguồn tài liệu/phiên bản ổn định. |
| Q11, Q17 | Tìm kiếm theo quyền và tổ chức tài liệu | Khớp các yêu cầu tìm kiếm/Folder/Tag đã phê duyệt, không khẳng định có năng lực chưa được phê duyệt. |
| Q14, Q20 | Thiếu bằng chứng và giới hạn nguồn bên ngoài | Không đoán hoặc dùng Internet; trả về hành vi thiếu bằng chứng đã quy định. |
| Q18 | Khả năng kiểm toán | Chỉ nêu các hoạt động kiểm toán và trường dữ liệu bản ghi bắt buộc đã được phê duyệt. |

Với mỗi lần chạy, ghi lại: ID trường hợp, đầu vào chính xác, câu trả lời kỳ vọng và nguồn chuẩn, câu trả lời thực tế, ID trích dẫn thực tế, đạt/không đạt, nhóm lỗi, thời điểm chạy, mã/code hoặc commit, phiên bản mô hình và prompt nếu áp dụng, phiên bản bộ dữ liệu và người đánh giá. Báo cáo:

- **Độ chính xác có căn cứ** = số trường hợp trả lời chính xác **và** được trích dẫn hợp lệ hỗ trợ / tổng số trường hợp.
- **Tỷ lệ rò rỉ nguồn trái phép** = số trường hợp làm lộ nội dung hoặc siêu dữ liệu bị hạn chế / số trường hợp kiểm tra kiểm soát truy cập; bắt buộc bằng `0`.
- **Tính hợp lệ của trích dẫn** = số trích dẫn tài liệu/phiên bản hợp lệ và người gọi được phép xem / tổng số trích dẫn bắt buộc; bắt buộc đạt `100%`.
- **Tính đầy đủ của bản ghi nguồn** = số yêu cầu hỏi đáp có bản ghi nguồn bắt buộc đã lưu / tổng số yêu cầu cần kiểm chứng; bắt buộc đạt `100%`.

Không đánh dấu benchmark đạt cho đến khi đính kèm kết quả chạy có thể tái lập. Dữ liệu kiểm thử phải là dữ liệu tổng hợp hoặc được phê duyệt để dùng trong môn học; tuyệt đối không đưa bí mật hoặc tài liệu nhạy cảm thực tế vào benchmark.

## Truy vết và các quyết định còn mở

- Yêu cầu: REQ-FR-04, REQ-FR-13–REQ-FR-15, REQ-FR-16, REQ-NFR-02–REQ-NFR-04, REQ-BR-02, REQ-BR-04, REQ-ASM-02.
- Backlog: [US-AI-02, US-AI-09, US-AI-10, US-AI-11 và US-AI-12](../04-backlog/user-stories.md).
- Workflow và điều kiện hợp lệ của phiên bản: [business-workflow.md](../03-product/business-workflow.md).
- Hiện trạng API: [api-contract.md](../06-technical/api-contract.md).
- Ma trận đầu-cuối chuẩn: [TRACEABILITY.md](../TRACEABILITY.md).

Trước khi phê duyệt chính thức, nhóm Product/BA phải thống nhất: (1) cách cấp/thu hồi quyền ở cấp tài liệu và mối liên hệ với quyền theo vai trò, (2) những yêu cầu hỏi đáp nào thuộc diện “cần kiểm chứng”, nếu có ngoại lệ với quy tắc lưu trữ 100%, và (3) người đánh giá cùng mức sai khác câu trả lời có thể chấp nhận khi chấm điểm ngữ nghĩa. Cho đến khi các điểm này được giải quyết, áp dụng các quy tắc nghiêm ngặt hơn về quyền riêng tư và lưu nguồn trong đặc tả này.
