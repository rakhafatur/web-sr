import { FiUser, FiPlus } from 'react-icons/fi';
import EntityFormModal, { Field } from '../../../components/EntityFormModal';
import FormInput from '../../../components/FormInput';

type Lady = {
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
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lady, 'id'>) => void;
  lady?: Lady | null;
};

const AddLadiesModal = ({ show, onClose, onSubmit, lady }: Props) => {
  const fields: Field[] = [
    { name: 'nama_lengkap', label: 'Nama Lengkap' },
    { name: 'nama_ladies', label: 'Nama Ladies' },
    { name: 'pin', label: 'PIN' },
    { name: 'nomor_ktp', label: 'Nomor KTP' },
    {
      name: 'tanggal_bergabung',
      label: 'Tanggal Bergabung',
      type: 'date',
    },
    { name: 'alamat', label: 'Alamat', type: 'textarea' },
    {
      name: 'nama_outlet',
      label: 'Nama Outlet',
      render: ({ value, onChange, readonly }) =>
        readonly ? (
          <input
            className="form-control bg-white text-dark border"
            value={value || '-'}
            readOnly
          />
        ) : (
          <div className="d-flex gap-3">
            {['SA', 'Royal', 'MTR'].map((outlet) => (
              <div key={outlet} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="nama_outlet"
                  value={outlet}
                  checked={value === outlet}
                  onChange={onChange}
                  id={`outlet-${outlet}`}
                />
                <label className="form-check-label" htmlFor={`outlet-${outlet}`}>{outlet}</label>
              </div>
            ))}
          </div>
        ),
    },
  ];

  return (
    <EntityFormModal
      show={show}
      onClose={onClose}
      onSubmit={onSubmit}
      data={lady || undefined}
      titleAdd={
        <span className="d-flex align-items-center gap-2">
          <FiPlus /> Tambah Ladies
        </span>
      }
      titleDetail={
        <span className="d-flex align-items-center gap-2">
          <FiUser /> Detail Ladies
        </span>
      }
      fields={fields}
    />
  );
};

export default AddLadiesModal;