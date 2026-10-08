import { useState, type FormEvent, type ReactNode } from "react";

type Role = "Reader" | "Author" | "Reviewer" | "Admin";
type Status = "Draft" | "Reviewing" | "Approved" | "Rejected" | "Published";
type Screen = "login" | "search" | "detail" | "ask" | "answer" | "create" | "review" | "versions" | "audit";

type Document = {
  id: string;
  title: string;
  version: string;
  folder: string;
  tag: string;
  status: Status;
  updated: string;
  content: string;
  author: string;
};

type AuditEvent = {
  id: number;
  action: string;
  object: string;
  actor: Role;
  result: string;
};

const initialDocuments: Document[] = [
  { id: "DOC-001", title: "Quy trình nhập kho", version: "v1.3", folder: "Kho vận", tag: "Quy trình", status: "Published", updated: "12/09/2026", content: "Quy trình nhập kho gồm tiếp nhận hàng, kiểm tra chứng từ, kiểm tra số lượng và cập nhật tồn kho.", author: "Nguyễn An" },
  { id: "DOC-002", title: "Quy định phân quyền tài liệu", version: "v2.0", folder: "Quản trị", tag: "Permission", status: "Published", updated: "10/09/2026", content: "Quyền xem tài liệu là điều kiện tiên quyết cho tìm kiếm, đọc, trích dẫn và hỏi đáp AI.", author: "Trần Bình" },
  { id: "DOC-003", title: "Hướng dẫn sử dụng hệ thống", version: "v1.1", folder: "Hệ thống", tag: "Hướng dẫn", status: "Published", updated: "08/09/2026", content: "Người dùng có thể tìm kiếm tài liệu được cấp quyền và đặt câu hỏi trên kho tri thức nội bộ.", author: "Lê Chi" },
  { id: "DOC-004", title: "Quy trình nghỉ phép", version: "Draft", folder: "Nhân sự", tag: "Nghỉ phép", status: "Reviewing", updated: "18/09/2026", content: "Nhân viên gửi yêu cầu nghỉ phép trên hệ thống, quản lý trực tiếp xem xét và bộ phận nhân sự cập nhật kết quả.", author: "Demo Author" },
];

const initialAudit: AuditEvent[] = [
  { id: 1, action: "Publish", object: "DOC-001 · v1.3", actor: "Reviewer", result: "Success" },
  { id: 2, action: "Ask AI", object: "DOC-001 · v1.3", actor: "Reader", result: "Success" },
];

