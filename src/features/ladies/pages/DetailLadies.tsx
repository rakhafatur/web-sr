import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiTag, FiKey, FiCreditCard, FiCalendar, FiMapPin, FiHome, FiBriefcase, FiEdit2 } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField, MobileSelectField, MobileChoiceField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DetailFormSkeleton from '../../../components/DetailFormSkeleton';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';
import { useAgentOptions } from '../hooks/useAgentOptions';
import { useOutletOptions } from '../hooks/useOutletOptions';
import LadiesFormDesktop from '../components/LadiesFormDesktop';
import { STATUS_LADIES, TONE_STATUS } from '../utils/statusLadies';
import { formatTanggal } from '../../../utils/formatTanggal';

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
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: dk-.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchLady = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ladies')
        .select(
          'nama_lengkap, nama_ladies, nama_outlet, outlet_id, pin, nomor_ktp, tanggal_bergabung, alamat, status, agent_id'
        )
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

  // outlet_id & nama_outlet selalu diubah bersama (pemilih bercari, mobile &
  // desktop).
  const pilihOutlet = (outletId: string) => {
    const selected = outlets.find((o) => o.id === outletId);
    setForm((prev) => ({
      ...prev,
      outlet_id: selected?.id ?? null,
      nama_outlet: selected?.nama_outlet ?? '',
    }));
  };

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

  // Desktop (gaya baru dk-, sama dengan Detail User): kartu identitas & kartu
  // informasi. Mode lihat = daftar label–nilai; mode ubah = form grid.
  const batalUbah = () => {
    setReadonly(true);
    setFieldSalah(null);
    fetchLady();
  };

  const statusDipilih = STATUS_LADIES.find((s) => s.value === form.status);
  const namaAgent = agents.find((a) => a.id === form.agent_id)?.nama_agent;
  const kosong = <span className="dk-muted">-</span>;

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/ladies', label: 'Ladies' }}
        title={readonly ? 'Detail ladies' : 'Ubah ladies'}
        description="Informasi ladies SR Agency"
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
              {(form.nama_ladies || form.nama_lengkap || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className="dk-identity-name">{form.nama_ladies || '-'}</h2>
            {form.nama_lengkap && <div className="dk-identity-sub">{form.nama_lengkap}</div>}
            <div className="dk-identity-meta">
              {statusDipilih && (
                <span className={`dk-status is-${TONE_STATUS[statusDipilih.value] ?? 'muted'}`}>
                  {statusDipilih.label}
                </span>
              )}
              {form.nama_outlet && <span className="dk-identity-sub">{form.nama_outlet}</span>}
            </div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi ladies">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi ladies</h2>
            <div className="dk-card-sub">
              {readonly ? 'Klik Ubah untuk mengganti data ladies.' : 'Kolom bertanda * wajib diisi.'}
            </div>
          </div>

          <div className="dk-card-body">
            {readonly ? (
              <dl className="dk-info">
                <div>
                  <dt>Nama ladies</dt>
                  <dd>{form.nama_ladies || kosong}</dd>
                </div>
                <div>
                  <dt>Nama lengkap</dt>
                  <dd>{form.nama_lengkap || kosong}</dd>
                </div>
                <div>
                  <dt>PIN</dt>
                  <dd className="dk-num">{form.pin || kosong}</dd>
                </div>
                <div>
                  <dt>Nomor KTP</dt>
                  <dd className="dk-num">{form.nomor_ktp || kosong}</dd>
                </div>
                <div>
                  <dt>Outlet</dt>
                  <dd>{form.nama_outlet || kosong}</dd>
                </div>
                <div>
                  <dt>Agent</dt>
                  <dd>{namaAgent || kosong}</dd>
                </div>
                <div>
                  <dt>Tanggal bergabung</dt>
                  <dd>{form.tanggal_bergabung ? formatTanggal(form.tanggal_bergabung) : kosong}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    {statusDipilih ? (
                      <span className={`dk-status is-${TONE_STATUS[statusDipilih.value] ?? 'muted'}`}>
                        {statusDipilih.label}
                      </span>
                    ) : (
                      form.status || kosong
                    )}
                  </dd>
                </div>
                <div className="dk-field--full">
                  <dt>Alamat</dt>
                  <dd style={{ whiteSpace: 'pre-line' }}>{form.alamat || kosong}</dd>
                </div>
              </dl>
            ) : (
              <LadiesFormDesktop
                form={form}
                fieldSalah={fieldSalah}
                onChange={handleChange}
                outletOptions={outlets.map((o) => ({ value: o.id, label: o.nama_outlet }))}
                agentOptions={agents.map((a) => ({ value: a.id, label: a.nama_agent }))}
                statusOptions={STATUS_LADIES}
                onOutletChange={pilihOutlet}
                onAgentChange={(v) => setForm((prev) => ({ ...prev, agent_id: v || null }))}
                onStatusChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailLadies;
