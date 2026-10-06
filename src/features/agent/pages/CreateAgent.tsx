import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopField from '../../../components/desktop/DesktopField';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';

const CreateAgent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nama_agent: '' });
  const [loading, setLoading] = useState(false);
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: dk-.
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

  // Desktop (gaya baru dk-, sama dengan Tambah User): pratinjau identitas
  // (terisi saat mengetik) & kartu form.
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/agent', label: 'Agent' }}
        title="Tambah agent"
        description="Tambahkan agent baru ke sistem SR Agency"
      />

      <div className="dk-detail-grid">
        <aside className="dk-card" aria-label="Pratinjau agent">
          <div className="dk-identity">
            <span className={`dk-avatar ${form.nama_agent ? '' : 'is-empty'}`} aria-hidden>
              {(form.nama_agent || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className={`dk-identity-name ${form.nama_agent ? '' : 'is-placeholder'}`}>
              {form.nama_agent || 'Nama agent'}
            </h2>
            <div className="dk-identity-sub">Agent</div>
            <div className="dk-identity-note">Pratinjau — terisi saat kamu mengetik</div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi agent">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi agent</h2>
            <div className="dk-card-sub">Kolom bertanda * wajib diisi.</div>
          </div>

          <div className="dk-card-body">
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
          </div>

          <div className="dk-card-foot">
            <button type="button" className="dk-btn" onClick={() => navigate('/agent')} disabled={loading}>
              Batal
            </button>
            <button type="button" className="dk-btn dk-btn--primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan agent'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateAgent;
