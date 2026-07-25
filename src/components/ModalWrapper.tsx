import { ReactNode, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { FiX } from 'react-icons/fi';

type Props = {
  show: boolean;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  /** Ganti header dari gradient terang default jadi band warna solid (mis. lewat <ModalHeading/>). */
  headerGradient?: string;
};

const ModalWrapper = ({
  show,
  title,
  children,
  footer,
  onClose,
  headerGradient,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  useEffect(() => {
    if (show) {
      document.body.style.overflow =
        'hidden';
    } else {
      document.body.style.overflow =
        '';
    }

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="position-fixed"
      style={{
        inset: 0,
        background:
          'rgba(15, 23, 42, 0.55)',
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: isMobile
            ? '100%'
            : 520,

          maxWidth: isMobile
            ? '100%'
            : '92vw',

          maxHeight: isMobile
            ? '92vh'
            : '88vh',

          background:
            'linear-gradient(to bottom, #ffffff, #fcfffd)',

          border:
            '1px solid rgba(25,153,71,0.08)',

          borderRadius: isMobile
            ? '28px 28px 0 0'
            : 30,

          overflow: 'hidden',

          boxShadow:
            '0 20px 60px rgba(0,0,0,0.16)',

          display: 'flex',
          flexDirection: 'column',

          position: 'absolute',

          left: 0,
          right: 0,

          marginLeft: 'auto',
          marginRight: 'auto',

          top: isMobile
            ? undefined
            : 40,

          bottom: isMobile
            ? 0
            : undefined,
        }}
      >
        {/* HEADER */}
        <div
          className={headerGradient ? 'px-4 py-4' : 'px-4 py-4 border-bottom'}
          style={{
            background:
              headerGradient ??
              'linear-gradient(to right, #f5fff8, #ffffff)',

            color: headerGradient ? 'white' : undefined,

            borderColor:
              'rgba(0,0,0,0.05)',

            flexShrink: 0,
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div className="flex-grow-1">
              {title}
            </div>

            <button
              onClick={onClose}
              className="border-0 d-flex align-items-center justify-content-center"
              style={
                headerGradient
                  ? {
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.18)',
                      color: 'white',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }
                  : {
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: '#f3f4f6',
                      color: '#666',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }
              }
            >
              <FiX size={headerGradient ? 20 : 18} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div
          className="flex-grow-1 overflow-auto"
          style={{
            padding: isMobile
              ? 20
              : 28,
          }}
        >
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div
            className="px-4 py-3 border-top"
            style={{
              background:
                'linear-gradient(to right, #fafafa, #ffffff)',

              borderColor:
                'rgba(0,0,0,0.05)',

              flexShrink: 0,
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
