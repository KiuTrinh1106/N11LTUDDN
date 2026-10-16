import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
/* =========================================================
   1. TYPES
========================================================= */

type Role = "Reader" | "Author" | "Reviewer" | "Admin";

type DocumentStatus =
  | "Draft"
  | "Reviewing"
  | "Approved"
  | "Rejected"
  | "Published";

type Screen =
  | "dashboard"
  | "knowledge"
  | "create"
  | "detail"
  | "review"
  | "assistant"
  | "versions"
  | "audit"
  | "settings";

type AuditAction = string;

interface DocumentVersion {
  version: string;
  title: string;
  content: string;
  publishedAt: string;
  publishedBy: string;
}

interface DocumentAttachment {
  filename: string;
  mediaType: string;
  createdAt: string;
}

interface KnowledgeDocument {
  id: string;
  reviewId: string | null;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  status: DocumentStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  reviewerComment: string;
  versions: DocumentVersion[];
  attachment: DocumentAttachment | null;
}

interface AuditRecord {
  id: string;
  action: AuditAction;
  actor: string;
  detail: string;
  timestamp: string;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface StoredState {
  documents: KnowledgeDocument[];
  audit: AuditRecord[];
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface ApiUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface ApiVersion {
  version: string;
  title: string;
  content: string;
  publishedAt: string;
  publishedBy?: string;
  publisher?: { displayName: string };
}

interface ApiDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  currentVersion: string;
  reviewerComment: string | null;
  createdAt: string;
  updatedAt: string;
  author: { displayName: string };
  reviewRequests: { id: string }[];
  versions: ApiVersion[];
  attachment: DocumentAttachment | null;
}

interface ApiAuditEvent {
  id: string;
  action: string;
  objectType: string;
  objectId: string;
  result: string;
  occurredAt: string;
  actor: { displayName: string } | null;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("kms-token");
  let response: Response;
  try {
    const headers = new Headers(options.headers);
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("content-type", "application/json");
    }
    if (token) headers.set("authorization", `Bearer ${token}`);
    response = await fetch(path, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Không kết nối được backend. Hãy kiểm tra backend đang chạy tại cổng 3000.");
  }

  if (response.status === 204) return undefined as T;
  const responseText = await response.text();
  let payload: {
    error?: { code?: string; message?: string };
  } = {};
  if (responseText.trim()) {
    try {
      payload = JSON.parse(responseText) as typeof payload;
    } catch {
      throw new Error(
        `Backend trả về dữ liệu không hợp lệ (HTTP ${response.status}). Kiểm tra cấu hình server/API.`,
      );
    }
  }
  if (!response.ok) {
    const message = payload.error?.message
      ?? (responseText.trim()
        ? `Yêu cầu thất bại (HTTP ${response.status}).`
        : `Backend trả về phản hồi rỗng (HTTP ${response.status}). Hãy kiểm tra backend và database.`);
    const error: ApiError = new Error(message);
    error.status = response.status;
    error.code = payload.error?.code;
    throw error;
  }
  if (!responseText.trim()) {
    throw new Error(`Backend trả về phản hồi rỗng (HTTP ${response.status}) cho ${path}.`);
  }
  return payload as T;
}

/* =========================================================
   2. CONSTANTS & HELPERS
========================================================= */

const NAVIGATION: {
  id: Screen;
  label: string;
  icon: string;
  group: string;
  roles?: Role[];
}[] = [
  { id: "dashboard", label: "Tổng quan", icon: "▦", group: "WORKSPACE" },
  { id: "knowledge", label: "Kho tri thức", icon: "▤", group: "WORKSPACE" },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: "✳",
    group: "WORKSPACE",
  },
  {
    id: "create",
    label: "Soạn tài liệu",
    icon: "＋",
    group: "CONTENT",
    roles: ["Author"],
  },
  {
    id: "review",
    label: "Kiểm duyệt",
    icon: "✓",
    group: "CONTENT",
    roles: ["Reviewer", "Admin"],
  },
  {
    id: "versions",
    label: "Phiên bản",
    icon: "◷",
    group: "GOVERNANCE",
    roles: ["Reviewer", "Admin"],
  },
  {
    id: "audit",
    label: "Nhật ký hoạt động",
    icon: "☷",
    group: "GOVERNANCE",
    roles: ["Admin"],
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: "⚙",
    group: "SYSTEM",
    roles: ["Admin"],
  },
];

