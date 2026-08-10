import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntityDetailActions from '../../../components/EntityDetailActions';
import { supabase } from '../../../lib/supabaseClient';
import { useAgentOptions } from '../hooks/useAgentOptions';
import { useOutletOptions } from '../hooks/useOutletOptions';

type FormType = {
  nama_lengkap: string;
  nama_ladies: string;
  nama_outlet: string;
  outlet_id: string | null;
  pin: string;
  nomor_ktp: string;
  tanggal_bergabung: string;
  alamat: string;
  status: string;
  agent_id: string | null;
};

const emptyForm: FormType = {
  nama_lengkap: '',
  nama_ladies: '',
  nama_outlet: '',
  outlet_id: null,
  pin: '',
  nomor_ktp: '',
  tanggal_bergabung: '',
  alamat: '',
  status: 'active',
  agent_id: null,
};

const DetailLadies = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const agents = useAgentOptions();
  const outlets = useOutletOptions();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readonly, setReadonly] = useState(true);

  const fetchLady = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ladies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setForm({
        nama_lengkap: data.nama_lengkap || '',
        nama_ladies: data.nama_ladies || '',
        nama_outlet: data.nama_outlet || '',
        outlet_id: data.outlet_id,
        pin: data.pin || '',
        nomor_ktp: data.nomor_ktp || '',
        tanggal_bergabung: data.tanggal_bergabung || '',
        alamat: data.alamat || '',
        status: data.status || 'active',
        agent_id: data.agent_id,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengambil data ladies');
      navigate('/ladies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = outlets.find((o) => o.id === e.target.value);
    setForm((prev) => ({
      ...prev,
      outlet_id: selected?.id ?? null,
      nama_outlet: selected?.nama_outlet ?? '',
    }));
  };

  const handleSave = async () => {
    if (!form.nama_lengkap || !form.nama_ladies) {
      toast.error('Nama lengkap dan nama ladies wajib diisi');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        tanggal_bergabung: form.tanggal_bergabung || null,
      };

      const { error } = await supabase.from('ladies').update(payload).eq('id', id);
      if (error) throw error;

      toast.success('Ladies berhasil diperbarui');
      setReadonly(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal update ladies');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="page-shell d-flex justify-content-center align-items-center py-5"
        role="status"
        aria-label="Mengambil data ladies"
      >
        <FiLoader size={24} className="spinner-icon" />
      </div>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        icon={<FiUser />}
        title="Detail Ladies"
        description="Kelola informasi ladies"
        actions={
          <EntityDetailActions
            readonly={readonly}
            editLabel="Edit Ladies"
            saving={saving}
            onEdit={() => setReadonly(false)}
            onCancel={() => {
              setReadonly(true);
              fetchLady();
            }}
            onSave={handleSave}
          />
        }
      />

      <EntityHeroCard
        icon={<FiUser />}
        title={form.nama_ladies || '-'}
        subtitle={form.nama_lengkap || 'Data ladies'}
      />

      <EntityFormCard title="Informasi Ladies" description="Detail dan informasi ladies">
        <FormField
          label="Nama Lengkap"
          name="nama_lengkap"
          value={form.nama_lengkap}
          onChange={handleChange}
          readOnly={readonly}
        />
        <FormField
          label="Nama Ladies"
          name="nama_ladies"
          value={form.nama_ladies}
          onChange={handleChange}
          readOnly={readonly}
        />
        <FormField
          label="PIN"
          name="pin"
          value={form.pin}
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
          label="Tanggal Bergabung"
          name="tanggal_bergabung"
          value={form.tanggal_bergabung}
          onChange={handleChange}
          readOnly={readonly}
          type="date"
        />
        <FormField
          label="Alamat"
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          readOnly={readonly}
          type="textarea"
        />

        <div>
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
            Nama Outlet
          </label>
          {readonly ? (
            <input
              className="form-control"
              value={form.nama_outlet || '-'}
              readOnly
            />
          ) : (
            <select
              className="form-select border"
              name="outlet_id"
              value={form.outlet_id || ''}
              onChange={handleOutletChange}
            >
              <option value="">-- Pilih Outlet --</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nama_outlet}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
            Agent
          </label>
          {readonly ? (
            <input
              className="form-control"
              value={agents.find((a) => a.id === form.agent_id)?.nama_agent || '-'}
              readOnly
            />
          ) : (
            <select
              className="form-select border"
              name="agent_id"
              value={form.agent_id || ''}
              onChange={handleChange}
            >
              <option value="">-- Pilih Agent --</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama_agent}
                </option>
              ))}
            </select>
          )}
        </div>

        {!readonly && (
          <div>
            <label className="form-label fw-semibold" htmlFor="status">
              Status
            </label>
            <select
              className="form-select border"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="resign">Resign</option>
              <option value="not active">Not Active</option>
            </select>
          </div>
        )}
      </EntityFormCard>
    </div>
  );
};

export default DetailLadies;
