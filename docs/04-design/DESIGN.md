# DESIGN Handoff - AI Document & Knowledge Management System

## 0. Phạm vi và nguyên tắc triển khai

Tài liệu này chuyển giao các quy tắc từ Design System sang Frontend Developer và QA cho MVP của AI Document & Knowledge Management System. Phạm vi giao diện được xác định từ các flow `Create -> Review -> Publish -> Version -> Search/Ask`, gồm bốn role tối thiểu: `Reader`, `Author`, `Reviewer` và `Admin`.

Tài liệu chỉ đặc tả những hành vi đã có trong Requirements, User Stories và prototype findings. `VoiceControl` chưa thuộc flow MVP đã được nghiệm thu; nếu xuất hiện trong Figma, phải coi là proposed và không được triển khai thay cho text flow khi chưa có quyết định chính thức.

### Quy ước kiểm chứng chung

- Mỗi trạng thái bất đồng bộ phải có UI state, accessible state và trạng thái kết thúc rõ ràng; không dùng spinner vô hạn.
- Mọi hành động thay đổi dữ liệu hoặc trạng thái nghiệp vụ phải chống submit lặp và giữ dữ liệu người dùng khi request lỗi.
- Permission-aware retrieval áp dụng ở UI và API: không hiển thị tài liệu, metadata, citation hoặc nội dung ngoài quyền.
- Trạng thái nghiệp vụ `Draft`, `Reviewing`, `Approved`, `Rejected`, `Published` phải được hiển thị bằng text, không chỉ bằng màu.

## 1. DESIGN TOKENS MAPPING

### 1.1 CSS Custom Properties

Các giá trị dưới đây lấy từ `foundation.md` và quy ước trạng thái trong `states.md`. Typography và breakpoint chưa có giá trị được phê duyệt trong tài liệu nền; không tự gán font family hoặc font size cố định trong code trước khi Figma được chốt.

```css
:root {
  /* Color tokens from foundation.md */
  --color-primary: #205b8e;
  --color-success: #2f6b4f;
  --color-warning: #9a5b00;
  --color-danger: #9b2c2c;

  /* Semantic aliases */
  --color-interactive-default: var(--color-primary);
  --color-interactive-hover: #17466d;
  --color-focus-ring: #205b8e;
  --color-feedback-success: var(--color-success);
  --color-feedback-warning: var(--color-warning);
  --color-feedback-error: var(--color-danger);
  --color-disabled: #6b7280;

  /* Layout tokens from foundation.md */
  --radius-md: 12px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Interaction and overlay tokens; exact values require Figma confirmation */
  --focus-ring-width: 3px;
  --focus-ring-offset: 2px;
  --shadow-overlay: 0 8px 24px rgb(17 24 39 / 18%);
}
```

### 1.2 Mapping và điều kiện nghiệm thu token

| Nhóm             | Token sử dụng                                                     | Quy tắc implementation                                                                                       | Cách QA kiểm tra                                                                         |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Primary action   | `--color-primary`, `--color-interactive-default`                  | Dùng cho action chính như `Lưu`, `Gửi Review`, `Search`, `Ask AI`; không dùng cho trạng thái thành công.     | Kiểm tra cùng một action có cùng màu trên Create, Review và Search.                      |
| Success          | `--color-success`, `--color-feedback-success`                     | Dùng cho `Approved`, `Published` và thông báo thao tác hoàn tất; luôn có text/icon đi kèm.                   | Kiểm tra người dùng phân biệt được success khi xem không có màu hoặc dùng screen reader. |
| Warning          | `--color-warning`, `--color-feedback-warning`                     | Dùng cho confirmation, hành động destructive và trạng thái chờ; không dùng để chỉ lỗi hệ thống.              | Kiểm tra confirmation nêu rõ hậu quả và có thể hủy.                                      |
| Error            | `--color-danger`, `--color-feedback-error`                        | Dùng cho validation, request failure, `Rejected` và `Permission denied`; luôn có thông điệp recovery nếu có. | Kiểm tra lỗi được liên kết với control và có hành động `Retry`/sửa dữ liệu phù hợp.      |
| Focus            | `--color-focus-ring`, `--focus-ring-width`, `--focus-ring-offset` | Mọi button, input, link, combobox, citation và dialog control phải có focus visible.                         | Duyệt toàn bộ flow bằng keyboard; không có focus bị mất hoặc bị cắt.                     |
| Spacing          | `--space-1` đến `--space-8`                                       | Dùng bội số 4px; giữ kích thước component ổn định giữa default, loading và error.                            | So sánh screenshot ở các state, không có layout shift khi đổi label/state.               |
| Radius / overlay | `--radius-md`, `--shadow-overlay`                                 | Dùng cho card, input, dialog và popover theo foundation; không dùng shadow thay cho focus.                   | Kiểm tra dialog/combobox nổi trên nội dung và không che mất focus.                       |

