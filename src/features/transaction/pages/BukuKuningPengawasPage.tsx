import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import CardTable from '../../../components/CardTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import logo from '../../../assets/logosr-black.png';
import { useMediaQuery } from 'react-responsive';
import { FiBook, FiPrinter } from 'react-icons/fi';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num) return '';
  return `Rp${num.toLocaleString('id-ID')}`;
};

const BukuKuningPengawasPage = () => {
  const [pengawasList, setPengawasList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<any[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isSmallMobile = useMediaQuery({ maxWidth: 480 });
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const pad = (n: number) => String(n).padStart(2, '0');
  const getLastDay = (year: number, month: number) => new Date(year, month, 0).getDate();

  useEffect(() => {
    const fetchPengawas = async () => {
      const { data } = await supabase.from('pengawas').select('*');
      setPengawasList(data || []);
    };
    fetchPengawas();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const from = `${tahun}-${pad(bulan)}-01`;
    const to = `${tahun}-${pad(bulan)}-${pad(getLastDay(tahun, bulan))}`;
    const prevMonth = bulan === 1 ? 12 : bulan - 1;
    const prevYear = bulan === 1 ? tahun - 1 : tahun;

    const fetchData = async () => {
      // Ambil saldo akhir bulan sebelumnya
      const { data: rekap } = await supabase
        .from('rekap_bulanan_pengawas')
        .select('saldo_akhir')
        .eq('pengawas_id', selectedId)
        .eq('bulan', prevMonth)
        .eq('tahun', prevYear)
        .maybeSingle();

      const saldoAwal = rekap?.saldo_akhir ?? 0;

      // Ambil data kasbon_pengawas dan gaji_pengawas
      const [kasbon, gaji] = await Promise.all([
        supabase.from('kasbon_pengawas').select('tanggal, jumlah, keterangan').eq('pengawas_id', selectedId).gte('tanggal', from).lte('tanggal', to),
        supabase.from('gaji_pengawas').select('tanggal, jumlah, keterangan').eq('pengawas_id', selectedId).gte('tanggal', from).lte('tanggal', to),
      ]);

      const transaksi: any[] = [];

      (gaji?.data || []).forEach((g) => {
        transaksi.push({
          tanggal: g.tanggal,
          keterangan: g.keterangan || '',
          voucher: '', // tidak ada voucher untuk pengawas
          pemasukan: Number(g.jumlah),
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

      // Urutkan tanggal ASC
      transaksi.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

      // Hitung saldo berjalan
      const fullRows: any[] = [
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
  }, [selectedId, bulan, tahun]);

  // === Perubahan hanya di sini: logic tutup buku ===
  const handleTutupBuku = async () => {
    if (rows.length === 0) return alert('❌ Tidak ada data transaksi.');

    const selected = pengawasList.find((l) => l.id === selectedId);
    const nama = selected ? selected.nama_panggilan : 'Unknown';

    const confirm = window.confirm(`❗ Yakin tutup buku - ${nama} - ${monthNames[bulan - 1]} - ${tahun}?`);
    if (!confirm) return;

    const lastSaldo = rows[rows.length - 1].saldo;
    const { error } = await supabase.from('rekap_bulanan_pengawas').upsert({
      pengawas_id: selectedId,
      bulan,
      tahun,
      saldo_akhir: lastSaldo,
      // created_at otomatis by default
    }, { onConflict: 'pengawas_id,bulan,tahun' });

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

      // Hanya nama panggilan
      const selected = pengawasList.find(l => l.id === selectedId);
      const namaLabel = selected
        ? `${selected.nama_panggilan}`
        : 'Nama tidak ditemukan';

      doc.setFontSize(12);
      doc.text(namaLabel, 30, 26);

      autoTable(doc, {
        startY: 32,
        head: [['Tanggal', 'Keterangan', 'Voucher', 'Pemasukan', 'Pengeluaran', 'Saldo']],
        body: rows.map((r) => [
          r.tanggal,
          r.keterangan,
          '', // Voucher selalu kosong
          formatRupiah(r.pemasukan || 0),
          formatRupiah(r.pengeluaran || 0),
          formatRupiah(r.saldo),
        ]),
        headStyles: {
          fillColor: [56, 176, 0],
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
      <h2 className="text-dark fw-bold fs-4 mb-4">📒 Buku Kuning Pengawas</h2>

      <div className="row mb-3">
        <div className="col-12 col-md-4 mb-2">
          <label className="form-label text-dark">Pilih Pengawas</label>
          <select className="form-select bg-white text-dark border-success" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">-- Pilih --</option>
            {pengawasList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_panggilan}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">Bulan</label>
          <select className="form-select bg-white text-dark border-success" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">Tahun</label>
          <input type="number" className="form-control bg-white text-dark border-success" min={2020} max={2030} value={tahun} onChange={(e) => setTahun(Number(e.target.value))} />
        </div>
      </div>

      {selectedId && rows.length > 0 && (
        <div
          className="d-flex gap-2 mb-3 justify-content-start flex-wrap"
          style={{ alignItems: 'center' }}
        >
          <button
            className="btn btn-sm btn-success fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={handleTutupBuku}
            title={isSmallMobile ? 'Tutup Buku' : ''}
            style={{
              minWidth: isSmallMobile ? 44 : 'auto',
              height: 36,
              padding: isSmallMobile ? '0.4rem' : '0.4rem 0.75rem',
            }}
          >
            <FiBook size={16} />
            {isSmallMobile ? null : 'Tutup Buku'}
          </button>
          <button
            className="btn btn-sm btn-outline-success fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={handleExportPDF}
            title={isSmallMobile ? 'Cetak PDF' : ''}
            style={{
              minWidth: isSmallMobile ? 44 : 'auto',
              height: 36,
              padding: isSmallMobile ? '0.4rem' : '0.4rem 0.75rem',
            }}
          >
            <FiPrinter size={16} />
            {isSmallMobile ? null : 'Cetak'}
          </button>
        </div>
      )}

      {!selectedId && <div className="alert alert-warning text-dark bg-warning-subtle border-warning">⚠️ Silakan pilih pengawas terlebih dahulu.</div>}

      {selectedId && (
        <>
          {rows.length > 0 ? (
            isMobile ? (
              <CardTable
                data={rows.filter(r => r.tanggal !== 'Sisa Kasbon').sort((a, b) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix())}
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
            )
          ) : (
            <div className="alert alert-info">ℹ️ Tidak ada transaksi di bulan ini.</div>
          )}
        </>
      )}
    </div>
  );
};

export default BukuKuningPengawasPage;