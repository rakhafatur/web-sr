import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import { hitungRekapAbsensi } from '../utils/rekapAbsensi';
import { buatGridBulan } from '../utils/gridKalender';
import ListLoadingState from '../../../components/ListLoadingState';
import Skeleton from '../../../components/Skeleton';
import SearchableSelect from '../../../components/SearchableSelect';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopField from '../../../components/desktop/DesktopField';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';
import ModalWrapper from '../../../components/ModalWrapper';
import SwipeToDelete from '../../../components/SwipeToDelete';
import MonthPill from '../../ladies/components/MonthPill';
import { STATUS_ABSENSI } from '../utils/rekapAbsensi';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiHeart,
  FiMoon,
  FiCoffee,
  FiEdit3,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
} from 'react-icons/fi';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
};

type Absensi = {
  status: string;
  keterangan: string | null;
  tanggal: string;
};

/** Tampilan status absensi (ikon & warna semantik) — mobile & desktop. */
const GAYA_STATUS: Record<string, { label: string; icon: React.ReactNode; color: string; soft: string }> = {
  KERJA: { label: 'Kerja', icon: <FiCheckCircle />, color: 'var(--color-income)', soft: 'var(--color-income-soft)' },
  MENS: { label: 'Mens', icon: <FiHeart />, color: 'var(--color-expense)', soft: 'var(--color-expense-soft)' },
  OFF: { label: 'Off', icon: <FiMoon />, color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' },
  SAKIT: { label: 'Sakit', icon: <FiCoffee />, color: 'var(--color-voucher)', soft: 'var(--color-voucher-soft)' },
};

const gayaStatus = (status: string) =>
  GAYA_STATUS[status] ?? { label: status, icon: <FiCheckCircle />, color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' };

/** Kepala kolom kalender — minggu mulai Senin, sama dengan buatGridBulan. */
const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/** "2026-10-06" → "Selasa, 6 Okt". */
const tanggalPanjang = (t: string) =>
  new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

/** Chip status 4 sejajar (mobile) — dipakai form input & sheet ubah. */
const PilihStatusMobile = ({ value, onChange }: { value: string; onChange: (s: string) => void }) => (
  <div
    className="tm-types"
    role="radiogroup"
    aria-label="Status absensi"
    style={{ gridTemplateColumns: `repeat(${STATUS_ABSENSI.length}, 1fr)` }}
  >
    {STATUS_ABSENSI.map((st) => {
      const g = gayaStatus(st);
      const aktif = value === st;
      return (
        <button
          key={st}
          type="button"
          role="radio"
          aria-checked={aktif}
          className={`tm-type ${aktif ? 'is-active' : ''}`}
          style={aktif ? { background: g.soft, borderColor: g.color, color: g.color } : undefined}
          onClick={() => onChange(st)}
        >
          {g.icon}
          {g.label}
        </button>
      );
    })}
  </div>
);

/** Chip status 4 sejajar (desktop) — di dialog catat/ubah. */
const PilihStatusDesktop = ({
  value,
  onChange,
  labelledBy,
}: {
  value: string;
  onChange: (s: string) => void;
  labelledBy: string;
}) => (
  <div
    className="dk-chips dk-chips--status"
    role="radiogroup"
    aria-labelledby={labelledBy}
    style={{ gridTemplateColumns: `repeat(${STATUS_ABSENSI.length}, minmax(0, 1fr))` }}
  >
    {STATUS_ABSENSI.map((st) => {
      const g = gayaStatus(st);
      const aktif = value === st;
      return (
        <button
          key={st}
          type="button"
          role="radio"
          aria-checked={aktif}
          className={`dk-chip ${aktif ? 'is-active' : ''}`}
          style={aktif ? { background: g.soft, borderColor: g.color, color: g.color } : undefined}
          onClick={() => onChange(st)}
        >
          {g.icon}
          {g.label}
        </button>
      );
    })}
  </div>
);

const AbsensiPage = () => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  // Pilihan ladies dibawa antar halaman (URL + sesi) — lihat usePilihanTerakhir.
  const [selectedLadyId, setSelectedLadyId] = usePilihanTerakhir('ladies');

  const [tanggal, setTanggal] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const [status, setStatus] =
    useState('KERJA');

  const [keterangan, setKeterangan] =
    useState('');

  const [bulan, setBulan] = useState(
    dayjs().month() + 1
  );

  const [tahun, setTahun] = useState(
    dayjs().year()
  );

  const [activeTab, setActiveTab] = useState<
    'input' | 'riwayat'
  >('input');

  // Dialog/sheet ubah satu tanggal — dipakai mobile & desktop.
  const [ubahAbsensi, setUbahAbsensi] = useState<Absensi | null>(null);
  const [ubahStatus, setUbahStatus] = useState('KERJA');
  const [ubahKeterangan, setUbahKeterangan] = useState('');
  // Khusus desktop: dialog yang sama dipakai untuk mencatat tanggal kosong
  // dari kalender (ubahBaru = true).
  const [ubahBaru, setUbahBaru] = useState(false);
  const [menyimpanUbah, setMenyimpanUbah] = useState(false);

  const queryClient = useQueryClient();
  const monthKey = `${tahun}-${String(bulan).padStart(2, '0')}`;
  const rekapQueryKey = ['absensi-rekap', selectedLadyId, monthKey];

  const { data: ladies = [] } = useQuery({
    queryKey: ['ladies-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin, status')
        .eq('status', 'active')
        .order('nama_ladies', {
          ascending: true,
        });

      if (error) throw error;
      return (data ?? []) as Lady[];
    },
    meta: { errorLabel: 'data ladies' },
  });

  // Sengaja satu query buat sebulan penuh (maksimal ~31 baris, ringan) —
  // kalender desktop, ringkasan, dan daftar mobile di-derive dari satu cache.
  const { data: rekapRiwayat = [], isLoading: loadingRiwayat } = useQuery({
    queryKey: rekapQueryKey,
    queryFn: async () => {
      const start = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const end = dayjs(start).endOf('month').format('YYYY-MM-DD');

      const { data, error } = await supabase
        .from('absensi')
        .select('tanggal, status, keterangan')
        .eq('ladies_id', selectedLadyId)
        .gte('tanggal', start)
        .lte('tanggal', end)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Absensi[];
    },
    enabled: !!selectedLadyId,
    meta: { errorLabel: 'absensi' },
  });

  const selectedLady = ladies.find(
    (l) => l.id === selectedLadyId
  );

  // Tanpa argumen: memakai state form (form mobile, seperti sebelumnya).
  // Dengan argumen: isian dari dialog kalender desktop.
  const addMutation = useMutation({
    mutationFn: async (
      isiDialog: { tanggal: string; status: string; keterangan: string | null } | void
    ) => {
      const isi = isiDialog || { tanggal, status, keterangan: keterangan || null };

      const { data: existing } =
        await supabase
          .from('absensi')
          .select('tanggal')
          .eq('ladies_id', selectedLadyId)
          .eq('tanggal', isi.tanggal);

      if (existing && existing.length > 0) {
        throw new Error('Absensi untuk tanggal ini sudah ada!');
      }

      const { error } =
        await supabase
          .from('absensi')
          .upsert({
            ladies_id: selectedLadyId,
            tanggal: isi.tanggal,
            status: isi.status,
            keterangan: isi.keterangan,
          });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Absensi berhasil disimpan!');
      setKeterangan('');
      queryClient.invalidateQueries({ queryKey: ['absensi-rekap', selectedLadyId] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Gagal menyimpan absensi'
      );
    },
  });

  const handleSubmit = () => {
    if (
      !selectedLadyId ||
      !tanggal ||
      !status
    ) {
      toast.error(
        'Lengkapi semua data!'
      );
      return;
    }

    const today = dayjs().format(
      'YYYY-MM-DD'
    );

    if (tanggal > today) {
      toast.error(
        'Tanggal tidak boleh di masa depan!'
      );
      return;
    }

    addMutation.mutate();
  };

  const handlePrevMonth = () => {
    if (bulan === 1) {
      setBulan(12);
      setTahun((prev) => prev - 1);
    } else {
      setBulan((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (bulan === 12) {
      setBulan(1);
      setTahun((prev) => prev + 1);
    } else {
      setBulan((prev) => prev + 1);
    }
  };

  const handleDelete = async (
    tanggalToDelete: string
  ) => {
    const confirm =
      await confirmDialog(
        'Hapus absensi ini?'
      );

    if (
      !confirm ||
      !selectedLadyId
    )
      return;

    await queryClient.cancelQueries({ queryKey: rekapQueryKey });

    const previous = queryClient.getQueryData<Absensi[]>(rekapQueryKey);

    queryClient.setQueryData<Absensi[]>(rekapQueryKey, (old) =>
      (old || []).filter((item) => item.tanggal !== tanggalToDelete)
    );

    const { error } =
      await supabase
        .from('absensi')
        .delete()
        .eq(
          'ladies_id',
          selectedLadyId
        )
        .eq('tanggal', tanggalToDelete);

    if (error) {
      queryClient.setQueryData(rekapQueryKey, previous);
      toast.error(
        'Gagal hapus data: ' +
        error.message
      );
    } else {
      queryClient.invalidateQueries({ queryKey: ['absensi-rekap', selectedLadyId] });
    }
  };

  const rekap = hitungRekapAbsensi(rekapRiwayat);

  /** Simpan perubahan status/keterangan satu tanggal — dipakai dialog desktop
      dan sheet mobile. */
  const simpanPerubahan = async (
    tanggalTarget: string,
    data: { status: string; keterangan?: string | null }
  ) => {
    if (!selectedLadyId) return;

    const { error } = await supabase
      .from('absensi')
      .update({
        status: data.status,
        keterangan: data.keterangan ?? null,
      })
      .eq('ladies_id', selectedLadyId)
      .eq('tanggal', tanggalTarget);

    if (error) {
      toast.error('Gagal update data: ' + error.message);
    }

    queryClient.invalidateQueries({ queryKey: ['absensi-rekap', selectedLadyId] });
  };

  const opsiLadies = ladies.map((l) => ({
    value: l.id,
    label: `${l.nama_ladies} • ${l.nama_outlet} (${l.pin})`,
  }));

  const labelBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
  const sekarang = dayjs();
  const diBulanIni = tahun === sekarang.year() && bulan === sekarang.month() + 1;

  const bukaUbah = (a: Absensi) => {
    setUbahAbsensi(a);
    setUbahBaru(false);
    setUbahStatus(a.status);
    setUbahKeterangan(a.keterangan ?? '');
  };

  /** Tanggal kosong di kalender desktop → dialog catat, status awal Kerja
      (kasus paling umum: klik tanggal → Simpan). */
  const bukaTambah = (tgl: string) => {
    setUbahAbsensi({ tanggal: tgl, status: 'KERJA', keterangan: null });
    setUbahBaru(true);
    setUbahStatus('KERJA');
    setUbahKeterangan('');
  };

  const simpanUbah = async () => {
    if (!ubahAbsensi) return;

    if (ubahBaru) {
      addMutation.mutate(
        { tanggal: ubahAbsensi.tanggal, status: ubahStatus, keterangan: ubahKeterangan || null },
        { onSuccess: () => setUbahAbsensi(null) }
      );
      return;
    }

    setMenyimpanUbah(true);
    try {
      await simpanPerubahan(ubahAbsensi.tanggal, {
        status: ubahStatus,
        keterangan: ubahKeterangan || null,
      });
      setUbahAbsensi(null);
    } finally {
      setMenyimpanUbah(false);
    }
  };

  const sedangMenyimpan = ubahBaru ? addMutation.isPending : menyimpanUbah;

  // Mobile: tampilan baru selaras Transaksi (Header app dicabut di MainLayout).
  // Desktop: gaya dk- di bawah.
  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Absensi" backTo="/" />

        <div className="tm-stack">
          <h2 className="tm-section-title">Ladies</h2>
          <SearchableSelect
            value={selectedLadyId}
            onChange={(v) => {
              setSelectedLadyId(v);
              setActiveTab('input');
            }}
            options={opsiLadies}
            placeholder="Pilih ladies"
            searchPlaceholder="Cari nama ladies..."
            height={52}
            borderRadius={999}
            fontSize="1rem"
          />

          {!selectedLadyId ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                <div className="tm-empty-title">Pilih ladies dulu</div>
                <div className="tm-empty-text">
                  Form absensi dan riwayat akan muncul setelah ladies dipilih.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="tm-segmented" role="tablist" aria-label="Tampilan">
                {[
                  { key: 'input' as const, label: 'Input' },
                  { key: 'riwayat' as const, label: 'Riwayat' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`tm-segment ${activeTab === tab.key ? 'is-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="tm-stack"
                >
                  {activeTab === 'input' ? (
                    <div className="tm-card">
                      <div className="tm-card-head">
                        <span className="tm-card-title">{selectedLady?.nama_ladies}</span>
                        {selectedLady?.nama_outlet && <span className="tm-pill">{selectedLady.nama_outlet}</span>}
                      </div>

                      <div className="tm-field" style={{ marginTop: 0 }}>
                        <label htmlFor="absen-tanggal" className="tm-label">Tanggal</label>
                        <div className="tm-input-wrap">
                          <FiCalendar className="tm-input-icon" aria-hidden />
                          <input
                            id="absen-tanggal"
                            type="date"
                            className="tm-input"
                            value={tanggal}
                            max={dayjs().format('YYYY-MM-DD')}
                            onChange={(e) => setTanggal(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="tm-field">
                        <span className="tm-label">Status</span>
                        <PilihStatusMobile value={status} onChange={setStatus} />
                      </div>

                      <div className="tm-field">
                        <label htmlFor="absen-keterangan" className="tm-label">Keterangan (opsional)</label>
                        <div className="tm-input-wrap">
                          <span className="tm-input-icon tm-input-icon--top" aria-hidden><FiEdit3 /></span>
                          <textarea
                            id="absen-keterangan"
                            rows={2}
                            className="tm-input tm-input--area"
                            placeholder="Tambahkan catatan..."
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="tm-submit">
                        <button
                          type="button"
                          className="tm-btn tm-btn--primary"
                          style={{ width: '100%' }}
                          onClick={handleSubmit}
                          disabled={addMutation.isPending}
                        >
                          <FiPlus aria-hidden />
                          {addMutation.isPending ? 'Menyimpan...' : 'Simpan Absensi'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <MonthPill
                        label={labelBulan}
                        value={monthKey}
                        max={dayjs().format('YYYY-MM')}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [y, m] = e.target.value.split('-').map(Number);
                          setTahun(y);
                          setBulan(m);
                        }}
                        onPrev={handlePrevMonth}
                        onNext={handleNextMonth}
                        nextDisabled={diBulanIni}
                      />

                      <section className="tm-stats" aria-label="Ringkasan absensi">
                        {STATUS_ABSENSI.map((st) => {
                          const g = gayaStatus(st);
                          return (
                            <div key={st} className="tm-stat">
                              <span className="tm-stat-label">
                                <span className="tm-dot" style={{ background: g.color }} />
                                {g.label}
                              </span>
                              <span className="tm-stat-value">{rekap[st]}</span>
                            </div>
                          );
                        })}
                      </section>

                      {loadingRiwayat ? (
                        <ListLoadingState label="Memuat histori absensi" rows={4} />
                      ) : rekapRiwayat.length === 0 ? (
                        <div className="tm-group">
                          <div className="tm-empty">
                            <span className="tm-empty-icon" aria-hidden><FiInbox /></span>
                            <div className="tm-empty-title">Belum ada absensi</div>
                            <div className="tm-empty-text">Tidak ada catatan absensi di {labelBulan}.</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="tm-group tm-list">
                            {rekapRiwayat.map((a) => {
                              const g = gayaStatus(a.status);
                              return (
                                <SwipeToDelete key={a.tanggal} onDelete={() => handleDelete(a.tanggal)} borderRadius={0}>
                                  <button type="button" className="tm-row tm-row-btn" onClick={() => bukaUbah(a)}>
                                    <span className="tm-row-icon" style={{ background: g.soft, color: g.color }} aria-hidden>
                                      {g.icon}
                                    </span>
                                    <div className="tm-row-main">
                                      <div className="tm-row-title">{tanggalPanjang(a.tanggal)}</div>
                                      <div className="tm-row-sub">
                                        <span style={{ color: g.color, fontWeight: 600 }}>{g.label}</span>
                                        {a.keterangan ? ` · ${a.keterangan}` : ''}
                                      </div>
                                    </div>
                                    <FiChevronRight className="tm-chevron" aria-hidden />
                                  </button>
                                </SwipeToDelete>
                              );
                            })}
                          </div>
                          <div className="tm-hint">Ketuk untuk mengubah · geser ke kiri untuk menghapus</div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        <ModalWrapper
          show={!!ubahAbsensi}
          title={
            <div className="fw-bold">
              Ubah absensi{ubahAbsensi ? ` · ${tanggalPanjang(ubahAbsensi.tanggal)}` : ''}
            </div>
          }
          onClose={() => setUbahAbsensi(null)}
          footer={
            <div className="tm-sheet-footer">
              <button type="button" className="tm-btn" onClick={() => setUbahAbsensi(null)}>Batal</button>
              <button type="button" className="tm-btn tm-btn--primary" onClick={simpanUbah}>
                Simpan
              </button>
            </div>
          }
        >
          <div className="tm-sheet-form">
            <div className="tm-field">
              <span className="tm-label">Status</span>
              <PilihStatusMobile value={ubahStatus} onChange={setUbahStatus} />
            </div>
            <div className="tm-field">
              <label htmlFor="ubah-keterangan" className="tm-label">Keterangan (opsional)</label>
              <div className="tm-input-wrap">
                <span className="tm-input-icon tm-input-icon--top" aria-hidden><FiEdit3 /></span>
                <textarea
                  id="ubah-keterangan"
                  rows={2}
                  className="tm-input tm-input--area"
                  value={ubahKeterangan}
                  onChange={(e) => setUbahKeterangan(e.target.value)}
                />
              </div>
            </div>
          </div>
        </ModalWrapper>
      </div>
    );
  }

  // Desktop (gaya baru dk-): pemilih ladies di atas, lalu satu kalender
  // bulanan sebagai satu-satunya tempat kerja — klik tanggal kosong = catat,
  // klik tanggal tercatat = ubah/hapus, lewat dialog yang sama.
  const hariIni = sekarang.format('YYYY-MM-DD');
  const grid = buatGridBulan(tahun, bulan - 1);
  const perTanggal = new Map(rekapRiwayat.map((a) => [a.tanggal, a]));
  const jumlahTercatat = rekapRiwayat.length;

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader title="Absensi" description="Catat dan pantau kehadiran harian ladies" />

      <section className="dk-card dk-pickbar" aria-label="Pilih ladies">
        <div className="dk-pickbar-field">
          <span className="dk-label" id="dk-absen-ladies-label">Ladies</span>
          <SearchableSelect
            value={selectedLadyId}
            onChange={setSelectedLadyId}
            options={opsiLadies}
            placeholder="Pilih ladies"
            searchPlaceholder="Cari nama ladies..."
            height={44}
            borderRadius={999}
            fontSize="15px"
          />
        </div>

        {selectedLady && (
          <div className="dk-pickbar-meta">
            <span className="dk-avatar" aria-hidden>
              {(selectedLady.nama_ladies || '?').charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="dk-pickbar-name">{selectedLady.nama_ladies}</div>
              <div className="dk-person-sub">
                {[selectedLady.nama_outlet, selectedLady.pin && `PIN ${selectedLady.pin}`]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          </div>
        )}
      </section>

      {!selectedLadyId ? (
        <section className="dk-card">
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiUsers /></span>
            <div className="dk-empty-title">Pilih ladies dulu</div>
            <div className="dk-empty-text">Kalender absensi akan muncul setelah ladies dipilih.</div>
          </div>
        </section>
      ) : (
        <section className="dk-card" aria-label={`Kalender absensi ${labelBulan}`}>
          <div className="dk-card-head dk-card-head--row">
            <div>
              <h2 className="dk-card-title">Kalender absensi</h2>
              <div className="dk-card-sub">
                Klik tanggal untuk mencatat atau mengubah absensi
                {!loadingRiwayat && ` · ${jumlahTercatat} hari tercatat`}
              </div>
            </div>
            <div className="dk-month-nav">
              <button type="button" className="dk-icon-btn" aria-label="Bulan sebelumnya" onClick={handlePrevMonth}>
                <FiChevronLeft />
              </button>
              <span className="dk-month-label" aria-live="polite">{labelBulan}</span>
              <button
                type="button"
                className="dk-icon-btn"
                aria-label="Bulan berikutnya"
                onClick={handleNextMonth}
                disabled={diBulanIni}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="dk-card-body">
            <div className="dk-stats" aria-label="Ringkasan absensi">
              {STATUS_ABSENSI.map((st) => {
                const g = gayaStatus(st);
                return (
                  <div key={st} className="dk-stat">
                    <span className="dk-stat-label">
                      <span className="dk-dot" style={{ background: g.color }} />
                      {g.label}
                    </span>
                    <span className="dk-stat-value">
                      {rekap[st]} <span className="dk-stat-unit">hari</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {loadingRiwayat ? (
              <div role="status" aria-label="Memuat kalender absensi">
                <Skeleton height={460} borderRadius="var(--radius-lg)" />
              </div>
            ) : (
              <div className="dk-cal">
                <div className="dk-cal-weekdays" aria-hidden>
                  {NAMA_HARI.map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>

                <div className="dk-cal-grid">
                  {grid.map((tgl, i) => {
                    if (!tgl) return <span key={`k${i}`} aria-hidden />;

                    const catatan = perTanggal.get(tgl);
                    const g = catatan ? gayaStatus(catatan.status) : null;
                    const nanti = tgl > hariIni;

                    return (
                      <button
                        key={tgl}
                        type="button"
                        className={`dk-cal-day ${tgl === hariIni ? 'is-today' : ''} ${g ? 'is-filled' : ''}`}
                        style={g ? { background: g.soft, color: g.color } : undefined}
                        disabled={nanti}
                        aria-label={`${tanggalPanjang(tgl)}: ${g ? g.label : 'belum tercatat, klik untuk mencatat'}${
                          catatan?.keterangan ? ` — ${catatan.keterangan}` : ''
                        }`}
                        title={catatan?.keterangan || undefined}
                        onClick={() => (catatan ? bukaUbah(catatan) : bukaTambah(tgl))}
                      >
                        <span className="dk-cal-num">{Number(tgl.slice(8))}</span>
                        {g ? (
                          <span className="dk-cal-body">
                            <span className="dk-cal-status">{g.label}</span>
                            {catatan?.keterangan && <span className="dk-cal-ket">{catatan.keterangan}</span>}
                          </span>
                        ) : (
                          !nanti && <FiPlus className="dk-cal-add" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* DIALOG CATAT / UBAH */}
      <ModalWrapper
        show={!!ubahAbsensi}
        title={
          <div>
            <div className="dk-card-title">{ubahBaru ? 'Catat absensi' : 'Ubah absensi'}</div>
            {ubahAbsensi && (
              <div className="dk-card-sub">
                {tanggalPanjang(ubahAbsensi.tanggal)}
                {selectedLady ? ` · ${selectedLady.nama_ladies}` : ''}
              </div>
            )}
          </div>
        }
        onClose={() => setUbahAbsensi(null)}
        footer={
          <div className="dk-modal-foot">
            {!ubahBaru && (
              <button
                type="button"
                className="dk-btn dk-btn--danger-ghost"
                style={{ marginRight: 'auto' }}
                disabled={sedangMenyimpan}
                onClick={() => {
                  if (!ubahAbsensi) return;
                  const t = ubahAbsensi.tanggal;
                  setUbahAbsensi(null);
                  handleDelete(t);
                }}
              >
                <FiTrash2 aria-hidden />
                Hapus
              </button>
            )}
            <button type="button" className="dk-btn" onClick={() => setUbahAbsensi(null)} disabled={sedangMenyimpan}>
              Batal
            </button>
            <button type="button" className="dk-btn dk-btn--primary" onClick={simpanUbah} disabled={sedangMenyimpan}>
              {sedangMenyimpan ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        }
      >
        <div className="dk-stack">
          <DesktopField label="Status" labelId="dk-ubah-status-label">
            <PilihStatusDesktop value={ubahStatus} onChange={setUbahStatus} labelledBy="dk-ubah-status-label" />
          </DesktopField>
          <DesktopField label="Keterangan (opsional)" htmlFor="dk-ubah-keterangan">
            <textarea
              id="dk-ubah-keterangan"
              rows={3}
              className="dk-input"
              placeholder="Tambahkan catatan..."
              value={ubahKeterangan}
              onChange={(e) => setUbahKeterangan(e.target.value)}
            />
          </DesktopField>
        </div>
      </ModalWrapper>
    </div>
  );
};
export default AbsensiPage;
