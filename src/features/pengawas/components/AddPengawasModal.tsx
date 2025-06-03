import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';
import { FiUser, FiPlus, FiEdit2 } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';

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

  const isMobile = useMediaQuery({ maxWidth: 768 });

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

    const cleanForm = {
      ...form,
      tanggal_lahir: form.tanggal_lahir ? form.tanggal_lahir : null,
      tanggal_bergabung: form.tanggal_bergabung ? form.tanggal_bergabung : null,
    };

    onSubmit(cleanForm);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
      }}
    >
      <div
        className="modal-dialog"
        style={{
          width: isMobile ? '100vw' : 480,
          maxWidth: isMobile ? '96vw' : 520,
          margin: isMobile ? '0 auto' : undefined,
          minWidth: isMobile ? 'unset' : 480,
          alignSelf: 'center',
        }}
      >
        <div
          className="modal-content"
          style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-green)',
            borderRadius: '1rem',
            color: 'var(--color-dark)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            padding: isMobile ? '0.5rem' : undefined,
          }}
        >
          <div className="modal-header border-0" style={{ padding: isMobile ? '1rem 1rem 0.5rem 1rem' : undefined }}>
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              {pengawas ? <FiUser /> : <FiPlus />}
              {pengawas ? 'Detail Pengawas' : 'Tambah Pengawas'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body" style={{ padding: isMobile ? '0.75rem 1rem' : undefined }}>
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
              value={
                readonly
                  ? (form.tanggal_lahir ? dayjs(form.tanggal_lahir).format('DD/MM/YYYY') : '')
                  : (form.tanggal_lahir || '')
              }
              onChange={handleChange}
              readOnly={readonly}
              type={readonly ? 'text' : 'date'}
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
              value={
                readonly
                  ? (form.tanggal_bergabung ? dayjs(form.tanggal_bergabung).format('DD/MM/YYYY') : '')
                  : (form.tanggal_bergabung || '')
              }
              onChange={handleChange}
              readOnly={readonly}
              type={readonly ? 'text' : 'date'}
            />
          </div>

          <div className="modal-footer border-0" style={{ padding: isMobile ? '0.5rem 1rem 1rem 1rem' : undefined }}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPengawasModal;