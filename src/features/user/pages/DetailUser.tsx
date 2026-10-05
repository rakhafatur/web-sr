import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import { toast } from 'react-toastify';


import {
  FiLock,
  FiUser,
  FiAtSign,
  FiEdit2,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import '../../../styles/desktop-admin.css';
import '../../../styles/mobile-admin.css';

import DetailFormSkeleton from '../../../components/DetailFormSkeleton';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';

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

  const [fieldSalah, setFieldSalah] =
    useState<string | null>(null);

  const [lihatPassword, setLihatPassword] = useState(false);

  // Mobile: tampilan baru (Header app dicabut di MainLayout). Desktop: lama.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchUser = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from('users')
          .select('username, nama')
          .eq('id', id)
          .single();

      if (error) throw error;

      setForm({
        username:
          data.username || '',
        nama: data.nama || '',
        password: '',
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data user'
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

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const error = validasiWajib([
      { label: 'Username', value: form.username, name: 'username' },
      { label: 'Nama', value: form.nama, name: 'nama' },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

    try {
      setSaving(true);

      let hashedPassword:
        | string
        | undefined = undefined;

      if (
        form.password.trim() !== ''
      ) {
        const { default: bcrypt } = await import('bcryptjs');

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

      toast.success(
        'User berhasil diperbarui'
      );

      setReadonly(true);

      setForm((prev) => ({
        ...prev,
        password: '',
      }));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Gagal update user'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DetailFormSkeleton label="Mengambil data user" fields={2} />;
  }

  const wajib = (
    <>
      <span className="tm-req" aria-hidden="true">*</span>
      <span className="visually-hidden"> (wajib diisi)</span>
    </>
  );

  if (isMobile) {
    const batal = () => {
      setReadonly(true);
      setFieldSalah(null);
      fetchUser();
    };

    return (
      <div className="tm-page">
        <MobilePageBar
          title={readonly ? 'Detail User' : 'Ubah User'}
          backTo="/users"
          action={
            readonly
              ? { icon: <FiEdit2 />, label: 'Ubah user', onClick: () => setReadonly(false) }
              : undefined
          }
        />

        <section className="tm-identity" aria-label="Identitas user">
          <span className="tm-avatar" aria-hidden>
            {(form.nama || form.username || '?').charAt(0).toUpperCase()}
          </span>
          <h2 className="tm-identity-name">{form.nama || '-'}</h2>
          <div className="tm-identity-sub">@{form.username}</div>
        </section>

        <div className="tm-stack">
          <h2 className="tm-section-title">Informasi akun</h2>
          <div className="tm-card tm-sheet-form">
            <div className="tm-field">
              <label htmlFor="detail-username" className="tm-label">Username{!readonly && wajib}</label>
              <div className="tm-input-wrap">
                <FiAtSign className="tm-input-icon" aria-hidden />
                <input
                  id="detail-username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  readOnly={readonly}
                  className={`tm-input ${fieldSalah === 'username' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'username' || undefined}
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="tm-field">
              <label htmlFor="detail-nama" className="tm-label">Nama lengkap{!readonly && wajib}</label>
              <div className="tm-input-wrap">
                <FiUser className="tm-input-icon" aria-hidden />
                <input
                  id="detail-nama"
                  name="nama"
                  type="text"
                  autoComplete="off"
                  readOnly={readonly}
                  className={`tm-input ${fieldSalah === 'nama' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'nama' || undefined}
                  value={form.nama}
                  onChange={handleChange}
                />
              </div>
            </div>

            {!readonly && (
              <div className="tm-field">
                <label htmlFor="detail-password" className="tm-label">Password baru (opsional)</label>
                <div className="tm-input-wrap">
                  <FiLock className="tm-input-icon" aria-hidden />
                  <input
                    id="detail-password"
                    name="password"
                    type={lihatPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="tm-input tm-input--trailing"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="tm-input-trailing"
                    onClick={() => setLihatPassword((v) => !v)}
                    aria-label={lihatPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {lihatPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="tm-help">Kosongkan kalau password tidak ingin diganti.</div>
              </div>
            )}
          </div>

          {!readonly && (
            <div className="tm-actions">
              <button type="button" className="tm-btn" onClick={batal} disabled={saving}>
                Batal
              </button>
              <button type="button" className="tm-btn tm-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop (gaya baru dk-): dua kolom — kartu identitas & kartu informasi.
  // Mode lihat menampilkan daftar label–nilai; mode ubah menampilkan input.
  const batalUbah = () => {
    setReadonly(true);
    setFieldSalah(null);
    fetchUser();
  };

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/users', label: 'Users' }}
        title={readonly ? 'Detail user' : 'Ubah user'}
        description="Informasi akun dan akses sistem"
        actions={
          readonly ? (
            <button type="button" className="dk-btn dk-btn--primary" onClick={() => setReadonly(false)}>
              <FiEdit2 aria-hidden />
              Ubah
            </button>
          ) : (
            <>
              <button type="button" className="dk-btn" onClick={batalUbah} disabled={saving}>
                Batal
              </button>
              <button type="button" className="dk-btn dk-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </>
          )
        }
      />

      <div className="dk-detail-grid">
        <aside className="dk-card">
          <div className="dk-identity">
            <span className="dk-avatar" aria-hidden>
              {(form.nama || form.username || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className="dk-identity-name">{form.nama || '-'}</h2>
            <div className="dk-identity-sub">@{form.username}</div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi akun">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi akun</h2>
            <div className="dk-card-sub">
              {readonly ? 'Klik Ubah untuk mengganti data atau password.' : 'Kolom bertanda * wajib diisi.'}
            </div>
          </div>

          <div className="dk-card-body">
            {readonly ? (
              <dl className="dk-info">
                <div>
                  <dt>Username</dt>
                  <dd>@{form.username || '-'}</dd>
                </div>
                <div>
                  <dt>Nama lengkap</dt>
                  <dd>{form.nama || '-'}</dd>
                </div>
                <div>
                  <dt>Password</dt>
                  <dd>••••••••</dd>
                </div>
              </dl>
            ) : (
              <div className="dk-form-grid">
                <div>
                  <label htmlFor="dk-username" className="dk-label">Username<span className="dk-req" aria-hidden="true">*</span><span className="visually-hidden"> (wajib diisi)</span></label>
                  <input
                    id="dk-username"
                    name="username"
                    type="text"
                    autoComplete="off"
                    className={`dk-input ${fieldSalah === 'username' ? 'is-invalid' : ''}`}
                    aria-invalid={fieldSalah === 'username' || undefined}
                    value={form.username}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="dk-nama" className="dk-label">Nama lengkap<span className="dk-req" aria-hidden="true">*</span><span className="visually-hidden"> (wajib diisi)</span></label>
                  <input
                    id="dk-nama"
                    name="nama"
                    type="text"
                    autoComplete="off"
                    className={`dk-input ${fieldSalah === 'nama' ? 'is-invalid' : ''}`}
                    aria-invalid={fieldSalah === 'nama' || undefined}
                    value={form.nama}
                    onChange={handleChange}
                  />
                </div>

                <div className="dk-field--full">
                  <label htmlFor="dk-password" className="dk-label">Password baru (opsional)</label>
                  <div className="dk-input-wrap" style={{ maxWidth: 420 }}>
                    <input
                      id="dk-password"
                      name="password"
                      type={lihatPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="dk-input dk-input--trailing"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="dk-input-trailing"
                      onClick={() => setLihatPassword((v) => !v)}
                      aria-label={lihatPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {lihatPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <div className="dk-help">Kosongkan kalau password tidak ingin diganti.</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailUser;