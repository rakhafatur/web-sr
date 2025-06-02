import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPage.css';

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
    <div className="login-page soft-green-theme">
      <div className="login-container">
        {/* Ilustrasi kiri */}
        <div className="login-illustration d-none d-md-flex">
          <img
            src="/illustration.png"
            alt="SR Login Illustration"
            className="img-fluid"
            style={{ maxWidth: '90%', borderRadius: '1rem' }}
          />
        </div>

        {/* Form kanan */}
        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="text-center mb-4">
              <h4 className="fw-bold">Welcome to <span className="brand">SR Agency</span></h4>
              <p className="text-muted">Silakan login untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  {...register('username', { required: true })}
                  autoFocus
                />
                {errors.username && <div className="invalid-feedback">Username wajib diisi</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
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
                {errors.password && <div className="invalid-feedback">Password wajib diisi</div>}
              </div>

              <button type="submit" className="btn btn-green w-100 fw-bold">
                Masuk
              </button>
            </form>

            <div className="text-center mt-3">
              <small>
                Belum punya akun? <Link to="/signup" className="text-green">Daftar</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
