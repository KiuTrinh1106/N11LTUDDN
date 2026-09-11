# Project Index - AI Document & Knowledge Management System (AI KMS)

- **Nhóm**: Nhóm 11 lớp LTUDDN | **Học phần**: Thực hành Lập trình Ứng dụng Doanh nghiệp
- **Cập nhật gần nhất**: 12/09/2026

## 1. Thông tin nhóm & Phân công vai trò

| Thành viên | Vai trò                             | Chức năng / User Story phụ trách chính                                     | Evidence chính sở hữu                                                                                                                                   |
| :--------- | :---------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Thơ        | BA / Product; QA / Release; UX / UI | Requirement set, user flow và kiểm thử/release cho các luồng MVP           | [Requirements Inventory](02-vault/requirements.md), [Prototype Findings](04-design/prototype-findings.md), [Test Strategy](06-testing/test-strategy.md) |
| Trinh      | AI / Vault; Developer; UX / UI      | Project Vault, AI Q&A và core implementation cho luồng Document Search/Ask | [Q&A Benchmark](02-vault/qa-benchmark.md), [AI Usage Log](logs/ai-usage-log.md), [Architecture](05-technical/architecture.md)                           |

## 2. Discovery & Project Vault (Bài tập 1)

| Artifact                              | ID / Tên file                           | Link                                              |
| :------------------------------------ | :-------------------------------------- | :------------------------------------------------ |
| Project Charter                       | `project-charter.md`                    | [Mở artifact](02-vault/project-charter.md)        |
| Research Notes                        | `research-notes.md`                     | [Mở artifact](01-discovery/research-notes.md)     |
| Research Synthesis                    | `research-synthesis.md`                 | [Mở artifact](01-discovery/research-synthesis.md) |
| Requirements Inventory                | `requirements.md` (REQ-_, NFR-_, BR-\*) | [Mở artifact](02-vault/requirements.md)           |
| Project Scope                         | `scope.md`                              | [Mở artifact](02-vault/scope.md)                  |
| Project Vault Index & Source Priority | `source-priority.md`                    | [Mở artifact](02-vault/source-priority.md)        |
| Q&A Benchmark & Accuracy Score        | `qa-benchmark.md`                       | [Mở artifact](02-vault/qa-benchmark.md)           |
| Glossary                              | `glossary.md`                           | [Mở artifact](02-vault/glossary.md)               |
| Open Questions                        | `open-questions.md`                     | [Mở artifact](02-vault/open-questions.md)         |

## 3. Product Definition & Design (Bài tập 2)

