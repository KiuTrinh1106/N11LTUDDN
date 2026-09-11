# AI Document & Knowledge Management System — Task Breakdown

## EP-01 — Quản lý quyền truy cập

| Story    | Task  | Title                                            | Owner | Est | Expected output                    |
| -------- | ----- | ------------------------------------------------ | ----- | --- | ---------------------------------- |
| US-AI-01 | T-101 | Xác định vai trò Reader, Author, Reviewer, Admin | BA    | 2h  | Danh sách 4 role + phạm vi quyền   |
| US-AI-01 | T-102 | Xây dựng ma trận quyền theo vai trò              | BA    | 3h  | Permission Matrix                  |
| US-AI-01 | T-103 | Thiết kế màn hình quản lý vai trò và quyền       | UI/UX | 4h  | Figma screen + states              |
| US-AI-01 | T-104 | Kiểm thử quyền theo 4 vai trò                    | QA    | 3h  | Permission test cases + evidence   |
| US-AI-02 | T-105 | Xác định quy tắc View Permission cho tài liệu    | BA    | 2h  | Document permission rules          |
| US-AI-02 | T-106 | Implement kiểm soát quyền xem tài liệu           | BE    | 5h  | Permission validation + unit tests |
| US-AI-02 | T-107 | Kiểm thử truy cập tài liệu theo quyền            | QA    | 3h  | Permission test report             |

## EP-02 — Quản lý và tổ chức tài liệu

| Story    | Task  | Title                                | Owner | Est | Expected output                  |
| -------- | ----- | ------------------------------------ | ----- | --- | -------------------------------- |
| US-AI-03 | T-201 | Xác định cấu trúc dữ liệu Document   | BA/BE | 3h  | Document specification           |
| US-AI-03 | T-202 | Thiết kế màn hình tạo tài liệu       | UI/UX | 4h  | Figma Create Document            |
| US-AI-03 | T-203 | Implement chức năng tạo tài liệu     | BE    | 5h  | Create Document API + tests      |
| US-AI-03 | T-204 | Implement giao diện tạo tài liệu     | FE    | 5h  | Create Document screen           |
| US-AI-03 | T-205 | Implement chỉnh sửa tài liệu         | FE/BE | 5h  | Edit flow + validation           |
| US-AI-03 | T-206 | Kiểm thử tạo và chỉnh sửa tài liệu   | QA    | 3h  | Test cases + evidence            |
| US-AI-04 | T-207 | Xác định quy tắc Folder và Tag       | BA    | 2h  | Folder/Tag specification         |
| US-AI-04 | T-208 | Thiết kế UI Folder và Tag            | UI/UX | 3h  | Figma Folder/Tag                 |
| US-AI-04 | T-209 | Implement thêm/xóa Tag và gán Folder | FE/BE | 5h  | Folder/Tag functionality + tests |
| US-AI-04 | T-210 | Kiểm thử Folder và Tag               | QA    | 2h  | Test report                      |

## EP-03 — Quy trình Review và Publish

| Story    | Task  | Title                                     | Owner | Est | Expected output                 |
| -------- | ----- | ----------------------------------------- | ----- | --- | ------------------------------- |
| US-AI-05 | T-301 | Xác định điều kiện gửi Version vào Review | BA    | 2h  | Review submission rules         |
| US-AI-05 | T-302 | Thiết kế luồng gửi Review                 | UI/UX | 3h  | Figma Review submission flow    |
| US-AI-05 | T-303 | Implement tạo Review Request              | BE    | 5h  | Review Request API + tests      |
| US-AI-05 | T-304 | Implement gửi Version vào Review          | FE    | 4h  | Submit Review flow              |
| US-AI-05 | T-305 | Kiểm thử gửi Review                       | QA    | 2h  | Review submission test evidence |
| US-AI-06 | T-306 | Thiết kế Review Queue                     | UI/UX | 4h  | Figma Review Queue              |
| US-AI-06 | T-307 | Implement Review Queue                    | FE/BE | 6h  | Review Queue + API              |
| US-AI-06 | T-308 | Implement Approve/Reject                  | BE    | 5h  | Review result API + tests       |
| US-AI-06 | T-309 | Implement giao diện Approve/Reject        | FE    | 4h  | Approve/Reject UI + states      |
| US-AI-06 | T-310 | Kiểm thử Approve/Reject                   | QA    | 3h  | Review test report              |
| US-AI-07 | T-311 | Xác định điều kiện Publish                | BA    | 2h  | Publish rules                   |
| US-AI-07 | T-312 | Implement kiểm tra Version đã Approved    | BE    | 4h  | Publish validation + tests      |
| US-AI-07 | T-313 | Thiết kế và implement Publish flow        | FE    | 4h  | Publish UI + confirmation       |
| US-AI-07 | T-314 | Kiểm thử Publish sau Approve              | QA    | 3h  | E2E Publish test                |

## EP-04 — Quản lý Version và lịch sử

