import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiTag, FiKey, FiCreditCard, FiCalendar, FiMapPin, FiHome, FiBriefcase } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField, MobileSelectField, MobileChoiceField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import FormField from '../../../components/FormField';
import EntityPageHeader from '../../../components/EntityPageHeader';
import EntityHeroCard from '../../../components/EntityHeroCard';
import EntityFormCard from '../../../components/EntityFormCard';
import EntityDetailActions from '../../../components/EntityDetailActions';
import DetailFormSkeleton from '../../../components/DetailFormSkeleton';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';
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


/** Nilai status yang disimpan form admin; label untuk tampilan mobile. */
const STATUS_LADIES = [
  { value: 'active', label: 'Aktif' },
  { value: 'not active', label: 'Nonaktif' },
  { value: 'resign', label: 'Resign' },
];

const DetailLadies = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const agents = useAgentOptions();
  const outlets = useOutletOptions();

  const [form, setForm] = useState<FormType>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readonly, setReadonly] = useState(true);
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: lama.
  const isMobile = useMediaQuery({ maxWidth: 768 });

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

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // outlet_id & nama_outlet selalu diubah bersama — dipakai desktop (select)
  // dan mobile (pemilih bercari).
  const pilihOutlet = (outletId: string) => {
    const selected = outlets.find((o) => o.id === outletId);
    setForm((prev) => ({
      ...prev,
      outlet_id: selected?.id ?? null,
      nama_outlet: selected?.nama_outlet ?? '',
    }));
  };

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => pilihOutlet(e.target.value);

  const handleSave = async () => {
    const error = validasiWajib([
      { label: 'Nama lengkap', value: form.nama_lengkap, name: 'nama_lengkap' },
      { label: 'Nama ladies', value: form.nama_ladies, name: 'nama_ladies' },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

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
    return <DetailFormSkeleton label="Mengambil data ladies" fields={6} />;
  }

  if (isMobile) {
    return (
      <MobileFormPage
        title={readonly ? 'Detail Ladies' : 'Ubah Ladies'}
        backTo="/ladies"
        onEdit={readonly ? () => setReadonly(false) : undefined}
        identity={{
          name: form.nama_ladies,
          sub: [form.nama_lengkap, form.nama_outlet].filter(Boolean).join(' · ') || undefined,
        }}
        sectionTitle="Informasi ladies"
        footer={
          !readonly && (
            <div className="tm-actions">
              <button
                type="button"
                className="tm-btn"
                disabled={saving}
                onClick={() => {
                  setReadonly(true);
                  setFieldSalah(null);
                  fetchLady();
                }}
              >
                Batal
              </button>
              <button type="button" className="tm-btn tm-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          )
        }
      >
        <MobileTextField
          id="ladies-nama-lengkap"
          label="Nama lengkap"
          name="nama_lengkap"
          icon={<FiUser />}
          required
          invalid={fieldSalah === 'nama_lengkap'}
          value={form.nama_lengkap}
          onChange={handleChange}
          readOnly={readonly}
        />
        <MobileTextField
          id="ladies-nama"
          label="Nama ladies"
          name="nama_ladies"
          icon={<FiTag />}
          required
          invalid={fieldSalah === 'nama_ladies'}
          value={form.nama_ladies}
          onChange={handleChange}
          readOnly={readonly}
        />
        <MobileTextField
          id="ladies-pin"
          label="PIN"
          name="pin"
          icon={<FiKey />}
          inputMode="numeric"
          value={form.pin}
          onChange={handleChange}
          readOnly={readonly}
        />
        <MobileTextField
          id="ladies-ktp"
          label="Nomor KTP"
          name="nomor_ktp"
          icon={<FiCreditCard />}
          inputMode="numeric"
          value={form.nomor_ktp}
          onChange={handleChange}
          readOnly={readonly}
        />
        <MobileTextField
          id="ladies-bergabung"
          label="Tanggal bergabung"
          name="tanggal_bergabung"
          type="date"
          icon={<FiCalendar />}
          value={form.tanggal_bergabung}
          onChange={handleChange}
          readOnly={readonly}
        />
        <MobileTextField
          id="ladies-alamat"
          label="Alamat"
          name="alamat"
          type="textarea"
          icon={<FiMapPin />}
          value={form.alamat}
          onChange={handleChange}
          readOnly={readonly}
        />
        <MobileSelectField
          id="ladies-outlet"
          label="Outlet"
          icon={<FiHome />}
          value={form.outlet_id || ''}
          options={outlets.map((o) => ({ value: o.id, label: o.nama_outlet }))}
          onChange={pilihOutlet}
          placeholder="Pilih outlet"
          readOnly={readonly}
        />
        <MobileSelectField
          id="ladies-agent"
          label="Agent"
          icon={<FiBriefcase />}
          value={form.agent_id || ''}
          options={agents.map((a) => ({ value: a.id, label: a.nama_agent }))}
          onChange={(v) => setForm((prev) => ({ ...prev, agent_id: v || null }))}
          placeholder="Pilih agent"
          readOnly={readonly}
        />
        <MobileChoiceField
          id="ladies-status"
          label="Status"
          value={form.status}
          options={STATUS_LADIES}
          onChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
          readOnly={readonly}
        />
      </MobileFormPage>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3" style={{ maxWidth: 760 }}>
      <EntityPageHeader
        backTo="/ladies"
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
          required
          invalid={fieldSalah === 'nama_lengkap'}
          value={form.nama_lengkap}
          onChange={handleChange}
          readOnly={readonly}
        />
        <FormField
          label="Nama Ladies"
          name="nama_ladies"
          required
          invalid={fieldSalah === 'nama_ladies'}
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
