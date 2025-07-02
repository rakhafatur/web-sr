import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Tambah useNavigate

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

  const navigate = useNavigate(); // ✅ Inisialisasi navigate
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
      is_active: false, // akun tidak aktif sampai di-approve admin
    });

    if (error) {
      alert('❌ Gagal daftar: ' + error.message);
      return;
    }

    alert('✅ Registrasi berhasil! Akunmu sedang menunggu persetujuan admin.');
    navigate('/login'); // ✅ Redirect ke halaman login
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle, #e6f4ea, #d4edda)',
        color: '#1a1a1a',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <div
        className="p-4 shadow"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '500px',
          border: '1px solid #cde8d2',
          boxShadow: '0 0 25px rgba(56, 176, 0, 0.15)',
        }}
      >
        <div className="text-center mb-4">
          <h4 className="fw-bold" style={{ color: '#38b000' }}>
            Daftar ke SR Agency
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            Buat akun barumu untuk melanjutkan
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              {...register('username', { required: true })}
            />
            {errors.username && <div className="invalid-feedback">Username wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register('password', { required: true })}
            />
            {errors.password && <div className="invalid-feedback">Password wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className={`form-control ${errors.nama ? 'is-invalid' : ''}`}
              {...register('nama', { required: true })}
            />
            {errors.nama && <div className="invalid-feedback">Nama wajib diisi</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Pilih Group</label>
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
            {errors.role && <div className="invalid-feedback">Group wajib dipilih</div>}
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{
              backgroundColor: '#38b000',
              color: 'white',
              border: 'none',
              padding: '10px 0',
            }}
          >
            ✨ Daftar
          </button>
        </form>

        <div className="text-center mt-3">
          <small style={{ color: '#333' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="fw-semibold" style={{ color: '#38b000' }}>
              Kembali ke Login
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;