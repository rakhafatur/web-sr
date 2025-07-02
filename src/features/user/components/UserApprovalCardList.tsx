import { FiUser, FiType, FiCheck } from 'react-icons/fi';
import DataCardList from '../../../components/DataCardList';

export type User = {
  id: string;
  username: string;
  nama: string | null;
};

type Props = {
  users: User[];
  onApprove: (userId: string) => void;
};

const UserApprovalCardList = ({ users, onApprove }: Props) => {
  return (
    <DataCardList
      items={users}
      getId={(u) => u.id}
      renderItem={(u) => (
        <>
          <div className="d-flex align-items-center mb-1" style={{ fontSize: '0.9rem' }}>
            <FiUser className="me-2" /> {u.username}
          </div>
          <div className="d-flex align-items-center mb-2" style={{ fontSize: '0.9rem' }}>
            <FiType className="me-2" /> {u.nama || '-'}
          </div>
          <button
            className="btn btn-sm btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => onApprove(u.id)}
          >
            <FiCheck /> Approve & Assign
          </button>
        </>
      )}
    />
  );
};

export default UserApprovalCardList;