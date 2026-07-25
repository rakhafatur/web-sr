import { useEffect, useState } from 'react';
import FormField from '../../../components/FormField';
import { FiUser, FiPlus, FiEdit2, FiSave } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';
import ModalHeading from '../../../components/ModalHeading';
import ModalButton from '../../../components/ModalButton';

const HEADER_GRADIENT = 'linear-gradient(135deg,var(--color-green),#7be0a9)';

type Agent = {
  nama_agent: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Agent) => void;
  agent?: (Agent & { id: string }) | null;
};

const AddAgentModal = ({ show, onClose, onSubmit, agent }: Props) => {
  const [form, setForm] = useState<Agent>({
    nama_agent: '',
  });

  const [readonly, setReadonly] = useState<boolean>(false);

  useEffect(() => {
    if (!show) return;

    if (agent) {
      setForm({
        nama_agent: agent.nama_agent,
      });
      setReadonly(true);
    } else {
      setForm({
        nama_agent: '',
      });
      setReadonly(false);
    }
  }, [show, agent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.nama_agent) {
      alert('Nama agent wajib diisi');
      return;
    }

    onSubmit(form);
    onClose();
  };

  if (!show) return null;

  const formContent = (
    <>
      <FormField
        label="Nama Agent"
        name="nama_agent"
        value={form.nama_agent}
        onChange={handleChange}
        readOnly={readonly}
      />
    </>
  );

  const footer = (
    <div className="d-flex justify-content-end gap-2 flex-wrap">
      <ModalButton variant="secondary" onClick={onClose}>
        Tutup
      </ModalButton>
      {readonly ? (
        <ModalButton variant="warning" icon={<FiEdit2 />} onClick={() => setReadonly(false)}>
          Edit Form
        </ModalButton>
      ) : (
        <ModalButton variant="primary" icon={<FiSave />} onClick={handleSubmit}>
          Simpan
        </ModalButton>
      )}
    </div>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      headerGradient={HEADER_GRADIENT}
      title={
        <ModalHeading
          icon={agent ? <FiUser /> : <FiPlus />}
          title={agent ? 'Detail Agent' : 'Tambah Agent'}
          subtitle={agent ? 'Lihat atau edit data agent' : 'Tambahkan agent baru ke sistem'}
        />
      }
      footer={footer}
    >
      {formContent}
    </ModalWrapper>
  );
};

export default AddAgentModal;