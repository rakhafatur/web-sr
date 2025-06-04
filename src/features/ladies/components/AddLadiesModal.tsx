import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';
import { FiUser, FiPlus, FiEdit2 } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';

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

  const formContent = (
    <>
      <FormInput label="Nama Lengkap" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} readOnly={readonly} />
      <FormInput label="Nama Ladies" name="nama_ladies" value={form.nama_ladies} onChange={handleChange} readOnly={readonly} />
      <FormInput label="PIN" name="pin" value={form.pin} onChange={handleChange} readOnly={readonly} />
      <FormInput label="Nomor KTP" name="nomor_ktp" value={form.nomor_ktp} onChange={handleChange} readOnly={readonly} />
      <FormInput label="Tanggal Bergabung" name="tanggal_bergabung" value={form.tanggal_bergabung} onChange={handleChange} readOnly={readonly} type="date" />
      <FormInput label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} readOnly={readonly} type="textarea" />

      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
          Nama Outlet
        </label>
        {readonly ? (
          <input
            className="form-control bg-white text-dark border"
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
                <label className="form-check-label" htmlFor={`outlet-${outlet}`}>{outlet}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const footer = (
    <>
      {readonly ? (
        <button className="btn btn-success fw-bold d-flex align-items-center gap-2" onClick={() => setReadonly(false)}>
          <FiEdit2 /> Edit Form
        </button>
      ) : (
        <button className="btn btn-success fw-bold" onClick={handleSubmit}>
          Simpan
        </button>
      )}
      <button className="btn btn-secondary fw-bold" onClick={onClose}>
        Tutup
      </button>
    </>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      title={lady ? (
        <span className="d-flex align-items-center gap-2">
          <FiUser /> Detail Ladies
        </span>
      ) : (
        <span className="d-flex align-items-center gap-2">
          <FiPlus /> Tambah Ladies
        </span>
      )}
      footer={footer}
    >
      {formContent}
    </ModalWrapper>
  );
};

export default AddLadiesModal;