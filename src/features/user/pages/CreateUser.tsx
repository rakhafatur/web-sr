import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { FiUsers, FiAtSign, FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobilePageBar from '../../../components/MobilePageBar';
import '../../../styles/mobile-admin.css';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntitySubmitButton from '../../../components/EntitySubmitButton';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    nama: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  const [lihatPassword, setLihatPassword] = useState(false);
  // Mobile: tampilan baru (Header app dicabut di MainLayout). Desktop: lama.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const error = validasiWajib([
      { label: 'Username', value: form.username, name: 'username' },
      { label: 'Nama', value: form.nama, name: 'nama' },
      { label: 'Password', value: form.password, name: 'password' },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

    try {
      setLoading(true);

      const { default: bcrypt } = await import('bcryptjs');
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

  const wajib = (
    <>
      <span className="tm-req" aria-hidden="true">*</span>
      <span className="visually-hidden"> (wajib diisi)</span>
    </>
  );

  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Tambah User" backTo="/users" />

        <div className="tm-stack">
          <div className="tm-card tm-sheet-form">
            <div className="tm-field">
              <label htmlFor="user-username" className="tm-label">Username{wajib}</label>
              <div className="tm-input-wrap">
                <FiAtSign className="tm-input-icon" aria-hidden />
                <input
                  id="user-username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  className={`tm-input ${fieldSalah === 'username' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'username' || undefined}
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="tm-field">
              <label htmlFor="user-nama" className="tm-label">Nama lengkap{wajib}</label>
              <div className="tm-input-wrap">
                <FiUser className="tm-input-icon" aria-hidden />
                <input
                  id="user-nama"
                  name="nama"
                  type="text"
                  autoComplete="off"
                  className={`tm-input ${fieldSalah === 'nama' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'nama' || undefined}
                  value={form.nama}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="tm-field">
              <label htmlFor="user-password" className="tm-label">Password{wajib}</label>
              <div className="tm-input-wrap">
                <FiLock className="tm-input-icon" aria-hidden />
                <input
                  id="user-password"
                  name="password"
                  type={lihatPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`tm-input tm-input--trailing ${fieldSalah === 'password' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'password' || undefined}
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="tm-input-trailing"
                  onClick={() => setLihatPassword((v) => !v)}
                  aria-label={lihatPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {lihatPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="tm-help">
                Password disimpan dalam bentuk hash — tidak bisa dilihat lagi setelah disimpan.
              </div>
            </div>
          </div>

          <button
            type="button"
            className="tm-btn tm-btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan User'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/users"
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
          required
          invalid={fieldSalah === 'username'}
          value={form.username}
          onChange={handleChange}
        />

        <FormField
          label="Nama Lengkap"
          name="nama"
          required
          invalid={fieldSalah === 'nama'}
          value={form.nama}
          onChange={handleChange}
        />

        <div>
          <FormField
            label="Password"
            name="password"
            required
            invalid={fieldSalah === 'password'}
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
