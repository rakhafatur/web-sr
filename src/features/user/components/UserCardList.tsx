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
          <div className="d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
            <FiUser className="me-2" /> {u.username}
          </div>
          <div className="d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
            <FiType className="me-2" /> {u.nama || '-'}
          </div>
        </>
      )}
    />
  );
};

export default UserCardList;
