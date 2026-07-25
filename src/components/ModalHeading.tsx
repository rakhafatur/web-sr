import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
};

/** Dipakai sebagai `title` ModalWrapper saat header pakai `headerGradient` (warna teks mewarisi putih dari header). */
const ModalHeading = ({ icon, title, subtitle }: Props) => (
  <div className="d-flex align-items-center gap-3">
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: 18,
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>

    <div>
      <div className="fw-bold" style={{ fontSize: '1.15rem' }}>
        {title}
      </div>

      {subtitle && (
        <div style={{ opacity: 0.8, fontSize: '0.88rem', marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

export default ModalHeading;
