import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import DataTable from '../../../components/DataTable';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import EmptyState from '../../../components/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  FiBarChart2,
  FiCalendar,
  FiActivity,
  FiDollarSign,
  FiUsers,
  FiSearch,
} from 'react-icons/fi';
import ListLoadingState from '../../../components/ListLoadingState';
import MobilePageBar from '../../../components/MobilePageBar';
import MonthPill from '../../ladies/components/MonthPill';
import '../../../styles/mobile-admin.css';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
};

type PerformaSummary = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  voucherTotal: number;
  voucherAvg: number;
  kasbon: number;
  pemasukan: number;
  masuk: number;
  pendapatanVoucher: number;
  total: number;
};

const PerformaLadiesPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [bulan, setBulan] = useState(dayjs().month() + 1);
  const [tahun, setTahun] = useState(dayjs().year());
  const [mode, setMode] = useState<'aktivitas' | 'pendapatan'>('aktivitas');
  const [cari, setCari] = useState('');

  const { data: ladiesList = [] } = useQuery({
    queryKey: ['performa-ladies-aktif'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet')
        .eq('status', 'active');

      if (error) throw error;
      return (data ?? []) as Lady[];
    },
    meta: { errorLabel: 'data ladies' },
  });

  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['performa-summary', bulan, tahun, ladiesList.length],
    queryFn: async () => {
      const monthStr = String(bulan).padStart(2, '0');
      const startDate = dayjs(`${tahun}-${monthStr}-01`).startOf('month');
      const endDate = dayjs(`${tahun}-${monthStr}-01`).endOf('month');

      const [vouchers, kasbon, pemasukan, absensi] = await Promise.all([
        supabase.from('vouchers').select('jumlah, jumlah_voucher, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
        supabase.from('kasbon').select('jumlah, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
        supabase.from('pemasukan_lain').select('jumlah, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
        supabase.from('absensi').select('status, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
      ]);

      const summaryMap: Record<string, PerformaSummary> = {};

      ladiesList.forEach((lady) => {
        summaryMap[lady.id] = {
          id: lady.id,
          nama_ladies: lady.nama_ladies || `Unknown-${lady.id}`,
          nama_outlet: lady.nama_outlet || '-',
          voucherTotal: 0,
          voucherAvg: 0,
          kasbon: 0,
          pemasukan: 0,
          masuk: 0,
          pendapatanVoucher: 0,
          total: 0,
        };
      });

      (vouchers.data || []).forEach((v) => {
        if (v.ladies_id && summaryMap[v.ladies_id]) {
          summaryMap[v.ladies_id].voucherTotal += Number(v.jumlah_voucher || 0);
          summaryMap[v.ladies_id].pendapatanVoucher += Number(v.jumlah || 0);
        }
      });

      (kasbon.data || []).forEach((k) => {
        if (k.ladies_id && summaryMap[k.ladies_id]) summaryMap[k.ladies_id].kasbon += Number(k.jumlah || 0);
      });

      (pemasukan.data || []).forEach((p) => {
        if (p.ladies_id && summaryMap[p.ladies_id]) summaryMap[p.ladies_id].pemasukan += Number(p.jumlah || 0);
      });

      (absensi.data || []).forEach((a) => {
        const id = a.ladies_id;
        const status = (a.status || '').toLowerCase();
        if (!id || !summaryMap[id]) return;
        if (['kerja', 'masuk', 'hadir'].includes(status)) summaryMap[id].masuk += 1;
      });

      return Object.values(summaryMap).map((row) => ({
        ...row,
        voucherAvg: row.masuk > 0 ? row.voucherTotal / row.masuk : 0,
        total: row.pemasukan + row.pendapatanVoucher - row.kasbon,
      }));
    },
    enabled: ladiesList.length > 0,
    meta: { errorLabel: 'performa ladies' },
  });

  const modeOptions = [
    { value: 'aktivitas' as const, label: 'Aktivitas', icon: <FiActivity size={14} /> },
    { value: 'pendapatan' as const, label: 'Pendapatan', icon: <FiDollarSign size={14} /> },
  ];

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout) — daftar peringkat per mode. Angka dari perhitungan di atas,
  // hanya diurutkan untuk tampilan. Desktop (grafik + tabel): lama.
  if (isMobile) {
    const labelBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    const sekarang = dayjs();
    const diBulanIni = tahun === sekarang.year() && bulan === sekarang.month() + 1;
    const geserBulan = (arah: -1 | 1) => {
      const d = new Date(tahun, bulan - 1 + arah, 1);
      setBulan(d.getMonth() + 1);
      setTahun(d.getFullYear());
    };

    const kataKunci = cari.trim().toLowerCase();
    const peringkat = [...data]
      .sort((a, b) =>
        mode === 'aktivitas'
          ? b.voucherTotal - a.voucherTotal || b.masuk - a.masuk
          : b.total - a.total
      )
      .map((row, i) => ({ ...row, rank: i + 1 }))
      .filter(
        (row) =>
          !kataKunci ||
          row.nama_ladies.toLowerCase().includes(kataKunci) ||
          row.nama_outlet.toLowerCase().includes(kataKunci)
      );

    return (
      <div className="tm-page">
        <MobilePageBar title="Performa Ladies" backTo="/" />

        <div className="tm-stack">
          <MonthPill
            label={labelBulan}
            value={`${tahun}-${String(bulan).padStart(2, '0')}`}
            max={dayjs().format('YYYY-MM')}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m] = e.target.value.split('-').map(Number);
              setTahun(y);
              setBulan(m);
            }}
            onPrev={() => geserBulan(-1)}
            onNext={() => geserBulan(1)}
            nextDisabled={diBulanIni}
          />

          <div className="tm-segmented" role="tablist" aria-label="Mode tampilan">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={mode === opt.value}
                className={`tm-segment ${mode === opt.value ? 'is-active' : ''}`}
                onClick={() => setMode(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="tm-search">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Cari nama atau outlet..."
              aria-label="Cari ladies"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>

          {loading ? (
            <ListLoadingState label="Memuat performa ladies" />
          ) : data.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                <div className="tm-empty-title">Belum ada ladies aktif</div>
                <div className="tm-empty-text">Tambahkan data ladies untuk melihat performanya di sini.</div>
              </div>
            </div>
          ) : peringkat.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiSearch /></span>
                <div className="tm-empty-title">Ladies tidak ditemukan</div>
                <div className="tm-empty-text">Coba kata kunci lain.</div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="tm-section-title">
                Peringkat {mode === 'aktivitas' ? 'voucher' : 'pendapatan'} · {labelBulan}
              </h2>
              <div className="tm-group tm-list">
                {peringkat.map((row) => (
                  <div key={row.id}>
                    <div className="tm-row">
                      <span className={`tm-rank ${row.rank <= 3 ? 'is-top' : ''}`} aria-label={`Peringkat ${row.rank}`}>
                        {row.rank}
                      </span>
                      <div className="tm-row-main">
                        <div className="tm-row-title">{row.nama_ladies}</div>
                        <div className="tm-row-sub" style={{ whiteSpace: 'normal' }}>
                          {mode === 'aktivitas'
                            ? `${row.nama_outlet} · ${row.masuk} hari masuk · ${row.voucherAvg.toFixed(1)}/hari`
                            : `Voucher ${formatRupiah(row.pendapatanVoucher)} · Lain ${formatRupiah(row.pemasukan)} · Kasbon ${formatRupiah(row.kasbon)}`}
                        </div>
                      </div>
                      <span
                        className="tm-row-amount"
                        style={
                          mode === 'pendapatan'
                            ? { color: row.total < 0 ? 'var(--color-expense)' : 'var(--color-income)' }
                            : undefined
                        }
                      >
                        {mode === 'aktivitas'
                          ? `${row.voucherTotal.toFixed(0)} pcs`
                          : formatRupiah(row.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <FeaturePageHeader
        icon={<FiBarChart2 />}
        title="Performa Ladies"
        description="Analisis aktivitas & pendapatan ladies per bulan"
      />

      {/* FILTER */}
      <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ overflow: 'hidden' }}>
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background: 'linear-gradient(to right, var(--color-green-lighter), var(--color-surface))',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiCalendar style={{ color: 'var(--color-green)' }} />

            <div>
              <div className="fw-bold" style={{ color: 'var(--color-dark)' }}>
                Filter Periode
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-500)' }}>
                Pilih bulan & tahun performa
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-4">
              <label className="fw-semibold mb-2" style={{ color: 'var(--color-dark)', fontSize: '0.9rem' }}>
                Bulan
              </label>

              <select
                className="form-select shadow-none"
                value={bulan}
                onChange={(e) => setBulan(parseInt(e.target.value))}
                style={{
                  height: isMobile ? 50 : 56,
                  borderRadius: 16,
                  border: '2px solid var(--color-green-light)',
                  paddingInline: 16,
                  fontSize: isMobile ? '0.84rem' : '0.92rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-dark)',
                }}
              >
                {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>

            <div className="col-6 col-md-4">
              <label className="fw-semibold mb-2" style={{ color: 'var(--color-dark)', fontSize: '0.9rem' }}>
                Tahun
              </label>

              <input
                type="number"
                className="form-control shadow-none"
                value={tahun}
                onChange={(e) => setTahun(parseInt(e.target.value))}
                style={{
                  height: isMobile ? 50 : 56,
                  borderRadius: 16,
                  border: '2px solid var(--color-green-light)',
                  paddingInline: 16,
                  // 16px di mobile — di bawah itu iOS otomatis nge-zoom saat difokus.
                  fontSize: isMobile ? 16 : '0.92rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-dark)',
                }}
              />
            </div>
          </div>

          <label className="fw-semibold mb-2 d-block" style={{ color: 'var(--color-dark)', fontSize: '0.9rem' }}>
            Mode Tampilan
          </label>

          <div
            className={isMobile ? 'd-flex gap-2' : 'd-flex gap-2 flex-wrap'}
          >
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                className={
                  isMobile
                    ? 'btn d-flex align-items-center justify-content-center gap-2 flex-fill'
                    : 'btn d-flex align-items-center gap-2'
                }
                onClick={() => setMode(opt.value)}
                style={{
                  borderRadius: 999,
                  padding: '10px 18px',
                  border: mode === opt.value ? 'none' : '1px solid var(--color-gray-200)',
                  background: mode === opt.value ? 'var(--color-green)' : 'var(--color-surface)',
                  color: mode === opt.value ? '#fff' : 'var(--color-gray-700)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && <ListLoadingState label="Memuat performa ladies" />}

      {/* EMPTY STATE */}
      {!loading && data.length === 0 && (
        <EmptyState
          icon="ℹ️"
          title="Belum ada data ladies aktif"
          description="Tambahkan data ladies untuk melihat performa di halaman ini"
        />
      )}

      {data.length > 0 && (
        <>
          {/* CHART — desktop only, biar tidak melebar/gepeng di layar sempit */}
          {!isMobile && (
            <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ overflow: 'hidden' }}>
              <div
                className="px-4 py-3 border-bottom"
                style={{
                  background: 'linear-gradient(to right, var(--color-surface), var(--color-green-lighter))',
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <FiBarChart2 style={{ color: 'var(--color-green)' }} />

                  <div>
                    <div className="fw-bold" style={{ color: 'var(--color-dark)' }}>
                      Grafik {mode === 'aktivitas' ? 'Aktivitas' : 'Pendapatan'}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-500)' }}>
                      {monthNames[bulan - 1]} {tahun}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4" style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                    <XAxis dataKey="nama_ladies" tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--color-gray-500)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-gray-200)', color: 'var(--color-dark)', borderRadius: 10 }} />
                    <Legend wrapperStyle={{ color: 'var(--color-dark)', fontSize: '0.85rem' }} />
                    <Bar
                      dataKey={mode === 'aktivitas' ? 'voucherTotal' : 'pendapatanVoucher'}
                      fill="var(--color-voucher)"
                      radius={[6, 6, 0, 0]}
                      name={mode === 'aktivitas' ? 'Voucher (pcs)' : 'Pendapatan Voucher'}
                    />
                    {mode === 'aktivitas' && <Bar dataKey="masuk" fill="var(--color-income)" radius={[6, 6, 0, 0]} name="Hari Masuk" />}
                    {mode === 'pendapatan' && <Bar dataKey="pemasukan" fill="var(--color-medical)" radius={[6, 6, 0, 0]} name="Pemasukan Lain" />}
                    {mode === 'pendapatan' && <Bar dataKey="kasbon" fill="var(--color-expense)" radius={[6, 6, 0, 0]} name="Kasbon (Pengeluaran)" />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TABEL */}
          {(
            <div className="card border-0 shadow-sm rounded-4" style={{ overflow: 'hidden' }}>
              <div
                className="px-4 py-3 border-bottom d-flex align-items-center gap-2"
                style={{
                  background: 'linear-gradient(to right, var(--color-surface), var(--color-green-lighter))',
                }}
              >
                <FiUsers style={{ color: 'var(--color-green)' }} />

                <div className="fw-bold" style={{ color: 'var(--color-dark)' }}>
                  Detail Performa Ladies
                </div>
              </div>

              <DataTable
                columns={mode === 'aktivitas' ? [
                  { key: 'nama_ladies', label: 'Nama Ladies' },
                  { key: 'masuk', label: 'Hari Masuk' },
                  { key: 'voucherTotal', label: 'Total Voucher (pcs)', render: (row) => row.voucherTotal.toFixed(0) },
                  { key: 'voucherAvg', label: 'Voucher / Hari Masuk', render: (row) => row.voucherAvg.toFixed(2) },
                ] : [
                  { key: 'nama_ladies', label: 'Nama Ladies' },
                  { key: 'pemasukan', label: 'Pemasukan Lain', render: (row) => formatRupiah(row.pemasukan) },
                  { key: 'pendapatanVoucher', label: 'Dari Voucher', render: (row) => formatRupiah(row.pendapatanVoucher) },
                  { key: 'kasbon', label: 'Kasbon', render: (row) => formatRupiah(row.kasbon) },
                  { key: 'total', label: 'Total Pendapatan', render: (row) => formatRupiah(row.total) },
                ]}
                data={data}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformaLadiesPage;
