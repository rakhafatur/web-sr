import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { FiUsers } from 'react-icons/fi';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntitySubmitButton from '../../../components/EntitySubmitButton';
import { supabase } from '../../../lib/supabaseClient';
import bcrypt from 'bcryptjs';

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    nama: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.username || !form.nama || !form.password) {
      toast.error('Semua field wajib diisi');
      return;
    }

    try {
      setLoading(true);

      const hashedPassword = await bcrypt.hash(form.password, 10);

      const { error } = await supabase.from('users').insert([
        {
          username: form.username,
          nama: form.nama,
          password: hashedPassword,
        },
      ]);

      if (error) throw error;

      toast.success('User berhasil ditambahkan');
      navigate('/users');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        icon={<FiUsers />}
        title="Tambah User"
        description="Tambahkan user baru ke sistem SR Agency"
      />

      <EntityHeroCard
        icon={<FiUsers />}
        title="User Management"
        subtitle="Lengkapi informasi user dengan benar sebelum menyimpan data"
      />

      <EntityFormCard title="Informasi User" description="Data user yang akan ditambahkan">
        <FormField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />

        <FormField
          label="Nama Lengkap"
          name="nama"
          value={form.nama}
          onChange={handleChange}
        />

        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: 6 }}>
            Password akan disimpan ke sistem
          </div>
        </div>
      </EntityFormCard>

      <EntitySubmitButton onClick={handleSubmit} loading={loading}>
        Simpan User
      </EntitySubmitButton>
    </div>
  );
};

export default CreateUser;
