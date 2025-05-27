import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';

type Absensi = {
  status: string;
  keterangan: string | null;
  tanggal: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { status: string; keterangan?: string }) => void | Promise<void>;
  absensi?: Absensi | null;
};

const AddAbsensiModal = ({ show, onClose, onSubmit, absensi }: Props) => {
  const [form, setForm] = useState({
    status: 'KERJA',
    keterangan: '',
  });

  const [readonly, setReadonly] = useState<boolean>(false);

  useEffect(() => {
    if (!show) return;

    if (absensi) {
      setForm({
        status: absensi.status,
        keterangan: absensi.keterangan || '',
      });
      setReadonly(true);
    } else {
      setForm({ status: 'KERJA', keterangan: '' });
      setReadonly(false);
    }
  }, [show, absensi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.status) {
      alert('Status wajib diisi');
      return;
    }

    onSubmit({
      status: form.status,
      keterangan: form.keterangan?.trim() || undefined,
    });

    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog">
        <div
          className="modal-content text-light"
          style={{
            background: 'linear-gradient(145deg, #1b0036, #0f001e)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 20px rgba(137, 79, 255, 0.4)',
            borderRadius: '1rem',
          }}
        >
          <div className="modal-header border-0">
            <h5 className="modal-title">
              {absensi ? '📝 Detail Absensi' : '➕ Tambah Absensi'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label text-light fw-semibold">Status</label>
              <div className="d-flex gap-3 flex-wrap">
                {['KERJA', 'MENS', 'OFF', 'SAKIT'].map((opt) => (
                  <div className="form-check" key={opt}>
                    <input
                      className="form-check-input"
                      type="radio"
                      id={opt}
                      name="status"
                      value={opt}
                      checked={form.status === opt}
                      onChange={handleChange}
                      disabled={readonly}
                    />
                    <label
                      className="form-check-label text-light"
                      htmlFor={opt}
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <FormInput
              label="Keterangan (Opsional)"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              readOnly={readonly}
              type="textarea"
            />
          </div>

          <div className="modal-footer border-0">
            {readonly ? (
              <button
                className="btn btn-warning fw-bold"
                onClick={() => setReadonly(false)}
              >
                ✏️ Edit Form
              </button>
            ) : (
              <button className="btn btn-primary fw-bold" onClick={handleSubmit}>
                Simpan
              </button>
            )}
            <button className="btn btn-secondary fw-bold" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAbsensiModal;