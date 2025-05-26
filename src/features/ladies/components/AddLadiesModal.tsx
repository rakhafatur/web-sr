import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';

type Lady = {
  id: string;
  nama_lengkap: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  nomor_ktp: string;
  tanggal_bergabung: string;
  alamat: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lady, 'id'>) => void;
  lady?: Lady | null;
};

const AddLadiesModal = ({ show, onClose, onSubmit, lady }: Props) => {
  const [form, setForm] = useState<Omit<Lady, 'id'>>({
    nama_lengkap: '',
    nama_ladies: '',
    nama_outlet: '',
    pin: '',
    nomor_ktp: '',
    tanggal_bergabung: '',
    alamat: '',
  });

  const [readonly, setReadonly] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (lady) {
      setForm({
        nama_lengkap: lady.nama_lengkap,
        nama_ladies: lady.nama_ladies,
        nama_outlet: lady.nama_outlet,
        pin: lady.pin,
        nomor_ktp: lady.nomor_ktp,
        tanggal_bergabung: lady.tanggal_bergabung,
        alamat: lady.alamat,
      });
      setReadonly(true);
    } else {
      setForm({
        nama_lengkap: '',
        nama_ladies: '',
        nama_outlet: '',
        pin: '',
        nomor_ktp: '',
        tanggal_bergabung: '',
        alamat: '',
      });
      setReadonly(false);
    }
  }, [show, lady]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
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
      <div className="modal-dialog modal-lg">
        <div
          className="modal-content text-light"
          style={{
            background: 'linear-gradient(145deg, #1b0036, #0f001e)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 0 20px rgba(137, 79, 255, 0.4)',
          }}
        >
          <div className="modal-header border-0">
            <h5 className="modal-title">{lady ? '💃 Detail Ladies' : '➕ Tambah Ladies'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <FormInput label="Nama Lengkap" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} readOnly={readonly} />
            <FormInput label="Nama Ladies" name="nama_ladies" value={form.nama_ladies} onChange={handleChange} readOnly={readonly} />
            <FormInput label="PIN" name="pin" value={form.pin} onChange={handleChange} readOnly={readonly} />
            <FormInput label="Nomor KTP" name="nomor_ktp" value={form.nomor_ktp} onChange={handleChange} readOnly={readonly} />
            <FormInput label="Tanggal Bergabung" name="tanggal_bergabung" value={form.tanggal_bergabung} onChange={handleChange} readOnly={readonly} type="date" />
            <FormInput label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} readOnly={readonly} type="textarea" />

            <div className="mb-3">
              <label className="form-label fw-semibold text-light">Nama Outlet</label>
              {readonly ? (
                <input
                  className="form-control bg-dark text-light border-secondary"
                  value={form.nama_outlet || '-'}
                  readOnly
                />
              ) : (
                <div className="d-flex gap-3">
                  {['SA', 'Royal', 'MTR'].map((outlet) => (
                    <div key={outlet} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="nama_outlet"
                        value={outlet}
                        checked={form.nama_outlet === outlet}
                        onChange={handleChange}
                        id={`outlet-${outlet}`}
                      />
                      <label className="form-check-label" htmlFor={`outlet-${outlet}`}>
                        {outlet}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer border-0">
            {readonly ? (
              <button className="btn btn-warning fw-bold" onClick={() => setReadonly(false)}>
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

export default AddLadiesModal;