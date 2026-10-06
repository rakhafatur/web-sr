import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUser, FiTag, FiCreditCard, FiCalendar, FiMapPin, FiEdit2 } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import MobileFormPage from '../../../components/mobile/MobileFormPage';
import { MobileTextField } from '../../../components/mobile/MobileFields';
import { toast } from 'react-toastify';

import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DetailFormSkeleton from '../../../components/DetailFormSkeleton';
import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib } from '../../../utils/validasiForm';
import { formatTanggal } from '../../../utils/formatTanggal';
import PengawasFormDesktop, { PengawasFormValues as FormType } from '../components/PengawasFormDesktop';

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
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);
  // Mobile: MobileFormPage (Header app dicabut di MainLayout). Desktop: dk-.
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchPengawas = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('pengawas')
        .select('nama_lengkap, nama_panggilan, nomor_ktp, tanggal_lahir, alamat, tanggal_bergabung')
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

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const error = validasiWajib([
      { label: 'Nama lengkap', value: form.nama_lengkap, name: 'nama_lengkap' },
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
    return <DetailFormSkeleton label="Mengambil data pengawas" fields={6} />;
  }

  if (isMobile) {
    return (
      <MobileFormPage
        title={readonly ? 'Detail Pengawas' : 'Ubah Pengawas'}
        backTo="/pengawas"
        onEdit={readonly ? () => setReadonly(false) : undefined}
        identity={{ name: form.nama_lengkap, sub: form.nama_panggilan || undefined }}
        sectionTitle="Informasi pengawas"
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
                  fetchPengawas();
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
          id="pengawas-nama-lengkap"
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
          id="pengawas-panggilan"
          label="Nama panggilan"
          name="nama_panggilan"
          icon={<FiTag />}
          value={form.nama_panggilan}
          onChange={handleChange}
            readOnly={readonly}
        />
        <MobileTextField
          id="pengawas-ktp"
          label="Nomor KTP"
          name="nomor_ktp"
          icon={<FiCreditCard />}
          inputMode="numeric"
          value={form.nomor_ktp}
          onChange={handleChange}
            readOnly={readonly}
        />
        <MobileTextField
          id="pengawas-lahir"
          label="Tanggal lahir"
          name="tanggal_lahir"
          type="date"
          icon={<FiCalendar />}
          value={form.tanggal_lahir}
          onChange={handleChange}
            readOnly={readonly}
        />
        <MobileTextField
          id="pengawas-alamat"
          label="Alamat"
          name="alamat"
          type="textarea"
          icon={<FiMapPin />}
          value={form.alamat}
          onChange={handleChange}
            readOnly={readonly}
        />
        <MobileTextField
          id="pengawas-bergabung"
          label="Tanggal bergabung"
          name="tanggal_bergabung"
          type="date"
          icon={<FiCalendar />}
          value={form.tanggal_bergabung}
          onChange={handleChange}
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
    fetchPengawas();
  };

  const kosong = <span className="dk-muted">-</span>;

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        back={{ to: '/pengawas', label: 'Pengawas' }}
        title={readonly ? 'Detail pengawas' : 'Ubah pengawas'}
        description="Informasi pengawas SR Agency"
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
              {(form.nama_lengkap || form.nama_panggilan || '?').charAt(0).toUpperCase()}
            </span>
            <h2 className="dk-identity-name">{form.nama_lengkap || '-'}</h2>
            <div className="dk-identity-sub">
              {form.nama_panggilan ? `Panggilan: ${form.nama_panggilan}` : 'Pengawas'}
            </div>
          </div>
        </aside>

        <section className="dk-card" aria-label="Informasi pengawas">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Informasi pengawas</h2>
            <div className="dk-card-sub">
              {readonly ? 'Klik Ubah untuk mengganti data pengawas.' : 'Kolom bertanda * wajib diisi.'}
            </div>
          </div>

          <div className="dk-card-body">
            {readonly ? (
              <dl className="dk-info">
                <div>
                  <dt>Nama lengkap</dt>
                  <dd>{form.nama_lengkap || kosong}</dd>
                </div>
                <div>
                  <dt>Nama panggilan</dt>
                  <dd>{form.nama_panggilan || kosong}</dd>
                </div>
                <div>
                  <dt>Nomor KTP</dt>
                  <dd className="dk-num">{form.nomor_ktp || kosong}</dd>
                </div>
                <div>
                  <dt>Tanggal lahir</dt>
                  <dd>{form.tanggal_lahir ? formatTanggal(form.tanggal_lahir) : kosong}</dd>
                </div>
                <div>
                  <dt>Tanggal bergabung</dt>
                  <dd>{form.tanggal_bergabung ? formatTanggal(form.tanggal_bergabung) : kosong}</dd>
                </div>
                <div className="dk-field--full">
                  <dt>Alamat</dt>
                  <dd style={{ whiteSpace: 'pre-line' }}>{form.alamat || kosong}</dd>
                </div>
              </dl>
            ) : (
              <PengawasFormDesktop form={form} fieldSalah={fieldSalah} onChange={handleChange} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailPengawas;
