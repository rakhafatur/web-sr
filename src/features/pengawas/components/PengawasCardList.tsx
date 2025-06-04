import { FiCreditCard, FiCalendar, FiUserPlus } from 'react-icons/fi';
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
          <div className="fw-bold fs-6">{p.nama_lengkap}</div>
          {p.nama_panggilan && (
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
              {p.nama_panggilan}
            </div>
          )}
          <div className="mt-2" style={{ fontSize: '0.9rem' }}>
            {p.nomor_ktp && (
              <div className="d-flex align-items-center mb-1">
                <FiCreditCard className="me-2" /> {p.nomor_ktp}
              </div>
            )}
            {p.tanggal_lahir && (
              <div className="d-flex align-items-center mb-1">
                <FiCalendar className="me-2" /> Lahir: {p.tanggal_lahir}
              </div>
            )}
            {p.tanggal_bergabung && (
              <div className="d-flex align-items-center">
                <FiUserPlus className="me-2" /> Bergabung: {p.tanggal_bergabung}
              </div>
            )}
          </div>
        </>
      )}
    />
  );
};

export default PengawasCardList;
