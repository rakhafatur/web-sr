import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';

type Pengawas = {
  nama_lengkap: string;
  nama_panggilan: string | null;
  nomor_ktp: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  tanggal_bergabung: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Pengawas) => void;
  pengawas?: (Pengawas & { id: string }) | null;
};

const AddPengawasModal = ({ show, onClose, onSubmit, pengawas }: Props) => {
  const [form, setForm] = useState<Pengawas>({
    nama_lengkap: '',
    nama_panggilan: '',
    nomor_ktp: '',
    tanggal_lahir: '',
    alamat: '',
    tanggal_bergabung: '',
  });
  const [readonly, setReadonly] = useState<boolean>(false);

  useEffect(() => {
    if (!show) return;

    if (pengawas) {
      setForm({
        nama_lengkap: pengawas.nama_lengkap,
        nama_panggilan: pengawas.nama_panggilan,
        nomor_ktp: pengawas.nomor_ktp,
        tanggal_lahir: pengawas.tanggal_lahir,
        alamat: pengawas.alamat,
        tanggal_bergabung: pengawas.tanggal_bergabung,
      });
      setReadonly(true);
    } else {
      setForm({
        nama_lengkap: '',
        nama_panggilan: '',
        nomor_ktp: '',
        tanggal_lahir: '',
        alamat: '',
        tanggal_bergabung: '',
      });
      setReadonly(false);
    }
  }, [show, pengawas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.nama_lengkap) {
      alert('Nama lengkap wajib diisi');
      return;
    }

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
            <h5 className="modal-title">
              {pengawas ? '👤 Detail Pengawas' : '➕ Tambah Pengawas'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <FormInput
              label="Nama Lengkap"
              name="nama_lengkap"
              value={form.nama_lengkap || ''}
              onChange={handleChange}
              readOnly={readonly}
            />
            <FormInput
              label="Nama Panggilan"
              name="nama_panggilan"
              value={form.nama_panggilan || ''}
              onChange={handleChange}
              readOnly={readonly}
            />
            <FormInput
              label="Nomor KTP"
              name="nomor_ktp"
              value={form.nomor_ktp || ''}
              onChange={handleChange}
              readOnly={readonly}
            />
            <FormInput
              label="Tanggal Lahir"
              name="tanggal_lahir"
              value={form.tanggal_lahir && !readonly ? form.tanggal_lahir : ''}
              onChange={handleChange}
              readOnly={readonly}
              type="date"
            />
            <FormInput
              label="Alamat"
              name="alamat"
              value={form.alamat || ''}
              onChange={handleChange}
              readOnly={readonly}
              type="textarea"
            />
            <FormInput
              label="Tanggal Bergabung"
              name="tanggal_bergabung"
              value={form.tanggal_bergabung && !readonly ? form.tanggal_bergabung : ''}
              onChange={handleChange}
              readOnly={readonly}
              type="date"
            />
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

export default AddPengawasModal;
