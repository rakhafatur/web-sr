import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark" aria-hidden>SR</div>
        <h1 className="auth-title">Masuk</h1>
        <p className="auth-subtitle">Masuk ke akun SR Agency kamu</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Label hanya untuk pembaca layar — tampilannya cukup placeholder
              seperti referensi, tapi kolom tanpa label tidak terbaca. */}
          <div className="auth-field">
            <label htmlFor="login-username" className="visually-hidden">Username</label>
            <FiUser className="auth-field-icon" aria-hidden />
            <input
              id="login-username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              className={`auth-input ${errors.username ? 'is-invalid' : ''}`}
              {...register('username', { required: true })}
              autoFocus
            />
            {errors.username && <div className="auth-field-error">Username wajib diisi</div>}
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="visually-hidden">Password</label>
            <FiLock className="auth-field-icon" aria-hidden />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              className={`auth-input auth-input--trailing ${errors.password ? 'is-invalid' : ''}`}
              {...register('password', { required: true })}
            />
            <button
              type="button"
              className="auth-field-trailing"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.password && <div className="auth-field-error">Password wajib diisi</div>}
          </div>

          <div className="auth-submit-gap">
            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting} style={AUTH_SUBMIT_STYLE}>
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </div>
        </form>

        <span className="auth-footer-text">
          Belum punya akun?{' '}
          <Link to="/signup" className="auth-link">Daftar</Link>
        </span>
      </div>
    </div>
  );
}

export default LoginPage;
