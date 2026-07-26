import { ReactNode } from 'react';

type Props = {
  message: ReactNode;
};

const LedgerEmptyState = ({ message }: Props) => (
  <div
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: 16,
      padding: '30px 20px',
      textAlign: 'center',
      color: 'var(--color-gray-500)',
      fontSize: 13,
    }}
  >
    {message}
  </div>
);

export default LedgerEmptyState;