| Story    | Task  | Title                                     | Owner | Est | Expected output               |
| -------- | ----- | ----------------------------------------- | ----- | --- | ----------------------------- |
| US-AI-08 | T-401 | Xác định Version Increment Rule           | BA    | 2h  | Version decision / TBD record |
| US-AI-08 | T-402 | Xác định Current Version Rule             | BA    | 2h  | Current Version rule          |
| US-AI-08 | T-403 | Thiết kế Version History                  | UI/UX | 3h  | Figma Version History         |
| US-AI-08 | T-404 | Implement tạo và xác định Current Version | BE    | 6h  | Version service + tests       |
| US-AI-08 | T-405 | Kiểm thử chuyển Current Version           | QA    | 3h  | Version test evidence         |
| US-AI-09 | T-406 | Xác định dữ liệu Version History          | BA    | 2h  | Version History specification |
| US-AI-09 | T-408 | Implement xem Version History             | FE/BE | 5h  | Version History flow          |

## EP-05 — Tìm kiếm và khám phá tri thức

| Story    | Task  | Title                                      | Owner | Est | Expected output               |
| -------- | ----- | ------------------------------------------ | ----- | --- | ----------------------------- |
| US-AI-10 | T-501 | Xác định phạm vi tài liệu được phép Search | BA    | 2h  | Search permission rules       |
| US-AI-10 | T-502 | Thiết kế màn hình Search                   | UI/UX | 3h  | Figma Search screen           |
| US-AI-10 | T-503 | Implement Search theo quyền truy cập       | BE    | 6h  | Search API + permission tests |
| US-AI-10 | T-504 | Implement giao diện kết quả Search         | FE    | 4h  | Search Results UI             |
| US-AI-10 | T-505 | Kiểm thử Search theo Permission            | QA    | 3h  | Search permission test        |
| US-AI-11 | T-506 | Xác định tiêu chí Search nâng cao          | BA    | 2h  | Advanced Search criteria      |
| US-AI-11 | T-507 | Thiết kế bộ lọc Folder và Tag              | UI/UX | 3h  | Figma Search filters          |
| US-AI-11 | T-508 | Implement Search Keyword + Folder/Tag      | FE/BE | 5h  | Advanced Search functionality |
| US-AI-11 | T-509 | Kiểm thử Search nâng cao                   | QA    | 3h  | Advanced Search test evidence |

## EP-06 — Trợ lý tri thức AI

| Story    | Task  | Title                                              | Owner | Est | Expected output                    |
| -------- | ----- | -------------------------------------------------- | ----- | --- | ---------------------------------- |
| US-AI-12 | T-601 | Xác định luồng Ask AI và phạm vi nguồn             | BA/AI | 3h  | AI Q&A flow + source rules         |
| US-AI-12 | T-602 | Implement truy xuất tài liệu theo Permission       | AI/BE | 6h  | Permission-aware Retrieval + tests |
| US-AI-12 | T-603 | Implement API Ask AI                               | AI/BE | 6h  | Q&A API + tests                    |
| US-AI-12 | T-604 | Thiết kế giao diện Ask AI                          | UI/UX | 4h  | Figma AI Q&A                       |
| US-AI-12 | T-605 | Implement trạng thái AI Processing/No Result/Error | FE    | 4h  | AI states                          |
| US-AI-12 | T-606 | Kiểm thử AI Q&A theo quyền                         | QA    | 4h  | AI permission test evidence        |
| US-AI-13 | T-607 | Xác định cấu trúc Citation                         | BA/AI | 2h  | Citation specification             |
| US-AI-13 | T-608 | Thiết kế Citation trong AI Answer                  | UI/UX | 3h  | Figma Citation                     |
| US-AI-13 | T-609 | Implement lưu Document ID và Version ID            | BE    | 5h  | Source Record + tests              |
| US-AI-13 | T-610 | Implement hiển thị nguồn AI sử dụng                | FE    | 4h  | Citation UI                        |
| US-AI-13 | T-611 | Kiểm thử Citation và Source Record                 | QA    | 3h  | Citation test evidence             |

## EP-07 — Audit và quản trị hệ thống

| Story    | Task  | Title                                         | Owner | Est | Expected output           |
| -------- | ----- | --------------------------------------------- | ----- | --- | ------------------------- |
| US-AI-14 | T-701 | Xác định danh sách Important Audit Activities | BA    | 2h  | Audit Activity List       |
| US-AI-14 | T-702 | Xác định cấu trúc Audit Log                   | BA/BE | 2h  | Audit Log specification   |
| US-AI-14 | T-703 | Implement ghi Audit Log                       | BE    | 5h  | Audit Log service + tests |
| US-AI-14 | T-704 | Thiết kế màn hình Audit Log                   | UI/UX | 3h  | Figma Audit Log           |
| US-AI-14 | T-705 | Implement xem Audit Log                       | FE/BE | 5h  | Audit Log screen + API    |
| US-AI-14 | T-706 | Kiểm thử Audit Log                            | QA    | 3h  | Audit test evidence       |
