import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import FormField from '../../../components/FormField';
import DataTable from '../../../components/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

const PerformaLadiesPage = () => {
  type Lady = {
    id: string;
    nama_ladies: string;
    nama_outlet: string;
  };

  type PerformaSummary = {
    id: string;
    nama_ladies: string;
    voucherTotal: number;
    voucherAvg: number;
    kasbon: number;
    pemasukan: number;
    masuk: number;
    pendapatanVoucher?: number;
    total?: number;
  };

  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [bulan, setBulan] = useState(dayjs().month() + 1);
  const [tahun, setTahun] = useState(dayjs().year());
  const [data, setData] = useState<PerformaSummary[]>([]);
  const [mode, setMode] = useState<'aktivitas' | 'pendapatan'>('aktivitas');

  const fetchLadies = async () => {
    const { data, error } = await supabase.from('ladies').select('id, nama_ladies, nama_outlet');
    if (!error && data) setLadiesList(data);
  };

  const fetchSummary = async () => {
    const startDate = dayjs(`${tahun}-${bulan}-01`).startOf('month');
    const endDate = dayjs(`${tahun}-${bulan}-01`).endOf('month');

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
        voucherTotal: 0,
        voucherAvg: 0,
        kasbon: 0,
        pemasukan: 0,
        masuk: 0,
      };
    });

    (vouchers.data || []).forEach(v => {
      if (v.ladies_id && summaryMap[v.ladies_id]) {
        summaryMap[v.ladies_id].voucherTotal += Number(v.jumlah || 0) / 150000;
      }
    });

    (kasbon.data || []).forEach(k => {
      if (k.ladies_id && summaryMap[k.ladies_id]) summaryMap[k.ladies_id].kasbon += Number(k.jumlah || 0);
    });

    (pemasukan.data || []).forEach(p => {
      if (p.ladies_id && summaryMap[p.ladies_id]) summaryMap[p.ladies_id].pemasukan += Number(p.jumlah || 0);
    });

    (absensi.data || []).forEach((a) => {
      const id = a.ladies_id;
      const status = (a.status || '').toLowerCase();
      if (!id || !summaryMap[id]) return;
      if (['kerja', 'masuk', 'hadir'].includes(status)) summaryMap[id].masuk += 1;
    });

    const finalData = Object.values(summaryMap).map(row => ({
      ...row,
      voucherTotal: Number(row.voucherTotal || 0),
      masuk: Number(row.masuk || 0),
      pemasukan: Number(row.pemasukan || 0),
      kasbon: Number(row.kasbon || 0),
      voucherAvg: row.masuk > 0 ? row.voucherTotal / row.masuk : 0,
      pendapatanVoucher: Number((row.voucherTotal || 0) * 150000),
      total: Number((row.pemasukan || 0) + ((row.voucherTotal || 0) * 150000) - (row.kasbon || 0)),
    }));

    setData(finalData);
  };

  useEffect(() => {
    fetchLadies();
  }, []);

  useEffect(() => {
    if (ladiesList.length > 0) fetchSummary();
  }, [bulan, tahun, ladiesList]);

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold fs-4 mb-4">📊 Performa Ladies Bulan {monthNames[bulan - 1]} {tahun}</h2>

      <div className="row mb-3">
        <div className="col-md-3">
          <FormField label="Bulan">
            <select className="form-select bg-dark text-light border-secondary" value={bulan} onChange={e => setBulan(parseInt(e.target.value))}>
              {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </FormField>
        </div>
        <div className="col-md-3">
          <FormField label="Tahun">
            <input type="number" className="form-control bg-dark text-light border-secondary" value={tahun} onChange={e => setTahun(parseInt(e.target.value))} />
          </FormField>
        </div>
      </div>

      <div className="mb-3 d-flex gap-2">
        <button className={`btn ${mode === 'aktivitas' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('aktivitas')}>Mode Aktivitas</button>
        <button className={`btn ${mode === 'pendapatan' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('pendapatan')}>Mode Pendapatan</button>
      </div>

      <div style={{ width: '100%', height: 400, background: '#1e1e1e' }} className="mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nama_ladies" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={mode === 'aktivitas' ? 'voucherTotal' : 'pendapatanVoucher'} fill="#8884d8" name={mode === 'aktivitas' ? 'Voucher (pcs)' : 'Pendapatan Voucher'} />
            {mode === 'aktivitas' && <Bar dataKey="masuk" fill="#60a5fa" name="Hari Masuk" />}
            {mode === 'pendapatan' && <Bar dataKey="pemasukan" fill="#22c55e" name="Pemasukan Lain" />}
            {mode === 'pendapatan' && <Bar dataKey="kasbon" fill="#f43f5e" name="Kasbon (Pengeluaran)" />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        columns={mode === 'aktivitas' ? [
          { key: 'nama_ladies', label: 'Nama Ladies' },
          { key: 'masuk', label: 'Hari Masuk' },
          { key: 'voucherTotal', label: 'Total Voucher (pcs)', render: (row) => row.voucherTotal.toFixed(0) },
          { key: 'voucherAvg', label: 'Voucher / Hari Masuk', render: (row) => row.voucherAvg.toFixed(2) },
        ] : [
          { key: 'nama_ladies', label: 'Nama Ladies' },
          { key: 'pemasukan', label: 'Pemasukan Lain', render: (row) => formatRupiah(row.pemasukan ?? 0) },
          { key: 'pendapatanVoucher', label: 'Dari Voucher', render: (row) => formatRupiah(row.pendapatanVoucher ?? 0) },
          { key: 'kasbon', label: 'Kasbon', render: (row) => formatRupiah(row.kasbon ?? 0) },
          { key: 'total', label: 'Total Pendapatan', render: (row) => formatRupiah(row.total ?? 0) },
        ]}
        data={data}
      />
    </div>
  );
};

export default PerformaLadiesPage;