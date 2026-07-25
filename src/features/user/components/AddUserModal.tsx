import { useEffect, useState } from 'react';

import FormField from '../../../components/FormField';
import ModalWrapper from '../../../components/ModalWrapper';

import {
  FiUser,
  FiPlus,
  FiEdit2,
  FiLock,
  FiCheckCircle,
  FiX,
} from 'react-icons/fi';

type User = {
  username: string;
  nama: string | null;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: {
    username: string;
    nama: string;
    password?: string;
  }) => void;
  user?: (User & { id: string }) | null;
};

const AddUserModal = ({
  show,
  onClose,
  onSubmit,
  user,
}: Props) => {
  const [form, setForm] = useState({
    username: '',
    nama: '',
    password: '',
  });

  const [readonly, setReadonly] =
    useState<boolean>(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!show) return;

    if (user) {
      setForm({
        username: user.username,
        nama: user.nama || '',
        password: '',
      });

      setReadonly(true);
    } else {
      setForm({
        username: '',
        nama: '',
        password: '',
      });

      setReadonly(false);
    }
  }, [show, user]);

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
    if (!form.username || !form.nama) {
      return alert(
        'Username dan Nama wajib diisi'
      );
    }

    if (
      !user &&
      !form.password
    ) {
      return alert(
        'Password wajib diisi untuk user baru'
      );
    }

    try {
      setLoading(true);

      const payload = {
        username: form.username,
        nama: form.nama,
        ...(form.password
          ? {
              password:
                form.password,
            }
          : {}),
      };

      await onSubmit(payload);

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      title={
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background:
                'linear-gradient(135deg, var(--color-green), #7be0a9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {user ? (
              <FiUser />
            ) : (
              <FiPlus />
            )}
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
              {user
                ? 'Detail User'
                : 'Tambah User'}
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color: '#777',
                marginTop: 2,
              }}
            >
              {user
                ? 'Kelola dan edit data user'
                : 'Tambahkan user baru ke sistem'}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
          <button
            className="btn btn-light fw-semibold d-flex align-items-center gap-2"
            onClick={onClose}
            style={{
              borderRadius: 12,
              padding:
                '10px 16px',
            }}
          >
            <FiX />
            Tutup
          </button>

          <div className="d-flex align-items-center gap-2">
            {readonly ? (
              <button
                className="btn btn-success fw-bold d-flex align-items-center gap-2"
                onClick={() =>
                  setReadonly(
                    false
                  )
                }
                style={{
                  borderRadius: 12,
                  padding:
                    '10px 18px',
                }}
              >
                <FiEdit2 />
                Edit Form
              </button>
            ) : (
              <button
                className="btn btn-success fw-bold d-flex align-items-center gap-2"
                onClick={
                  handleSubmit
                }
                disabled={loading}
                style={{
                  borderRadius: 12,
                  padding:
                    '10px 18px',
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
            )}
          </div>
        </div>
      }
    >
      <div className="d-flex flex-column gap-4">
        {/* INFO BOX */}
        <div
          className="p-3 rounded-4"
          style={{
            background:
              'linear-gradient(to right, #f5fff8, #ffffff)',
            border:
              '1px solid rgba(25,153,71,0.12)',
          }}
        >
          <div className="d-flex align-items-start gap-3">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background:
                  '#dff7e7',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                color:
                  'var(--color-green)',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <FiUser />
            </div>

            <div>
              <div
                className="fw-bold"
                style={{
                  fontSize: '0.92rem',
                  color:
                    'var(--color-dark)',
                }}
              >
                {user
                  ? 'Data User'
                  : 'User Baru'}
              </div>

              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#666',
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {readonly
                  ? 'Klik tombol edit form untuk mengubah data user.'
                  : 'Lengkapi informasi user di bawah ini.'}
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="d-flex flex-column gap-3">
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
              onChange={
                handleChange
              }
              readOnly={
                readonly
              }
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
              onChange={
                handleChange
              }
              readOnly={
                readonly
              }
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

                {user
                  ? 'Password Baru (Opsional)'
                  : 'Password'}
              </div>

              <FormField
                label=""
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                type="password"
              />

              {!user && (
                <div
                  style={{
                    fontSize:
                      '0.76rem',
                    color: '#888',
                    marginTop: 6,
                  }}
                >
                  Password akan
                  dienkripsi otomatis
                  sebelum disimpan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddUserModal;