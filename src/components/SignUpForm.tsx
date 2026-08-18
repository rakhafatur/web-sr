import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEdit3, FiUsers } from 'react-icons/fi';
import Button from './Button';
import bgImage from '../assets/bg-home.jpg';
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
