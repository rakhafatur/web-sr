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

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    nama: '',
    password: '',
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.username ||
      !form.nama ||
      !form.password
    ) {
      return alert(
        'Semua field wajib diisi'
      );
    }

    try {
      setLoading(true);

      const { error } =
        await supabase
          .from('users')
          .insert([
            {
              username:
                form.username,
              nama: form.nama,
              password:
                form.password,
            },
          ]);

      if (error) throw error;

      alert(
        'User berhasil ditambahkan'
      );

      navigate('/users');
    } catch (err: any) {
      alert(
        err.message ||
          'Gagal menambahkan user'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: 24,
        paddingBottom: 120,
      }}
    >
      {/* HEADER */}
      <div
        className="d-flex align-items-center gap-3 mb-4"
      >
        <button
          onClick={() =>
            navigate('/users')
          }
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border:
              '1px solid #e8ecef',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            fontSize: 18,
            color:
              'var(--color-dark)',
          }}
        >
          <FiArrowLeft />
        </button>

        <div>
          <div
            className="fw-bold"
            style={{
              fontSize: '1.4rem',
              color:
                'var(--color-dark)',
            }}
          >
            Tambah User
          </div>

          <div
            style={{
              fontSize: '0.85rem',
              color: '#777',
              marginTop: 2,
            }}
          >
            Tambahkan user baru ke
            sistem
          </div>
        </div>
      </div>

      {/* HERO */}
      <div
        className="d-flex align-items-center gap-3 mb-4"
        style={{
          padding: 22,
          borderRadius: 24,
          background:
            'linear-gradient(135deg, #f4fff7, #ffffff)',
          border:
            '1px solid #e8f4ec',
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 18,
            background:
              'linear-gradient(135deg, var(--color-green), #7be0a9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            color: 'white',
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          <FiUsers />
        </div>

        <div>
          <div
            className="fw-bold"
            style={{
              fontSize: '1rem',
              color:
                'var(--color-dark)',
            }}
          >
            User Management
          </div>

          <div
            style={{
              fontSize: '0.84rem',
              color: '#666',
              marginTop: 4,
              lineHeight: 1.6,
            }}
          >
            Lengkapi informasi user
            dengan benar sebelum
            menyimpan data.
          </div>
        </div>
      </div>

      {/* FORM */}
      <div
        className="d-flex flex-column gap-4"
        style={{
          background: 'white',
          borderRadius: 28,
          padding: 24,
          border:
            '1px solid #edf1f2',
          boxShadow:
            '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div
            className="fw-semibold mb-2"
            style={{
              fontSize: '0.88rem',
              color:
                'var(--color-dark)',
            }}
          >
            Username
          </div>

          <FormInput
            label=""
            name="username"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <div
            className="fw-semibold mb-2"
            style={{
              fontSize: '0.88rem',
              color:
                'var(--color-dark)',
            }}
          >
            Nama Lengkap
          </div>

          <FormInput
            label=""
            name="nama"
            value={form.nama}
            onChange={handleChange}
          />
        </div>

        <div>
          <div
            className="fw-semibold d-flex align-items-center gap-2 mb-2"
            style={{
              fontSize: '0.88rem',
              color:
                'var(--color-dark)',
            }}
          >
            <FiLock size={14} />
            Password
          </div>

          <FormInput
            label=""
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <div
            style={{
              marginTop: 8,
              fontSize: '0.76rem',
              color: '#888',
              lineHeight: 1.5,
            }}
          >
            Password akan
            dienkripsi otomatis
            sebelum disimpan.
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          paddingTop: 20,
          marginTop: 24,
          background:
            'linear-gradient(to top, #f8faf9 70%, transparent)',
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-100"
          style={{
            border: 'none',
            borderRadius: 18,
            background:
              'linear-gradient(135deg, var(--color-green), #67d492)',
            color: 'white',
            fontWeight: 700,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            gap: 10,
            fontSize: '0.95rem',
          }}
        >
          {loading ? (
            <>
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />
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