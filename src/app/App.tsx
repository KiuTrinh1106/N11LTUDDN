import { useAskAi } from '../modules/knowledge/hooks/useAskAi.js';
import { AskAiPanel } from '../modules/knowledge/components/AskAiPanel.js';

const demoFetch: typeof fetch = async (input) => {
  const url = String(input);
  let payload: Record<string, unknown>;
  let status = 200;

  if (url.endsWith('/api/ai/conversations')) {
    payload = { id: 'demo-conversation-1' };
    status = 201;
  } else if (url.includes('/messages')) {
    payload = { requestId: 'demo-request-1', messageId: 'demo-message-1', status: 'PROCESSING' };
    status = 202;
  } else if (url.includes('/api/ai/requests/')) {
    payload = {
      requestId: 'demo-request-1',
      status: 'COMPLETED',
      answer: 'Theo tài liệu hiện hành, nhân viên được nghỉ phép theo chính sách nội bộ của tổ chức.',
      citations: [
        {
          id: 'demo-source-1',
          documentId: 'document-quy-trinh-nghi-phep',
          versionId: 'version-1',
          citationLabel: 'Quy trình nghỉ phép',
        },
      ],
    };
  } else {
    payload = { code: 'NOT_FOUND' };
    status = 404;
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export default function App() {
  const askAi = useAskAi({
    documentId: 'document-quy-trinh-nghi-phep',
    fetchImpl: demoFetch,
    pollIntervalMs: 500,
  });

  return (
    <main className="app-shell">
      <div className="app-orbit" aria-hidden="true" />
      <div className="app-content">
        <p className="app-status">Prototype · Reader workspace</p>
        <AskAiPanel
          question={askAi.question}
          status={askAi.status}
          answer={askAi.answer}
          error={askAi.error}
          canSubmit={askAi.canSubmit}
          onQuestionChange={askAi.setQuestion}
          onRequestConfirmation={askAi.requestConfirmation}
          onCancelConfirmation={askAi.cancelConfirmation}
          onConfirmSubmit={askAi.submit}
          onRetry={askAi.retry}
          onReset={askAi.reset}
        />
      </div>
    </main>
  );
}
