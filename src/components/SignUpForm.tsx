import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEdit3, FiUsers, FiEye, FiEyeOff, FiChevronDown } from 'react-icons/fi';
import Button from './Button';
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark" aria-hidden>SR</div>
        <h1 className="auth-title">Daftar</h1>
        <p className="auth-subtitle">Akun aktif setelah disetujui admin</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Label hanya untuk pembaca layar — lihat LoginPage. */}
          <div className="auth-field">
            <label htmlFor="signup-nama" className="visually-hidden">Nama Lengkap</label>
            <FiEdit3 className="auth-field-icon" aria-hidden />
            <input
              id="signup-nama"
              type="text"
              placeholder="Nama lengkap"
              autoComplete="name"
              className={`auth-input ${errors.nama ? 'is-invalid' : ''}`}
              {...register('nama', { required: true })}
            />
            {errors.nama && <div className="auth-field-error">Nama wajib diisi</div>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-username" className="visually-hidden">Username</label>
            <FiUser className="auth-field-icon" aria-hidden />
            <input
              id="signup-username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              className={`auth-input ${errors.username ? 'is-invalid' : ''}`}
              {...register('username', { required: true })}
            />
            {errors.username && <div className="auth-field-error">Username wajib diisi</div>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password" className="visually-hidden">Password</label>
            <FiLock className="auth-field-icon" aria-hidden />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="new-password"
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

          <div className="auth-field">
            <label htmlFor="signup-group" className="visually-hidden">Group</label>
            <FiUsers className="auth-field-icon" aria-hidden />
            <select
              id="signup-group"
              className={`auth-input auth-input--trailing ${errors.role ? 'is-invalid' : ''}`}
              {...register('role', { required: true })}
            >
              <option value="">Pilih group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.group_name}
                </option>
              ))}
            </select>
            <span className="auth-field-trailing" aria-hidden>
              <FiChevronDown />
            </span>
            {errors.role && <div className="auth-field-error">Group wajib dipilih</div>}
          </div>

          <div className="auth-submit-gap">
            <Button type="submit" variant="primary" fullWidth disabled={saving} style={AUTH_SUBMIT_STYLE}>
              {saving ? 'Mendaftar...' : 'Daftar'}
            </Button>
          </div>
        </form>

        <span className="auth-footer-text">
          Sudah punya akun?{' '}
          <Link to="/login" className="auth-link">Masuk</Link>
        </span>
      </div>
    </div>
  );
}

export default SignUpForm;