function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("Reader");
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAudit);
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedId, setSelectedId] = useState(initialDocuments[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", content: "", folder: "Nhân sự", tag: "" });
  const selectedDocument = documents.find((document) => document.id === selectedId) ?? documents[0];
  const visibleDocuments = role === "Reader" ? documents.filter((document) => document.status === "Published") : documents;

  const addAudit = (action: string, object: string) => {
    setAuditEvents((events) => [{ id: Date.now(), action, object, actor: role, result: "Success" }, ...events]);
  };
  const updateDocument = (id: string, update: Partial<Document>) => {
    setDocuments((current) => current.map((document) => document.id === id ? { ...document, ...update } : document));
  };
  const openDocument = (document: Document) => {
    setSelectedId(document.id);
    setScreen("detail");
  };

  if (screen === "login") {
    const signIn = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setScreen(role === "Reader" ? "search" : role === "Author" ? "create" : "review");
    };
    return <div className="login-page"><form className="login-card" onSubmit={signIn}>
      <div className="logo" aria-hidden="true">K</div><p className="eyebrow">AI DOCUMENT &amp; KNOWLEDGE MANAGEMENT</p><h1>Kho tri thức nội bộ</h1><p className="muted">Tìm kiếm tài liệu và hỏi AI dựa trên nguồn được cấp quyền.</p>
      <label htmlFor="email">Email</label><input id="email" type="email" defaultValue="reader@company.vn" required />
      <label htmlFor="password">Mật khẩu</label><input id="password" type="password" defaultValue="12345678" required />
      <label htmlFor="role">Vai trò demo</label><select id="role" value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="Reader">Reader - tìm kiếm và hỏi AI</option><option value="Author">Author - tạo và gửi tài liệu</option><option value="Reviewer">Reviewer - Review và Publish</option><option value="Admin">Admin - Review và Audit</option></select>
      <button className="button primary full" type="submit">Đăng nhập</button><p className="demo-note">Prototype local: quyền chỉ mô phỏng ở giao diện, chưa thay thế xác thực backend.</p>
    </form></div>;
  }

  if (screen === "create") {
    const saveDraft = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (editingId) {
        updateDocument(editingId, { ...draft, status: "Draft", version: "Draft", updated: "18/09/2026" });
        setSelectedId(editingId);
        addAudit("Edit", `${editingId} · Draft`);
        setEditingId(null);
        setDraft({ title: "", content: "", folder: "Nhân sự", tag: "" });
        setScreen("detail");
        return;
      }
      const id = `DOC-${String(documents.length + 1).padStart(3, "0")}`;
      const newDocument: Document = { ...draft, id, version: "Draft", status: "Draft", updated: "18/09/2026", author: "Demo Author" };
      setDocuments((current) => [...current, newDocument]);
      setSelectedId(id);
      addAudit("Create", `${id} · Draft`);
      setDraft({ title: "", content: "", folder: "Nhân sự", tag: "" });
      setScreen("detail");
    };
    return <Layout role={role} setScreen={setScreen}><PageHeader eyebrow="AUTHOR WORKSPACE" title="Tạo tài liệu" description="Lưu thành Draft trước khi gửi Reviewer. Draft chưa phải version chính thức." /><form className="card form-grid" onSubmit={saveDraft}><div><label htmlFor="document-title">Tên tài liệu</label><input id="document-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></div><div><label htmlFor="document-folder">Folder</label><select id="document-folder" value={draft.folder} onChange={(event) => setDraft({ ...draft, folder: event.target.value })}><option>Nhân sự</option><option>Kho vận</option><option>Quản trị</option><option>Hệ thống</option></select></div><div><label htmlFor="document-tag">Tag</label><input id="document-tag" value={draft.tag} onChange={(event) => setDraft({ ...draft, tag: event.target.value })} placeholder="Ví dụ: Quy trình" required /></div><div className="form-wide"><label htmlFor="document-content">Nội dung</label><textarea id="document-content" rows={8} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} required /></div><div className="actions form-wide"><button className="button primary" type="submit">Lưu Draft</button></div></form></Layout>;
  }

  if (screen === "review") {
    const reviewDocuments = documents.filter((document) => ["Reviewing", "Approved", "Rejected"].includes(document.status));
    return <Layout role={role} setScreen={setScreen}><PageHeader eyebrow="REVIEW WORKSPACE" title="Review queue" description="Reviewer/Admin xử lý đúng trạng thái trước khi Publish." />{reviewDocuments.length === 0 ? <section className="empty-state"><h2>Không có tài liệu chờ Review</h2><p>Queue hiện không có tài liệu Reviewing.</p></section> : <div className="document-list">{reviewDocuments.map((document) => <DocumentCard document={document} key={document.id} onOpen={openDocument} />)}</div>}</Layout>;
  }

  if (screen === "audit") {
    return <Layout role={role} setScreen={setScreen}><PageHeader eyebrow="ADMINISTRATION" title="Audit log" description="Theo dõi Create, Review, Approve, Publish và Ask AI." /><section className="card table-wrap"><table><thead><tr><th>Action</th><th>Object</th><th>Actor</th><th>Result</th></tr></thead><tbody>{auditEvents.map((event) => <tr key={event.id}><td>{event.action}</td><td>{event.object}</td><td>{event.actor}</td><td><span className="badge success">{event.result}</span></td></tr>)}</tbody></table></section></Layout>;
  }

  if (screen === "versions") {
    return <Layout role={role} setScreen={setScreen}><button className="back-button" type="button" onClick={() => setScreen("detail")}>← Quay lại tài liệu</button><PageHeader eyebrow="VERSION HISTORY" title={selectedDocument.title} description="Chỉ version hiện hành được dùng cho Search/Q&A." /><section className="card"><div className="version-row"><strong>{selectedDocument.version}</strong><span className="badge success">Current</span><span>Published · {selectedDocument.updated}</span></div><div className="version-row muted"><strong>Draft</strong><span>Phiên bản đang phát triển được lưu trong workflow.</span></div></section></Layout>;
  }

  if (screen === "detail") {
    const canEdit = role === "Author" && ["Draft", "Rejected"].includes(selectedDocument.status);
    const canReview = (role === "Reviewer" || role === "Admin") && selectedDocument.status === "Reviewing";
    const canPublish = (role === "Reviewer" || role === "Admin") && selectedDocument.status === "Approved";
    return <Layout role={role} setScreen={setScreen}><button className="back-button" type="button" onClick={() => setScreen(role === "Reader" ? "search" : role === "Author" ? "create" : "review")}>← Quay lại</button><div className="page-header"><div><span className={`badge ${statusClass(selectedDocument.status)}`}>{selectedDocument.status}{selectedDocument.status === "Published" ? " · Current" : ""}</span><h1>{selectedDocument.title}</h1><p className="muted">{selectedDocument.id} · {selectedDocument.version} · Cập nhật {selectedDocument.updated} · Người tạo: {selectedDocument.author}</p></div></div><section className="card"><div className="metadata"><div><span>Folder</span><strong>{selectedDocument.folder}</strong></div><div><span>Tag</span><strong>{selectedDocument.tag}</strong></div><div><span>Version</span><strong>{selectedDocument.version}</strong></div><div><span>Quyền truy cập</span><strong>Được phép xem</strong></div></div><hr /><h2>Nội dung tài liệu</h2><p>{selectedDocument.content}</p><p className="muted">{selectedDocument.status === "Published" ? "Đây là version hiện hành được sử dụng cho Search và Q&A." : "Bản này chưa phải version chính thức và chưa được dùng cho Search/Q&A."}</p></section><div className="actions">{canEdit && <button className="button secondary" type="button" onClick={() => { setDraft({ title: selectedDocument.title, content: selectedDocument.content, folder: selectedDocument.folder, tag: selectedDocument.tag }); setScreen("create"); }}>Chỉnh sửa Draft</button>}{canEdit && <button className="button primary" type="button" onClick={() => { updateDocument(selectedDocument.id, { status: "Reviewing" }); addAudit("Review", selectedDocument.id); }}>Gửi Review</button>}{canReview && <><button className="button secondary" type="button" onClick={() => { updateDocument(selectedDocument.id, { status: "Rejected" }); addAudit("Reject", selectedDocument.id); }}>Reject</button><button className="button primary" type="button" onClick={() => { updateDocument(selectedDocument.id, { status: "Approved" }); addAudit("Approve", selectedDocument.id); }}>Approve</button></>}{canPublish && <button className="button primary" type="button" onClick={() => { updateDocument(selectedDocument.id, { status: "Published", version: selectedDocument.version === "Draft" ? "v1.0" : selectedDocument.version, updated: "18/09/2026" }); addAudit("Publish", `${selectedDocument.id} · ${selectedDocument.version}`); }}>Publish</button>}{selectedDocument.status === "Published" && <><button className="button secondary" type="button" onClick={() => setScreen("versions")}>Xem version</button><button className="button primary" type="button" onClick={() => setScreen("ask")}>Hỏi AI về tài liệu này</button></>}</div></Layout>;
  }

  if (screen === "ask") {
    const submitQuestion = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (question.trim()) { addAudit("Ask AI", "Permission-aware knowledge base"); setScreen("answer"); } };
    return <Layout role={role} setScreen={setScreen}><PageHeader eyebrow="KNOWLEDGE ASSISTANT" title="Hỏi AI" description="AI chỉ truy xuất tài liệu Published mà Reader được phép xem." /><form className="card" onSubmit={submitQuestion}><label htmlFor="question">Câu hỏi của bạn</label><textarea id="question" rows={5} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ví dụ: Quy trình nhập kho gồm những bước nào?" required /><div className="notice"><strong>Phạm vi nguồn:</strong> Kho tri thức nội bộ · chỉ tài liệu được cấp quyền</div><button className="button primary" type="submit" disabled={!question.trim()}>Ask AI</button></form></Layout>;
  }

  if (screen === "answer") {
    const hasAnswer = question.toLowerCase().includes("nhập kho") || question.toLowerCase().includes("nhap kho");
    return <Layout role={role} setScreen={setScreen}><PageHeader eyebrow="AI ANSWER" title="Kết quả trả lời" description="Kết quả chỉ dựa trên nguồn nội bộ được phép." /><section className="card"><div className="question-box"><span>Câu hỏi</span><strong>{question}</strong></div><div className="answer-box"><h2>Trả lời</h2><p>{hasAnswer ? initialDocuments[0].content : "Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này."}</p></div>{hasAnswer && <div className="citation"><div><p className="eyebrow">CITATION</p><strong>{initialDocuments[0].title}</strong></div><span>{initialDocuments[0].id} · Version {initialDocuments[0].version} · Current</span></div>}<div className="success-message">{hasAnswer ? "Câu trả lời đã được ghi nhận nguồn tài liệu và phiên bản." : "Câu trả lời không sử dụng nguồn ngoài kho tri thức được cấp quyền."}</div></section><div className="actions"><button className="button secondary" type="button" onClick={() => setScreen("ask")}>Hỏi câu khác</button><button className="button primary" type="button" onClick={() => setScreen("search")}>Về tìm kiếm</button></div></Layout>;
  }

  const filteredDocuments = visibleDocuments.filter((document) => `${document.title} ${document.folder} ${document.tag}`.toLowerCase().includes(query.toLowerCase()));
  return <Layout role={role} setScreen={setScreen}><PageHeader eyebrow="KNOWLEDGE BASE" title="Tìm kiếm tri thức" description="Tìm tài liệu Published trong phạm vi quyền của bạn." /><form className="search-bar" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="search">Tìm tài liệu</label><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên tài liệu, Folder hoặc Tag..." /><button className="button primary" type="submit">Search</button></form>{query && filteredDocuments.length === 0 ? <section className="empty-state"><div className="empty-icon" aria-hidden="true">⌕</div><h2>Không tìm thấy tài liệu</h2><p>Thử từ khóa khác. Kết quả chỉ bao gồm tài liệu bạn được phép truy cập.</p></section> : <div className="result-layout"><section><div className="section-heading"><h2>Kết quả tìm kiếm</h2><span>{filteredDocuments.length} tài liệu</span></div><div className="document-list">{filteredDocuments.map((document) => <DocumentCard document={document} key={document.id} onOpen={openDocument} />)}</div></section><aside className="assistant-card"><p className="eyebrow">AI ASSISTANT</p><h2>Không cần đọc từng tài liệu?</h2><p>Đặt câu hỏi để AI tổng hợp thông tin từ các nguồn bạn được phép truy cập.</p><button className="button primary full" type="button" onClick={() => setScreen("ask")}>Ask AI</button></aside></div>}</Layout>;
}