### 1.3 Token chưa được chốt

`font family`, scale typography, line-height, z-index, màu surface/background, contrast ratio mục tiêu và breakpoint chính thức chưa được định nghĩa trong `foundation.md`. Developer không được tự tạo token public mới; các giá trị này cần được cập nhật sau khi người phụ trách Design xác nhận Figma.

## 2. COMPONENT SPEC & STATES

### 2.1 Button

| State      | Thể hiện trực quan và hành vi                                   | A11y / QA assertion                                                                |
| ---------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `default`  | Hiển thị label hành động rõ ràng; kích thước giữ ổn định.       | Dùng phần tử native `<button>`; label không mơ hồ.                                 |
| `hover`    | Dùng `--color-interactive-hover`; không đổi kích thước.         | Hover không phải cơ chế duy nhất để hiểu trạng thái.                               |
| `focus`    | Hiển thị focus ring bằng `--color-focus-ring`.                  | Có thể reach bằng `Tab`; focus ring không bị `overflow: hidden` cắt.               |
| `disabled` | Dùng `--color-disabled`; không nhận click/keyboard.             | Nếu bị chặn do quyền, hiển thị lý do ở context phù hợp; không chỉ dựa vào opacity. |
| `loading`  | Hiển thị spinner/text loading; khóa submit lặp nhưng giữ width. | Gắn `aria-busy="true"` ở vùng phù hợp; không tạo request trùng.                    |
| `error`    | Giữ button hoặc chuyển sang action `Retry`, kèm error message.  | Error liên kết bằng `aria-describedby` khi lỗi thuộc form/action.                  |

Các label bắt buộc phải phản ánh đúng quyền: Author không được thấy hoặc thực hiện `Approve`/`Publish`; Reviewer/Admin chỉ `Publish` khi bản đã `Approved`.

### 2.2 Input, Search Bar và AI Question Form

| State                           | Thể hiện trực quan và hành vi                                                                 | A11y / QA assertion                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `empty / filled`                | Label luôn hiển thị; filled giữ nguyên nội dung sau các request lỗi.                          | `<label>` liên kết với `id`; placeholder không thay thế label.                           |
| `hover / focus`                 | Border/focus ring thay đổi, không làm xê dịch layout.                                         | Có thể nhập và submit bằng keyboard; focus visible.                                      |
| `disabled / read-only`          | Disabled không nhận thao tác; read-only vẫn cho phép select/copy nếu phù hợp.                 | Không dùng disabled cho dữ liệu chỉ đọc nếu `readonly` đúng semantics hơn.               |
| `validation error`              | Error text đặt gần field, không chỉ đổi border.                                               | Dùng `aria-invalid="true"` và `aria-describedby`; focus về lỗi đầu tiên khi submit form. |
| `loading`                       | Search/AI Question giữ query hoặc question, chống submit lặp.                                 | Vùng kết quả/câu trả lời có `aria-busy`; query không bị xóa.                             |
| `no result / insufficient data` | Search hiển thị `Không tìm thấy kết quả phù hợp`; Q&A hiển thị thông báo thiếu dữ liệu chuẩn. | Không tiết lộ sự tồn tại của tài liệu ngoài quyền; không suy đoán hoặc dùng Internet.    |
| `request error`                 | Hiển thị lỗi kỹ thuật và `Retry`; giữ input.                                                  | Error có thể đọc được; retry không làm mất query/question.                               |

### 2.3 Textarea / Editor

