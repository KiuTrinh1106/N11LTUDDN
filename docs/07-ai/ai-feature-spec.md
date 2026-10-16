# AI Feature Specification - Permission-aware Knowledge Q&A

**Status:** Business specification and acceptance contract. The existing endpoint is a prototype baseline; benchmark execution and several acceptance requirements remain unverified.

## Business problem and user value

Readers need a fast answer grounded in approved internal knowledge without manually opening multiple documents. The answer must be verifiable, use only content the caller may read, and clearly decline when the permitted knowledge base does not support an answer. A plausible but unsupported answer is a failure, not a successful response.

**Primary user:** Reader.
**Supporting users:** Author publishes and maintains source content; Reviewer/Admin approve it; Admin supports permissions and auditability.

## Scope

### In scope

- Accept a text question and search approved, current internal document versions.
- Apply the caller's current `ASK_AI` and document `VIEW` permissions before any source can enter retrieval, answer generation, logs visible to users, or citations.
- Return an answer grounded in retrieved passages and show source identity sufficient to open and verify the source.
- Persist the question/result and source identifiers for auditable, verifiable Q&A.
- Decline unsupported questions without guessing or consulting the Internet.
- Evaluate business correctness, grounding, citation validity and access control against an approved set of at least 20 cases.

### Out of scope

- Internet search, voice, autonomous document approval, unsupported recommendations, and using unapproved/non-current documents as answer sources.
- Treating an answer as correct solely because its wording resembles the expected answer when the cited source does not support it.

## Business rules

1. A caller must be authenticated and have `ASK_AI`. Every retrieved document must also be currently visible to that caller.
2. Retrieval is restricted to `Published` current versions. Draft, Reviewing, Approved-but-unpublished, Rejected, superseded and unauthorized versions are ineligible.
3. Access control is applied before ranking/context construction; removing a citation only after generation is not sufficient.
4. Each factual answer must be supported by its cited source(s). Citation must resolve to an existing document and version that is current and visible to the caller at response time.
5. If no permitted source supports the answer, return the approved insufficient-evidence response and an empty citation list. Do not infer facts, expose the existence/title of restricted documents, or fall back to the Internet.
6. If the service or retrieval layer fails, return an explicit error state. Do not represent infrastructure failure as a successful “no data” answer.
7. Store the actor, question/request identity, answer outcome, timestamp and source document/version IDs for every Q&A request that requires verification. Do not store secrets or unrelated personal data in the evaluation output.
8. Benchmark threshold is at least 80% correct grounded answers (`>=16/20` for the initial 20-case set). This threshold does not relax safety gates: unauthorized-source leakage must be 0%, and all required citations/source records must be valid and present.

## Input and output contract

### Input

| Field | Required | Rule |
| --- | --- | --- |
| `question` | Yes | Non-empty UTF-8 text, maximum 1,000 characters. Reject whitespace-only or non-searchable input with a validation error. |
| Caller identity | Yes | Derived from the authenticated session; never accepted as a caller-supplied user ID. |
| Permission context | Yes | Resolved server-side for the caller and applied before retrieval. |

### Required product output

```json
{
  "answer": "Answer grounded in the permitted source, or the approved insufficient-evidence message.",
  "status": "ANSWERED",
  "citations": [
    {
      "documentId": "document-id",
      "versionId": "version-id",
      "title": "Visible document title",
      "versionNumber": "v1.0"
    }
  ]
}
```

For insufficient evidence, `status` is `INSUFFICIENT_EVIDENCE` and `citations` is empty. Each citation must contain stable document and version identifiers; display labels alone are not enough for audit or traceability. For validation, authorization or service errors, use the repository's explicit error response and an appropriate HTTP status; never return an empty success-shaped answer.

### Existing implementation baseline (not the acceptance contract)

The current backend exposes `POST /api/ai/ask` with `{ "question": "..." }`; its success response is `{ "answer": "...", "sources": [{ "id", "title", "version" }] }`. The implementation uses keyword matching and an excerpt, not a demonstrated model-based grounded generation/evaluation pipeline. The response shape does not include `versionId` or an explicit status, and the reviewed route does not demonstrate a persisted per-answer source record. Treat these as gaps against REQ-FR-14 and REQ-NFR-04 until implementation and tests prove otherwise.

Also verify and fix caller-specific permission filtering before treating REQ-FR-15 as satisfied: the current published-document listing interface receives no caller identity, so the end-to-end permission-aware guarantee is not evidenced by the route contract alone.

## Fallback and error behavior

