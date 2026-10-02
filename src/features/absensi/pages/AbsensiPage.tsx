import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import AddAbsensiModal from '../components/AddAbsensiModal';
import AbsensiSummaryCards from '../components/AbsensiSummaryCards';
import AbsensiMonthHeader from '../components/AbsensiMonthHeader';
import StatusPicker from '../components/StatusPicker';
import { hitungRekapAbsensi } from '../utils/rekapAbsensi';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import ListLoadingState from '../../../components/ListLoadingState';
import Button from '../../../components/Button';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import SearchableSelect from '../../../components/SearchableSelect';
import MobilePageBar from '../../../components/MobilePageBar';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';
import ModalWrapper from '../../../components/ModalWrapper';
import SwipeToDelete from '../../../components/SwipeToDelete';
import MonthPill from '../../ladies/components/MonthPill';
import { STATUS_ABSENSI } from '../utils/rekapAbsensi';
import '../../../styles/mobile-admin.css';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiHeart,
  FiMoon,
  FiCoffee,
  FiEdit3,
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

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** Tampilan status absensi di mobile (ikon & warna semantik). */
const GAYA_STATUS: Record<string, { label: string; icon: React.ReactNode; color: string; soft: string }> = {
  KERJA: { label: 'Kerja', icon: <FiCheckCircle />, color: 'var(--color-income)', soft: 'var(--color-income-soft)' },
  MENS: { label: 'Mens', icon: <FiHeart />, color: 'var(--color-expense)', soft: 'var(--color-expense-soft)' },
  OFF: { label: 'Off', icon: <FiMoon />, color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' },
  SAKIT: { label: 'Sakit', icon: <FiCoffee />, color: 'var(--color-voucher)', soft: 'var(--color-voucher-soft)' },
};

const gayaStatus = (status: string) =>
  GAYA_STATUS[status] ?? { label: status, icon: <FiCheckCircle />, color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' };

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

  const [page, setPage] = useState(1);

  const limit = isMobile ? 5 : 10;

  const [showModal, setShowModal] =
    useState(false);

  const [editAbsensi, setEditAbsensi] =
    useState<Absensi | null>(null);

  const [
    selectedTanggal,
    setSelectedTanggal,
  ] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'input' | 'riwayat'
  >('input');

  // Sheet ubah absensi versi mobile (sebelumnya mobile hanya bisa hapus).
  const [ubahMobile, setUbahMobile] = useState<Absensi | null>(null);
  const [ubahStatus, setUbahStatus] = useState('KERJA');
  const [ubahKeterangan, setUbahKeterangan] = useState('');

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
  // riwayat (paginated, dipakai DataTable desktop) & rekapRiwayat (dipakai
  // summary + daftar mobile) sebelumnya 2 fetch terpisah yang
  // datanya tumpang tindih, sekarang cukup di-derive dari satu cache.
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

  const riwayat = rekapRiwayat.slice(
    (page - 1) * limit,
    (page - 1) * limit + limit
  );

  const totalPages = Math.max(
    1,
    Math.ceil(rekapRiwayat.length / limit)
  );

  const selectedLady = ladies.find(
    (l) => l.id === selectedLadyId
  );

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: existing } =
        await supabase
          .from('absensi')
          .select('*')
          .eq('ladies_id', selectedLadyId)
          .eq('tanggal', tanggal);

      if (existing && existing.length > 0) {
        throw new Error('Absensi untuk tanggal ini sudah ada!');
      }

      const { error } =
        await supabase
          .from('absensi')
          .upsert({
            ladies_id: selectedLadyId,
            tanggal,
            status,
            keterangan: keterangan || null,
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

    setPage(1);
  };

  const handleNextMonth = () => {
    if (bulan === 12) {
      setBulan(1);
      setTahun((prev) => prev + 1);
    } else {
      setBulan((prev) => prev + 1);
    }

    setPage(1);
  };

  const handleEdit = (
    absen: Absensi
  ) => {
    setEditAbsensi(absen);
    setSelectedTanggal(
      absen.tanggal
    );
    setShowModal(true);
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

  /** Simpan perubahan status/keterangan satu tanggal — dipakai modal desktop
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

  const riwayatWithId = riwayat.map(
    (row, idx) => ({
      ...row,
      id:
        row.tanggal + '-' + idx,
    })
  );

  const statusButtons = (
    <StatusPicker value={status} onChange={setStatus} />
  );

  const riwayatSection = (
    <>
      <AbsensiMonthHeader
        bulanLabel={monthNames[bulan - 1]}
        tahun={tahun}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <AbsensiSummaryCards rekap={rekap} />

      {/* RIWAYAT */}
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
              'linear-gradient(to right, var(--color-surface), var(--color-green-lighter))',
          }}
        >
          <div className="fw-bold">
            Riwayat Absensi
          </div>

          <div
            style={{
              fontSize:
                '0.85rem',
              color: 'var(--color-gray-500)',
            }}
          >
            Histori absensi{' '}
            {selectedLady?.nama_ladies}
          </div>
        </div>

        <div
          className={
            isMobile
              ? 'p-2'
              : 'p-3'
          }
        >
          {loadingRiwayat ? (
            <ListLoadingState label="Memuat histori absensi" rows={4} />
          ) : (
            <>
              <DataTable
                columns={[
                  {
                    key:
                      'tanggal',
                    label:
                      'Tanggal',
                  },
                  {
                    key:
                      'status',
                    label:
                      'Status',
                    render: (
                      a
                    ) => (
                      <span
                        className={`badge ${a.status ===
                          'KERJA'
                          ? 'bg-success'
                          : a.status ===
                            'MENS'
                            ? 'bg-danger'
                            : a.status ===
                              'OFF'
                              ? 'bg-secondary'
                              : 'bg-warning text-dark'
                          }`}
                      >
                        {
                          a.status
                        }
                      </span>
                    ),
                  },
                  {
                    key:
                      'keterangan',
                    label:
                      'Keterangan',
                    render: (
                      a
                    ) =>
                      a.keterangan ||
                      '-',
                  },
                  {
                    key: 'id',
                    label:
                      'Aksi',
                    render: (
                      a
                    ) => (
                      <div className="d-flex gap-2">
                        <ActionIconButton
                          icon={<FiEdit2 />}
                          variant="warning"
                          title="Edit"
                          onClick={() => handleEdit(a)}
                        />
                        <ActionIconButton
                          icon={<FiTrash2 />}
                          variant="danger"
                          title="Hapus"
                          onClick={() => handleDelete(a.tanggal)}
                        />
                      </div>
                    ),
                  },
                ]}
                data={
                  riwayatWithId
                }
              />

              {/* PAGINATION */}
              {totalPages > 1 && (
                <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  const opsiLadies = ladies.map((l) => ({
    value: l.id,
    label: `${l.nama_ladies} • ${l.nama_outlet} (${l.pin})`,
  }));

  // Mobile: tampilan baru selaras Transaksi (Header app dicabut di MainLayout).
  // Desktop: tampilan lama di bawah.
  if (isMobile) {
    const labelBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    const sekarang = dayjs();
    const diBulanIni = tahun === sekarang.year() && bulan === sekarang.month() + 1;
    const tanggalPanjang = (t: string) =>
      new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });

    const bukaUbah = (a: Absensi) => {
      setUbahMobile(a);
      setUbahStatus(a.status);
      setUbahKeterangan(a.keterangan ?? '');
    };

    return (
      <div className="tm-page">
        <MobilePageBar title="Absensi" backTo="/" />

        <div className="tm-stack">
          <h2 className="tm-section-title">Ladies</h2>
          <SearchableSelect
            value={selectedLadyId}
            onChange={(v) => {
              setSelectedLadyId(v);
              setPage(1);
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
                          setPage(1);
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
          show={!!ubahMobile}
          title={
            <div className="fw-bold">
              Ubah absensi{ubahMobile ? ` · ${tanggalPanjang(ubahMobile.tanggal)}` : ''}
            </div>
          }
          onClose={() => setUbahMobile(null)}
          footer={
            <div className="tm-sheet-footer">
              <button type="button" className="tm-btn" onClick={() => setUbahMobile(null)}>Batal</button>
              <button
                type="button"
                className="tm-btn tm-btn--primary"
                onClick={async () => {
                  if (!ubahMobile) return;
                  await simpanPerubahan(ubahMobile.tanggal, {
                    status: ubahStatus,
                    keterangan: ubahKeterangan || null,
                  });
                  setUbahMobile(null);
                }}
              >
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

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <FeaturePageHeader
        icon={<FiCalendar />}
        title="Absensi Harian"
        description="Kelola absensi ladies harian"
      />

      {(
        <>
          {/* FORM CARD (DESKTOP — TIDAK DIUBAH) */}
          <div
            className="card border-0 shadow-sm rounded-4 mb-4"
            style={{
              overflow: 'hidden',
            }}
          >
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background:
                  'linear-gradient(to right, var(--color-green-lighter), var(--color-surface))',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FiUsers
                  size={18}
                  style={{
                    color:
                      'var(--color-green)',
                  }}
                />

                <div>
                  <div className="fw-bold">
                    Input Absensi
                  </div>

                  <div
                    style={{
                      fontSize:
                        '0.85rem',
                      color: 'var(--color-gray-500)',
                    }}
                  >
                    Isi data absensi
                    harian ladies
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="row g-4">
                {/* LADIES */}
                <div className="col-12 col-lg-4">
                  <label
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: '0.95rem',
                    }}
                  >
                    Pilih Ladies
                  </label>

                  <SearchableSelect
                    value={selectedLadyId}
                    onChange={(v) => {
                      setSelectedLadyId(v);
                      setPage(1);
                    }}
                    options={ladies.map((l) => ({
                      value: l.id,
                      label: `${l.nama_ladies} • ${l.nama_outlet} (${l.pin})`,
                    }))}
                    placeholder="-- Pilih Ladies --"
                    searchPlaceholder="Cari nama ladies..."
                    height={58}
                    borderRadius={18}
                    fontSize="0.95rem"
                  />
                </div>

                {/* DATE */}
                <div className="col-12 col-lg-4">
                  <label className="fw-semibold mb-2">
                    Tanggal
                  </label>

                  <input
                    type="date"
                    className="form-control shadow-none"
                    value={tanggal}
                    onChange={(e) =>
                      setTanggal(
                        e.target.value
                      )
                    }
                    style={{
                      height: 58,
                      borderRadius: 18,
                      border:
                        '2px solid var(--color-green-light)',
                      paddingInline: 18,
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                {/* STATUS */}
                <div className="col-12 col-lg-4">
                  <label className="fw-semibold mb-2">
                    Status
                  </label>

                  {statusButtons}
                </div>

                {/* KETERANGAN */}
                <div className="col-12">
                  <label className="fw-semibold mb-2">
                    Keterangan
                  </label>

                  <textarea
                    className="form-control shadow-none"
                    rows={3}
                    value={keterangan}
                    onChange={(e) =>
                      setKeterangan(
                        e.target.value
                      )
                    }
                    placeholder="Tambahkan catatan..."
                    style={{
                      borderRadius: 16,
                      border:
                        '2px solid var(--color-green-light)',
                      padding: 16,
                      fontSize: '0.92rem',
                      minHeight: 110,
                      resize: 'none',
                    }}
                  />
                </div>
              </div>

              {/* BUTTON */}
              <div className="mt-4 d-flex">
                <Button
                  variant="primary"
                  icon={addMutation.isPending ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus size={18} />}
                  onClick={handleSubmit}
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? 'Menyimpan...' : 'Simpan Absensi'}
                </Button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {selectedLadyId && riwayatSection}
        </>
      )}

      {/* MODAL */}
      <AddAbsensiModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditAbsensi(null);
          setSelectedTanggal(null);
        }}
        absensi={editAbsensi}
        onSubmit={async (data) => {
          if (!selectedTanggal) return;

          await simpanPerubahan(selectedTanggal, data);

          setShowModal(false);
          setEditAbsensi(null);
          setSelectedTanggal(null);
        }}
      />
    </div>
  );
};
export default AbsensiPage;
