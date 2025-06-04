import { FiUser, FiPlus } from 'react-icons/fi';
import EntityFormModal, { Field } from '../../../components/EntityFormModal';
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
  const handleSubmit = (data: { username: string; nama: string; password?: string }) => {
    if (!data.username || !data.nama) {
      alert('Username dan Nama wajib diisi');
      return;
    }
    if (!user && !data.password) {
      alert('Password wajib diisi untuk user baru');
      return;
    }

    const payload = {
      username: data.username,
      nama: data.nama,
      ...(data.password ? { password: data.password } : {}),
    };

    onSubmit(payload);
  };

  const fields: Field[] = [
    { name: 'username', label: 'Username' },
    { name: 'nama', label: 'Nama Lengkap' },
    {
      name: 'password',
      label: () => (user ? 'Password Baru (Opsional)' : 'Password'),
      type: 'password',
      render: ({ value, onChange, readonly }) =>
        readonly ? null : (
          <FormInput
            label={user ? 'Password Baru (Opsional)' : 'Password'}
            name="password"
            value={value}
            onChange={onChange}
            type="password"
          />
        ),
    },
  ];

  return (
    <EntityFormModal
      show={show}
      onClose={onClose}
      onSubmit={handleSubmit}
      data={user || undefined}
      titleAdd={
        <span className="d-flex align-items-center gap-2">
          <FiPlus /> Tambah User
        </span>
      }
      titleDetail={
        <span className="d-flex align-items-center gap-2">
          <FiUser /> Detail User
        </span>
      }
      fields={fields}
    />
  );
};

export default AddUserModal;
