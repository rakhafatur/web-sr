import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import { supabase } from '../../../lib/supabaseClient';
import { useAgentOptions } from '../hooks/useAgentOptions';

type FormType = {
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

const emptyForm: FormType = {
  nama_lengkap: '',
  nama_ladies: '',
  nama_outlet: '',
  pin: '',
  nomor_ktp: '',
  tanggal_bergabung: '',
  alamat: '',
  status: 'active',
  agent_id: null,
};

const CreateLadies = () => {
  const navigate = useNavigate();
  const agents = useAgentOptions();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.nama_ladies) {
      toast.error('Nama lengkap dan nama ladies wajib diisi');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        tanggal_bergabung: form.tanggal_bergabung || null,
      };

      const { error } = await supabase.from('ladies').insert([payload]);
      if (error) throw error;

      toast.success('Ladies berhasil ditambahkan');
      navigate('/ladies');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan ladies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <EntityPageHeader
        icon={<FiUser />}
        title="Tambah Ladies"
        description="Tambahkan ladies baru ke sistem SR Agency"
        onBack={() => navigate('/ladies')}
        actions={
          <button
            className="btn btn-light fw-bold d-flex align-items-center gap-2"
            style={{ borderRadius: 14, color: 'var(--color-green)' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status" />
                Menyimpan...
              </>
            ) : (
              <>
                <FiCheckCircle />
                Simpan
              </>
            )}
          </button>
        }
      />

      <EntityHeroCard
        icon={<FiUser />}
        title="Ladies Management"
        subtitle="Lengkapi informasi ladies dengan benar sebelum menyimpan data"
      />

      <EntityFormCard title="Informasi Ladies" description="Data ladies yang akan ditambahkan">
        <FormField
          label="Nama Lengkap"
          name="nama_lengkap"
          value={form.nama_lengkap}
          onChange={handleChange}
        />
        <FormField
          label="Nama Ladies"
          name="nama_ladies"
          value={form.nama_ladies}
          onChange={handleChange}
        />
        <FormField label="PIN" name="pin" value={form.pin} onChange={handleChange} />
        <FormField
          label="Nomor KTP"
          name="nomor_ktp"
          value={form.nomor_ktp}
          onChange={handleChange}
        />
        <FormField
          label="Tanggal Bergabung"
          name="tanggal_bergabung"
          value={form.tanggal_bergabung}
          onChange={handleChange}
          type="date"
        />
        <FormField
          label="Alamat"
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          type="textarea"
        />

        <div>
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
            Nama Outlet
          </label>
          <div className="d-flex gap-3 flex-wrap">
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
                <label className="form-check-label" htmlFor={`outlet-${outlet}`}>
                  {outlet}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
            Agent
          </label>
          <select
            className="form-select border"
            name="agent_id"
            value={form.agent_id || ''}
            onChange={handleChange}
          >
            <option value="">-- Pilih Agent --</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama_agent}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label fw-semibold" htmlFor="status">
            Status
          </label>
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
      </EntityFormCard>
    </div>
  );
};

export default CreateLadies;
