import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import CardTable from '../../../components/CardTable'; // ⬅️ import CardTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import logo from '../../../assets/logosr-black.png';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
};

type Row = {
  tanggal: string;
  keterangan: string;
  voucher: number | string;
  pemasukan: number | string;
  pengeluaran: number | string;
  saldo: number;
};

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num) return '';
  return `Rp${num.toLocaleString('id-ID')}`;
};

const BukuKuningPage = () => {
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<Row[]>([]);

  const isMobile = window.innerWidth <= 768;
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const sortedRows = [...rows].sort((a, b) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase.from('ladies').select('*');
      setLadiesList(data || []);
    };
    fetchLadies();
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const getLastDay = (year: number, month: number) => new Date(year, month, 0).getDate();

  useEffect(() => {
    if (!selectedLadyId) return;

    const from = `${tahun}-${pad(bulan)}-01`;
    const to = `${tahun}-${pad(bulan)}-${pad(getLastDay(tahun, bulan))}`;
    const prevMonth = bulan === 1 ? 12 : bulan - 1;
    const prevYear = bulan === 1 ? tahun - 1 : tahun;

    const fetchData = async () => {
      const { data: rekap } = await supabase
        .from('rekap_bulanan')
        .select('saldo_akhir')
        .eq('ladies_id', selectedLadyId)
        .eq('bulan', prevMonth)
        .eq('tahun', prevYear)
        .maybeSingle();

      const saldoAwal = rekap?.saldo_akhir ?? 0;

      const [vouchers, kasbon, pemasukan] = await Promise.all([
        supabase.from('vouchers').select('tanggal, jumlah').eq('ladies_id', selectedLadyId).gte('tanggal', from).lte('tanggal', to),
        supabase.from('kasbon').select('tanggal, jumlah, keterangan').eq('ladies_id', selectedLadyId).gte('tanggal', from).lte('tanggal', to),
        supabase.from('pemasukan_lain').select('tanggal, jumlah, keterangan').eq('ladies_id', selectedLadyId).gte('tanggal', from).lte('tanggal', to),
      ]);

      const transaksi: Row[] = [];

      (vouchers?.data || []).forEach((v) => {
        transaksi.push({
          tanggal: v.tanggal,
          keterangan: 'Voucher',
          voucher: v.jumlah / 150000,
          pemasukan: Number(v.jumlah),
          pengeluaran: '',
          saldo: 0,
        });
      });

      (pemasukan?.data || []).forEach((p) => {
        transaksi.push({
          tanggal: p.tanggal,
          keterangan: p.keterangan || '',
          voucher: '',
          pemasukan: Number(p.jumlah),
          pengeluaran: '',
          saldo: 0,
        });
      });

      (kasbon?.data || []).forEach((k) => {
        transaksi.push({
          tanggal: k.tanggal,
          keterangan: k.keterangan || '',
          voucher: '',
          pemasukan: '',
          pengeluaran: Number(k.jumlah),
          saldo: 0,
        });
      });

      transaksi.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

      const fullRows: Row[] = [
        {
          tanggal: 'Sisa Kasbon',
          keterangan: '',
          voucher: '',
          pemasukan: '',
          pengeluaran: '',
          saldo: saldoAwal,
        },
      ];

      let saldo = saldoAwal;
      transaksi.forEach((trx) => {
        const pemasukan = trx.pemasukan === '' ? 0 : Number(trx.pemasukan);
        const pengeluaran = trx.pengeluaran === '' ? 0 : Number(trx.pengeluaran);
        saldo += pemasukan - pengeluaran;
        fullRows.push({ ...trx, saldo });
      });

      setRows(fullRows);
    };

    fetchData();
  }, [selectedLadyId, bulan, tahun]);

  const handleTutupBuku = async () => {
    if (rows.length === 0) return alert('❌ Tidak ada data transaksi.');
    const lastSaldo = rows[rows.length - 1].saldo;
    const { error } = await supabase.from('rekap_bulanan').upsert({
      ladies_id: selectedLadyId,
      bulan,
      tahun,
      saldo_akhir: lastSaldo,
    }, { onConflict: 'ladies_id,bulan,tahun' });

    if (error) alert('❌ Gagal menyimpan saldo: ' + error.message);
    else alert('✅ Buku bulan ini ditutup dan saldo disimpan.');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 12, 16, 16);
      doc.setFontSize(14);
      doc.text(`TOTALAN - ${monthNames[bulan - 1].toUpperCase()} - ${tahun}`, 30, 20);

      const selectedLady = ladiesList.find(l => l.id === selectedLadyId);
      const namaLabel = selectedLady
        ? `${selectedLady.nama_ladies} - ${selectedLady.nama_outlet} (${selectedLady.pin})`
        : 'Nama tidak ditemukan';

      doc.setFontSize(12);
      doc.text(namaLabel, 30, 26);

      autoTable(doc, {
        startY: 32,
        head: [['Tanggal', 'Keterangan', 'Voucher', 'Pemasukan', 'Pengeluaran', 'Saldo']],
        body: rows.map((r) => [
          r.tanggal,
          r.keterangan,
          r.voucher || '',
          formatRupiah(r.pemasukan || 0),
          formatRupiah(r.pengeluaran || 0),
          formatRupiah(r.saldo),
        ]),
        headStyles: {
          fillColor: [43, 7, 82],
          textColor: 255,
        },
      });

      const today = new Date().toLocaleDateString('id-ID');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Dicetak: ${today}`, 14, 285);
      doc.text('SR Agency', pageWidth - 14, 285, { align: 'right' });
      doc.text(`Halaman 1`, pageWidth / 2, 285, { align: 'center' });

      doc.save(`Totalan-${namaLabel}-${bulan}-${tahun}.pdf`);
    };
  };

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold fs-4 mb-4">📒 Buku Kuning Bulanan</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label text-light">Pilih Ladies</label>
          <select className="form-select bg-dark text-light" value={selectedLadyId} onChange={(e) => setSelectedLadyId(e.target.value)}>
            <option value="">-- Pilih --</option>
            {ladiesList.map((lady) => (
              <option key={lady.id} value={lady.id}>
                {lady.nama_ladies} - {lady.nama_outlet} ({lady.pin})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label text-light">Bulan</label>
          <select className="form-select bg-dark text-light" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label text-light">Tahun</label>
          <input type="number" className="form-control bg-dark text-light" min={2020} max={2030} value={tahun} onChange={(e) => setTahun(Number(e.target.value))} />
        </div>
      </div>

      {selectedLadyId && rows.length > 0 && (
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-warning" onClick={handleTutupBuku}>
            🧾 Tutup Buku Bulan Ini
          </button>
          <button className="btn btn-outline-light" onClick={handleExportPDF}>
            📄 Export ke PDF
          </button>
        </div>
      )}

      {!selectedLadyId && <div className="alert alert-warning">⚠️ Silakan pilih ladies terlebih dahulu.</div>}

      {selectedLadyId && rows.length > 0 && (
        <>
          {isMobile ? (
            <CardTable
              data={sortedRows}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
            />
          ) : (
            <DataTable
              columns={[
                { key: 'tanggal', label: 'Tanggal' },
                { key: 'keterangan', label: 'Keterangan' },
                { key: 'voucher', label: 'Voucher' },
                {
                  key: 'pemasukan',
                  label: 'Pemasukan',
                  render: (row) => formatRupiah(row.pemasukan),
                },
                {
                  key: 'pengeluaran',
                  label: 'Pengeluaran',
                  render: (row) => formatRupiah(row.pengeluaran),
                },
                {
                  key: 'saldo',
                  label: 'Saldo',
                  render: (row) => formatRupiah(row.saldo),
                },
              ]}
              data={rows.map((row, i) => ({ id: `${i}`, ...row }))}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BukuKuningPage;