import { useEffect, useState } from 'react';
import FormField from '../../../components/FormField';
import { FiUser, FiPlus, FiEdit2 } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';

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
    <>
      {readonly ? (
        <button
          className="btn btn-success fw-bold d-flex align-items-center gap-2"
          onClick={() => setReadonly(false)}
        >
          <FiEdit2 /> Edit
        </button>
      ) : (
        <button className="btn btn-success fw-bold" onClick={handleSubmit}>
          Simpan
        </button>
      )}
      <button className="btn btn-secondary fw-bold" onClick={onClose}>
        Tutup
      </button>
    </>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      title={
        agent ? (
          <span className="d-flex align-items-center gap-2">
            <FiUser /> Detail Agent
          </span>
        ) : (
          <span className="d-flex align-items-center gap-2">
            <FiPlus /> Tambah Agent
          </span>
        )
      }
      footer={footer}
    >
      {formContent}
    </ModalWrapper>
  );
};

export default AddAgentModal;