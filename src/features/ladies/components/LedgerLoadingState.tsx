import { FiLoader } from 'react-icons/fi';

type Props = {
  text: string;
};

const LedgerLoadingState = ({ text }: Props) => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: '70vh' }}
    role="status"
    aria-label={text}
  >
    <FiLoader size={28} className="spinner-icon" />
  </div>
);

export default LedgerLoadingState;
