import { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';

type Props = {
  show: boolean;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

const ModalWrapper = ({ show, title, children, footer, onClose }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  if (!show) return null;

  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    border: '1.5px solid var(--color-green)',
    borderRadius: isMobile ? '2rem 2rem 0 0' : '1.5rem', // mobile: atas bulat, bawah lurus, desktop full bulat
    boxShadow: '0 8px 32px rgba(56,176,0,0.11)', // soft green shadow
    color: 'var(--color-dark)',
    width: isMobile ? '97vw' : 420,
    maxWidth: '97vw',
    maxHeight: '95vh',
    display: 'flex',
    flexDirection: 'column',
    animation: isMobile ? 'slideUp 0.33s ease-out' : 'fadeIn 0.25s ease-out',
    position: 'absolute',
    left: '50%',
    transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
    bottom: isMobile ? 0 : undefined,
    top: isMobile ? undefined : '50%',
    overflow: 'hidden', // biar ga ada overflow border
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ backgroundColor: 'rgba(0,0,0,0.42)', zIndex: 1050 }}
    >
      <div style={baseStyle}>
        {/* HEADER */}
        <div
          className="d-flex justify-content-between align-items-center py-2 px-5 border-bottom"
          style={{
            backgroundColor: 'var(--color-green-light)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            borderTopLeftRadius: isMobile ? '2rem' : '1.5rem',
            borderTopRightRadius: isMobile ? '2rem' : '1.5rem',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <h5 className="m-0 fw-bold">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        {/* BODY */}
        <div className="flex-grow-1 overflow-auto px-5 py-4">{children}</div>
        {/* FOOTER */}
        {footer && (
          <div
            className="py-3 px-5 border-top d-flex justify-content-end gap-3"
            style={{
              backgroundColor: 'var(--color-green-light)',
              borderBottomLeftRadius: isMobile ? '2rem' : '1.5rem',
              borderBottomRightRadius: isMobile ? '2rem' : '1.5rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalWrapper;
