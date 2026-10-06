import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiTag, FiKey, FiCreditCard, FiCalendar, FiMapPin, FiHome, FiBriefcase } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField, MobileSelectField, MobileChoiceField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';
import { useAgentOptions } from '../hooks/useAgentOptions';
import { useOutletOptions } from '../hooks/useOutletOptions';
import LadiesFormDesktop from '../components/LadiesFormDesktop';
import { STATUS_LADIES, TONE_STATUS } from '../utils/statusLadies';

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
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: dk-.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // outlet_id & nama_outlet selalu diubah bersama (pemilih bercari, mobile &
  // desktop).
  const pilihOutlet = (outletId: string) => {
    const selected = outlets.find((o) => o.id === outletId);
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

  if (isMobile) {
    return (
      <MobileFormPage
        title="Tambah Ladies"
        backTo="/ladies"
        sectionTitle="Informasi ladies"
        footer={
          <button type="button" className="tm-btn tm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Ladies'}
          </button>
        }
      >
        <MobileTextField
          id="ladies-nama-lengkap"
          label="Nama lengkap"
          name="nama_lengkap"
          icon={<FiUser />}
          required
          invalid={fieldSalah === 'nama_lengkap'}
          value={form.nama_lengkap}
          onChange={handleChange}
        />
        <MobileTextField
          id="ladies-nama"
          label="Nama ladies"
          name="nama_ladies"
          icon={<FiTag />}
          required
          invalid={fieldSalah === 'nama_ladies'}
          value={form.nama_ladies}
          onChange={handleChange}
        />
        <MobileTextField
          id="ladies-pin"
          label="PIN"
          name="pin"
          icon={<FiKey />}
          inputMode="numeric"
          value={form.pin}
          onChange={handleChange}
        />
        <MobileTextField
          id="ladies-ktp"
          label="Nomor KTP"
          name="nomor_ktp"
          icon={<FiCreditCard />}
          inputMode="numeric"
          value={form.nomor_ktp}
          onChange={handleChange}
        />
        <MobileTextField
          id="ladies-bergabung"
          label="Tanggal bergabung"
          name="tanggal_bergabung"
          type="date"
          icon={<FiCalendar />}
          value={form.tanggal_bergabung}
          onChange={handleChange}
        />
        <MobileTextField
          id="ladies-alamat"
          label="Alamat"
          name="alamat"
          type="textarea"
          icon={<FiMapPin />}
          value={form.alamat}
          onChange={handleChange}
        />
        <MobileSelectField
          id="ladies-outlet"
          label="Outlet"
          icon={<FiHome />}
          value={form.outlet_id || ''}
          options={outlets.map((o) => ({ value: o.id, label: o.nama_outlet }))}
          onChange={pilihOutlet}
          placeholder="Pilih outlet"
        />
        <MobileSelectField
          id="ladies-agent"
          label="Agent"
          icon={<FiBriefcase />}
          value={form.agent_id || ''}
          options={agents.map((a) => ({ value: a.id, label: a.nama_agent }))}
          onChange={(v) => setForm((prev) => ({ ...prev, agent_id: v || null }))}
          placeholder="Pilih agent"
        />
        <MobileChoiceField
          id="ladies-status"
          label="Status"
          value={form.status}
          options={STATUS_LADIES}
          onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
        />
      </MobileFormPage>
    );
  }

  // Desktop (gaya baru dk-, sama dengan Tambah User): pratinjau identitas
  // (terisi saat mengetik) & kartu form grid 2 kolom.
  const statusDipilih = STATUS_LADIES.find((s) => s.value === form.status);

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/ladies', label: 'Ladies' }}
        title="Tambah ladies"
        description="Tambahkan ladies baru ke sistem SR Agency"
      />

      <div className="dk-detail-grid">
        <aside className="dk-card" aria-label="Pratinjau ladies">
          <div className="dk-identity">
            <span className={`dk-avatar ${form.nama_ladies ? '' : 'is-empty'}`} aria-hidden>
              {(form.nama_ladies || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className={`dk-identity-name ${form.nama_ladies ? '' : 'is-placeholder'}`}>
              {form.nama_ladies || 'Nama ladies'}
            </h2>
            <div className="dk-identity-sub">{form.nama_lengkap || 'Nama lengkap'}</div>
            <div className="dk-identity-meta">
              {statusDipilih && (
                <span className={`dk-status is-${TONE_STATUS[statusDipilih.value] ?? 'muted'}`}>
                  {statusDipilih.label}
                </span>
              )}
              {form.nama_outlet && <span className="dk-identity-sub">{form.nama_outlet}</span>}
            </div>
            <div className="dk-identity-note">Pratinjau — terisi saat kamu mengetik</div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi ladies">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi ladies</h2>
            <div className="dk-card-sub">Kolom bertanda * wajib diisi.</div>
          </div>

          <div className="dk-card-body">
            <LadiesFormDesktop
              form={form}
              fieldSalah={fieldSalah}
              onChange={handleChange}
              outletOptions={outlets.map((o) => ({ value: o.id, label: o.nama_outlet }))}
              agentOptions={agents.map((a) => ({ value: a.id, label: a.nama_agent }))}
              statusOptions={STATUS_LADIES}
              onOutletChange={pilihOutlet}
              onAgentChange={(v) => setForm((prev) => ({ ...prev, agent_id: v || null }))}
              onStatusChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
            />
          </div>

          <div className="dk-card-foot">
            <button type="button" className="dk-btn" onClick={() => navigate('/ladies')} disabled={loading}>
              Batal
            </button>
            <button type="button" className="dk-btn dk-btn--primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan ladies'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateLadies;
