import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FiArrowLeft,
  FiCheckCircle,
  FiLock,
  FiUsers,
} from 'react-icons/fi';

import FormInput from '../../../components/FormInput';
import { supabase } from '../../../lib/supabaseClient';
import bcrypt from 'bcryptjs';

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    nama: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.username || !form.nama || !form.password) {
      return alert('Semua field wajib diisi');
    }

    try {
      setLoading(true);

      const hashedPassword = await bcrypt.hash(form.password, 10);

      const { error } = await supabase.from('users').insert([
        {
          username: form.username,
          nama: form.nama,
          password: hashedPassword,
        },
      ]);

      if (error) throw error;

      alert('User berhasil ditambahkan');
      navigate('/users');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid py-4 px-md-4 px-3"
      style={{
        background: 'linear-gradient(to bottom, #f7fff9 0%, #ffffff 100%)',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-green), #7be0a9)',
          color: 'white',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -50,
            top: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        <div className="d-flex align-items-center gap-3 position-relative">
          <button
            onClick={() => navigate('/users')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <FiArrowLeft />
          </button>

          <div>
            <h2 className="fw-bold mb-1">Tambah User</h2>
            <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>
              Tambahkan user baru ke sistem SR Agency
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT CARD (DISAMAKAN FULL STYLE DENGAN HALAMAN LAIN) */}
      <div
        className="card border-0 shadow-sm rounded-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <div className="p-4 p-md-5">
          {/* HERO */}
          <div
            className="d-flex align-items-center gap-3 mb-4"
            style={{
              padding: 22,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #f4fff7, #ffffff)',
              border: '1px solid #e8f4ec',
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: 'linear-gradient(135deg, var(--color-green), #7be0a9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              <FiUsers />
            </div>

            <div>
              <div className="fw-bold">User Management</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                Lengkapi informasi user dengan benar sebelum menyimpan data
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="d-flex flex-column gap-4">
            <div>
              <FormInput
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <FormInput
                label="Nama Lengkap"
                name="nama"
                value={form.nama}
                onChange={handleChange}
              />
            </div>

            <div>

              <FormInput
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />

              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 6 }}>
                Password akan disimpan ke sistem
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-100"
          style={{
            border: 'none',
            borderRadius: 18,
            background: 'linear-gradient(135deg, var(--color-green), #67d492)',
            color: 'white',
            fontWeight: 700,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {loading ? (
            <>
              <div className="spinner-border spinner-border-sm" />
              Menyimpan...
            </>
          ) : (
            <>
              <FiCheckCircle />
              Simpan User
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateUser;