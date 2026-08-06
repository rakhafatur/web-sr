import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import AddAbsensiModal from '../components/AddAbsensiModal';
import CardTableAbsensi from '../components/CardTableAbsensi';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import Button from '../../../components/Button';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import SearchableSelect from '../../../components/SearchableSelect';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUsers,
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

const AbsensiPage = () => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [selectedLadyId, setSelectedLadyId] =
    useState('');

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

  const queryClient = useQueryClient();
  const monthKey = `${tahun}-${String(bulan).padStart(2, '0')}`;
  const rekapQueryKey = ['absensi-rekap', selectedLadyId, monthKey];

  const { data: ladies = [] } = useQuery({
    queryKey: ['ladies-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('*')
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
  // summary + CardTableAbsensi mobile) sebelumnya 2 fetch terpisah yang
  // datanya tumpang tindih, sekarang cukup di-derive dari satu cache.
  const { data: rekapRiwayat = [] } = useQuery({
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
        '❗ Yakin ingin menghapus absensi ini?'
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

  const totalKERJA =
    rekapRiwayat.filter(
      (r) => r.status === 'KERJA'
    ).length;

  const totalMENS =
    rekapRiwayat.filter(
      (r) => r.status === 'MENS'
    ).length;

  const totalOFF =
    rekapRiwayat.filter(
      (r) => r.status === 'OFF'
    ).length;

  const totalSAKIT =
    rekapRiwayat.filter(
      (r) => r.status === 'SAKIT'
    ).length;

  const riwayatWithId = riwayat.map(
    (row, idx) => ({
      ...row,
      id:
        row.tanggal + '-' + idx,
    })
  );

  const statusButtons = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? 'repeat(4, 1fr)'
          : 'repeat(4, auto)',
        gap: isMobile ? 8 : 10,
      }}
    >
      {[
        'KERJA',
        'MENS',
        'OFF',
        'SAKIT',
      ].map((opt) => {
        const active =
          status === opt;

        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              setStatus(opt)
            }
            className={`btn segmented-chip${active ? ' active' : ''}`}
            style={{
              height: isMobile ? 42 : 46,
              padding: isMobile ? '0 6px' : '0 16px',
              fontSize: isMobile ? '0.7rem' : '0.88rem',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const riwayatSection = (
    <>
      {/* HEADER REKAP */}
      <div
        className="d-flex justify-content-between align-items-center mb-3"
        style={{
          gap: 12,
        }}
      >
        {/* LEFT */}
        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            className="fw-bold"
            style={{
              fontSize: isMobile
                ? '0.92rem'
                : '1.1rem',

              color:
                'var(--color-dark)',

              lineHeight: 1.1,
            }}
          >
            Rekap Absensi
          </div>

          <div
            style={{
              fontSize: isMobile
                ? '0.72rem'
                : '0.9rem',

              color: 'var(--color-gray-500)',

              marginTop: 2,
            }}
          >
            {
              monthNames[
              bulan - 1
              ]
            }{' '}
            {tahun}
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="d-flex align-items-center"
          style={{
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            className="btn border-0 d-flex align-items-center justify-content-center"
            onClick={
              handlePrevMonth
            }
            style={{
              width: isMobile
                ? 34
                : 40,

              height: isMobile
                ? 34
                : 40,

              borderRadius: 12,

              background:
                'var(--color-surface-2)',

              padding: 0,

              fontSize: isMobile
                ? '0.8rem'
                : '1rem',
            }}
          >
            ←
          </button>

          <button
            className="btn border-0 d-flex align-items-center justify-content-center"
            onClick={
              handleNextMonth
            }
            style={{
              width: isMobile
                ? 34
                : 40,

              height: isMobile
                ? 34
                : 40,

              borderRadius: 12,

              background:
                'var(--color-surface-2)',

              padding: 0,

              fontSize: isMobile
                ? '0.8rem'
                : '1rem',
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div
        className="row g-2 mb-4"
      >
        {[
          {
            label: 'Kerja',
            total: totalKERJA,
            bg: 'var(--color-income-soft)',
            color: 'var(--color-income)',
          },
          {
            label: 'Mens',
            total: totalMENS,
            bg: 'var(--color-expense-soft)',
            color: 'var(--color-expense)',
          },
          {
            label: 'Off',
            total: totalOFF,
            bg: 'var(--color-gray-200)',
            color: 'var(--color-gray-700)',
          },
          {
            label: 'Sakit',
            total: totalSAKIT,
            bg: 'var(--color-voucher-soft)',
            color: 'var(--color-voucher)',
          },
        ].map((item) => (
          <div
            className="col-6 col-lg-3"
            key={item.label}
          >
            <div
              className="h-100"
              style={{
                background:
                  item.bg,

                borderRadius:
                  isMobile
                    ? 16
                    : 22,

                padding:
                  isMobile
                    ? '12px 14px'
                    : '18px 20px',

                boxShadow:
                  '0 2px 10px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: isMobile
                    ? '0.7rem'
                    : '0.82rem',

                  color:
                    item.color,

                  opacity: 0.8,

                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  fontSize: isMobile
                    ? '1.4rem'
                    : '2rem',

                  fontWeight: 800,

                  lineHeight: 1.1,

                  marginTop: 2,

                  color:
                    item.color,
                }}
              >
                {item.total}
              </div>
            </div>
          </div>
        ))}
      </div>

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
          {!isMobile ? (
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
          ) : (
            <CardTableAbsensi
              data={
                rekapRiwayat
              }
              page={page - 1}
              rowsPerPage={limit}
              onPageChange={(
                p
              ) => {
                if (
                  p >= 0 &&
                  p <
                  totalPages
                ) {
                  setPage(
                    p + 1
                  );
                }
              }}
              onDelete={
                handleDelete
              }
            />
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <FeaturePageHeader
        icon={<FiCalendar />}
        title="Absensi Harian"
        description="Kelola absensi ladies harian"
      />

      {!isMobile ? (
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
      ) : (
        <>
          {/* PILIH LADIES (MOBILE — TERPISAH, IKUT SCROLL) */}
          <div
            className="card border-0 shadow-sm rounded-4 mb-4"
            style={{
              overflow: 'hidden',
            }}
          >
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background: 'var(--color-surface-2)',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FiUsers
                  size={18}
                  style={{ color: 'var(--color-green)' }}
                />

                <span
                  className="fw-semibold"
                  style={{ color: 'var(--color-dark)' }}
                >
                  Pilih Ladies
                </span>
              </div>
            </div>

            <div className="p-4">
              <SearchableSelect
                value={selectedLadyId}
                onChange={(v) => {
                  setSelectedLadyId(v);
                  setPage(1);
                  setActiveTab('input');
                }}
                options={ladies.map((l) => ({
                  value: l.id,
                  label: `${l.nama_ladies} • ${l.nama_outlet} (${l.pin})`,
                }))}
                placeholder="-- Pilih Ladies --"
                searchPlaceholder="Cari nama ladies..."
                height={50}
                borderRadius={14}
                fontSize="0.82rem"
              />

              {/* EMPTY STATE */}
              {!selectedLadyId && (
                <div
                  className="mt-4 p-4 rounded-4"
                  style={{
                    background: 'var(--color-warning)',
                    border: '1px solid var(--color-warning-hover)',
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div style={{ fontSize: 24 }}>⚠️</div>

                    <div>
                      <div className="fw-bold mb-1">
                        Ladies belum dipilih
                      </div>

                      <div
                        style={{
                          fontSize: '0.92rem',
                          color: 'var(--color-gray-500)',
                        }}
                      >
                        Pilih salah satu ladies untuk
                        input absensi dan lihat riwayat.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTENT */}
          {selectedLadyId && (
            <>
              {/* TAB SWITCHER */}
              <div className="d-flex gap-2 mb-3">
                {[
                  { key: 'input' as const, label: 'Input Absensi' },
                  { key: 'riwayat' as const, label: 'Riwayat' },
                ].map((tab) => {
                  const active = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className="flex-fill tap-scale"
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        padding: '10px 12px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        background: active
                          ? 'var(--color-green)'
                          : 'var(--color-surface)',
                        color: active
                          ? '#fff'
                          : 'var(--color-gray-700)',
                        boxShadow: active
                          ? 'var(--shadow-brand)'
                          : '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
              {activeTab === 'input' ? (
                <div
                  className="card border-0 shadow-sm rounded-4"
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="px-4 py-3 border-bottom"
                    style={{
                      background:
                        'linear-gradient(to right, var(--color-green-lighter), var(--color-surface))',
                    }}
                  >
                    <div className="fw-bold">Input Absensi</div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-gray-500)',
                      }}
                    >
                      {selectedLady?.nama_ladies}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="row g-4">
                      {/* DATE */}
                      <div className="col-12">
                        <label className="fw-semibold mb-2">
                          Tanggal
                        </label>

                        <input
                          type="date"
                          className="form-control shadow-none"
                          value={tanggal}
                          onChange={(e) =>
                            setTanggal(e.target.value)
                          }
                          style={{
                            height: 50,
                            borderRadius: 14,
                            border: '2px solid var(--color-green-light)',
                            paddingInline: 14,
                            fontSize: '0.82rem',
                          }}
                        />
                      </div>

                      {/* STATUS */}
                      <div className="col-12">
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
                          rows={2}
                          value={keterangan}
                          onChange={(e) =>
                            setKeterangan(e.target.value)
                          }
                          placeholder="Tambahkan catatan..."
                          style={{
                            borderRadius: 16,
                            border: '2px solid var(--color-green-light)',
                            padding: '12px 14px',
                            fontSize: '0.82rem',
                            minHeight: 80,
                            resize: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <div className="mt-4 d-flex justify-content-center">
                      <Button
                        variant="primary"
                        icon={addMutation.isPending ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus size={18} />}
                        onClick={handleSubmit}
                        disabled={addMutation.isPending}
                        fullWidth
                      >
                        {addMutation.isPending ? 'Menyimpan...' : 'Simpan Absensi'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                riwayatSection
              )}
              </motion.div>
              </AnimatePresence>
            </>
          )}
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
          if (
            !selectedLadyId ||
            !selectedTanggal
          )
            return;

          const { error } =
            await supabase
              .from('absensi')
              .update({
                status:
                  data.status,
                keterangan:
                  data.keterangan ??
                  null,
              })
              .eq(
                'ladies_id',
                selectedLadyId
              )
              .eq(
                'tanggal',
                selectedTanggal
              );

          if (error) {
            toast.error(
              'Gagal update data: ' +
              error.message
            );
          }

          setShowModal(false);
          setEditAbsensi(null);
          setSelectedTanggal(null);

          queryClient.invalidateQueries({ queryKey: ['absensi-rekap', selectedLadyId] });
        }}
      />
    </div>
  );
};
export default AbsensiPage;
