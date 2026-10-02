import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiBriefcase } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntityDetailActions from '../../../components/EntityDetailActions';
import DetailFormSkeleton from '../../../components/DetailFormSkeleton';
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
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: lama.
  const isMobile = useMediaQuery({ maxWidth: 768 });

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

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
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
    return <DetailFormSkeleton label="Mengambil data agent" fields={1} />;
  }

  if (isMobile) {
    return (
      <MobileFormPage
        title={readonly ? 'Detail Agent' : 'Ubah Agent'}
        backTo="/agent"
        onEdit={readonly ? () => setReadonly(false) : undefined}
        identity={{ name: form.nama_agent }}
        sectionTitle="Informasi agent"
        footer={
          !readonly && (
            <div className="tm-actions">
              <button
                type="button"
                className="tm-btn"
                disabled={saving}
                onClick={() => {
                  setReadonly(true);
                  setFieldSalah(null);
                  fetchAgent();
                }}
              >
                Batal
              </button>
              <button type="button" className="tm-btn tm-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          )
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
          readOnly={readonly}
        />
      </MobileFormPage>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/agent"
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
          required
          invalid={fieldSalah === 'nama_agent'}
          value={form.nama_agent}
          onChange={handleChange}
          readOnly={readonly}
        />
      </EntityFormCard>
    </div>
  );
};

export default DetailAgent;