| State             | Thể hiện trực quan và hành vi                               | A11y / QA assertion                                                                |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Draft / editing` | Cho Author nhập Name, Content, Folder và Tag; action `Lưu`. | Mỗi field có label; required field báo rõ trước khi tạo Draft.                     |
| `saving`          | Hiển thị trạng thái đang lưu, chống lưu lặp.                | `aria-busy`; không mất nội dung nếu request chậm.                                  |
| `read-only`       | Reader xem được nội dung nhưng không có action chỉnh sửa.   | Semantics đọc được; kiểm tra Reader không thể edit bằng UI hoặc request trực tiếp. |
| `error`           | Giữ nội dung; chỉ rõ field/request lỗi và cho retry.        | Error message liên kết đúng field hoặc vùng editor.                                |

### 2.4 Status Badge và Document Card / Row

| State                          | Thể hiện trực quan và hành vi                                                            | A11y / QA assertion                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Draft`                        | Hiển thị text `Draft`; chưa phải version chính thức.                                     | Không cho hiểu nhầm là current version.                        |
| `Reviewing / Pending Review`   | Hiển thị text trạng thái Review; xuất hiện trong Review queue.                           | `Pending Review` chỉ là nhãn UI của nghiệp vụ `Reviewing`.     |
| `Approved`                     | Hiển thị `Approved`; Reviewer/Admin có thể thấy `Publish`.                               | `Approved` chưa tạo version chính thức.                        |
| `Rejected`                     | Hiển thị `Rejected`, lý do nếu có quyền; Author có thể sửa cùng Draft.                   | Không tạo version chính thức mới khi Reject.                   |
| `Published / current version`  | Hiển thị rõ version hiện hành; version này được dùng cho Search/Q&A.                     | Chỉ có duy nhất một current version.                           |
| `superseded`                   | Phân biệt version cũ không còn hiện hành.                                                | Không dùng version này làm nguồn Search/Q&A hiện hành.         |
| `loading / empty / restricted` | Skeleton khi tải; empty khi không có item; restricted không render metadata ngoài quyền. | Không để card restricted làm lộ title, metadata hoặc citation. |

### 2.5 Modal / Confirmation Dialog và Toast / Alert

| Component/state                 | Thể hiện trực quan và hành vi                                                     | A11y / QA assertion                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Dialog `opening / confirmation` | Dùng cho `Gửi Review`, `Approve`, `Reject`, `Publish`; có action xác nhận và hủy. | Dùng `role="dialog"` và accessible name; focus trap; `Escape` đóng nếu không phải thao tác bắt buộc; focus trả về trigger. |
| Dialog `submitting`             | Khóa action lặp, hiển thị processing.                                             | Không cho thao tác nền; `aria-busy`; không đóng mất dữ liệu khi request đang chạy.                                         |
| Dialog `success / error`        | Hiển thị kết quả và next action rõ ràng.                                          | Error có retry/sửa; success không phụ thuộc màu.                                                                           |
| Alert `info / success`          | Thông báo lưu Draft, gửi Review hoặc Publish thành công.                          | Dùng `role="status"` cho thông tin không khẩn cấp.                                                                         |
| Alert `warning / error`         | Cảnh báo quyền, validation hoặc request failure.                                  | Dùng `role="alert"` khi cần chú ý ngay; text nêu hành động recovery.                                                       |

### 2.6 Search Results, Review Queue, Citation và VoiceControl

| Component               | States bắt buộc                                                               | Hành vi / A11y kiểm chứng                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Search Results          | `loading`, `results`, `no result`, `error`, `permission denied`               | Chỉ trả về tài liệu Reader được phép; `no result` không tiết lộ tài liệu bị hạn chế; item mở đúng Document Detail.                      |
| Review Queue            | `loading`, `empty`, `Reviewing`, `Approved`, `Rejected`, `permission denied`  | Item có document, version, sender và status; Approve/Reject cần confirmation; lưu người xử lý và thời điểm.                             |
| Citation                | `inline`, `expanded`, `unavailable`, `invalidated`                            | Có document ID/version ID hoặc định danh tương đương; chỉ mở nguồn được phép; không hiển thị citation ngoài quyền.                      |
| VoiceControl (proposed) | `idle`, `listening`, `transcribing`, `permission denied`, `error`, `disabled` | Chỉ triển khai sau khi chốt scope; luôn có text input thay thế; transcript phải chỉnh sửa được trước submit; không tự gửi ngoài ý muốn. |

