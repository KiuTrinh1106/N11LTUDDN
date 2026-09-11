import { useCallback, useEffect, useRef, useState } from 'react';

export type AskAiStatus =
  | 'idle'
  | 'confirming'
  | 'creating'
  | 'processing'
  | 'success'
  | 'empty'
  | 'error';

export type AiCitation = {
  id?: string;
  documentId: string;
  versionId: string;
  citationLabel?: string;
};

export type AiAnswer = {
  requestId: string;
  answer?: string;
  citations: AiCitation[];
};

export type AskAiError = {
  code: string;
  message: string;
  retryable: boolean;
};

type ConversationResponse = {
  id: string;
};

type MessageResponse = {
  requestId: string;
  status: 'PROCESSING';
};

type RequestResponse = {
  requestId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  answer?: string;
  citations?: AiCitation[];
  errorCode?: string;
};

type Fetcher = typeof fetch;

export type UseAskAiOptions = {
  apiBaseUrl?: string;
  documentId?: string;
  fetchImpl?: Fetcher;
  pollIntervalMs?: number;
};

export type UseAskAiResult = {
  question: string;
  setQuestion: (question: string) => void;
  status: AskAiStatus;
  answer: AiAnswer | null;
  error: AskAiError | null;
  canSubmit: boolean;
  requestConfirmation: () => void;
  cancelConfirmation: () => void;
  submit: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
};

const DEFAULT_POLL_INTERVAL_MS = 800;
const MAX_QUESTION_LENGTH = 2000;
const INSUFFICIENT_DATA_MESSAGE =
  'Không đủ dữ liệu hoặc không tìm thấy dữ liệu trong bộ tài liệu này.';

function getErrorMessage(errorCode?: string): string {
  if (errorCode === 'AI_UNAVAILABLE') {
    return 'Không thể kết nối đến dịch vụ AI. Vui lòng thử lại.';
  }

  if (errorCode === 'QNA_FORBIDDEN' || errorCode === 'REQUEST_FORBIDDEN') {
    return 'Bạn không có quyền sử dụng dữ liệu này.';
  }

  return 'Không thể xử lý câu hỏi. Vui lòng thử lại.';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & {
    code?: string;
  };

  if (!response.ok) {
    const error = new Error(payload.code ?? `HTTP_${response.status}`);
    error.name = payload.code ?? 'API_ERROR';
    throw error;
  }

  return payload;
}

export function useAskAi({
  apiBaseUrl = '',
  documentId,
  fetchImpl = fetch,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: UseAskAiOptions = {}): UseAskAiResult {
  const [question, setQuestionState] = useState('');
  const [status, setStatus] = useState<AskAiStatus>('idle');
  const [answer, setAnswer] = useState<AiAnswer | null>(null);
  const [error, setError] = useState<AskAiError | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('');
  const pollingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuestion = useCallback((value: string) => {
    if (value.length <= MAX_QUESTION_LENGTH) {
      setQuestionState(value);
      setError(null);
      setStatus((currentStatus) =>
        currentStatus === 'error' || currentStatus === 'empty'
          ? 'idle'
          : currentStatus,
      );
    }
  }, []);

  const clearPollingTimer = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  useEffect(() => clearPollingTimer, [clearPollingTimer]);

  const validateQuestion = useCallback((): AskAiError | null => {
    const normalizedQuestion = question.trim();

    if (!normalizedQuestion) {
      return {
        code: 'QUESTION_REQUIRED',
        message: 'Vui lòng nhập câu hỏi trước khi tiếp tục.',
        retryable: false,
      };
    }

    if (normalizedQuestion.length < 3) {
      return {
        code: 'QUESTION_TOO_SHORT',
        message: 'Câu hỏi cần có ít nhất 3 ký tự.',
        retryable: false,
      };
    }

    return null;
  }, [question]);

  const requestConfirmation = useCallback(() => {
    const validationError = validateQuestion();

    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setError(null);
    setStatus('confirming');
  }, [validateQuestion]);

  const cancelConfirmation = useCallback(() => {
    setStatus(answer ? 'success' : 'idle');
  }, [answer]);

  const pollRequest = useCallback(
    async (requestId: string): Promise<void> => {
      const response = await fetchImpl(
        `${apiBaseUrl}/api/ai/requests/${requestId}`,
        { headers: { Accept: 'application/json' } },
      );
      const result = await parseResponse<RequestResponse>(response);

      if (result.status === 'PROCESSING') {
        await new Promise<void>((resolve) => {
          pollingTimer.current = setTimeout(resolve, pollIntervalMs);
        });
        return pollRequest(requestId);
      }

      if (result.status === 'FAILED') {
        throw Object.assign(new Error(result.errorCode ?? 'AI_FAILED'), {
          name: result.errorCode ?? 'AI_FAILED',
        });
      }

      const citations = result.citations ?? [];
      setAnswer({
        requestId: result.requestId,
        answer: result.answer?.trim() || INSUFFICIENT_DATA_MESSAGE,
        citations,
      });
      setStatus(result.answer?.trim() && citations.length > 0 ? 'success' : 'empty');
    },
    [apiBaseUrl, fetchImpl, pollIntervalMs],
  );

  const submit = useCallback(async () => {
    const validationError = validateQuestion();

    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    const normalizedQuestion = question.trim();
    setLastSubmittedQuestion(normalizedQuestion);
    setError(null);
    setAnswer(null);
    clearPollingTimer();
    setStatus('creating');

    try {
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const conversationResponse = await fetchImpl(
          `${apiBaseUrl}/api/ai/conversations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId }),
          },
        );
        const conversation = await parseResponse<ConversationResponse>(
          conversationResponse,
        );
        activeConversationId = conversation.id;
        setConversationId(activeConversationId);
      }

      setStatus('processing');
      const messageResponse = await fetchImpl(
        `${apiBaseUrl}/api/ai/conversations/${activeConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: normalizedQuestion }),
        },
      );
      const message = await parseResponse<MessageResponse>(messageResponse);
      await pollRequest(message.requestId);
    } catch (caughtError) {
      const code = caughtError instanceof Error ? caughtError.name : 'UNKNOWN_ERROR';
      setError({
        code,
        message: getErrorMessage(code),
        retryable: true,
      });
      setStatus('error');
    }
  }, [
    apiBaseUrl,
    clearPollingTimer,
    conversationId,
    documentId,
    fetchImpl,
    pollRequest,
    question,
    validateQuestion,
  ]);

  const retry = useCallback(async () => {
    if (lastSubmittedQuestion) {
      setQuestionState(lastSubmittedQuestion);
    }
    await submit();
  }, [lastSubmittedQuestion, submit]);

  const reset = useCallback(() => {
    clearPollingTimer();
    setQuestionState('');
    setStatus('idle');
    setAnswer(null);
    setError(null);
    setLastSubmittedQuestion('');
  }, [clearPollingTimer]);

  return {
    question,
    setQuestion,
    status,
    answer,
    error,
    canSubmit: question.trim().length >= 3 && status !== 'creating' && status !== 'processing',
    requestConfirmation,
    cancelConfirmation,
    submit,
    retry,
    reset,
  };
}