| Condition | Required behavior |
| --- | --- |
| No matching permitted current published source | Return `INSUFFICIENT_EVIDENCE`, the message “Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.”, and no citations. |
| Matching content is insufficient or ambiguous | Do not complete the answer by inference; return the insufficient-evidence response, or a clearly bounded partial response only if every factual statement has valid citations. |
| Caller is unauthenticated | Return `401`; do not search or disclose whether a source exists. |
| Caller lacks `ASK_AI` or `VIEW` for a candidate source | Return the standard authorization behavior; exclude that source before retrieval and never reveal its metadata. |
| Invalid/empty/over-limit question | Return a validation error; preserve no false success answer. |
| Retrieval/model/database unavailable or timed out | Return an explicit retryable/non-retryable service error as appropriate; do not convert an operational failure into “no documents found.” |
| User asks for Internet search or requests hidden/restricted data | Explain that only permitted internal published sources can be used; do not fetch or cite external/restricted information. |

## Minimum acceptance criteria

- A Reader's supported question returns a grounded answer and citations for the current published version they may read.
- The same question from a caller who cannot read the source never receives its content, title, excerpt, answer contribution or citation.
- Draft, Reviewing, Approved-but-not-published, Rejected and superseded versions are never returned as current Q&A evidence.
- A no-evidence question returns the exact insufficient-evidence behavior above and does not invoke external retrieval.
- Citation identifiers resolve to the actual document/version and remain authorized for the caller.
- A request record exists for every verification-required Q&A, with actor, timestamp, outcome and source IDs.
- The approved benchmark scores at least 16 of its first 20 cases as correct and grounded; security and citation hard gates pass independently.

## Evaluation set and scoring

The existing [Vault QA benchmark](../02-requirements/vault-qa-benchmark.md.md) contains 20 gold questions/answers (`Q1`–`Q20`). Use all 20 as the initial minimum evaluation set. Its gold answers are expected answers, not actual model outputs or proof of a passing run.

| Cases | Coverage | Pass condition |
| --- | --- | --- |
| Q1, Q4–Q7, Q12–Q13, Q19 | Review, approval, publishing and version lifecycle | Correct decision and lifecycle timing; no version is created before publish; version/retention claims match approved rules. |
| Q2–Q3, Q8, Q15–Q16 | Roles, view rights and restricted content | Correctly refuse unauthorized access; no restricted content or metadata leaks in answer or sources. |
| Q9–Q10 | Q&A and source traceability | Correctly state whether Q&A is supported and require stable document/version source identity. |
| Q11, Q17 | Permission-aware search and document organization | Match approved search/Folder/Tag requirements without claiming unapproved capabilities. |
| Q14, Q20 | Insufficient evidence and external-source boundary | Do not guess or use Internet; return the defined insufficient-evidence behavior. |
| Q18 | Auditability | Name only the approved audit activities and required record fields. |

For every run, record: case ID, exact input, expected answer and gold source, actual answer, actual citation IDs, pass/fail, failure category, run timestamp, code/commit, model and prompt version if applicable, dataset revision, and evaluator. Report:

- **Grounded accuracy** = cases correct **and** supported by valid citations / total cases.
- **Unauthorized-source leakage** = cases exposing restricted content or metadata / access-control cases; must be `0`.
- **Citation validity** = valid, visible document/version citations / required citations; must be `100%`.
- **Source-record completeness** = Q&A requests with required persisted source records / verification-required requests; must be `100%`.

Do not mark the benchmark passed until a reproducible run result is attached. Keep test fixtures synthetic or approved for course use; never place secrets or real sensitive documents in the benchmark.

## Traceability and open decisions

- Requirements: REQ-FR-04, REQ-FR-13–REQ-FR-15, REQ-FR-16, REQ-NFR-02–REQ-NFR-04, REQ-BR-02, REQ-BR-04, REQ-ASM-02.
- Backlog: [US-AI-02, US-AI-09, US-AI-10, US-AI-11 and US-AI-12](../04-backlog/user-stories.md).
- Workflow and version eligibility: [business-workflow.md](../03-product/business-workflow.md).
- API baseline: [api-contract.md](../06-technical/api-contract.md).
- Canonical end-to-end matrix: [TRACEABILITY.md](../TRACEABILITY.md).

Before sign-off, the Product/BA group must approve: (1) how document-level permissions are granted/revoked and their relationship to role permissions, (2) which Q&A requests are “cần kiểm chứng” if any exception to the 100% persistence rule is intended, and (3) the evaluator and acceptable answer variance for semantic scoring. Until resolved, the stricter privacy and source-persistence rules in this specification apply.