function statusClass(status: Status) { return status === "Published" || status === "Approved" ? "success" : status === "Rejected" ? "danger" : "warning"; }
function DocumentCard({ document, onOpen }: { document: Document; onOpen: (document: Document) => void }) { return <button className="document-card" type="button" onClick={() => onOpen(document)}><div className="document-icon" aria-hidden="true">DOC</div><div className="document-content"><h3>{document.title}</h3><p>{document.content}</p><div className="document-meta"><span>{document.folder}</span><span>{document.tag}</span><span>{document.version}</span></div></div><span className={`badge ${statusClass(document.status)}`}>{document.status}</span></button>; }
function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div></div>; }
function Layout({ children, role, setScreen }: { children: ReactNode; role: Role; setScreen: (screen: Screen) => void }) { const home = role === "Reader" ? "search" : role === "Author" ? "create" : "review"; return <div className="app"><header className="topbar"><button className="logo-button" type="button" onClick={() => setScreen(home)}><span className="small-logo">K</span><strong>AI KMS</strong></button><nav aria-label="Điều hướng chính"><button type="button" onClick={() => setScreen("search")}>Tìm kiếm</button>{role === "Reader" && <button type="button" onClick={() => setScreen("ask")}>Hỏi AI</button>}{role === "Author" && <button type="button" onClick={() => setScreen("create")}>Tạo tài liệu</button>}{(role === "Reviewer" || role === "Admin") && <button type="button" onClick={() => setScreen("review")}>Review queue</button>}{role === "Admin" && <button type="button" onClick={() => setScreen("audit")}>Audit log</button>}</nav><div className="topbar-actions"><div className="user-chip">{role}</div><button className="logout-button" type="button" onClick={() => setScreen("login")}>Đăng xuất</button></div></header><main className="main">{children}</main></div>; }

export default App;
