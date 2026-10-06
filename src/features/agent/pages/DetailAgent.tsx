import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiBriefcase, FiEdit2 } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopField from '../../../components/desktop/DesktopField';
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
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: dk-.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchAgent = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('agent')
        .select('nama_agent')
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

  // Desktop (gaya baru dk-, sama dengan Detail User): kartu identitas & kartu
  // informasi. Mode lihat = daftar label–nilai; mode ubah = input.
  const batalUbah = () => {
    setReadonly(true);
    setFieldSalah(null);
    fetchAgent();
  };

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/agent', label: 'Agent' }}
        title={readonly ? 'Detail agent' : 'Ubah agent'}
        description="Informasi agent SR Agency"
        actions={
          readonly ? (
            <button type="button" className="dk-btn dk-btn--primary" onClick={() => setReadonly(false)}>
              <FiEdit2 aria-hidden />
              Ubah
            </button>
          ) : (
            <>
              <button type="button" className="dk-btn" onClick={batalUbah} disabled={saving}>
                Batal
              </button>
              <button type="button" className="dk-btn dk-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </>
          )
        }
      />

      <div className="dk-detail-grid">
        <aside className="dk-card">
          <div className="dk-identity">
            <span className="dk-avatar" aria-hidden>
              {(form.nama_agent || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className="dk-identity-name">{form.nama_agent || '-'}</h2>
            <div className="dk-identity-sub">Agent</div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi agent">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi agent</h2>
            <div className="dk-card-sub">
              {readonly ? 'Klik Ubah untuk mengganti data agent.' : 'Kolom bertanda * wajib diisi.'}
            </div>
          </div>

          <div className="dk-card-body">
            {readonly ? (
              <dl className="dk-info">
                <div>
                  <dt>Nama agent</dt>
                  <dd>{form.nama_agent || '-'}</dd>
                </div>
              </dl>
            ) : (
              <div className="dk-form-grid">
                <DesktopField label="Nama agent" htmlFor="dk-nama-agent" required>
                  <input
                    id="dk-nama-agent"
                    name="nama_agent"
                    type="text"
                    autoComplete="off"
                    className={`dk-input ${fieldSalah === 'nama_agent' ? 'is-invalid' : ''}`}
                    aria-invalid={fieldSalah === 'nama_agent' || undefined}
                    value={form.nama_agent}
                    onChange={handleChange}
                  />
                </DesktopField>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailAgent;
