# Design Foundation - AI Document & Knowledge Management System

## Phạm vi

Foundation này là nguồn token nền cho giao diện web của AI Document & Knowledge Management System. Các token phục vụ các flow `Create -> Review -> Publish -> Version -> Search/Ask` và bốn role `Reader`, `Author`, `Reviewer`, `Admin`.

MVP hiện tại xác nhận luồng hỏi AI bằng văn bản. VoiceControl nếu xuất hiện trong prototype chỉ là proposed và không được xem là token hoặc chức năng bắt buộc cho đến khi có quyết định phạm vi riêng.

## Color tokens

| Token                     | Value     | Use                                                                            |
| :------------------------ | :-------- | :----------------------------------------------------------------------------- |
| `color.primary`           | `#205B8E` | Primary action: `Lưu`, `Gửi Review`, `Search`, `Ask AI`.                       |
| `color.success`           | `#2F6B4F` | Kết quả thành công, `Approved`, `Published`, current version.                  |
| `color.warning`           | `#9A5B00` | Confirmation, hành động destructive, trạng thái chờ hoặc cần chú ý.            |
| `color.danger`            | `#9B2C2C` | Validation error, request failure, `Rejected`, `Permission denied`.            |
| `color.interactive.hover` | `#17466D` | Hover của interactive control; cần kiểm tra lại contrast trên surface thực tế. |
| `color.focus.ring`        | `#205B8E` | Focus ring cho button, input, link, combobox, citation và dialog control.      |
| `color.disabled`          | `#6B7280` | Disabled state; không dùng opacity làm tín hiệu duy nhất.                      |

### Semantic aliases

| Semantic token              | Alias           |
| :-------------------------- | :-------------- |
| `color.interactive.default` | `color.primary` |
| `color.feedback.success`    | `color.success` |
| `color.feedback.warning`    | `color.warning` |
| `color.feedback.error`      | `color.danger`  |

Mọi trạng thái phải có text hoặc icon có accessible name đi kèm màu. Không dùng màu đơn lẻ để phân biệt `Draft`, `Reviewing`, `Approved`, `Rejected`, `Published` hoặc quyền truy cập.

## Typography

| Token              | Value                  | Status                                           |
| :----------------- | :--------------------- | :----------------------------------------------- |
| `font.family.base` | `TBD - Figma cần chốt` | Chưa có trong tài liệu nền.                      |
| `font.size.*`      | `TBD - Figma cần chốt` | Chưa tự gán scale để tránh lệch handoff.         |
| `font.weight.*`    | `TBD - Figma cần chốt` | Cần xác nhận cho heading, body, label và status. |
| `line-height.*`    | `TBD - Figma cần chốt` | Cần kiểm tra cùng font và ngôn ngữ tiếng Việt.   |

## Spacing, radius và overlay

| Token               | Value                            | Use                                                         |
| :------------------ | :------------------------------- | :---------------------------------------------------------- |
| `space.base`        | `4px`                            | Đơn vị cơ sở của spacing scale.                             |
| `space.1`           | `4px`                            | Khoảng cách nội bộ nhỏ.                                     |
| `space.2`           | `8px`                            | Gap giữa label, icon và control gần nhau.                   |
| `space.3`           | `12px`                           | Padding nhỏ của chip, input hoặc metadata.                  |
| `space.4`           | `16px`                           | Padding control và khoảng cách section nhỏ.                 |
| `space.6`           | `24px`                           | Gap giữa nhóm nội dung hoặc vùng form.                      |
| `space.8`           | `32px`                           | Khoảng cách section lớn.                                    |
| `radius.md`         | `12px`                           | Card, input, dialog và vùng được framing.                   |
| `focus.ring.width`  | `3px`                            | Độ dày focus ring tối thiểu đề xuất.                        |
| `focus.ring.offset` | `2px`                            | Khoảng cách focus ring với control.                         |
| `shadow.overlay`    | `0 8px 24px rgb(17 24 39 / 18%)` | Modal, combobox và popover; không thay thế focus indicator. |

## Responsive foundation

| Token / breakpoint   | Value            | Use                                                     |
| :------------------- | :--------------- | :------------------------------------------------------ |
| `breakpoint.mobile`  | `< 768px`        | Một cột, padding ngang `space.4`, action chính dễ chạm. |
| `breakpoint.tablet`  | `768px - 1199px` | Grid 8 cột, padding ngang `space.6`.                    |
| `breakpoint.desktop` | `>= 1200px`      | Grid 12 cột; max-width content cần chốt trong Figma.    |
| `layout.grid`        | CSS Grid         | Page layout, queue/detail và vùng nhiều cột.            |
| `layout.row`         | Flexbox          | Button group, metadata, tag/chip list và inline action. |

## CSS Custom Properties

```css
:root {
  --color-primary: #205b8e;
  --color-success: #2f6b4f;
  --color-warning: #9a5b00;
  --color-danger: #9b2c2c;
  --color-interactive-default: var(--color-primary);
  --color-interactive-hover: #17466d;
  --color-focus-ring: #205b8e;
  --color-feedback-success: var(--color-success);
  --color-feedback-warning: var(--color-warning);
  --color-feedback-error: var(--color-danger);
  --color-disabled: #6b7280;

  --radius-md: 12px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --focus-ring-width: 3px;
  --focus-ring-offset: 2px;
  --shadow-overlay: 0 8px 24px rgb(17 24 39 / 18%);
}
```

## Nguyên tắc kiểm chứng

- Contrast ratio của text, icon và focus indicator phải được kiểm tra trên surface/background thực tế sau khi Figma chốt màu nền.
- Hover, focus, loading và error không được làm thay đổi kích thước control hoặc gây layout shift.
- Mọi control tương tác phải dùng được bằng keyboard và có focus visible.
- Typography, surface/background, z-index và max-width content vẫn là `TBD`; cần cập nhật token chính thức trước khi khóa implementation.
