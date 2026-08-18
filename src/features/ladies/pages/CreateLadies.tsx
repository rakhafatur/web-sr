import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntitySubmitButton from '../../../components/EntitySubmitButton';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';
import { useAgentOptions } from '../hooks/useAgentOptions';
import { useOutletOptions } from '../hooks/useOutletOptions';

type FormType = {
  nama_lengkap: string;
  nama_ladies: string;
  nama_outlet: string;
  outlet_id: string | null;
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
  outlet_id: null,
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
  const outlets = useOutletOptions();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = outlets.find((o) => o.id === e.target.value);
    setForm((prev) => ({
      ...prev,
      outlet_id: selected?.id ?? null,
      nama_outlet: selected?.nama_outlet ?? '',
    }));
  };

  const handleSubmit = async () => {
    const error = validasiWajib([
      { label: 'Nama lengkap', value: form.nama_lengkap, name: 'nama_lengkap' },
      { label: 'Nama ladies', value: form.nama_ladies, name: 'nama_ladies' },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

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
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/ladies"
        icon={<FiUser />}
        title="Tambah Ladies"
        description="Tambahkan ladies baru ke sistem SR Agency"
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
          required
          invalid={fieldSalah === 'nama_lengkap'}
          value={form.nama_lengkap}
          onChange={handleChange}
        />
        <FormField
          label="Nama Ladies"
          name="nama_ladies"
          required
          invalid={fieldSalah === 'nama_ladies'}
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
          <select
            className="form-select border"
            name="outlet_id"
            value={form.outlet_id || ''}
            onChange={handleOutletChange}
          >
            <option value="">-- Pilih Outlet --</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nama_outlet}
              </option>
            ))}
          </select>
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

      <EntitySubmitButton onClick={handleSubmit} loading={loading}>
        Simpan Ladies
      </EntitySubmitButton>
    </div>
  );
};

export default CreateLadies;
