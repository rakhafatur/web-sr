import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntityDetailActions from '../../../components/EntityDetailActions';
import { supabase } from '../../../lib/supabaseClient';

type FormType = {
  nama_lengkap: string;
  nama_panggilan: string;
  nomor_ktp: string;
  tanggal_lahir: string;
  alamat: string;
  tanggal_bergabung: string;
};

const emptyForm: FormType = {
  nama_lengkap: '',
  nama_panggilan: '',
  nomor_ktp: '',
  tanggal_lahir: '',
  alamat: '',
  tanggal_bergabung: '',
};

const DetailPengawas = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readonly, setReadonly] = useState(true);

  const fetchPengawas = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('pengawas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setForm({
        nama_lengkap: data.nama_lengkap || '',
        nama_panggilan: data.nama_panggilan || '',
        nomor_ktp: data.nomor_ktp || '',
        tanggal_lahir: data.tanggal_lahir || '',
        alamat: data.alamat || '',
        tanggal_bergabung: data.tanggal_bergabung || '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengambil data pengawas');
      navigate('/pengawas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengawas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.nama_lengkap) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        tanggal_lahir: form.tanggal_lahir || null,
        tanggal_bergabung: form.tanggal_bergabung || null,
      };

      const { error } = await supabase.from('pengawas').update(payload).eq('id', id);
      if (error) throw error;

      toast.success('Pengawas berhasil diperbarui');
      setReadonly(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal update pengawas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell py-5">
        <div className="d-flex align-items-center gap-3">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Mengambil data pengawas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        icon={<FiUser />}
        title="Detail Pengawas"
        description="Kelola informasi pengawas"
        onBack={() => navigate('/pengawas')}
        actions={
          <EntityDetailActions
            readonly={readonly}
            editLabel="Edit Pengawas"
            saving={saving}
            onEdit={() => setReadonly(false)}
            onCancel={() => {
              setReadonly(true);
              fetchPengawas();
            }}
            onSave={handleSave}
          />
        }
      />

      <EntityHeroCard
        icon={<FiUser />}
        title={form.nama_lengkap || '-'}
        subtitle={form.nama_panggilan || 'Data pengawas'}
      />

      <EntityFormCard title="Informasi Pengawas" description="Detail dan informasi pengawas">
        <FormField
          label="Nama Lengkap"
          name="nama_lengkap"
          value={form.nama_lengkap}
          onChange={handleChange}
          readOnly={readonly}
        />
        <FormField
          label="Nama Panggilan"
          name="nama_panggilan"
          value={form.nama_panggilan}
          onChange={handleChange}
          readOnly={readonly}
        />
        <FormField
          label="Nomor KTP"
          name="nomor_ktp"
          value={form.nomor_ktp}
          onChange={handleChange}
          readOnly={readonly}
        />
        <FormField
          label="Tanggal Lahir"
          name="tanggal_lahir"
          value={
            readonly
              ? form.tanggal_lahir
                ? dayjs(form.tanggal_lahir).format('DD/MM/YYYY')
                : ''
              : form.tanggal_lahir
          }
          onChange={handleChange}
          readOnly={readonly}
          type={readonly ? 'text' : 'date'}
        />
        <FormField
          label="Alamat"
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          readOnly={readonly}
          type="textarea"
        />
        <FormField
          label="Tanggal Bergabung"
          name="tanggal_bergabung"
          value={
            readonly
              ? form.tanggal_bergabung
                ? dayjs(form.tanggal_bergabung).format('DD/MM/YYYY')
                : ''
              : form.tanggal_bergabung
          }
          onChange={handleChange}
          readOnly={readonly}
          type={readonly ? 'text' : 'date'}
        />
      </EntityFormCard>
    </div>
  );
};

export default DetailPengawas;
