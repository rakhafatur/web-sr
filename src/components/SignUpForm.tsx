import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';

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

  const [groups, setGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from('user_group').select('id, group_name');
      if (!error && data) setGroups(data);
    };
    fetchGroups();
  }, []);

  const onSubmit = async (data: FormData) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { error } = await supabase.from('users').insert({
      username: data.username,
      password: hashedPassword,
      nama: data.nama,
      user_group_id: data.role,
    });

    if (error) {
      alert('❌ Gagal daftar: ' + error.message);
      return;
    }

    alert('✅ Registrasi berhasil! Silakan login.');
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
          maxWidth: '500px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 30px rgba(137, 79, 255, 0.3)',
        }}
      >
        <div className="text-center mb-4">
          <h4>
            Daftar ke <span className="text-warning">SR Agency</span>
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
            Buat akun barumu untuk melanjutkan
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label text-light">Username</label>
            <input
              type="text"
              className={`form-control bg-dark text-white border-secondary ${errors.username ? 'is-invalid' : ''}`}
              {...register('username', { required: true })}
            />
            {errors.username && <div className="invalid-feedback">Username wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Password</label>
            <input
              type="password"
              className={`form-control bg-dark text-white border-secondary ${errors.password ? 'is-invalid' : ''}`}
              {...register('password', { required: true })}
            />
            {errors.password && <div className="invalid-feedback">Password wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Nama Lengkap</label>
            <input
              type="text"
              className={`form-control bg-dark text-white border-secondary ${errors.nama ? 'is-invalid' : ''}`}
              {...register('nama', { required: true })}
            />
            {errors.nama && <div className="invalid-feedback">Nama wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Pilih Group</label>
            <select
              className={`form-select bg-dark text-white border-secondary ${errors.role ? 'is-invalid' : ''}`}
              {...register('role', { required: true })}
            >
              <option value="">-- Pilih Group --</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.group_name}
                </option>
              ))}
            </select>
            {errors.role && <div className="invalid-feedback">Group wajib dipilih</div>}
          </div>

          <button type="submit" className="btn btn-warning w-100 fw-bold">
            ✨ Daftar
          </button>
        </form>

        <div className="text-center mt-3">
          <small style={{ color: '#ccc' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="text-warning fw-semibold">
              Kembali ke Login
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
