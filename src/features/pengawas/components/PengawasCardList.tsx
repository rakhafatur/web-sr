import { FiCreditCard, FiCalendar, FiUserPlus, FiUser, FiSmile } from 'react-icons/fi';
import DataCardList from '../../../components/DataCardList';

export type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  nomor_ktp: string | null;
  tanggal_lahir: string | null;
  tanggal_bergabung: string | null;
  alamat: string | null;
};

type Props = {
  pengawas: Pengawas[];
  onEdit: (pengawas: Pengawas) => void;
  onDelete: (id: string) => void;
};

const PengawasCardList = ({ pengawas, onEdit, onDelete }: Props) => {
  return (
    <DataCardList
      items={pengawas}
      getId={(p) => p.id}
      onEdit={onEdit}
      onDelete={onDelete}
      renderItem={(p) => (
        <>

          <div className="d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
            <FiSmile className="me-2" /> {p.nama_panggilan}
          </div>
          <div className="d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
            <FiUser className="me-2" /> {p.nama_lengkap}
          </div>
        </>
      )}
    />
  );
};

export default PengawasCardList;
