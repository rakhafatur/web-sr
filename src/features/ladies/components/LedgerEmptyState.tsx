import { ReactNode } from 'react';

type Props = {
  message: ReactNode;
};

const LedgerEmptyState = ({ message }: Props) => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-8) var(--space-5)',
      textAlign: 'center',
      color: 'var(--color-gray-500)',
      fontSize: 'var(--font-size-sm)',
    }}
  >
    {message}
  </div>
);

export default LedgerEmptyState;
