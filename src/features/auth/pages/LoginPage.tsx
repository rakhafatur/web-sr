import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logoSR from '../../../assets/logosr.png';
import { useState } from 'react';

type LoginFormData = {
  username: string;
  password: string;
};

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.username, data.password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1b0036 0%, #0f001e 100%)',
        backgroundSize: 'cover',
        color: 'white',
      }}
    >
      <div
        className="p-4 shadow"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 30px rgba(137, 79, 255, 0.3)',
        }}
      >
        <div className="text-center mb-4">
          <img
            src={logoSR}
            alt="Logo"
            style={{ width: 100, height: 100, borderRadius: 24, marginBottom: '0.5rem' }}
          />
          <h4 className="mt-3">Welcome to <span className="text-warning">SR Agency</span></h4>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>Silakan login untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label text-light">Username</label>
            <input
              type="text"
              className={`form-control bg-dark text-white border-secondary ${errors.username ? 'is-invalid' : ''}`}
              {...register('username', { required: true })}
              autoFocus
            />
            {errors.username && <div className="invalid-feedback">Username wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control bg-dark text-white border-secondary ${errors.password ? 'is-invalid' : ''}`}
                {...register('password', { required: true })}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">Password wajib diisi</div>}
          </div>

          <button className="btn btn-warning w-100 fw-bold" type="submit">
            Masuk
          </button>
        </form>

        <div className="text-center mt-3">
          <small style={{ color: '#ddd' }}>
            Belum punya akun? <Link to="/signup" className="text-warning">Daftar</Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;