### 2.7 Tiêu chí A11y tối thiểu

- Tất cả thao tác chính phải dùng được bằng keyboard; thứ tự `Tab` đi theo thứ tự đọc và không mắc trong loading state.
- Focus state phải nhìn thấy; không được xóa outline mà không cung cấp focus indicator tương đương.
- Text, icon và màu trạng thái phải đạt tiêu chí tương phản theo WCAG áp dụng cho cỡ chữ và vai trò hiển thị; giá trị màu cuối cùng cần kiểm tra bằng công cụ contrast sau khi Figma chốt surface/background.
- Form field có label; lỗi có `aria-invalid`/`aria-describedby`; vùng tải có `aria-busy`; toast dùng `role="status"` hoặc `role="alert"` đúng mức độ.
- Dialog quản lý focus khi mở/đóng, có accessible name và không cho thao tác nội dung nền.

## 3. FIGMA TO STORY MAPPING

Tên dưới đây là quy ước đặt tên Figma cần dùng để Developer và QA tìm cùng một frame/component. Đây không phải khẳng định rằng các frame đã tồn tại; khi bàn giao Figma, tên thực tế phải khớp bảng.

| Story ID                              | Tên Story                                    | Figma Frame/Component Name                                                              | Ghi chú/Mô tả hành vi chuyển trang                                                                                                                                                                                                          |
| ------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-AI-01                              | Quản lý vai trò và quyền truy cập người dùng | `Permission / Role Gate`                                                                | Áp dụng role Reader, Author, Reviewer, Admin; action ngoài quyền phải bị chặn. Mô hình RBAC/ABAC cụ thể vẫn TBD.                                                                                                                            |
| US-AI-02                              | Kiểm soát quyền truy cập tài liệu            | `Document Detail / Permission States`                                                   | Có quyền thì xem content/metadata; không có quyền thì không nhận dữ liệu nhạy cảm, kể cả Search/Citation/Q&A.                                                                                                                               |
| US-AI-03                              | Tạo và chỉnh sửa tài liệu                    | `Create Document`, `Document Detail / Draft`, `Document Editor`                         | Author nhập Name, Content, Folder, Tag; lưu thành `Draft`; Reader không được edit.                                                                                                                                                          |
| US-AI-04                              | Tổ chức tài liệu bằng Folder và Tag          | `Folder & Tag / Select`, `Tag / Chip`                                                   | Gắn/bỏ Folder hoặc Tag theo quyền; Tag suggestion chỉ lưu sau xác nhận nếu được triển khai.                                                                                                                                                 |
| US-AI-05                              | Gửi tài liệu vào Review                      | `Document Detail / Send Review`, `Dialog / Confirm Send Review`                         | Author xác nhận gửi Draft; chuyển `Draft -> Reviewing`; không tạo Review Request trùng.                                                                                                                                                     |
| US-AI-06                              | Review và Approve hoặc Reject                | `Review Queue`, `Review Detail`, `Dialog / Approve`, `Dialog / Reject`                  | Reviewer/Admin xem queue; Approve hoặc Reject lưu người thực hiện và thời điểm; Author bị chặn.                                                                                                                                             |
| US-AI-07                              | Publish tài liệu đã được Approve             | `Approved Detail`, `Dialog / Confirm Publish`, `Published Detail`                       | Chỉ Reviewer/Admin Publish bản đã Approved; chuyển `Approved -> Published`; tạo current version.                                                                                                                                            |
| US-AI-08                              | Tạo và quản lý Version tài liệu              | `Version History`, `Version Badge / Current`, `Version Badge / Superseded`              | Reject giữ cùng Draft; Publish tạo version chính thức tiếp theo; Reader chỉ xem version gần nhất theo quyền.                                                                                                                                |
| US-AI-02, US-AI-08                    | Xem tài liệu/version trong quyền             | `Document Detail / Current Version`                                                     | Search và Q&A dùng current version; version cũ không còn hiện hành không được làm nguồn hiện tại.                                                                                                                                           |
| TBD (REQ-FR-12)                       | Search tài liệu theo quyền                   | `Search`, `Search Results`, `Search / Empty`, `Search / Error`                          | User Story cho Search chưa có trong `user-stories.md`; chỉ triển khai theo REQ-FR-12. Chỉ hiển thị kết quả được phép; không có Internet search.                                                                                             |
| TBD (REQ-FR-13, REQ-FR-14, REQ-FR-15) | Hỏi AI bằng văn bản và kiểm tra nguồn        | `Ask AI`, `AI Processing`, `AI Answer`, `Citation / Expanded`, `AI / Insufficient Data` | User Story cho Q&A chưa có trong `user-stories.md`; chỉ triển khai theo các Requirement ID nêu trong cột Story ID. Reader submit câu hỏi; AI dùng nguồn nội bộ được phép; hiển thị/lưu document ID và version ID hoặc citation tương đương. |

