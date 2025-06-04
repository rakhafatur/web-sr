import { FiUser, FiPlus } from 'react-icons/fi';
import dayjs from 'dayjs';
import EntityFormModal, { Field } from '../../../components/EntityFormModal';
import FormInput from '../../../components/FormInput';

type Pengawas = {
  nama_lengkap: string;
  nama_panggilan: string | null;
  nomor_ktp: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  tanggal_bergabung: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Pengawas) => void;
  pengawas?: (Pengawas & { id: string }) | null;
};

const AddPengawasModal = ({ show, onClose, onSubmit, pengawas }: Props) => {
  const handleSubmit = (data: Pengawas) => {
    if (!data.nama_lengkap) {
      alert('Nama lengkap wajib diisi');
      return;
    }

    const cleanForm = {
      ...data,
      tanggal_lahir: data.tanggal_lahir || null,
      tanggal_bergabung: data.tanggal_bergabung || null,
    };

    onSubmit(cleanForm);
  };

  const fields: Field[] = [
    { name: 'nama_lengkap', label: 'Nama Lengkap' },
    { name: 'nama_panggilan', label: 'Nama Panggilan' },
    { name: 'nomor_ktp', label: 'Nomor KTP' },
    {
      name: 'tanggal_lahir',
      label: 'Tanggal Lahir',
      render: ({ value, onChange, readonly }) => (
        <FormInput
          label="Tanggal Lahir"
          name="tanggal_lahir"
          value={
            readonly
              ? value
                ? dayjs(value).format('DD/MM/YYYY')
                : ''
              : value || ''
          }
          onChange={onChange}
          readOnly={readonly}
          type={readonly ? 'text' : 'date'}
        />
      ),
    },
    { name: 'alamat', label: 'Alamat', type: 'textarea' },
    {
      name: 'tanggal_bergabung',
      label: 'Tanggal Bergabung',
      render: ({ value, onChange, readonly }) => (
        <FormInput
          label="Tanggal Bergabung"
          name="tanggal_bergabung"
          value={
            readonly
              ? value
                ? dayjs(value).format('DD/MM/YYYY')
                : ''
              : value || ''
          }
          onChange={onChange}
          readOnly={readonly}
          type={readonly ? 'text' : 'date'}
        />
      ),
    },
  ];

  return (
    <EntityFormModal
      show={show}
      onClose={onClose}
      onSubmit={handleSubmit}
      data={pengawas || undefined}
      titleAdd={
        <span className="d-flex align-items-center gap-2">
          <FiPlus /> Tambah Pengawas
        </span>
      }
      titleDetail={
        <span className="d-flex align-items-center gap-2">
          <FiUser /> Detail Pengawas
        </span>
      }
      fields={fields}
    />
  );
};

export default AddPengawasModal;
