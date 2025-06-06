import { FiUser, FiSmile, FiMapPin, FiCreditCard, FiCalendar } from 'react-icons/fi';
import DataCardList from '../../../components/DataCardList';

export type Lady = {
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
  ladies: Lady[];
  onEdit: (lady: Lady) => void;
  onDelete: (id: string) => void;
};

const LadiesCardList = ({ ladies, onEdit, onDelete }: Props) => {
  return (
    <DataCardList
      items={ladies}
      getId={(l) => l.id}
      onEdit={onEdit}
      onDelete={onDelete}
      renderItem={(l) => (
        <>
          <div className="d-flex align-items-center mb-1" style={{ fontSize: '0.9rem' }}>
            <FiSmile className="me-2" /> {l.nama_ladies}
          </div>
          <div className="d-flex align-items-center mb-1" style={{ fontSize: '0.9rem' }}>
            <FiUser className="me-2" /> {l.nama_lengkap}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ fontSize: '0.9rem' }}>
            <FiMapPin className="me-2" /> {l.nama_outlet}
          </div>
          <div className="d-flex align-items-center mb-1" style={{ fontSize: '0.9rem' }}>
            <FiCreditCard className="me-2" /> PIN: {l.pin}
          </div>
        </>
      )}
    />
  );
};

export default LadiesCardList;
