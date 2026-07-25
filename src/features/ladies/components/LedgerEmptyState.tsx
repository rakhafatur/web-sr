import { ReactNode } from 'react';

type Props = {
  message: ReactNode;
};

const LedgerEmptyState = ({ message }: Props) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #f1f5f9',
      borderRadius: 16,
      padding: '30px 20px',
      textAlign: 'center',
      color: '#777',
      fontSize: 13,
    }}
  >
    {message}
  </div>
);

export default LedgerEmptyState;
