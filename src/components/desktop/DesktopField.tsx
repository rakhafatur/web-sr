import { ReactNode } from 'react';
import '../../styles/desktop-admin.css';

type Props = {
  label: string;
  /** id input yang dilabeli. Kosongkan untuk kontrol non-input (chip, pemilih). */
  htmlFor?: string;
  /** id untuk label — dipakai aria-labelledby oleh kontrol non-input. */
  labelId?: string;
  required?: boolean;
  help?: ReactNode;
  /** Memenuhi dua kolom dk-form-grid. */
  full?: boolean;
  children: ReactNode;
};

/** Satu field form admin desktop: label (+ tanda wajib), kontrol, teks bantuan. */
const DesktopField = ({ label, htmlFor, labelId, required, help, full, children }: Props) => {
  const isiLabel = (
    <>
      {label}
      {required && (
        <>
          <span className="dk-req" aria-hidden="true">*</span>
          <span className="visually-hidden"> (wajib diisi)</span>
        </>
      )}
    </>
  );

  return (
    <div className={full ? 'dk-field--full' : undefined}>
      {htmlFor ? (
        <label htmlFor={htmlFor} id={labelId} className="dk-label">{isiLabel}</label>
      ) : (
        <span id={labelId} className="dk-label">{isiLabel}</span>
      )}
      {children}
      {help && <div className="dk-help">{help}</div>}
    </div>
  );
};

export default DesktopField;
