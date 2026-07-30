import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import DataTable from '../../../components/DataTable';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  FiBarChart2,
  FiCalendar,
  FiActivity,
  FiDollarSign,
  FiGift,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiUsers,
} from 'react-icons/fi';

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

  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [bulan, setBulan] = useState(dayjs().month() + 1);
  const [tahun, setTahun] = useState(dayjs().year());
  const [data, setData] = useState<PerformaSummary[]>([]);
  const [mode, setMode] = useState<'aktivitas' | 'pendapatan'>('aktivitas');
  const [loading, setLoading] = useState(false);

  const fetchLadies = async () => {
    const { data, error } = await supabase
      .from('ladies')
      .select('id, nama_ladies, nama_outlet')
      .eq('status', 'active');

    if (!error && data) setLadiesList(data);
  };

  const fetchSummary = async () => {
    setLoading(true);

    const monthStr = String(bulan).padStart(2, '0');
    const startDate = dayjs(`${tahun}-${monthStr}-01`).startOf('month');
    const endDate = dayjs(`${tahun}-${monthStr}-01`).endOf('month');

    const [vouchers, kasbon, pemasukan, absensi] = await Promise.all([
      supabase.from('vouchers').select('jumlah, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
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
        summaryMap[v.ladies_id].voucherTotal += Number(v.jumlah || 0) / 150000;
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

    const finalData = Object.values(summaryMap).map((row) => {
      const pendapatanVoucher = row.voucherTotal * 150000;

      return {
        ...row,
        voucherAvg: row.masuk > 0 ? row.voucherTotal / row.masuk : 0,
        pendapatanVoucher,
        total: row.pemasukan + pendapatanVoucher - row.kasbon,
      };
    });

    setData(finalData);
    setLoading(false);
  };

  useEffect(() => {
    fetchLadies();
  }, []);

  useEffect(() => {
    if (ladiesList.length > 0) fetchSummary();
    // eslint-disable-next-line
  }, [bulan, tahun, ladiesList]);

  const modeOptions = [
    { value: 'aktivitas' as const, label: 'Aktivitas', icon: <FiActivity size={14} /> },
    { value: 'pendapatan' as const, label: 'Pendapatan', icon: <FiDollarSign size={14} /> },
  ];

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      {/* HERO */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
          color: 'white',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: isMobile ? 54 : 60,
              height: isMobile ? 54 : 60,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 22 : 26,
              backdropFilter: 'blur(8px)',
            }}
          >
            <FiBarChart2 />
          </div>

          <div>
            <h2
              className="fw-semibold mb-0"
              style={{ fontSize: isMobile ? '1rem' : '1.8rem', lineHeight: 1.2 }}
            >
              Performa Ladies
            </h2>

            <div
              style={{
                opacity: 0.78,
                fontSize: isMobile ? '0.72rem' : '0.92rem',
                marginTop: 2,
              }}
            >
              Analisis aktivitas & pendapatan ladies per bulan
            </div>
          </div>
        </div>
      </div>

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
                  fontSize: isMobile ? '0.84rem' : '0.92rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-dark)',
                }}
              />
            </div>
          </div>

          <label className="fw-semibold mb-2 d-block" style={{ color: 'var(--color-dark)', fontSize: '0.9rem' }}>
            Mode Tampilan
          </label>

          <div className="d-flex gap-2 flex-wrap">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                className="btn d-flex align-items-center gap-2"
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

      {/* EMPTY STATE */}
      {!loading && data.length === 0 && (
        <div className="alert alert-info">
          ℹ️ Belum ada data ladies aktif untuk ditampilkan.
        </div>
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

          {/* MOBILE — kartu per ladies, bukan tabel lebar yang bikin geser ke kanan */}
          {isMobile ? (
            <div className="d-flex flex-column gap-3">
              {data.map((row) => (
                <div
                  key={row.id}
                  className="card border-0 shadow-sm rounded-4 p-3"
                >
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        minWidth: 38,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    >
                      {row.nama_ladies.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        className="fw-bold"
                        style={{
                          color: 'var(--color-dark)',
                          fontSize: '0.92rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {row.nama_ladies}
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--color-gray-500)' }}>
                        {row.nama_outlet}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: mode === 'aktivitas' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                      gap: 8,
                    }}
                  >
                    {(mode === 'aktivitas'
                      ? [
                          { icon: <FiCalendar size={12} />, label: 'Hari Masuk', value: `${row.masuk}`, bg: 'var(--color-income-soft)', color: 'var(--color-income)' },
                          { icon: <FiGift size={12} />, label: 'Voucher', value: `${row.voucherTotal.toFixed(0)} pcs`, bg: 'var(--color-voucher-soft)', color: 'var(--color-voucher)' },
                          { icon: <FiTrendingUp size={12} />, label: 'Voucher/Hari', value: row.voucherAvg.toFixed(2), bg: 'var(--color-medical-soft)', color: 'var(--color-medical)' },
                        ]
                      : [
                          { icon: <FiDollarSign size={12} />, label: 'Pemasukan Lain', value: formatRupiah(row.pemasukan), bg: 'var(--color-medical-soft)', color: 'var(--color-medical)' },
                          { icon: <FiGift size={12} />, label: 'Dari Voucher', value: formatRupiah(row.pendapatanVoucher), bg: 'var(--color-voucher-soft)', color: 'var(--color-voucher)' },
                          { icon: <FiTrendingDown size={12} />, label: 'Kasbon', value: formatRupiah(row.kasbon), bg: 'var(--color-expense-soft)', color: 'var(--color-expense)' },
                          { icon: <FiAward size={12} />, label: 'Total Pendapatan', value: formatRupiah(row.total), bg: 'var(--color-income-soft)', color: 'var(--color-income)' },
                        ]
                    ).map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          background: stat.bg,
                          borderRadius: 12,
                          padding: '8px 10px',
                        }}
                      >
                        <div
                          className="d-flex align-items-center gap-1"
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            color: stat.color,
                            opacity: 0.85,
                            textTransform: 'uppercase',
                            marginBottom: 3,
                          }}
                        >
                          {stat.icon}
                          <span>{stat.label}</span>
                        </div>

                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: stat.color,
                            wordBreak: 'break-word',
                          }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
