import { useEffect, useState } from 'react';
import FormField from '../../../components/FormField';
import { FiUser, FiPlus, FiEdit2, FiSave } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';
import ModalHeading from '../../../components/ModalHeading';
import ModalButton from '../../../components/ModalButton';
import { supabase } from '../../../lib/supabaseClient';

const HEADER_GRADIENT = 'linear-gradient(135deg,var(--color-green),#7be0a9)';

type Lady = {
  id: string;
  nama_lengkap: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  nomor_ktp: string;
  tanggal_bergabung: string;
  alamat: string;
  status: string;
  agent_id: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Lady, 'id'>) => void;
  lady?: Lady | null;
};

const AddLadiesModal = ({ show, onClose, onSubmit, lady }: Props) => {
  const [form, setForm] = useState<Omit<Lady, 'id'>>({
    nama_lengkap: '',
    nama_ladies: '',
    nama_outlet: '',
    pin: '',
    nomor_ktp: '',
    tanggal_bergabung: '',
    alamat: '',
    status: 'active',
    agent_id: null,
  });

  const [readonly, setReadonly] = useState(false);
  const [agents, setAgents] = useState<{ id: string; nama_agent: string }[]>([]);

  // Load agents saat modal dibuka
  useEffect(() => {
    if (!show) return;

    const loadAgents = async () => {
      const { data } = await supabase.from("agent").select("id, nama_agent");
      setAgents(data || []);
    };

    loadAgents();
  }, [show]);

  // Load data ladies jika mode edit/detail
  useEffect(() => {
    if (!show) return;

    if (lady) {
      setForm({
        nama_lengkap: lady.nama_lengkap,
        nama_ladies: lady.nama_ladies,
        nama_outlet: lady.nama_outlet,
        pin: lady.pin,
        nomor_ktp: lady.nomor_ktp,
        tanggal_bergabung: lady.tanggal_bergabung,
        alamat: lady.alamat,
        status: lady.status,
        agent_id: lady.agent_id,
      });
      setReadonly(true);
    } else {
      setForm({
        nama_lengkap: '',
        nama_ladies: '',
        nama_outlet: '',
        pin: '',
        nomor_ktp: '',
        tanggal_bergabung: '',
        alamat: '',
        status: 'active',
        agent_id: null,
      });
      setReadonly(false);
    }
  }, [show, lady]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  if (!show) return null;

  const formContent = (
    <>
      <FormField label="Nama Lengkap" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} readOnly={readonly} />
      <FormField label="Nama Ladies" name="nama_ladies" value={form.nama_ladies} onChange={handleChange} readOnly={readonly} />
      <FormField label="PIN" name="pin" value={form.pin} onChange={handleChange} readOnly={readonly} />
      <FormField label="Nomor KTP" name="nomor_ktp" value={form.nomor_ktp} onChange={handleChange} readOnly={readonly} />
      <FormField label="Tanggal Bergabung" name="tanggal_bergabung" value={form.tanggal_bergabung} onChange={handleChange} readOnly={readonly} type="date" />
      <FormField label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} readOnly={readonly} type="textarea" />

      {/* Dropdown Outlet */}
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>Nama Outlet</label>
        {readonly ? (
          <input className="form-control bg-white text-dark border" value={form.nama_outlet || '-'} readOnly />
        ) : (
          <div className="d-flex gap-3">
            {['SA', 'Royal', 'MTR', 'Travel'].map((outlet) => (
              <div key={outlet} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="nama_outlet"
                  value={outlet}
                  checked={form.nama_outlet === outlet}
                  onChange={handleChange}
                  id={`outlet-${outlet}`}
                />
                <label className="form-check-label" htmlFor={`outlet-${outlet}`}>{outlet}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown Agent */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Agent</label>

        {readonly ? (
          <input
            className="form-control bg-white text-dark border"
            value={agents.find(a => a.id === form.agent_id)?.nama_agent || '-'}
            readOnly
          />
        ) : (
          <select
            className="form-select border"
            name="agent_id"
            value={form.agent_id || ''}
            onChange={handleChange}
          >
            <option value="">-- Pilih Agent --</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.nama_agent}</option>
            ))}
          </select>
        )}
      </div>

      {/* Status */}
      {!readonly && (
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="status">Status</label>
          <select
            className="form-select border"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="resign">Resign</option>
            <option value="not active">Not Active</option>
          </select>
        </div>
      )}
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
          icon={lady ? <FiUser /> : <FiPlus />}
          title={lady ? 'Detail Ladies' : 'Tambah Ladies'}
          subtitle={lady ? 'Lihat atau edit data ladies' : 'Tambahkan ladies baru ke sistem'}
        />
      }
      footer={footer}
    >
      {formContent}
    </ModalWrapper>
  );
};

export default AddLadiesModal;
