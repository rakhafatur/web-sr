import logo from '../../../assets/logosr-green.png';

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
      style={{ width: 90, marginBottom: 14, animation: 'pulse 1.5s infinite' }}
    />

    <div style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>{text}</div>
  </div>
);

export default LedgerLoadingState;
