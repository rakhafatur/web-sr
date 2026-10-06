import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiTag, FiCreditCard, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';
import PengawasFormDesktop, { PengawasFormValues as FormType } from '../components/PengawasFormDesktop';

const CreatePengawas = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormType>({
    nama_lengkap: '',
    nama_panggilan: '',
    nomor_ktp: '',
    tanggal_lahir: '',
    alamat: '',
    tanggal_bergabung: '',
  });

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
      { label: 'Nama lengkap', value: form.nama_lengkap, name: 'nama_lengkap' },
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
        tanggal_lahir: form.tanggal_lahir || null,
        tanggal_bergabung: form.tanggal_bergabung || null,
      };

      const { error } = await supabase.from('pengawas').insert([payload]);
      if (error) throw error;

      toast.success('Pengawas berhasil ditambahkan');
      navigate('/pengawas');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan pengawas');
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <MobileFormPage
        title="Tambah Pengawas"
        backTo="/pengawas"
        sectionTitle="Informasi pengawas"
        footer={
          <button type="button" className="tm-btn tm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Pengawas'}
          </button>
        }
      >
        <MobileTextField
          id="pengawas-nama-lengkap"
          label="Nama lengkap"
          name="nama_lengkap"
          icon={<FiUser />}
          required
          invalid={fieldSalah === 'nama_lengkap'}
          value={form.nama_lengkap}
          onChange={handleChange}
        />
        <MobileTextField
          id="pengawas-panggilan"
          label="Nama panggilan"
          name="nama_panggilan"
          icon={<FiTag />}
          value={form.nama_panggilan}
          onChange={handleChange}
        />
        <MobileTextField
          id="pengawas-ktp"
          label="Nomor KTP"
          name="nomor_ktp"
          icon={<FiCreditCard />}
          inputMode="numeric"
          value={form.nomor_ktp}
          onChange={handleChange}
        />
        <MobileTextField
          id="pengawas-lahir"
          label="Tanggal lahir"
          name="tanggal_lahir"
          type="date"
          icon={<FiCalendar />}
          value={form.tanggal_lahir}
          onChange={handleChange}
        />
        <MobileTextField
          id="pengawas-alamat"
          label="Alamat"
          name="alamat"
          type="textarea"
          icon={<FiMapPin />}
          value={form.alamat}
          onChange={handleChange}
        />
        <MobileTextField
          id="pengawas-bergabung"
          label="Tanggal bergabung"
          name="tanggal_bergabung"
          type="date"
          icon={<FiCalendar />}
          value={form.tanggal_bergabung}
          onChange={handleChange}
        />
      </MobileFormPage>
    );
  }

  // Desktop (gaya baru dk-, sama dengan Tambah User): pratinjau identitas
  // (terisi saat mengetik) & kartu form grid 2 kolom.
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/pengawas', label: 'Pengawas' }}
        title="Tambah pengawas"
        description="Tambahkan pengawas baru ke sistem SR Agency"
      />

      <div className="dk-detail-grid">
        <aside className="dk-card" aria-label="Pratinjau pengawas">
          <div className="dk-identity">
            <span className={`dk-avatar ${form.nama_lengkap ? '' : 'is-empty'}`} aria-hidden>
              {(form.nama_lengkap || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className={`dk-identity-name ${form.nama_lengkap ? '' : 'is-placeholder'}`}>
              {form.nama_lengkap || 'Nama lengkap'}
            </h2>
            <div className="dk-identity-sub">
              {form.nama_panggilan ? `Panggilan: ${form.nama_panggilan}` : 'Pengawas'}
            </div>
            <div className="dk-identity-note">Pratinjau — terisi saat kamu mengetik</div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi pengawas">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi pengawas</h2>
            <div className="dk-card-sub">Kolom bertanda * wajib diisi.</div>
          </div>

          <div className="dk-card-body">
            <PengawasFormDesktop form={form} fieldSalah={fieldSalah} onChange={handleChange} />
          </div>

          <div className="dk-card-foot">
            <button type="button" className="dk-btn" onClick={() => navigate('/pengawas')} disabled={loading}>
              Batal
            </button>
            <button type="button" className="dk-btn dk-btn--primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan pengawas'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreatePengawas;
