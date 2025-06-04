import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';
import { FiUser, FiPlus, FiEdit2 } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';

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

  const formContent = (
    <>
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
      title={user ? (
        <span className="d-flex align-items-center gap-2">
          <FiUser /> Detail User
        </span>
      ) : (
        <span className="d-flex align-items-center gap-2">
          <FiPlus /> Tambah User
        </span>
      )}
      footer={footer}
    >
      {formContent}
    </ModalWrapper>
  );
};

export default AddUserModal;
