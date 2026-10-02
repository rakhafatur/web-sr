import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiTag, FiCreditCard, FiCalendar, FiMapPin } from 'react-icons/fi';
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

type FormType = {
  nama_lengkap: string;
  nama_panggilan: string;
  nomor_ktp: string;
  tanggal_lahir: string;
  alamat: string;
  tanggal_bergabung: string;
};

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

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/pengawas"
        icon={<FiUser />}
        title="Tambah Pengawas"
        description="Tambahkan pengawas baru ke sistem SR Agency"
      />

      <EntityHeroCard
        icon={<FiUser />}
        title="Pengawas Management"
        subtitle="Lengkapi informasi pengawas dengan benar sebelum menyimpan data"
      />

      <EntityFormCard title="Informasi Pengawas" description="Data pengawas yang akan ditambahkan">
        <FormField
          label="Nama Lengkap"
          name="nama_lengkap"
          required
          invalid={fieldSalah === 'nama_lengkap'}
          value={form.nama_lengkap}
          onChange={handleChange}
        />
        <FormField
          label="Nama Panggilan"
          name="nama_panggilan"
          value={form.nama_panggilan}
          onChange={handleChange}
        />
        <FormField
          label="Nomor KTP"
          name="nomor_ktp"
          value={form.nomor_ktp}
          onChange={handleChange}
        />
        <FormField
          label="Tanggal Lahir"
          name="tanggal_lahir"
          value={form.tanggal_lahir}
          onChange={handleChange}
          type="date"
        />
        <FormField
          label="Alamat"
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          type="textarea"
        />
        <FormField
          label="Tanggal Bergabung"
          name="tanggal_bergabung"
          value={form.tanggal_bergabung}
          onChange={handleChange}
          type="date"
        />
      </EntityFormCard>

      <EntitySubmitButton onClick={handleSubmit} loading={loading}>
        Simpan Pengawas
      </EntitySubmitButton>
    </div>
  );
};

export default CreatePengawas;
