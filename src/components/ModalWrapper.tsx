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
    border: '1px solid var(--color-green)',
    borderRadius: '1.25rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
    color: 'var(--color-dark)',
    width: isMobile ? '95vw' : 420,
    maxWidth: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    animation: isMobile ? 'slideUp 0.3s ease-out' : 'fadeIn 0.3s ease-out',
    position: 'absolute',
    left: '50%',
    transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
    bottom: isMobile ? 0 : undefined,
    top: isMobile ? undefined : '50%',
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
    >
      <div style={baseStyle}>
        {/* HEADER */}
        <div
          className="d-flex justify-content-between align-items-center py-2 px-4 border-bottom"
          style={{
            backgroundColor: 'var(--color-green-light)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <h5 className="m-0 fw-bold">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        {/* BODY */}
        <div className="flex-grow-1 overflow-auto p-4">{children}</div>
        {/* FOOTER */}
        {footer && (
          <div
            className="py-2 px-4 border-top d-flex justify-content-end gap-2"
            style={{
              backgroundColor: 'var(--color-green-light)',
              position: 'static',
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