| Artifact                               | ID / Tên file                             | Link                                                                                                  |
| :------------------------------------- | :---------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| PRD (Product Requirement Document)     | `prd.md`                                  | [Mở artifact](03-product/prd.md)                                                                      |
| Epics                                  | `epics.md`                                | [Mở artifact](03-product/epics.md)                                                                    |
| User Stories List                      | `user-stories.md` (US-01 đến US-12)       | [Mở artifact](03-product/user-stories.md)                                                             |
| Task Assignment                        | `task-assignment.md`                      | [Mở artifact](03-product/task-assignment.md)                                                          |
| Vertical Slice                         | `vertical-slice.md`                       | [Mở artifact](03-product/vertical-slice.md)                                                           |
| Taiga Backlog & Task Board             | `taiga.md`                                | [Mở artifact](03-product/taiga.md)                                                                    |
| Prototype Brief & Usability Findings   | `prototype-findings.md`                   | [Mở artifact](04-design/prototype-findings.md)                                                        |
| Design Foundation                      | `foundation.md`                           | [Mở artifact](04-design/foundation.md)                                                                |
| Design System & Components             | `DESIGN.md`, `components.md`              | [DESIGN](04-design/DESIGN.md) · [Components](04-design/components.md)                                 |
| User Flow & State Specifications       | `flow.md`, `states.md`, `state-matrix.md` | [Flow](04-design/flow.md) · [States](04-design/states.md) · [State Matrix](04-design/state-matrix.md) |
| Screen Inventory & Handoff             | `screen-inventory.md`, `handoff.md`       | [Screen Inventory](04-design/screen-inventory.md) · [Handoff](04-design/handoff.md)                   |
| Figma Design System & Screen Inventory | Chưa có file/URL chính thức               | [Placeholder Figma](https://figma.com/link-to-file)                                                   |

## 4. Technical & Engineering

| Artifact                         | ID / Tên file                         | Link                                                                                          |
| :------------------------------- | :------------------------------------ | :-------------------------------------------------------------------------------------------- |
| Architecture & Data Flow Diagram | `architecture.md`                     | [Mở artifact](05-technical/architecture.md)                                                   |
| Data Model & ERD                 | `data-model.md`, `database-schema.md` | [Data Model](05-technical/data-model.md) · [Database Schema](05-technical/database-schema.md) |
| API Contracts                    | `api-contract.md`                     | [Mở artifact](05-technical/api-contract.md)                                                   |
| Architecture Decision Records    | `adr/`                                | [Mở thư mục ADR](05-technical/adr/)                                                           |
| Source Code Repository           | Chưa có URL repository chính thức     | [Placeholder repository](https://github.com/link-to-repo)                                     |

## 5. QA, Release & Operation

| Artifact                            | ID / Tên file                         | Link                                                                                  |
| :---------------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------ |
| Test Strategy & Test Cases          | `test-strategy.md`, `test-cases.md`   | [Test Strategy](06-testing/test-strategy.md) · [Test Cases](06-testing/test-cases.md) |
| Bug Reports & Triage Board          | `bug-reports/BUG-001.md`              | [BUG-001](06-testing/bug-reports/BUG-001.md)                                          |
| Release Checklist                   | `release-checklist.md`                | [Mở artifact](07-release/release-checklist.md)                                        |
| Staging / Production Deployment URL | Chưa triển khai                       | [Placeholder deployment](https://your-app.vercel.app)                                 |
| Runbook & Setup Guide               | `runbook.md`, `README.md#quick-start` | [Runbook](07-release/runbook.md) · [Quick Start](../README.md#quick-start)            |
| Release Notes                       | `release-notes.md`                    | [Mở artifact](07-release/release-notes.md)                                            |

## 6. Evidence & AI Usage

| Artifact                       | ID / Tên file                                                                      | Link                                         |
| :----------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------- |
| AI Usage Log                   | `logs/ai-usage-log.md` (tối thiểu 5 entries có Human Verification)                 | [Mở artifact](logs/ai-usage-log.md)          |
| Traceability Matrix            | `logs/traceability-matrix.md` (Requirement → Story → Task → Code → Test → Release) | [Mở artifact](logs/traceability-matrix.md)   |
| Retrospective & Metrics Report | `logs/retrospective.md`                                                            | [Mở artifact](logs/retrospective.md)         |
| Decisions Log                  | `08-decisions/decisions-log.md`                                                    | [Mở artifact](08-decisions/decisions-log.md) |

### Kiểm tra độ bao phủ artifact

- **Bài 1**: Đã liên kết Charter, Research, Requirements, Scope, Source Priority, Q&A Benchmark, Glossary và Open Questions.
- **Bài 2**: Đã liên kết PRD, Epics, User Stories, Task Assignment, Vertical Slice, Taiga, Prototype, Design System, Flow, States, Screen Inventory và Handoff.
- **Bài cuối**: Đã liên kết Architecture, Data Model/Schema, API, ADRs, Test Strategy/Cases, Bug Report, Release Checklist, Runbook, Release Notes, AI Log, Traceability Matrix và Retrospective.
- Các URL chưa có artifact thật được đánh dấu **Placeholder** để cập nhật sau khi nhóm có link chính thức.
