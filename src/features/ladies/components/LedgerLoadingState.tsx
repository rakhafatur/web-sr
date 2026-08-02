import logo from '../../../assets/logosr-blue.png';

type Props = {
  text: string;
};

const LedgerLoadingState = ({ text }: Props) => (
  <div
    className="d-flex flex-column justify-content-center align-items-center"
    style={{ minHeight: '70vh' }}
  >
    <img
      src={logo}
      alt="loading"
      style={{ width: 90, marginBottom: 'var(--space-3)', animation: 'pulse 1.5s infinite' }}
    />

    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', fontWeight: 500 }}>{text}</div>
  </div>
);

export default LedgerLoadingState;