## 4. UX COPY & ERROR HANDLING TABLE

| Context/Trạng thái                  | Nội dung hiển thị (Tiếng Việt)                                                        | Mục đích/Hành động gợi ý cho người dùng                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Empty - Review Queue                | `Không có tài liệu chờ Review.`                                                       | Cho Reviewer/Admin biết queue hiện không có item; không phải lỗi.                           |
| Empty - Search                      | `Không tìm thấy kết quả phù hợp.`                                                     | Cho phép Reader sửa từ khóa và Search lại; không tiết lộ tài liệu ngoài quyền.              |
| Empty - Version History             | `Chưa có version chính thức.`                                                         | Giải thích Draft chưa được Publish nên chưa có version chính thức.                          |
| Error - Validation                  | `Vui lòng kiểm tra các trường bắt buộc trước khi tiếp tục.`                           | Giữ dữ liệu; đưa focus đến field lỗi và cho phép sửa.                                       |
| Error - Save Draft                  | `Không thể lưu Draft. Dữ liệu của bạn vẫn được giữ lại. Thử lại?`                     | Cho phép `Retry`; không xóa nội dung chưa lưu.                                              |
| Error - Send Review                 | `Chưa thể gửi tài liệu vào Review. Vui lòng thử lại.`                                 | Giữ trạng thái Draft và cho phép retry; không tạo request trùng.                            |
| Error - Review/Publish              | `Thao tác chưa hoàn tất. Vui lòng kiểm tra quyền và trạng thái tài liệu rồi thử lại.` | Không khẳng định thành công khi request lỗi; kiểm tra role và state trước retry.            |
| Error - Search/AI connection        | `Không thể kết nối đến dịch vụ. Vui lòng thử lại.`                                    | Cho phép `Retry`; giữ query/question; không hiển thị stack trace.                           |
| Permission denied - Edit            | `Bạn không có quyền chỉnh sửa tài liệu này.`                                          | Giải thích ngắn gọn; không hiển thị action edit cho Reader nếu đã biết role.                |
| Permission denied - Approve/Publish | `Bạn không có quyền thực hiện thao tác này.`                                          | Chặn hành động; không tiết lộ thêm metadata hoặc quy tắc quyền chưa được chốt.              |
| Permission denied - Document/Search | `Không tìm thấy kết quả phù hợp.`                                                     | Dùng thông điệp không tiết lộ sự tồn tại của tài liệu ngoài quyền.                          |
| Confirmation - Send Review          | `Gửi bản Draft này vào Review?`                                                       | Cho Author xác nhận đúng tài liệu/bản Draft trước khi chuyển sang `Reviewing`.              |
| Confirmation - Approve              | `Approve bản Draft này?`                                                              | Cho Reviewer/Admin xác nhận kết quả Review; lưu người thực hiện và thời điểm.               |
| Confirmation - Reject               | `Reject bản Draft này?`                                                               | Nêu rằng Draft sẽ được giữ để Author chỉnh sửa và gửi lại; hỏi lý do nếu prototype yêu cầu. |
| Confirmation - Publish              | `Publish bản đã Approved này?`                                                        | Cảnh báo Publish sẽ tạo version chính thức tiếp theo và đánh dấu current version.           |
| Success - Draft saved               | `Đã lưu Draft.`                                                                       | Xác nhận lưu thành công; cho phép tiếp tục chỉnh sửa hoặc gửi Review.                       |
| Success - Review sent               | `Đã gửi tài liệu vào Review.`                                                         | Xác nhận trạng thái đã chuyển sang `Reviewing`.                                             |
| Success - Approved/Rejected         | `Đã ghi nhận kết quả Review: Approved/Rejected.`                                      | Xác nhận audit context; hiển thị next action phù hợp.                                       |
| Success - Published                 | `Đã Publish. Đây là version hiện hành.`                                               | Xác nhận version chính thức được tạo và dùng cho Search/Q&A.                                |
| AI - Insufficient data              | `Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.`                 | Không suy đoán, không dùng Internet; cho phép Reader sửa câu hỏi hoặc kết thúc lượt hỏi.    |

