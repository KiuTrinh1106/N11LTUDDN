# Phân công task Taiga

## Nguyên tắc

- **Trinh**: BA, BE và AI; đồng thời nhận các task `FE/BE` có phần backend hoặc tích hợp lớn.
- **Thơ**: UI/UX, FE và QA; đồng thời nhận các task `FE/BE` còn lại.
- Các task `FE/BE` được chia thêm để tổng ước lượng của hai người gần cân bằng.

## Phân công

| Thành viên | Task                                                                                                                                                                                                                                         | Tổng ước lượng |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------: |
| Trinh      | T-101, T-102, T-105, T-106, T-201, T-203, T-205, T-207, T-209, T-301, T-303, T-307, T-308, T-311, T-312, T-401, T-402, T-404, T-406, T-408, T-409, T-501, T-503, T-506, T-508, T-601, T-602, T-603, T-607, T-609, T-701, T-702, T-703        |           125h |
| Thơ        | T-103, T-104, T-107, T-202, T-204, T-206, T-208, T-210, T-302, T-304, T-305, T-306, T-309, T-310, T-313, T-314, T-403, T-405, T-407, T-410, T-502, T-504, T-505, T-507, T-509, T-604, T-605, T-606, T-608, T-610, T-611, T-704, T-705, T-706 |           116h |

## Ngoại lệ `FE/BE`

- Trinh: `T-205`, `T-209`, `T-307`, `T-408`, `T-409`, `T-508`.
- Thơ: `T-705`.

Script [taiga-create-tasks.js](../../scripts/taiga-create-tasks.js) đọc trực tiếp task từ `taiga.md`, áp dụng mapping trên, tìm User Story và thành viên tương ứng trong Taiga, sau đó tạo và gán task. Các task đã tồn tại với cùng tiêu đề sẽ được bỏ qua để có thể chạy lại an toàn.
