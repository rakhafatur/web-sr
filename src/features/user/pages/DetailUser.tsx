import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import bcrypt from 'bcryptjs';

import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiLock,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import FormField from '../../../components/FormField';
import { supabase } from '../../../lib/supabaseClient';

type FormType = {
  username: string;
  nama: string;
  password: string;
};

const DetailUser = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [form, setForm] =
    useState<FormType>({
      username: '',
      nama: '',
      password: '',
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [readonly, setReadonly] =
    useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

      if (error) throw error;

      setForm({
        username:
          data.username || '',
        nama: data.nama || '',
        password: '',
      });
    } catch (err: any) {
      alert(
        err.message ||
          'Gagal mengambil data user'
      );

      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // eslint-disable-next-line
  }, [id]);

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

  const handleSave = async () => {
    if (
      !form.username ||
      !form.nama
    ) {
      return alert(
        'Username dan nama wajib diisi'
      );
    }

    try {
      setSaving(true);

      let hashedPassword:
        | string
        | undefined = undefined;

      if (
        form.password.trim() !== ''
      ) {
        hashedPassword =
          await bcrypt.hash(
            form.password,
            10
          );
      }

      const { error } =
        await supabase
          .from('users')
          .update({
            username:
              form.username,
            nama: form.nama,
            ...(hashedPassword
              ? {
                  password:
                    hashedPassword,
                }
              : {}),
          })
          .eq('id', id);

      if (error) throw error;

      alert(
        'User berhasil diperbarui'
      );

      setReadonly(true);

      setForm((prev) => ({
        ...prev,
        password: '',
      }));
    } catch (err: any) {
      alert(
        err.message ||
          'Gagal update user'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell py-5">
        <div className="d-flex align-items-center gap-3">
          <div
            className="spinner-border spinner-border-sm"
            role="status"
          />

          <span>
            Mengambil data user...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--color-green), #7be0a9)',
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
            background:
              'rgba(255,255,255,0.08)',
          }}
        />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 position-relative">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() =>
                navigate('/users')
              }
              className="btn btn-light d-flex align-items-center justify-content-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
              }}
            >
              <FiArrowLeft />
            </button>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                background:
                  'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                fontSize: 28,
                backdropFilter:
                  'blur(10px)',
              }}
            >
              <FiUsers />
            </div>

            <div>
              <h2
                className="fw-bold mb-1"
                style={{
                  fontSize: '1.8rem',
                }}
              >
                Detail User
              </h2>

              <div
                style={{
                  opacity: 0.82,
                  fontSize: '0.92rem',
                }}
              >
                Kelola informasi user
                dan akses sistem
              </div>
            </div>
          </div>

          {readonly ? (
            <button
              className="btn btn-light fw-bold d-flex align-items-center gap-2"
              style={{
                borderRadius: 14,
                color:
                  'var(--color-green)',
              }}
              onClick={() =>
                setReadonly(false)
              }
            >
              <FiEdit2 />
              Edit User
            </button>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-light fw-semibold d-flex align-items-center gap-2"
                style={{
                  borderRadius: 14,
                }}
                onClick={() => {
                  setReadonly(true);

                  fetchUser();
                }}
              >
                <FiX />
                Batal
              </button>

              <button
                className="btn btn-success fw-bold d-flex align-items-center gap-2"
                style={{
                  borderRadius: 14,
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
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
                    Simpan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HERO */}
      <div className="mb-4">
        <div
          className="card border-0 shadow-sm rounded-4"
          style={{
            overflow: 'hidden',
          }}
        >
          <div className="p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  background:
                    '#effff4',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  color:
                    'var(--color-green)',
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                <FiUser />
              </div>

              <div>
                <div
                  className="fw-bold"
                  style={{
                    fontSize: '1.1rem',
                    color:
                      'var(--color-dark)',
                  }}
                >
                  {form.nama || '-'}
                </div>

                <div
                  style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginTop: 2,
                  }}
                >
                  @{form.username}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div
        className="card border-0 shadow-sm rounded-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background:
              'linear-gradient(to right, #fafafa, #ffffff)',
          }}
        >
          <div
            className="fw-bold"
            style={{
              color:
                'var(--color-dark)',
            }}
          >
            Informasi User
          </div>

          <div
            style={{
              fontSize: '0.84rem',
              color: '#666',
            }}
          >
            Detail dan informasi akun
            user
          </div>
        </div>

        <div className="p-4 d-flex flex-column gap-4">
          <div>
            <div
              className="mb-2 fw-semibold"
              style={{
                fontSize: '0.88rem',
                color:
                  'var(--color-dark)',
              }}
            >
              Username
            </div>

            <FormField
              label=""
              name="username"
              value={form.username}
              onChange={handleChange}
              readOnly={readonly}
            />
          </div>

          <div>
            <div
              className="mb-2 fw-semibold"
              style={{
                fontSize: '0.88rem',
                color:
                  'var(--color-dark)',
              }}
            >
              Nama Lengkap
            </div>

            <FormField
              label=""
              name="nama"
              value={form.nama}
              onChange={handleChange}
              readOnly={readonly}
            />
          </div>

          {!readonly && (
            <div>
              <div
                className="mb-2 fw-semibold d-flex align-items-center gap-2"
                style={{
                  fontSize: '0.88rem',
                  color:
                    'var(--color-dark)',
                }}
              >
                <FiLock size={14} />
                Password Baru
                (Opsional)
              </div>

              <FormField
                label=""
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />

              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#888',
                  marginTop: 6,
                }}
              >
                Kosongkan password jika
                tidak ingin mengganti
                password user.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailUser;