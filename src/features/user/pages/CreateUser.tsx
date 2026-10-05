import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { FiAtSign, FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import '../../../styles/desktop-admin.css';
import '../../../styles/mobile-admin.css';

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

  // Desktop (gaya baru dk-): dua kolom seperti Detail — pratinjau identitas
  // (terisi langsung saat mengetik) & kartu form.
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/users', label: 'Users' }}
        title="Tambah user"
        description="Tambahkan akun baru ke sistem SR Agency"
      />

      <div className="dk-detail-grid">
        <aside className="dk-card" aria-label="Pratinjau user">
          <div className="dk-identity">
            <span className={`dk-avatar ${form.nama || form.username ? '' : 'is-empty'}`} aria-hidden>
              {(form.nama || form.username || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className={`dk-identity-name ${form.nama ? '' : 'is-placeholder'}`}>
              {form.nama || 'Nama user'}
            </h2>
            <div className="dk-identity-sub">@{form.username || 'username'}</div>
            <div className="dk-identity-note">Pratinjau — terisi saat kamu mengetik</div>
          </div>
        </aside>

      <section className="dk-card" aria-label="Informasi user">
        <div className="dk-card-head">
          <h2 className="dk-card-title">Informasi user</h2>
          <div className="dk-card-sub">Kolom bertanda * wajib diisi.</div>
        </div>

        <div className="dk-card-body">
          <div className="dk-form-grid">
            <div>
              <label htmlFor="dk-username" className="dk-label">Username<span className="dk-req" aria-hidden="true">*</span><span className="visually-hidden"> (wajib diisi)</span></label>
              <input
                id="dk-username"
                name="username"
                type="text"
                autoComplete="off"
                className={`dk-input ${fieldSalah === 'username' ? 'is-invalid' : ''}`}
                aria-invalid={fieldSalah === 'username' || undefined}
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dk-nama" className="dk-label">Nama lengkap<span className="dk-req" aria-hidden="true">*</span><span className="visually-hidden"> (wajib diisi)</span></label>
              <input
                id="dk-nama"
                name="nama"
                type="text"
                autoComplete="off"
                className={`dk-input ${fieldSalah === 'nama' ? 'is-invalid' : ''}`}
                aria-invalid={fieldSalah === 'nama' || undefined}
                value={form.nama}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dk-password" className="dk-label">Password<span className="dk-req" aria-hidden="true">*</span><span className="visually-hidden"> (wajib diisi)</span></label>
              <div className="dk-input-wrap">
                <input
                  id="dk-password"
                  name="password"
                  type={lihatPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`dk-input dk-input--trailing ${fieldSalah === 'password' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'password' || undefined}
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="dk-input-trailing"
                  onClick={() => setLihatPassword((v) => !v)}
                  aria-label={lihatPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {lihatPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="dk-help">Disimpan dalam bentuk hash — tidak bisa dilihat lagi setelah disimpan.</div>
            </div>
          </div>
        </div>

        <div className="dk-card-foot">
          <button type="button" className="dk-btn" onClick={() => navigate('/users')} disabled={loading}>
            Batal
          </button>
          <button type="button" className="dk-btn dk-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan user'}
          </button>
        </div>
      </section>
      </div>
    </div>
  );
};

export default CreateUser;
