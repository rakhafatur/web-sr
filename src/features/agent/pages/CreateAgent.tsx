import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField } from '../../../components/mobile/MobileFields';
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
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: lama.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const error = validasiWajib([
      { label: 'Nama agent', value: form.nama_agent, name: 'nama_agent' },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

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

  if (isMobile) {
    return (
      <MobileFormPage
        title="Tambah Agent"
        backTo="/agent"
        sectionTitle="Informasi agent"
        footer={
          <button type="button" className="tm-btn tm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Agent'}
          </button>
        }
      >
        <MobileTextField
          id="agent-nama"
          label="Nama agent"
          name="nama_agent"
          icon={<FiBriefcase />}
          required
          invalid={fieldSalah === 'nama_agent'}
          value={form.nama_agent}
          onChange={handleChange}
        />
      </MobileFormPage>
    );
  }

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
          invalid={fieldSalah === 'nama_agent'}
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
