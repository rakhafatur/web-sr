import { FiUser } from 'react-icons/fi';
import DataCardList from '../../../components/DataCardList';

export type Agent = {
  id: string;
  nama_agent: string;
};

type Props = {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
};

const AgentCardList = ({ agents, onEdit, onDelete }: Props) => {
  return (
    <DataCardList
      items={agents}
      getId={(a) => a.id}
      onEdit={onEdit}
      onDelete={onDelete}
      renderItem={(a) => (
        <>
          <div
            className="d-flex align-items-center"
            style={{ fontSize: '0.9rem' }}
          >
            <FiUser className="me-2" /> {a.nama_agent}
          </div>
        </>
      )}
    />
  );
};

export default AgentCardList;
