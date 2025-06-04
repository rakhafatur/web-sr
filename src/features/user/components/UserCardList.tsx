import { FiUser, FiType } from 'react-icons/fi';
import DataCardList from '../../../components/DataCardList';

export type User = {
  id: string;
  username: string;
  nama: string | null;
};

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
};

const UserCardList = ({ users, onEdit, onDelete }: Props) => {
  return (
    <DataCardList
      items={users}
      getId={(u) => u.id}
      onEdit={onEdit}
      onDelete={onDelete}
      renderItem={(u) => (
        <>
          <div className="mb-2 d-flex align-items-center" style={{ color: 'var(--color-dark)' }}>
            <FiUser className="me-2" /> <strong>Username:</strong>&nbsp;{u.username}
          </div>
          <div className="d-flex align-items-center" style={{ color: 'var(--color-dark)' }}>
            <FiType className="me-2" /> <strong>Nama:</strong>&nbsp;{u.nama || '-'}
          </div>
        </>
      )}
    />
  );
};

export default UserCardList;
