import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const error = validasiWajib([
      { label: 'Nama lengkap', value: form.nama_lengkap },
    ]);

    if (error) {
      toast.error(error);
      return;
    }

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

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
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