const formatDate = (value: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const canReview = (role: Role) =>
  role === "Reviewer" || role === "Admin";

const canPublish = (role: Role) =>
  role === "Admin";

const canCreate = (role: Role) => role === "Author";

const canEditDocument = (
  role: Role,
  document: KnowledgeDocument,
  currentUser: string,
) => {
  return (
    role === "Author" &&
    document.author === currentUser &&
    ["Draft", "Rejected"].includes(document.status)
  );
};

const statusLabel: Record<DocumentStatus, string> = {
  Draft: "Bản nháp",
  Reviewing: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Cần chỉnh sửa",
  Published: "Đã xuất bản",
};

const statusClass: Record<DocumentStatus, string> = {
  Draft: "status-draft",
  Reviewing: "status-reviewing",
  Approved: "status-approved",
  Rejected: "status-rejected",
  Published: "status-published",
};

const fromApiDocument = (document: ApiDocument): KnowledgeDocument => ({
  id: document.id,
  reviewId: document.reviewRequests?.[0]?.id ?? null,
  title: document.title,
  description: document.description,
  content: document.content,
  category: document.category,
  tags: document.tags,
  author: document.author.displayName,
  status: statusFromApi(document.status),
  version: document.currentVersion,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
  reviewerComment: document.reviewerComment ?? "",
  attachment: document.attachment ?? null,
  versions: document.versions.map((version) => ({
    version: version.version,
    title: version.title,
    content: version.content,
    publishedAt: version.publishedAt,
    publishedBy: version.publisher?.displayName ?? version.publishedBy ?? "Unknown",
  })),
});

const fromApiAudit = (event: ApiAuditEvent): AuditRecord => ({
  id: event.id,
  action: event.action as AuditAction,
  actor: event.actor?.displayName ?? "System",
  detail: `${event.objectType} ${event.objectId} · ${event.result}`,
  timestamp: event.occurredAt,
});

function statusFromApi(status: string): DocumentStatus {
  switch (status) {
    case "DRAFT": return "Draft";
    case "REVIEWING": return "Reviewing";
    case "APPROVED": return "Approved";
    case "REJECTED": return "Rejected";
    case "PUBLISHED": return "Published";
    default: throw new Error("Server returned an unsupported document status.");
  }
}

const roleFromApi = (role: string): Role => {
  const normalized = role.charAt(0) + role.slice(1).toLowerCase();
  if (normalized === "Reader" || normalized === "Author" || normalized === "Reviewer" || normalized === "Admin") {
    return normalized;
  }
  throw new Error("Server returned an unsupported role.");
};

/* =========================================================
   3. SMALL REUSABLE COMPONENTS
========================================================= */

function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={`status-badge ${statusClass[status]}`}>
      <span className="status-dot" />
      {statusLabel[status]}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">▤</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

/* =========================================================
   4. MAIN APPLICATION
========================================================= */

export default function App() {
  const [storedState, setStoredState] = useState<StoredState>({
    documents: [],
    audit: [],
  });

  const { documents, audit } = storedState;

  const [session, setSession] = useState<UserSession | null>(null);
  const [loginEmail, setLoginEmail] = useState("author@demo.local");
  const [loginPassword, setLoginPassword] = useState("");

  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("Vận hành");
  const [formTags, setFormTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviewComment, setReviewComment] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<{
    text: string;
    sources: { id: string; title: string; version: string }[];
  } | null>(null);

  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentUser = session?.name ?? "";
  const currentRole = session?.role ?? "Reader";

  const selectedDocument = documents.find(
    (document) => document.id === selectedId,
  );

  useEffect(() => {
    const token = sessionStorage.getItem("kms-token");
    if (!token) return;

    let active = true;
    apiRequest<ApiUser>("/api/auth/me")
      .then((user) => {
        if (active) {
          setSession({
            id: user.id,
            name: user.displayName,
            email: user.email,
            role: roleFromApi(user.role),
          });
        }
      })
      .catch((error: ApiError) => {
        sessionStorage.removeItem("kms-token");
        if (error.status !== 401) {
          setToast(error.message || "Không thể khôi phục phiên đăng nhập.");
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!session) return;

    let active = true;
    Promise.all([
      apiRequest<{ items: ApiDocument[] }>("/api/documents"),
      session.role === "Admin"
        ? apiRequest<{ items: ApiAuditEvent[] }>("/api/audit")
        : Promise.resolve({ items: [] as ApiAuditEvent[] }),
    ])
      .then(([documentResult, auditResult]) => {
        if (!active) return;
        setStoredState({
          documents: documentResult.items.map(fromApiDocument),
          audit: auditResult.items.map(fromApiAudit),
        });
      })
      .catch((error: ApiError) => {
        if (active) notify(error.message);
      });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const refreshDocuments = async () => {
    const [result, auditResult] = await Promise.all([
      apiRequest<{ items: ApiDocument[] }>("/api/documents"),
      session?.role === "Admin"
        ? apiRequest<{ items: ApiAuditEvent[] }>("/api/audit")
        : Promise.resolve({ items: [] as ApiAuditEvent[] }),
    ]);
    setStoredState((previous) => ({
      ...previous,
      documents: result.items.map(fromApiDocument),
      ...(session?.role === "Admin" ? { audit: auditResult.items.map(fromApiAudit) } : {}),
    }));
  };

  const goTo = (nextScreen: Screen) => {
    if (nextScreen === "create" && !canCreate(currentRole)) {
      notify("Vai trò hiện tại không có quyền tạo tài liệu.");
      return;
    }

    if (nextScreen === "review" && !canReview(currentRole)) {
      notify("Bạn không có quyền truy cập khu vực kiểm duyệt.");
      return;
    }

    if (nextScreen === "audit" && currentRole !== "Admin") {
      notify("Chỉ Admin mới có quyền xem nhật ký hoạt động.");
      return;
    }

    if (nextScreen === "versions" && currentRole !== "Reviewer" && currentRole !== "Admin") {
      notify("Vai trò hiện tại không có quyền xem lịch sử phiên bản.");
      return;
    }

    if (nextScreen === "settings" && currentRole !== "Admin") {
      notify("Chỉ Admin mới có thể truy cập cài đặt.");
      return;
    }

    setScreen(nextScreen);
    setMobileNavOpen(false);
  };

  const handleLogin = async () => {
    const email = loginEmail.trim();

    if (!email || !email.includes("@")) {
      notify("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    try {
      const result = await apiRequest<{
        accessToken: string;
        user: ApiUser;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: loginPassword }),
      });
      sessionStorage.setItem("kms-token", result.accessToken);
      setStoredState({ documents: [], audit: [] });
      setSession({
        id: result.user.id,
        name: result.user.displayName,
        email: result.user.email,
        role: roleFromApi(result.user.role),
      });
      setScreen("dashboard");
      setLoginPassword("");
      notify(`Đăng nhập thành công với vai trò ${result.user.role}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest<void>("/api/auth/logout", { method: "POST" });
    } catch (error) {
      notify(`Đăng xuất phía máy chủ thất bại: ${error instanceof Error ? error.message : "lỗi không xác định"}`);
    }
    sessionStorage.removeItem("kms-token");
    setSession(null);
    setStoredState({ documents: [], audit: [] });
    setScreen("dashboard");
    setSelectedId(null);
    setEditingId(null);
  };

  const visibleDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");

    return documents.filter((document) => {
      // Reader chỉ được tra cứu tài liệu Published trong bản demo.
      if (
        currentRole === "Reader" &&
        document.status !== "Published"
      ) {
        return false;
      }

      const matchesSearch =
        !normalizedSearch ||
        [
          document.id,
          document.title,
          document.description,
          document.content,
          document.category,
          document.author,
          ...document.tags,
        ]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || document.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        document.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [documents, search, statusFilter, categoryFilter, currentRole]);

  const categories = useMemo(
    () => [...new Set(documents.map((document) => document.category))],
    [documents],
  );

  const stats = useMemo(
    () => ({
      total: documents.length,
      published: documents.filter(
        (document) => document.status === "Published",
      ).length,
      pending: documents.filter(
        (document) => document.status === "Reviewing",
      ).length,
      approved: documents.filter(
        (document) => document.status === "Approved",
      ).length,
    }),
    [documents],
  );

  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormCategory("Vận hành");
    setFormTags("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setReviewComment("");
  };

  const startCreate = () => {
    if (!canCreate(currentRole)) {
      notify("Bạn không có quyền tạo tài liệu.");
      return;
    }

    resetForm();
    goTo("create");
  };

  const startEdit = (document: KnowledgeDocument) => {
    if (!canEditDocument(currentRole, document, currentUser)) {
      notify("Bạn không có quyền chỉnh sửa tài liệu này.");
      return;
    }

    setEditingId(document.id);
    setFormTitle(document.title);
    setFormDescription(document.description);
    setFormContent(document.content);
    setFormCategory(document.category);
    setFormTags(document.tags.join(", "));
    setSelectedFile(null);
    setReviewComment(document.reviewerComment);
    setScreen("create");
  };

  const saveDraft = async () => {
    if (!canCreate(currentRole)) {
      notify("Bạn không có quyền tạo hoặc chỉnh sửa tài liệu.");
      return;
    }

    if (!formTitle.trim() || (!selectedFile && !formContent.trim())) {
      notify("Vui lòng nhập tiêu đề và nội dung hoặc chọn tệp tài liệu.");
      return;
    }

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      content: formContent.trim(),
      category: formCategory,
      tags: formTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    };
    try {
      if (editingId) {
        await apiRequest(`/api/documents/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        notify("Đã cập nhật bản nháp.");
      } else if (selectedFile) {
        const upload = new FormData();
        upload.append("file", selectedFile);
        upload.append("title", payload.title);
        upload.append("description", payload.description);
        upload.append("category", payload.category);
        upload.append("tags", payload.tags.join(","));
        await apiRequest("/api/documents/upload", {
          method: "POST",
          body: upload,
        });
        notify("Đã tạo bản nháp và lưu tệp đính kèm.");
      } else {
        await apiRequest("/api/documents", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("Đã tạo bản nháp mới.");
      }
      await refreshDocuments();
      resetForm();
      setScreen("knowledge");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể lưu tài liệu.");
    }
  };

  const downloadAttachment = async (document: KnowledgeDocument) => {
    const token = sessionStorage.getItem("kms-token");
    try {
      const response = await fetch(
        `/api/documents/${encodeURIComponent(document.id)}/attachment`,
        { headers: token ? { authorization: `Bearer ${token}` } : {} },
      );
      if (!response.ok) {
        let message = `Không thể tải tệp (HTTP ${response.status}).`;
        try {
          const payload = await response.json() as { error?: { message?: string } };
          message = payload.error?.message ?? message;
        } catch {
          throw new Error(message);
        }
        throw new Error(message);
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = document.attachment?.filename ?? "attachment";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể tải tệp.");
    }
  };

  const submitForReview = async (document: KnowledgeDocument) => {
    try {
      await apiRequest(`/api/documents/${encodeURIComponent(document.id)}/review`, {
        method: "POST",
      });
      await refreshDocuments();
      notify("Đã gửi tài liệu vào hàng đợi kiểm duyệt.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể gửi duyệt.");
    }
  };

  const decideReview = async (document: KnowledgeDocument, decision: "approve" | "reject") => {
    if (!document.reviewId) {
      notify("Không tìm thấy yêu cầu duyệt đang chờ cho tài liệu này.");
      return;
    }
    if (decision === "reject" && !reviewComment.trim()) {
      notify("Vui lòng ghi rõ lý do yêu cầu chỉnh sửa.");
      return;
    }
    try {
      await apiRequest(`/api/reviews/${encodeURIComponent(document.reviewId)}/${decision}`, {
        method: "POST",
        body: JSON.stringify(decision === "reject" ? { reason: reviewComment.trim() } : {}),
      });
      await refreshDocuments();
      setReviewComment("");
      notify(decision === "approve" ? "Đã phê duyệt. Tài liệu chờ Admin xuất bản." : "Đã gửi yêu cầu chỉnh sửa cho tác giả.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể xử lý yêu cầu duyệt.");
    }
  };

  const approveDocument = (document: KnowledgeDocument) => decideReview(document, "approve");

  const rejectDocument = (document: KnowledgeDocument) => decideReview(document, "reject");

  const publishDocument = async (document: KnowledgeDocument) => {
    if (!canPublish(currentRole)) {
      notify("Chỉ Admin mới có quyền xuất bản.");
      return;
    }
    try {
      await apiRequest(`/api/documents/${encodeURIComponent(document.id)}/publish`, {
        method: "POST",
      });
      await refreshDocuments();
      notify("Đã xuất bản tài liệu.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể xuất bản tài liệu.");
    }
  };

  const openDocument = (document: KnowledgeDocument) => {
    if (
      currentRole === "Reader" &&
      document.status !== "Published"
    ) {
      notify("Reader chỉ được xem tài liệu đã xuất bản.");
      return;
    }

    setSelectedId(document.id);
    setScreen("detail");
  };

  const askAssistant = async () => {
    const question = aiQuestion.trim();

    if (!question) {
      notify("Vui lòng nhập câu hỏi.");
      return;
    }
    try {
      const result = await apiRequest<{
        answer: string;
        sources: { id: string; title: string; version: string }[];
      }>("/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setAiAnswer({ text: result.answer, sources: result.sources });
      if (currentRole === "Admin") {
        const auditResult = await apiRequest<{ items: ApiAuditEvent[] }>("/api/audit");
        setStoredState((previous) => ({
          ...previous,
          audit: auditResult.items.map(fromApiAudit),
        }));
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể tra cứu tài liệu.");
    }
  };

  /* =======================================================
     5. LOGIN SCREEN
  ======================================================= */

  if (!session) {
    return (
      <div className="login-layout">
        <div className="login-brand-panel">
          <div className="brand-lockup">
            <div className="brand-logo">K</div>
            <div>
              <div className="brand-name">Knowbase</div>
              <div className="brand-subtitle">AI KNOWLEDGE PLATFORM</div>
            </div>
          </div>

          <div className="login-hero">
            <div className="eyebrow">KNOWLEDGE. CONNECTED.</div>
            <h1>
              Tri thức được tổ chức.
              <br />
              Quy trình được kiểm soát.
            </h1>
            <p>
              Một không gian tập trung để quản lý tài liệu, kiểm soát
              phiên bản và tra cứu tri thức theo nguồn.
            </p>
          </div>

          <div className="login-benefits">
            <div><span>✓</span> Quản lý vòng đời tài liệu</div>
            <div><span>✓</span> Kiểm duyệt và phân quyền theo vai trò</div>
            <div><span>✓</span> Tra cứu có nguồn tham chiếu</div>
          </div>

          <div className="login-footer">
            Enterprise Knowledge Management · Demo environment
          </div>
        </div>

        <div className="login-form-panel">
          <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            <div className="mobile-brand brand-lockup">
              <div className="brand-logo">K</div>
              <div>
                <div className="brand-name">Knowbase</div>
                <div className="brand-subtitle">AI KNOWLEDGE PLATFORM</div>
              </div>
            </div>

            <div className="eyebrow">WELCOME BACK</div>
            <h2>Đăng nhập hệ thống</h2>
            <p className="muted">
              Đăng nhập demo để khám phá các chức năng theo vai trò.
            </p>

            <label className="field-label">Email công việc</label>
            <input
              className="form-input"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="name@company.com"
              autoComplete="username"
              required
            />

            <label className="field-label">Mật khẩu</label>
            <input
              className="form-input"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <div className="demo-notice">
              <strong>Đăng nhập được xác thực</strong>
              <p>
                Vai trò được lấy từ tài khoản trên máy chủ, không thể tự chọn
                hoặc giả mạo từ giao diện.
              </p>
              <p>
                Tài khoản demo: reader@demo.local, author@demo.local,
                reviewer@demo.local, admin@demo.local. Mật khẩu do người chạy
                seed đặt qua DEMO_PASSWORD.
              </p>
            </div>

            <button className="primary-button full-width" type="submit">
              Đăng nhập <span>→</span>
            </button>

            <p className="login-terms">
              Bản demo học tập · Không sử dụng dữ liệu nhạy cảm
            </p>
          </form>
        </div>

        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  /* =======================================================
     6. PAGE CONTENT
  ======================================================= */

  const pageTitle: Record<Screen, string> = {
    dashboard: "Tổng quan",
    knowledge: "Kho tri thức",
    create: editingId ? "Chỉnh sửa tài liệu" : "Soạn tài liệu",
    detail: "Chi tiết tài liệu",
    review: "Kiểm duyệt tài liệu",
    assistant: "AI Assistant",
    versions: "Quản lý phiên bản",
    audit: "Nhật ký hoạt động",
    settings: "Cài đặt hệ thống",
  };

  const pageSubtitle: Record<Screen, string> = {
    dashboard: "Theo dõi tình trạng tri thức và quy trình xử lý.",
    knowledge: "Tìm kiếm, phân loại và quản lý tài liệu trong hệ thống.",
    create: "Soạn thảo nội dung và chuẩn bị tài liệu cho quy trình kiểm duyệt.",
    detail: "Thông tin, trạng thái và lịch sử của tài liệu.",
    review: "Đánh giá nội dung trước khi phê duyệt và xuất bản.",
    assistant: "Tra cứu nội dung từ nguồn tri thức đã xuất bản.",
    versions: "Theo dõi các phiên bản đã được xuất bản.",
    audit: "Theo dõi các thao tác quan trọng trong bản demo.",
    settings: "Quản lý dữ liệu demo và thông tin môi trường.",
  };

  const currentNav = NAVIGATION.find((item) => item.id === screen);

  return (
    <div className="app-shell">
      {mobileNavOpen && (
        <button
          className="mobile-overlay"
          aria-label="Đóng menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">K</div>
          <div>
            <div className="brand-name">Knowbase</div>
            <div className="brand-subtitle">KNOWLEDGE PLATFORM</div>
          </div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">AC</div>
          <div className="workspace-info">
            <strong>Acme Workspace</strong>
            <span>Knowledge team</span>
          </div>
          <span className="workspace-chevron">⌄</span>
        </div>

        <nav className="sidebar-navigation">
          {["WORKSPACE", "CONTENT", "GOVERNANCE", "SYSTEM"].map(
            (group) => {
              const items = NAVIGATION.filter(
                (item) =>
                  item.group === group &&
                  (!item.roles || item.roles.includes(currentRole)),
              );

              if (items.length === 0) return null;

              return (
                <div className="nav-group" key={group}>
                  <div className="nav-group-label">{group}</div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-item ${
                        screen === item.id ||
                        (screen === "detail" && item.id === "knowledge")
                          ? "nav-item-active"
                          : ""
                      }`}
                      onClick={() => goTo(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.id === "review" && stats.pending > 0 && (
                        <span className="nav-count">{stats.pending}</span>
                      )}
                    </button>
                  ))}
                </div>
              );
            },
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="storage-card">
            <div className="storage-card-top">
              <span>Không gian tri thức</span>
              <span className="storage-indicator" />
            </div>
            <strong>{documents.length} tài liệu</strong>
            <div className="storage-progress">
              <span style={{ width: `${Math.min(documents.length * 5, 100)}%` }} />
            </div>
            <small>Dữ liệu lưu trên máy chủ</small>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">
              {currentUser.slice(0, 1).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <strong>{currentUser}</strong>
              <span>{currentRole}</span>
            </div>
            <button
              className="icon-button logout-button"
              title="Đăng xuất"
              onClick={handleLogout}
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Mở menu"
            >
              ☰
            </button>
            <div className="breadcrumb">
              <span>Knowbase</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{currentNav?.label ?? pageTitle[screen]}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="environment-chip">
              <span className="environment-dot" />
              Demo environment
            </div>
            <button
              className="topbar-avatar"
              title={`${currentUser} · ${currentRole}`}
              onClick={() => goTo("dashboard")}
            >
              {currentUser.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="page-container">
          <div className="page-heading">
            <div>
              <div className="page-kicker">KNOWLEDGE MANAGEMENT</div>
              <h1>{pageTitle[screen]}</h1>
              <p>{pageSubtitle[screen]}</p>
            </div>

            <div className="page-heading-actions">
              {canCreate(currentRole) && screen !== "create" && (
                <button className="primary-button" onClick={startCreate}>
                  <span>＋</span> Tạo tài liệu
                </button>
              )}
            </div>
          </div>

          {/* DASHBOARD */}
          {screen === "dashboard" && (
            <>
              <div className="welcome-banner">
                <div className="welcome-banner-content">
                  <div className="welcome-eyebrow">YOUR KNOWLEDGE WORKSPACE</div>
                  <h2>Xin chào, {currentUser.split(" ")[0]} 👋</h2>
                  <p>
                    Tổ chức tri thức hiệu quả hơn với tài liệu tập trung,
                    quy trình rõ ràng và thông tin có thể truy xuất.
                  </p>
                  <button
                    className="banner-button"
                    onClick={() => goTo("knowledge")}
                  >
                    Khám phá kho tri thức <span>→</span>
                  </button>
                </div>
                <div className="welcome-decoration" aria-hidden="true">
                  <div className="decoration-orbit orbit-one" />
                  <div className="decoration-orbit orbit-two" />
                  <div className="decoration-core">K</div>
                  <div className="decoration-node node-one">▤</div>
                  <div className="decoration-node node-two">✳</div>
                  <div className="decoration-node node-three">✓</div>
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Chỉ số tổng quan</h2>
                  <p>Tình hình tài liệu trong không gian làm việc.</p>
                </div>
                <span className="updated-label">
                  <span className="status-dot status-dot-green" />
                  Dữ liệu hiện tại
                </span>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Tổng tài liệu</span>
                    <span className="stat-icon icon-blue">▤</span>
                  </div>
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-footnote">Tất cả trạng thái</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Đã xuất bản</span>
                    <span className="stat-icon icon-green">✓</span>
                  </div>
                  <div className="stat-number">{stats.published}</div>
                  <div className="stat-footnote">Có thể tra cứu theo quyền</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Chờ kiểm duyệt</span>
                    <span className="stat-icon icon-amber">◷</span>
                  </div>
                  <div className="stat-number">{stats.pending}</div>
                  <div className="stat-footnote">Cần Reviewer xử lý</div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Đã phê duyệt</span>
                    <span className="stat-icon icon-purple">◎</span>
                  </div>
                  <div className="stat-number">{stats.approved}</div>
                  <div className="stat-footnote">Chờ xuất bản chính thức</div>
                </div>
              </div>

              <div className="dashboard-grid">
                <section className="panel recent-panel">
                  <div className="panel-header">
                    <div>
                      <h2>Tài liệu gần đây</h2>
                      <p>Các tài liệu được cập nhật gần đây.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => goTo("knowledge")}
                    >
                      Xem tất cả →
                    </button>
                  </div>

                  <div className="document-list">
                    {documents
                      .filter(
                        (document) =>
                          currentRole !== "Reader" ||
                          document.status === "Published",
                      )
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime(),
                      )
                      .slice(0, 4)
                      .map((document) => (
                        <button
                          className="document-list-item"
                          key={document.id}
                          onClick={() => openDocument(document)}
                        >
                          <div className="document-file-icon">▤</div>
                          <div className="document-list-main">
                            <strong>{document.title}</strong>
                            <span>
                              {document.id} · {document.category}
                            </span>
                          </div>
                          <div className="document-list-meta">
                            <StatusBadge status={document.status} />
                            <span>{formatDate(document.updatedAt)}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </section>
              </div>

              <div className="info-banner">
                <div className="info-banner-icon">i</div>
                <div>
                  <strong>Nguyên tắc quản trị tri thức</strong>
                  <p>
                    Chỉ tài liệu đã xuất bản mới xuất hiện trong kết quả tra
                    cứu thông thường và nguồn tham chiếu của AI Assistant.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* KNOWLEDGE BASE */}
          {screen === "knowledge" && (
            <section className="panel">
              <div className="panel-header knowledge-panel-header">
                <div>
                  <h2>Danh mục tài liệu</h2>
                  <p>
                    {visibleDocuments.length} kết quả phù hợp với bộ lọc hiện tại.
                  </p>
                </div>
                <span className="count-chip">{visibleDocuments.length} tài liệu</span>
              </div>

              <div className="filter-toolbar">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm theo tiêu đề, nội dung, thẻ..."
                    aria-label="Tìm kiếm tài liệu"
                  />
                  {search && (
                    <button
                      className="clear-search"
                      onClick={() => setSearch("")}
                      aria-label="Xóa tìm kiếm"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="All">Tất cả trạng thái</option>
                  {Object.entries(statusLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Lọc theo danh mục"
                >
                  <option value="All">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {visibleDocuments.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy tài liệu"
                  description="Thử đổi từ khóa hoặc điều chỉnh bộ lọc."
                />
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>TÀI LIỆU</th>
                        <th>DANH MỤC</th>
                        <th>TÁC GIẢ</th>
                        <th>PHIÊN BẢN</th>
                        <th>TRẠNG THÁI</th>
                        <th>CẬP NHẬT</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDocuments.map((document) => (
                        <tr key={document.id}>
                          <td>
                            <button
                              className="table-document-title"
                              onClick={() => openDocument(document)}
                            >
                              <span className="table-file-icon">▤</span>
                              <span>
                                <strong>{document.title}</strong>
                                <small>{document.id}</small>
                              </span>
                            </button>
                            {document.tags.length > 0 && (
                              <div className="tag-row">
                                {document.tags.slice(0, 3).map((tag) => (
                                  <span className="tag-chip" key={tag}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>{document.category}</td>
                          <td>{document.author}</td>
                          <td>
                            <span className="version-label">
                              {document.version}
                            </span>
                          </td>
                          <td><StatusBadge status={document.status} /></td>
                          <td className="date-cell">
                            {formatDate(document.updatedAt)}
                          </td>
                          <td>
                            <button
                              className="row-action-button"
                              onClick={() => openDocument(document)}
                              aria-label={`Mở ${document.title}`}
                            >
                              →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* CREATE / EDIT */}
          {screen === "create" && (
            <section className="panel editor-panel">
              <div className="editor-top">
                <div>
                  <div className="editor-status">
                    <span className="status-dot status-dot-blue" />
                    {editingId ? `Đang chỉnh sửa ${editingId}` : "Tài liệu mới"}
                  </div>
                  <h2>Thông tin tài liệu</h2>
                  <p>
                    Nội dung sẽ được lưu thành bản nháp trước khi gửi kiểm duyệt.
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => {
                    resetForm();
                    goTo("knowledge");
                  }}
                >
                  Hủy
                </button>
              </div>

              <div className="form-grid">
                <div className="form-field form-field-full">
                  <label className="field-label">Tiêu đề tài liệu *</label>
                  <input
                    className="form-input"
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                    placeholder="Ví dụ: Quy trình tiếp nhận hàng hóa"
                    maxLength={200}
                  />
                </div>

                <div className="form-field form-field-full">
                  <label className="field-label">Mô tả ngắn</label>
                  <textarea
                    className="form-input form-textarea-small"
                    value={formDescription}
                    onChange={(event) =>
                      setFormDescription(event.target.value)
                    }
                    placeholder="Mô tả mục đích và phạm vi tài liệu..."
                    rows={2}
                    maxLength={500}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Danh mục *</label>
                  <select
                    className="form-input"
                    value={formCategory}
                    onChange={(event) => setFormCategory(event.target.value)}
                  >
                    {[...new Set([...categories, "Vận hành", "Quản trị", "Hướng dẫn", "Nhân sự"])].map(
                      (category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Thẻ (phân cách bằng dấu phẩy)</label>
                  <input
                    className="form-input"
                    value={formTags}
                    onChange={(event) => setFormTags(event.target.value)}
                    placeholder="quy trình, vận hành, hướng dẫn"
                  />
                </div>

                {!editingId && (
                  <div className="form-field form-field-full">
                    <label className="field-label" htmlFor="document-file">
                      Tải tệp tài liệu (PDF, DOCX, TXT)
                    </label>
                    <input
                      ref={fileInputRef}
                      id="document-file"
                      className="form-input"
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        if (file && file.size > 10 * 1024 * 1024) {
                          event.target.value = "";
                          setSelectedFile(null);
                          notify("Tệp tải lên không được vượt quá 10 MB.");
                          return;
                        }
                        setSelectedFile(file);
                      }}
                    />
                    <div className="field-helper upload-helper">
                      {selectedFile
                        ? `${selectedFile.name} · Nội dung sẽ được trích xuất khi lưu`
                        : "Tối đa 10 MB. Bản gốc được lưu cùng tài liệu; PDF scan chưa hỗ trợ OCR."}
                    </div>
                  </div>
                )}

                <div className="form-field form-field-full">
                  <label className="field-label">Nội dung tài liệu *</label>
                  <textarea
                    className="form-input form-textarea"
                    value={formContent}
                    onChange={(event) => setFormContent(event.target.value)}
                    placeholder="Nhập nội dung chi tiết của tài liệu..."
                    rows={14}
                    disabled={Boolean(selectedFile)}
                  />
                  <div className="field-helper">
                    {selectedFile
                      ? "Nội dung sẽ được lấy từ tệp đã chọn khi lưu."
                      : `${formContent.length} ký tự · Nội dung dạng văn bản`}
                  </div>
                </div>
              </div>

              <div className="editor-footer">
                <p>
                  <span className="status-dot status-dot-amber" />
                  Lưu bản nháp chưa làm tài liệu xuất hiện với Reader.
                </p>
                <div className="editor-actions">
                  <button
                    className="secondary-button"
                    onClick={() => {
                      resetForm();
                      goTo("knowledge");
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button className="primary-button" onClick={saveDraft}>
                    Lưu bản nháp
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* DOCUMENT DETAIL */}
          {screen === "detail" && (
            <>
              {!selectedDocument ? (
                <EmptyState
                  title="Không tìm thấy tài liệu"
                  description="Tài liệu có thể đã bị thay đổi hoặc không còn tồn tại."
                />
              ) : (
                <div className="detail-layout">
                  <section className="panel detail-main">
                    <div className="detail-toolbar">
                      <button
                        className="text-button"
                        onClick={() => goTo("knowledge")}
                      >
                        ← Quay lại kho tri thức
                      </button>
                      <StatusBadge status={selectedDocument.status} />
                    </div>

                    <div className="detail-title-block">
                      <div className="detail-file-icon">▤</div>
                      <div>
                        <div className="detail-id">{selectedDocument.id}</div>
                        <h2>{selectedDocument.title}</h2>
                        <p>{selectedDocument.description || "Chưa có mô tả."}</p>
                      </div>
                    </div>

                    <div className="detail-meta-grid">
                      <div>
                        <span>Người tạo</span>
                        <strong>{selectedDocument.author}</strong>
                      </div>
                      <div>
                        <span>Danh mục</span>
                        <strong>{selectedDocument.category}</strong>
                      </div>
                      <div>
                        <span>Phiên bản hiện tại</span>
                        <strong>{selectedDocument.version}</strong>
                      </div>
                      <div>
                        <span>Cập nhật lần cuối</span>
                        <strong>{formatDate(selectedDocument.updatedAt)}</strong>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Nội dung tài liệu</h3>
                      <div className="document-content">
                        {selectedDocument.content}
                      </div>
                    </div>

                    {selectedDocument.attachment && (
                      <div className="detail-section">
                        <h3>Tệp gốc</h3>
                        <button
                          className="secondary-button"
                          onClick={() => void downloadAttachment(selectedDocument)}
                        >
                          Tải xuống {selectedDocument.attachment.filename}
                        </button>
                      </div>
                    )}

                    {selectedDocument.tags.length > 0 && (
                      <div className="detail-section">
                        <h3>Thẻ</h3>
                        <div className="tag-row">
                          {selectedDocument.tags.map((tag) => (
                            <span className="tag-chip" key={tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDocument.reviewerComment && (
                      <div className="reviewer-comment">
                        <strong>Ý kiến kiểm duyệt</strong>
                        <p>{selectedDocument.reviewerComment}</p>
                      </div>
                    )}

                    <div className="detail-actions">
                      {canEditDocument(
                        currentRole,
                        selectedDocument,
                        currentUser,
                      ) && (
                        <button
                          className="secondary-button"
                          onClick={() => startEdit(selectedDocument)}
                        >
                          Chỉnh sửa
                        </button>
                      )}

                      {(selectedDocument.status === "Draft" ||
                        selectedDocument.status === "Rejected") &&
                        (currentRole === "Admin" ||
                          (currentRole === "Author" &&
                            selectedDocument.author === currentUser)) && (
                          <button
                            className="primary-button"
                            onClick={() => submitForReview(selectedDocument)}
                          >
                            Gửi kiểm duyệt →
                          </button>
                        )}

                      {canPublish(currentRole) &&
                        selectedDocument.status === "Approved" && (
                          <button
                            className="primary-button"
                            onClick={() => publishDocument(selectedDocument)}
                          >
                            Xuất bản tài liệu
                          </button>
                        )}
                    </div>
                  </section>

                  <aside className="panel detail-side">
                    <div className="panel-header">
                      <div>
                        <h2>Thông tin quản trị</h2>
                        <p>Trạng thái và lịch sử tài liệu.</p>
                      </div>
                    </div>

                    <div className="detail-side-section">
                      <span className="side-label">TRẠNG THÁI</span>
                      <StatusBadge status={selectedDocument.status} />
                    </div>

                    <div className="detail-side-section">
                      <span className="side-label">NGƯỜI PHỤ TRÁCH</span>
                      <div className="person-row">
                        <div className="user-avatar">
                          {selectedDocument.author.slice(0, 1)}
                        </div>
                        <div>
                          <strong>{selectedDocument.author}</strong>
                          <span>Tác giả</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-side-section">
                      <span className="side-label">PHIÊN BẢN ĐÃ XUẤT BẢN</span>
                      <strong>{selectedDocument.versions.length}</strong>
                    </div>

                    <button
                      className="secondary-button full-width"
                      onClick={() => goTo("versions")}
                    >
                      Xem lịch sử phiên bản
                    </button>
                  </aside>
                </div>
              )}
            </>
          )}

          {/* REVIEW */}
          {screen === "review" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Hàng đợi kiểm duyệt</h2>
                  <p>
                    Chỉ Reviewer và Admin mới có quyền phê duyệt hoặc từ chối.
                  </p>
                </div>
                <span className="count-chip">
                  {documents.filter((item) => item.status === "Reviewing").length} chờ duyệt
                </span>
              </div>

              <div className="review-queue">
                {documents
                  .filter((document) =>
                    ["Reviewing", "Approved", "Rejected"].includes(
                      document.status,
                    ),
                  )
                  .map((document) => (
                    <div className="review-card" key={document.id}>
                      <div className="review-card-header">
                        <div className="document-file-icon">▤</div>
                        <div className="review-card-title">
                          <strong>{document.title}</strong>
                          <span>
                            {document.id} · {document.author} · {document.category}
                          </span>
                        </div>
                        <StatusBadge status={document.status} />
                      </div>

                      <p className="review-description">
                        {document.description || "Chưa có mô tả."}
                      </p>

                      {document.reviewerComment && (
                        <div className="reviewer-comment">
                          <strong>Ý kiến trước đó</strong>
                          <p>{document.reviewerComment}</p>
                        </div>
                      )}

                      {document.status === "Reviewing" && (
                        <div className="review-comment-field">
                          <label className="field-label">
                            Nhận xét kiểm duyệt
                          </label>
                          <textarea
                            className="form-input form-textarea-small"
                            value={selectedId === document.id ? reviewComment : ""}
                            onFocus={() => setSelectedId(document.id)}
                            onChange={(event) => {
                              setSelectedId(document.id);
                              setReviewComment(event.target.value);
                            }}
                            placeholder="Nhập lý do nếu cần yêu cầu chỉnh sửa..."
                            rows={2}
                          />
                        </div>
                      )}

                      <div className="review-card-footer">
                        <button
                          className="secondary-button"
                          onClick={() => openDocument(document)}
                        >
                          Xem nội dung
                        </button>

                        {document.status === "Reviewing" && (
                          <>
                            <button
                              className="danger-outline-button"
                              onClick={() => {
                                setSelectedId(document.id);
                                rejectDocument(document);
                              }}
                            >
                              Yêu cầu chỉnh sửa
                            </button>
                            <button
                              className="primary-button"
                              onClick={() => {
                                setSelectedId(document.id);
                                approveDocument(document);
                              }}
                            >
                              Phê duyệt
                            </button>
                          </>
                        )}

                        {document.status === "Approved" && canPublish(currentRole) && (
                          <button
                            className="primary-button"
                            onClick={() => publishDocument(document)}
                          >
                            Xuất bản
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                {documents.filter((document) =>
                  ["Reviewing", "Approved", "Rejected"].includes(
                    document.status,
                  ),
                ).length === 0 && (
                  <EmptyState
                    title="Hàng đợi đang trống"
                    description="Chưa có tài liệu cần kiểm duyệt hoặc xuất bản."
                  />
                )}
              </div>
            </section>
          )}

          {/* AI ASSISTANT */}
          {screen === "assistant" && (
            <div className="assistant-layout">
              <section className="panel assistant-panel">
                <div className="assistant-heading">
                  <div className="assistant-mark">✳</div>
                  <div>
                    <h2>Hỏi đáp từ kho tri thức</h2>
                    <p>
                      Tìm kiếm thông tin từ các tài liệu đã xuất bản.
                    </p>
                  </div>
                </div>

                <div className="assistant-disclaimer">
                  <span>ⓘ</span>
                  <p>
                    Bản hiện tại dùng tìm kiếm từ khóa. Hệ thống không tự
                    suy diễn câu trả lời và không truy cập Internet.
                  </p>
                </div>

                <label className="field-label">Câu hỏi của bạn</label>
                <textarea
                  className="form-input assistant-question"
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  placeholder="Ví dụ: Quy trình tiếp nhận hàng hóa nhập kho gồm những bước nào?"
                  rows={4}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      askAssistant();
                    }
                  }}
                />

                <div className="assistant-form-footer">
                  <button className="primary-button" onClick={askAssistant}>
                    Tìm trong tri thức <span>→</span>
                  </button>
                </div>

                {!aiAnswer && (
                  <div className="suggested-questions">
                    <div className="field-label">Gợi ý câu hỏi</div>
                    {[
                      "Quy trình nhập kho gồm những bước nào?",
                      "Ai có quyền xuất bản tài liệu?",
                      "Làm thế nào để sử dụng kho tri thức?",
                    ].map((question) => (
                      <button
                        className="suggestion-chip"
                        key={question}
                        onClick={() => setAiQuestion(question)}
                      >
                        {question} <span>↗</span>
                      </button>
                    ))}
                  </div>
                )}

                {aiAnswer && (
                  <div className="assistant-answer">
                    <div className="answer-title">
                      <span className="assistant-mark small-mark">✳</span>
                      <strong>Kết quả tra cứu</strong>
                    </div>
                    <p>{aiAnswer.text}</p>

                    <div className="source-heading">
                      Nguồn tham chiếu ({aiAnswer.sources.length})
                    </div>

                    {aiAnswer.sources.map((source) => (
                      <button
                        className="source-card"
                        key={source.id}
                        onClick={() => {
                          const document = documents.find(
                            (item) => item.id === source.id,
                          );
                          if (document) openDocument(document);
                        }}
                      >
                        <span className="source-icon">▤</span>
                        <span>
                          <strong>{source.title}</strong>
                          <small>{source.id} · {source.version}</small>
                        </span>
                        <span className="source-arrow">↗</span>
                      </button>
                    ))}

                    {aiAnswer.sources.length === 0 && (
                      <p className="muted">
                        Không có nguồn phù hợp để trích dẫn.
                      </p>
                    )}
                  </div>
                )}
              </section>

              <aside className="assistant-side">
                <section className="panel assistant-side-panel">
                  <div className="assistant-side-icon">▤</div>
                  <h3>Phạm vi tri thức</h3>
                  <p>
                    Chỉ sử dụng nội dung tài liệu có trạng thái Published.
                  </p>
                  <div className="assistant-metric">
                    <span>Tài liệu đã xuất bản</span>
                    <strong>{stats.published}</strong>
                  </div>
                </section>

                <section className="panel assistant-side-panel">
                  <h3>Nguyên tắc sử dụng</h3>
                  <ul className="principle-list">
                    <li>Kiểm tra nguồn trước khi sử dụng thông tin.</li>
                    <li>Thử từ khóa cụ thể nếu chưa tìm thấy kết quả.</li>
                    <li>Nội dung không có trong nguồn sẽ không được xác nhận.</li>
                  </ul>
                </section>
              </aside>
            </div>
          )}

          {/* VERSION HISTORY */}
          {screen === "versions" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Lịch sử phiên bản</h2>
                  <p>
                    Chỉ các phiên bản đã xuất bản được ghi nhận trong lịch sử.
                  </p>
                </div>
              </div>

              <div className="version-document-list">
                {documents.flatMap((document) =>
                  document.versions.map((version) => ({
                    document,
                    version,
                  })),
                ).length === 0 ? (
                  <EmptyState
                    title="Chưa có lịch sử phiên bản"
                    description="Phiên bản sẽ xuất hiện sau khi tài liệu được xuất bản."
                  />
                ) : (
                  documents.flatMap((document) =>
                    document.versions.map((version) => ({
                      document,
                      version,
                    })),
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.version.publishedAt).getTime() -
                      new Date(a.version.publishedAt).getTime(),
                  )
                  .map(({ document, version }) => (
                    <div
                      className="version-row"
                      key={`${document.id}-${version.version}`}
                    >
                      <div className="version-file-icon">▤</div>
                      <div className="version-row-main">
                        <strong>{version.title}</strong>
                        <span>
                          {document.id} · Xuất bản bởi {version.publishedBy}
                        </span>
                      </div>
                      <span className="version-label">{version.version}</span>
                      <div className="version-date">
                        {formatDate(version.publishedAt)}
                      </div>
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setSelectedId(document.id);
                          setScreen("detail");
                        }}
                      >
                        Xem tài liệu
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* AUDIT */}
          {screen === "audit" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Nhật ký hệ thống</h2>
                  <p>
                    Ghi nhận các thao tác chính được thực hiện trong bản demo.
                  </p>
                </div>
                <span className="count-chip">{audit.length} sự kiện</span>
              </div>

              <div className="table-scroll">
                <table className="data-table audit-table">
                  <thead>
                    <tr>
                      <th>HÀNH ĐỘNG</th>
                      <th>NGƯỜI THỰC HIỆN</th>
                      <th>CHI TIẾT</th>
                      <th>THỜI GIAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <span className="audit-action">
                            {record.action.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>{record.actor}</td>
                        <td>{record.detail}</td>
                        <td className="date-cell">
                          {formatDate(record.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {audit.length === 0 && (
                  <EmptyState
                    title="Chưa có sự kiện"
                    description="Các thao tác hệ thống sẽ được ghi nhận tại đây."
                  />
                )}
              </div>
            </section>
          )}

          {/* SETTINGS */}
          {screen === "settings" && (
            <div className="settings-grid">
              <section className="panel settings-panel">
                <div className="settings-icon">◈</div>
                <h2>Thông tin môi trường</h2>
                <p>
                  Thông tin cấu hình của phiên bản demo hiện tại.
                </p>

                <div className="settings-detail-row">
                  <span>Tên hệ thống</span>
                  <strong>Knowbase AI KMS</strong>
                </div>
                <div className="settings-detail-row">
                  <span>Frontend</span>
                  <strong>React + TypeScript</strong>
                </div>
                <div className="settings-detail-row">
                  <span>Lưu trữ</span>
                  <strong>PostgreSQL + Prisma</strong>
                </div>
                <div className="settings-detail-row">
                  <span>Backend API</span>
                  <strong>Node.js API</strong>
                </div>
                <div className="settings-detail-row">
                  <span>AI model</span>
                  <strong>Chưa cấu hình model</strong>
                </div>
              </section>

              <section className="panel settings-panel">
                <div className="settings-icon">↻</div>
                <h2>Dữ liệu demo</h2>
                <p>Dữ liệu tài liệu và nhật ký được lưu trên máy chủ.</p>

                <div className="settings-detail-row">
                  <span>Số tài liệu</span>
                  <strong>{documents.length}</strong>
                </div>
                <div className="settings-detail-row">
                  <span>Số bản ghi audit</span>
                  <strong>{audit.length}</strong>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => void refreshDocuments().catch((error: Error) => notify(error.message))}
                >
                  Tải lại dữ liệu từ máy chủ
                </button>
              </section>
            </div>
          )}

          <footer className="page-footer">
            <span>Knowbase · Enterprise Knowledge Management</span>
            <span>Demo · Backend API + PostgreSQL</span>
          </footer>
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}