import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AskAiPanel } from '../../src/modules/knowledge/components/AskAiPanel.js';

function renderPanel(overrides: Partial<React.ComponentProps<typeof AskAiPanel>> = {}) {
  return render(
    <AskAiPanel
      question=""
      status="idle"
      answer={null}
      error={null}
      canSubmit={false}
      onQuestionChange={vi.fn()}
      onRequestConfirmation={vi.fn()}
      onCancelConfirmation={vi.fn()}
      onConfirmSubmit={vi.fn(async () => undefined)}
      onRetry={vi.fn(async () => undefined)}
      onReset={vi.fn()}
      {...overrides}
    />,
  );
}

describe('AskAiPanel', () => {
  it('renders the default text question state', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Hỏi AI về tài liệu được phép' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hỏi AI' })).toHaveProperty('disabled', true);
  });

  it('renders confirmation before a valid question is sent', () => {
    const onConfirm = vi.fn(async () => undefined);
    renderPanel({
      question: 'Nhân viên được nghỉ phép bao nhiêu ngày?',
      canSubmit: true,
      status: 'confirming',
      onConfirmSubmit: onConfirm,
    });

    expect(screen.getByRole('dialog', { name: 'Gửi câu hỏi cho AI?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders loading and answer citations from hook state', () => {
    renderPanel({
      status: 'success',
      answer: {
        requestId: 'request-1',
        answer: 'Theo tài liệu hiện hành, nhân viên được nghỉ phép theo chính sách nội bộ.',
        citations: [
          {
            documentId: 'document-1',
            versionId: 'version-1',
            citationLabel: 'Quy trình nghỉ phép',
          },
        ],
      },
    });

    expect(screen.getByRole('heading', { name: 'Câu trả lời' })).toBeTruthy();
    expect(screen.getByText('Document ID: document-1')).toBeTruthy();
    expect(screen.getByText('Version ID: version-1')).toBeTruthy();
  });
});
