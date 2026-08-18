import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntityDetailActions from '../../../components/EntityDetailActions';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';

type FormType = {
  nama_agent: string;
};

const DetailAgent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<FormType>({ nama_agent: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readonly, setReadonly] = useState(true);

  const fetchAgent = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('agent')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setForm({ nama_agent: data.nama_agent || '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengambil data agent');
      navigate('/agent');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const error = validasiWajib([
      { label: 'Nama agent', value: form.nama_agent },
    ]);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from('agent').update(form).eq('id', id);
      if (error) throw error;

      toast.success('Agent berhasil diperbarui');
      setReadonly(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal update agent');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="page-shell d-flex justify-content-center align-items-center py-5"
        role="status"
        aria-label="Mengambil data agent"
      >
        <FiLoader size={24} className="spinner-icon" />
      </div>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        icon={<FiUser />}
        title="Detail Agent"
        description="Kelola informasi agent"
        actions={
          <EntityDetailActions
            readonly={readonly}
            editLabel="Edit Agent"
            saving={saving}
            onEdit={() => setReadonly(false)}
            onCancel={() => {
              setReadonly(true);
              fetchAgent();
            }}
            onSave={handleSave}
          />
        }
      />

      <EntityHeroCard icon={<FiUser />} title={form.nama_agent || '-'} subtitle="Data agent" />

      <EntityFormCard title="Informasi Agent" description="Detail dan informasi agent">
        <FormField
          label="Nama Agent"
          name="nama_agent"
          value={form.nama_agent}
          onChange={handleChange}
          readOnly={readonly}
        />
      </EntityFormCard>
    </div>
  );
};

export default DetailAgent;
