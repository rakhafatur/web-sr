import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEdit3, FiUsers, FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi';
import Button from './Button';
import bgImage from '../assets/bg-home.jpg';
import { AUTH_SUBMIT_STYLE } from '../features/auth/authStyles';
import '../styles/auth.css';

type FormData = {
  username: string;
  password: string;
  nama: string;
  role: string;
};

type UserGroup = {
  id: string;
  group_name: string;
};

function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Mobile: layar penuh (pola referensi). Desktop: kartu + ilustrasi.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('user_group').select('id, group_name');
      if (!error && data) setGroups(data);
    };
    fetchGroups();
  }, []);

  const onSubmit = async (data: FormData) => {
    setSaving(true);

    const { default: bcrypt } = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { error } = await supabase.from('users').insert({
      username: data.username,
      password: hashedPassword,
      nama: data.nama,
      user_group_id: data.role,
      is_active: false, // akun tidak aktif sampai di-approve admin
    });

    setSaving(false);

    if (error) {
      toast.error('Gagal daftar: ' + error.message);
      return;
    }

    toast.success('Registrasi berhasil! Akunmu sedang menunggu persetujuan admin.');
    navigate('/login');
  };

  if (isMobile) {
    return (
      <div className="auth-m">
        <div className="auth-m-card">
          <div className="auth-m-mark" aria-hidden>SR</div>
          <h1 className="auth-m-title">Daftar</h1>
          <p className="auth-m-subtitle">Akun aktif setelah disetujui admin</p>

          <form className="auth-m-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Label hanya untuk pembaca layar — lihat LoginPage. */}
            <div className="auth-m-field">
              <label htmlFor="signup-nama" className="visually-hidden">Nama Lengkap</label>
              <FiEdit3 className="auth-m-field-icon" aria-hidden />
              <input
                id="signup-nama"
                type="text"
                placeholder="Nama lengkap"
                autoComplete="name"
                className={`auth-m-input ${errors.nama ? 'is-invalid' : ''}`}
                {...register('nama', { required: true })}
              />
              {errors.nama && <div className="auth-m-field-error">Nama wajib diisi</div>}
            </div>

            <div className="auth-m-field">
              <label htmlFor="signup-username" className="visually-hidden">Username</label>
              <FiUser className="auth-m-field-icon" aria-hidden />
              <input
                id="signup-username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                className={`auth-m-input ${errors.username ? 'is-invalid' : ''}`}
                {...register('username', { required: true })}
              />
              {errors.username && <div className="auth-m-field-error">Username wajib diisi</div>}
            </div>

            <div className="auth-m-field">
              <label htmlFor="signup-password" className="visually-hidden">Password</label>
              <FiLock className="auth-m-field-icon" aria-hidden />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                className={`auth-m-input auth-m-input--trailing ${errors.password ? 'is-invalid' : ''}`}
                {...register('password', { required: true })}
              />
              <button
                type="button"
                className="auth-m-field-trailing"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {errors.password && <div className="auth-m-field-error">Password wajib diisi</div>}
            </div>

            <div className="auth-m-field">
              <label htmlFor="signup-group" className="visually-hidden">Group</label>
              <FiUsers className="auth-m-field-icon" aria-hidden />
              <select
                id="signup-group"
                className={`auth-m-input auth-m-input--trailing ${errors.role ? 'is-invalid' : ''}`}
                {...register('role', { required: true })}
              >
                <option value="">Pilih group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.group_name}
                  </option>
                ))}
              </select>
              <span className="auth-m-field-trailing" aria-hidden>
                <FiChevronDown />
              </span>
              {errors.role && <div className="auth-m-field-error">Group wajib dipilih</div>}
            </div>

            <div className="auth-m-submit-gap">
              <Button type="submit" variant="primary" fullWidth disabled={saving} style={AUTH_SUBMIT_STYLE}>
                {saving ? 'Mendaftar...' : 'Daftar'}
              </Button>
            </div>
          </form>

          <span className="auth-m-footer">
            Sudah punya akun?{' '}
            <Link to="/login" className="auth-link">Masuk</Link>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-illustration d-none d-md-flex">
          <img src={bgImage} alt="SR SignUp Illustration" className="img-fluid" style={{ maxWidth: '90%' }} loading="lazy" />
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="text-center mb-4">
              <h4 className="auth-title mb-1">
                Daftar ke <span className="auth-brand">SR Agency</span>
              </h4>
              <p className="auth-subtitle mb-0">Buat akun barumu untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-3">
                <label className="auth-field-label">Username</label>
                <div className="auth-input-group">
                  <FiUser className="auth-input-icon" />
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    {...register('username', { required: true })}
                  />
                </div>
                {errors.username && <div className="invalid-feedback d-block">Username wajib diisi</div>}
              </div>

              <div className="mb-3">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-group">
                  <FiLock className="auth-input-icon" />
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', { required: true })}
                  />
                </div>
                {errors.password && <div className="invalid-feedback d-block">Password wajib diisi</div>}
              </div>

              <div className="mb-3">
                <label className="auth-field-label">Nama Lengkap</label>
                <div className="auth-input-group">
                  <FiEdit3 className="auth-input-icon" />
                  <input
                    type="text"
                    className={`form-control ${errors.nama ? 'is-invalid' : ''}`}
                    {...register('nama', { required: true })}
                  />
                </div>
                {errors.nama && <div className="invalid-feedback d-block">Nama wajib diisi</div>}
              </div>

              <div className="mb-4">
                <label className="auth-field-label">Pilih Group</label>
                <div className="auth-input-group">
                  <FiUsers className="auth-input-icon" />
                  <select
                    className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                    {...register('role', { required: true })}
                  >
                    <option value="">-- Pilih Group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group_name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && <div className="invalid-feedback d-block">Group wajib dipilih</div>}
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={saving}>
                {saving ? 'Mendaftar...' : 'Daftar'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <span className="auth-footer-text">
                Sudah punya akun?{' '}
                <Link to="/login" className="auth-link">Kembali ke Login</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
