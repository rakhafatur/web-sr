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

const CreateAgent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama_agent: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const error = validasiWajib([
      { label: 'Nama agent', value: form.nama_agent },
    ]);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from('agent').insert([form]);
      if (error) throw error;

      toast.success('Agent berhasil ditambahkan');
      navigate('/agent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/agent"
        icon={<FiUser />}
        title="Tambah Agent"
        description="Tambahkan agent baru ke sistem SR Agency"
      />

      <EntityHeroCard
        icon={<FiUser />}
        title="Agent Management"
        subtitle="Lengkapi informasi agent dengan benar sebelum menyimpan data"
      />

      <EntityFormCard title="Informasi Agent" description="Data agent yang akan ditambahkan">
        <FormField
          label="Nama Agent"
          name="nama_agent"
          required
          value={form.nama_agent}
          onChange={handleChange}
        />
      </EntityFormCard>

      <EntitySubmitButton onClick={handleSubmit} loading={loading}>
        Simpan Agent
      </EntitySubmitButton>
    </div>
  );
};

export default CreateAgent;