## 5. RESPONSIVE BREAKPOINTS & LAYOUT RULES

Các breakpoint dưới đây là quy ước implementation đề xuất để làm prototype responsive; cần đối chiếu với Figma trước khi khóa token chính thức.

| Viewport | Breakpoint đề xuất | Layout và hành vi                                                                                                                                                      |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile   | `< 768px`          | Một cột; padding ngang `--space-4`; action chính full-width hoặc nằm trong vùng sticky có safe area; bảng chuyển thành list/card hoặc cho phép cuộn ngang có chủ đích. |
| Tablet   | `768px - 1199px`   | Grid 8 cột; padding ngang `--space-6`; Review Queue và Search Results ưu tiên list; Dialog không vượt quá viewport và giữ margin `--space-4`.                          |
| Desktop  | `>= 1200px`        | Grid 12 cột; content max-width cần chốt theo Figma; form có thể dùng hai vùng nhưng không tách action khỏi context; queue/detail giữ thứ tự đọc rõ.                    |

### Layout rules chung

- Dùng CSS Grid cho page-level layout và vùng có cột rõ; dùng flexbox cho row action, button group, metadata và chip list.
- Không để loading, error hoặc label dài làm thay đổi kích thước control; dùng min-width, min-height hoặc layout track ổn định.
- Trên mobile, ưu tiên thứ tự: title/status, nội dung chính, error/help text, primary action, secondary action. Không ẩn error chỉ vì thiếu chiều ngang.
- Review Queue, Search Results và Version History phải giữ được document, version và status trong cùng context khi viewport thu hẹp.
- Dialog có `max-width` theo viewport, không tràn ngang; focus trap hoạt động như nhau trên touch và keyboard.
- Search và AI Question Form không được mất query/question khi đổi breakpoint, mở citation hoặc retry.
- Không đặt hai card lồng nhau để mô phỏng page section; card chỉ dùng cho item lặp lại hoặc vùng thật sự cần framing.

## 6. VERIFY - Điều kiện bàn giao cho Developer và QA

### Checklist tối thiểu

- [ ] Developer có CSS variable mapping cho color, radius, spacing, focus và overlay.
- [ ] Mỗi component tương tác có state `default`, `hover/focus`, `disabled`, `loading` và `error` khi phù hợp.
- [ ] Mỗi flow bất đồng bộ có success/error/retry; dữ liệu input không mất khi lỗi.
- [ ] Traceability map nối frame/component với User Story và hành vi chuyển trạng thái.
- [ ] UX copy có empty, error, permission denied, confirmation và success cho các flow MVP.
- [ ] QA có thể kiểm tra keyboard, focus, ARIA, permission-aware retrieval và responsive layout.
- [ ] Search/Q&A không hiển thị dữ liệu, citation hoặc version ngoài quyền; Q&A không dùng Internet.
- [ ] Publish chỉ thành công với bản đã `Approved` và người dùng có quyền; Publish tạo duy nhất một current version.

### 3 điểm con người phải kiểm tra lại trong Figma trước khi code

1. **Token còn thiếu và token lệch ngữ cảnh:** xác nhận font, typography scale, surface/background, contrast ratio, breakpoint, z-index và thay các ghi chú cũ như `Cart/order success` hoặc `active voice` bằng semantic của AI KMS.
2. **Mapping frame/state và quyền:** xác nhận Figma có frame riêng cho Draft, Reviewing, Approved, Rejected, Published, loading, empty, error, confirmation và permission denied; kiểm tra action `Approve`/`Publish` không xuất hiện sai role.
3. **Luồng text, citation và responsive:** xác nhận `Search`, `Ask AI`, `AI processing`, `Insufficient data`, citation document/version và mobile layout; nếu có VoiceControl, xác nhận đây là scope được phê duyệt và vẫn có text fallback.
