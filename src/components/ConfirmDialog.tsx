import { useEffect, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import ModalWrapper from './ModalWrapper';
import ModalHeading from './ModalHeading';
import Button from './Button';

type ConfirmState = {
  message: string;
  resolve: (value: boolean) => void;
} | null;

let trigger: ((message: string) => Promise<boolean>) | null = null;

/**
 * Pengganti `window.confirm()` bawaan browser — dialog popup native itu
 * terlihat lepas dari tema app (putih polos, font sistem) dan langsung
 * merusak kesan "seperti aplikasi native" yang dibangun di seluruh app.
 * Dipakai persis seperti window.confirm: `if (!(await confirmDialog(msg))) return;`
 */
export function confirmDialog(message: string): Promise<boolean> {
  if (!trigger) {
    // Jaring pengaman kalau <ConfirmDialogHost/> belum sempat mount.
    return Promise.resolve(window.confirm(message));
  }
  return trigger(message);
}

const ConfirmDialogHost = () => {
  const [state, setState] = useState<ConfirmState>(null);

  useEffect(() => {
    trigger = (message: string) =>
      new Promise<boolean>((resolve) => {
        setState({ message, resolve });
      });

    return () => {
      trigger = null;
    };
  }, []);

  const respond = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  const footer = (
    <div className="d-flex justify-content-end gap-2 flex-wrap">
      <Button variant="secondary" onClick={() => respond(false)}>
        Batal
      </Button>
      <Button variant="danger" onClick={() => respond(true)}>
        Ya, Lanjutkan
      </Button>
    </div>
  );

  return (
    <ModalWrapper
      show={!!state}
      onClose={() => respond(false)}
      headerGradient="linear-gradient(135deg,var(--color-expense),#b91c1c)"
      title={<ModalHeading icon={<FiAlertTriangle />} title="Konfirmasi" />}
      footer={footer}
    >
      <div style={{ color: 'var(--color-dark)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
        {state?.message}
      </div>
    </ModalWrapper>
  );
};

export default ConfirmDialogHost;
