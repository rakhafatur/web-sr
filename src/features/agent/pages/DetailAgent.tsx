import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiCheckCircle, FiEdit2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import { supabase } from '../../../lib/supabaseClient';

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
    if (!form.nama_agent) {
      toast.error('Nama agent wajib diisi');
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
      <div className="container-fluid py-5" style={{ minHeight: '100vh' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Mengambil data agent...</span>
        </div>
      </div>
    );
  }

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
        title="Detail Agent"
        description="Kelola informasi agent"
        onBack={() => navigate('/agent')}
        actions={
          readonly ? (
            <button
              className="btn btn-light fw-bold d-flex align-items-center gap-2"
              style={{ borderRadius: 14, color: 'var(--color-green)' }}
              onClick={() => setReadonly(false)}
            >
              <FiEdit2 />
              Edit Agent
            </button>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-light fw-semibold d-flex align-items-center gap-2"
                style={{ borderRadius: 14 }}
                onClick={() => {
                  setReadonly(true);
                  fetchAgent();
                }}
              >
                <FiX />
                Batal
              </button>

              <button
                className="btn btn-success fw-bold d-flex align-items-center gap-2"
                style={{ borderRadius: 14 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
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
            </div>
          )
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
