import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';

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
  const [form, setForm] = useState({
    username: '',
    nama: '',
    password: '',
  });

  const [readonly, setReadonly] = useState<boolean>(false);

  useEffect(() => {
    if (!show) return;

    if (user) {
      setForm({
        username: user.username,
        nama: user.nama || '',
        password: '',
      });
      setReadonly(true);
    } else {
      setForm({ username: '', nama: '', password: '' });
      setReadonly(false);
    }
  }, [show, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.username || !form.nama) {
      alert('Username dan Nama wajib diisi');
      return;
    }
    if (!user && !form.password) {
      alert('Password wajib diisi untuk user baru');
      return;
    }

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
            <h5 className="modal-title">{user ? '👤 Detail User' : '➕ Tambah User'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <FormInput
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              readOnly={readonly}
            />

            <FormInput
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              readOnly={readonly}
            />

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

export default AddUserModal;