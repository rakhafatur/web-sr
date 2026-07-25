import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import { supabase } from '../../../lib/supabaseClient';

const CreateAgent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama_agent: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nama_agent) {
      toast.error('Nama agent wajib diisi');
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
    <div
      className="container-fluid py-4 px-md-4 px-3"
      style={{
        background: 'linear-gradient(to bottom, #f7fff9 0%, #ffffff 100%)',
        minHeight: '100vh',
      }}
    >
      <EntityPageHeader
        icon={<FiUser />}
        title="Tambah Agent"
        description="Tambahkan agent baru ke sistem SR Agency"
        onBack={() => navigate('/agent')}
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
        title="Agent Management"
        subtitle="Lengkapi informasi agent dengan benar sebelum menyimpan data"
      />

      <EntityFormCard title="Informasi Agent" description="Data agent yang akan ditambahkan">
        <FormField
          label="Nama Agent"
          name="nama_agent"
          value={form.nama_agent}
          onChange={handleChange}
        />
      </EntityFormCard>
    </div>
  );
};

export default CreateAgent;
