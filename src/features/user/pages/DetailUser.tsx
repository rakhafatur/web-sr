import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import { toast } from 'react-toastify';


import {
  FiLock,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntityDetailActions from '../../../components/EntityDetailActions';
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

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/users"
        icon={<FiUsers />}
        title="Detail User"
        description="Kelola informasi user dan akses sistem"
        actions={
          <EntityDetailActions
            readonly={readonly}
            editLabel="Edit User"
            saving={saving}
            onEdit={() => setReadonly(false)}
            onCancel={() => {
              setReadonly(true);
              fetchUser();
            }}
            onSave={handleSave}
          />
        }
      />

      <EntityHeroCard icon={<FiUser />} title={form.nama || '-'} subtitle={`@${form.username}`} />

      <EntityFormCard title="Informasi User" description="Detail dan informasi akun user">
        <div>
          <div className="mb-2 fw-semibold" style={{ fontSize: '0.88rem', color: 'var(--color-dark)' }}>
            Username
            <span aria-hidden="true" style={{ color: 'var(--color-expense)', marginLeft: 4 }}>
              *
            </span>
            <span className="visually-hidden"> (wajib diisi)</span>
          </div>

          <FormField
            label=""
            name="username"
            invalid={fieldSalah === 'username'}
            value={form.username}
            onChange={handleChange}
            readOnly={readonly}
          />
        </div>

        <div>
          <div className="mb-2 fw-semibold" style={{ fontSize: '0.88rem', color: 'var(--color-dark)' }}>
            Nama Lengkap
            <span aria-hidden="true" style={{ color: 'var(--color-expense)', marginLeft: 4 }}>
              *
            </span>
            <span className="visually-hidden"> (wajib diisi)</span>
          </div>

          <FormField
            label=""
            name="nama"
            invalid={fieldSalah === 'nama'}
            value={form.nama}
            onChange={handleChange}
            readOnly={readonly}
          />
        </div>

        {!readonly && (
          <div>
            <div
              className="mb-2 fw-semibold d-flex align-items-center gap-2"
              style={{ fontSize: '0.88rem', color: 'var(--color-dark)' }}
            >
              <FiLock size={14} />
              Password Baru (Opsional)
            </div>

            <FormField
              label=""
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <div style={{ fontSize: '0.76rem', color: 'var(--color-gray-500)', marginTop: 6 }}>
              Kosongkan password jika tidak ingin mengganti password user.
            </div>
          </div>
        )}
      </EntityFormCard>
    </div>
  );
};

export default DetailUser;