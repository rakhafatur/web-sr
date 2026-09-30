import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import Button from '../../../components/Button';
import { AUTH_SUBMIT_STYLE } from '../authStyles';
import '../../../styles/auth.css';

type LoginFormData = {
  username: string;
  password: string;
};

function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const { login } = useAuth(); // tidak ambil user dari context, ambil dari localStorage
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  // Mobile: layar penuh (pola referensi). Desktop: kartu + ilustrasi.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.username, data.password);

    if (result === 'success') {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');

      if (localUser.ladies_id) {
        navigate('/ladies/home');
      } else {
        navigate('/');
      }
    } else if (result === 'inactive') {
      toast.warning('Akunmu belum aktif. Menunggu persetujuan admin.');
    } else if (result === 'invalid') {
      // Sengaja tidak membedakan "username tidak ada" dan "password salah" —
      // pesan yang berbeda memberi tahu orang luar username mana yang valid.
      toast.error('Username atau password salah.');
    } else {
      toast.error('Terjadi kesalahan saat login.');
    }
  };

  if (isMobile) {
    return (
      <div className="auth-m">
        <div className="auth-m-card">
          <div className="auth-m-mark" aria-hidden>SR</div>
          <h1 className="auth-m-title">Masuk</h1>
          <p className="auth-m-subtitle">Masuk ke akun SR Agency kamu</p>

          <form className="auth-m-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Label hanya untuk pembaca layar — tampilannya cukup placeholder
                seperti referensi, tapi kolom tanpa label tidak terbaca. */}
            <div className="auth-m-field">
              <label htmlFor="login-username" className="visually-hidden">Username</label>
              <FiUser className="auth-m-field-icon" aria-hidden />
              <input
                id="login-username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                className={`auth-m-input ${errors.username ? 'is-invalid' : ''}`}
                {...register('username', { required: true })}
                autoFocus
              />
              {errors.username && <div className="auth-m-field-error">Username wajib diisi</div>}
            </div>

            <div className="auth-m-field">
              <label htmlFor="login-password" className="visually-hidden">Password</label>
              <FiLock className="auth-m-field-icon" aria-hidden />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
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

            <div className="auth-m-submit-gap">
              <Button type="submit" variant="primary" fullWidth disabled={isSubmitting} style={AUTH_SUBMIT_STYLE}>
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </Button>
            </div>
          </form>

          <span className="auth-m-footer">
            Belum punya akun?{' '}
            <Link to="/signup" className="auth-link">Daftar</Link>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Ilustrasi kiri (desktop only) */}
        <div className="auth-illustration d-none d-md-flex">
          <img src="/assets/bg-login.jpg" alt="SR Login Illustration" className="img-fluid" style={{ maxWidth: '90%' }} loading="lazy" />
        </div>

        {/* Form kanan */}
        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="text-center mb-4">
              <h4 className="auth-title mb-1">
                Welcome to <span className="auth-brand">SR Agency</span>
              </h4>
              <p className="auth-subtitle mb-0">Silakan login untuk melanjutkan</p>
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
                    autoFocus
                  />
                </div>
                {errors.username && <div className="invalid-feedback d-block">Username wajib diisi</div>}
              </div>

              <div className="mb-4">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-group input-group">
                  <FiLock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">Password wajib diisi</div>}
              </div>

              <Button type="submit" variant="primary" fullWidth>
                Masuk
              </Button>
            </form>

            <div className="text-center mt-4">
              <span className="auth-footer-text">
                Belum punya akun?{' '}
                <Link to="/signup" className="auth-link">Daftar</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
