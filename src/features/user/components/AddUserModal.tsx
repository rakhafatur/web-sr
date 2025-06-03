import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';
import { FiUser, FiPlus, FiEdit2 } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';

type User = {
  username: string;
  nama: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; nama: string; password?: string }) => void;
  user?: (User & { id: string }) | null;
};

const AddUserModal = ({ show, onClose, onSubmit, user }: Props) => {
  const [form, setForm] = useState({ username: '', nama: '', password: '' });
  const [readonly, setReadonly] = useState<boolean>(false);

  // Tambahkan deteksi mobile
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    if (!show) return;
    if (user) {
      setForm({ username: user.username, nama: user.nama || '', password: '' });
      setReadonly(true);
    } else {
      setForm({ username: '', nama: '', password: '' });
      setReadonly(false);
    }
  }, [show, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.username || !form.nama) return alert('Username dan Nama wajib diisi');
    if (!user && !form.password) return alert('Password wajib diisi untuk user baru');

    const payload = {
      username: form.username,
      nama: form.nama,
      ...(form.password ? { password: form.password } : {}),
    };
    onSubmit(payload);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
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
          width: isMobile ? '100vw' : 400,
          maxWidth: isMobile ? '96vw' : 400,
          margin: isMobile ? '0 auto' : undefined,
          minWidth: isMobile ? 'unset' : 400,
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
              {user ? <FiUser /> : <FiPlus />}
              {user ? 'Detail User' : 'Tambah User'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body" style={{ padding: isMobile ? '0.75rem 1rem' : undefined }}>
            <FormInput label="Username" name="username" value={form.username} onChange={handleChange} readOnly={readonly} />
            <FormInput label="Nama Lengkap" name="nama" value={form.nama} onChange={handleChange} readOnly={readonly} />
            {!readonly && (
              <FormInput
                label={user ? 'Password Baru (Opsional)' : 'Password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
              />
            )}
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

export default AddUserModal;
