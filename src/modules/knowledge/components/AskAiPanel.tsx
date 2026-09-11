import type { CSSProperties, FormEvent } from 'react';
import type {
  AiAnswer,
  AskAiError,
  AskAiStatus,
} from '../hooks/useAskAi.js';

export type AskAiPanelProps = {
  question: string;
  status: AskAiStatus;
  answer: AiAnswer | null;
  error: AskAiError | null;
  canSubmit: boolean;
  onQuestionChange: (question: string) => void;
  onRequestConfirmation: () => void;
  onCancelConfirmation: () => void;
  onConfirmSubmit: () => Promise<void>;
  onRetry: () => Promise<void>;
  onReset: () => void;
};

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

const styles: Record<string, TokenStyle> = {
  panel: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: 'var(--space-8)',
    color: 'var(--color-text)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-card)',
    fontFamily: 'inherit',
  },
  header: { marginBottom: 'var(--space-6)' },
  eyebrow: {
    margin: '0 0 var(--space-2)',
    color: 'var(--color-primary)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: { margin: 0, fontSize: '1.75rem', lineHeight: 1.2 },
  description: {
    margin: 'var(--space-3) 0 0',
    color: 'var(--color-text-muted)',
    lineHeight: 1.6,
  },
  fieldLabel: { display: 'block', marginBottom: 'var(--space-2)', fontWeight: 700 },
  textarea: {
    display: 'block',
    width: '100%',
    minHeight: '120px',
    boxSizing: 'border-box',
    padding: 'var(--space-4)',
    resize: 'vertical',
    color: 'var(--color-text)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-strong)',
    borderRadius: 'var(--radius-md)',
    font: 'inherit',
    lineHeight: 1.5,
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-3)',
  },
  hint: { color: 'var(--color-text-muted)', fontSize: '0.875rem' },
  button: {
    minHeight: '44px',
    padding: '0 var(--space-4)',
    color: 'var(--color-on-primary)',
    background: 'var(--color-primary)',
    border: 0,
    borderRadius: 'var(--radius-md)',
    font: 'inherit',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    minHeight: '44px',
    padding: '0 var(--space-4)',
    color: 'var(--color-primary)',
    background: 'transparent',
    border: '1px solid currentColor',
    borderRadius: 'var(--radius-md)',
    font: 'inherit',
    fontWeight: 700,
    cursor: 'pointer',
  },
  disabledButton: { opacity: 0.55, cursor: 'not-allowed' },
  alert: {
    marginTop: 'var(--space-4)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    lineHeight: 1.5,
  },
  error: {
    color: 'var(--color-danger)',
    background: '#fff5f5',
    border: '1px solid color-mix(in srgb, var(--color-danger) 35%, var(--color-surface))',
  },
  success: {
    color: 'var(--color-success)',
    background: '#f2faf5',
    border: '1px solid color-mix(in srgb, var(--color-success) 35%, var(--color-surface))',
  },
  empty: {
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface-muted)',
    border: '1px solid var(--color-border)',
  },
  answer: {
    marginTop: 'var(--space-6)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--color-border)',
  },
  answerText: { margin: 'var(--space-2) 0 0', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
  citationList: { display: 'grid', gap: 'var(--space-2)', margin: 'var(--space-4) 0 0', padding: 0, listStyle: 'none' },
  citation: {
    padding: 'var(--space-3)',
    background: 'var(--color-surface-muted)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 10,
    display: 'grid',
    placeItems: 'center',
    padding: 'var(--space-4)',
    background: 'var(--color-overlay)',
  },
  modal: {
    width: 'min(100%, 440px)',
    padding: 'var(--space-6)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-overlay)',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' },
};

function LoadingState() {
  return (
    <div style={{ ...styles.alert, ...styles.empty }} role="status" aria-live="polite">
      <strong>AI đang xử lý</strong>
      <p style={{ margin: 'var(--space-1) 0 0' }}>
        Đang tìm nguồn tài liệu được phép và chuẩn bị câu trả lời.
      </p>
    </div>
  );
}

function ConfirmationDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div style={styles.modalBackdrop} role="presentation">
      <section
        aria-labelledby="ask-ai-confirmation-title"
        aria-modal="true"
        role="dialog"
        style={styles.modal}
      >
        <h2 id="ask-ai-confirmation-title" style={{ margin: 0, fontSize: '1.25rem' }}>
          Gửi câu hỏi cho AI?
        </h2>
        <p style={{ ...styles.description, marginBottom: 0 }}>
          AI chỉ sử dụng tài liệu nội bộ mà bạn được phép truy cập và sẽ hiển thị nguồn trả lời.
        </p>
        <div style={styles.modalActions}>
          <button type="button" style={styles.secondaryButton} onClick={onCancel}>
            Hủy
          </button>
          <button type="button" style={styles.button} onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </section>
    </div>
  );
}

export function AskAiPanel({
  question,
  status,
  answer,
  error,
  canSubmit,
  onQuestionChange,
  onRequestConfirmation,
  onCancelConfirmation,
  onConfirmSubmit,
  onRetry,
  onReset,
}: AskAiPanelProps) {
  const isBusy = status === 'creating' || status === 'processing';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRequestConfirmation();
  };

  return (
    <section aria-labelledby="ask-ai-title" style={styles.panel}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Knowledge assistant</p>
        <h1 id="ask-ai-title" style={styles.title}>
          Hỏi AI về tài liệu được phép
        </h1>
        <p style={styles.description}>
          Đặt câu hỏi bằng văn bản để nhận câu trả lời có thể kiểm chứng từ kho tri thức nội bộ.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="ask-ai-question" style={styles.fieldLabel}>
          Câu hỏi của bạn
        </label>
        <textarea
          id="ask-ai-question"
          name="question"
          value={question}
          maxLength={2000}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ví dụ: Nhân viên được nghỉ phép bao nhiêu ngày?"
          disabled={isBusy}
          aria-describedby="ask-ai-question-hint"
          aria-invalid={Boolean(error)}
          style={styles.textarea}
        />
        <div style={styles.actionRow}>
          <span id="ask-ai-question-hint" style={styles.hint}>
            {question.length}/2000 ký tự
          </span>
          <button
            type="submit"
            disabled={!canSubmit || isBusy}
            style={{ ...styles.button, ...(!canSubmit || isBusy ? styles.disabledButton : {}) }}
            aria-disabled={!canSubmit || isBusy}
          >
            {status === 'creating' ? 'Đang mở phiên...' : 'Hỏi AI'}
          </button>
        </div>
      </form>

      {status === 'processing' && <LoadingState />}

      {status === 'error' && error && (
        <div style={{ ...styles.alert, ...styles.error }} role="alert">
          <strong>{error.message}</strong>
          <div style={{ ...styles.actionRow, justifyContent: 'flex-start' }}>
            {error.retryable && (
              <button type="button" style={styles.secondaryButton} onClick={() => void onRetry()}>
                Thử lại
              </button>
            )}
            <button type="button" style={styles.secondaryButton} onClick={onReset}>
              Xóa câu hỏi
            </button>
          </div>
        </div>
      )}

      {status === 'empty' && (
        <div style={{ ...styles.alert, ...styles.empty }} role="status">
          Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.
        </div>
      )}

      {status === 'success' && answer && (
        <article style={styles.answer} aria-live="polite">
          <div style={{ ...styles.alert, ...styles.success }} role="status">
            Đã tạo câu trả lời từ nguồn tài liệu được phép.
          </div>
          <h2 style={{ margin: 'var(--space-6) 0 0', fontSize: '1.15rem' }}>Câu trả lời</h2>
          <p style={styles.answerText}>{answer.answer}</p>
          <h3 style={{ margin: 'var(--space-6) 0 0', fontSize: '1rem' }}>Nguồn tham khảo</h3>
          <ul style={styles.citationList} aria-label="Nguồn tham khảo">
            {answer.citations.map((citation) => (
              <li key={citation.id ?? `${citation.documentId}-${citation.versionId}`} style={styles.citation}>
                {citation.citationLabel ?? 'Tài liệu nội bộ'}
                <br />
                <span>Document ID: {citation.documentId}</span>
                <br />
                <span>Version ID: {citation.versionId}</span>
              </li>
            ))}
          </ul>
          <button type="button" style={{ ...styles.secondaryButton, marginTop: 'var(--space-6)' }} onClick={onReset}>
            Đặt câu hỏi mới
          </button>
        </article>
      )}

      {status === 'confirming' && (
        <ConfirmationDialog onCancel={onCancelConfirmation} onConfirm={onConfirmSubmit} />
      )}
    </section>
  );
}
