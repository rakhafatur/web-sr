import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../assets/logosr-black.png';
import { useMediaQuery } from 'react-responsive';
import { FiBook, FiPrinter } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import {
  PDF_COLORS,
  drawBackground,
  drawDecorativeCircles,
  drawFooter,
  drawPageBadges,
  drawSectionTitle,
  drawProfileCard,
} from '../utils/pdfReport';

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
    if (rows.length === 0) {
      toast.error('Tidak ada data transaksi.');
      return;
    }

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

    if (error) toast.error('Gagal menyimpan saldo: ' + error.message);
    else toast.success('Buku bulan ini ditutup dan saldo disimpan.');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const img = new Image();
    img.src = logo;

    const selected = pengawasList.find((l) => l.id === selectedId);

    const namaFile = selected
      ? `Totalan ${selected.nama_panggilan} - ${monthNames[bulan - 1]} ${tahun}`
      : `Totalan - ${monthNames[bulan - 1]} ${tahun}`;

    const totalGaji = rows.reduce(
      (sum, r) => sum + (typeof r.pemasukan === 'number' ? r.pemasukan : 0),
      0
    );

    const totalKasbon = rows.reduce(
      (sum, r) => sum + (typeof r.pengeluaran === 'number' ? r.pengeluaran : 0),
      0
    );

    const saldoAwal = rows[0]?.saldo || 0;
    const saldoAkhir = rows[rows.length - 1]?.saldo || 0;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const C = PDF_COLORS;

      // =====================================
      // PAGE 1 — HEADER
      // =====================================

      drawBackground(doc, C, pageWidth, pageHeight);
      drawDecorativeCircles(doc, C, pageWidth);

      // logo badge
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.setFillColor(...C.white);
      doc.roundedRect(pageWidth - 46, 8, 32, 32, 6, 6, 'FD');
      doc.addImage(img, 'PNG', pageWidth - 42, 12, 24, 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...C.ink);
      doc.text('Laporan Transaksi', 14, 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...C.primary);
      doc.text(`${monthNames[bulan - 1]} ${tahun}`, 14, 38);

      // =====================================
      // PROFILE CARD
      // =====================================

      const cardY = 46;
      const cardH = 36;

      drawProfileCard(
        doc,
        14,
        cardY,
        182,
        cardH,
        [
          {
            icon: 'person',
            label: 'NAMA PANGGILAN',
            value: selected?.nama_panggilan || '-',
          },
        ],
        C
      );

      const cardBottom = cardY + cardH;

      // =====================================
      // RINGKASAN KEUANGAN
      // =====================================

      drawSectionTitle(doc, 'Ringkasan Keuangan', 14, cardBottom + 14, C);

      const summaryDots: [number, number, number][] = [
        C.primary,
        C.danger,
        C.muted,
        C.primary,
      ];

      autoTable(doc, {
        startY: cardBottom + 19,

        theme: 'grid',

        head: [['Ringkasan', 'Nominal']],

        body: [
          ['Gaji', formatRupiah(totalGaji)],
          ['Kasbon', formatRupiah(totalKasbon)],
          ['Saldo Awal', formatRupiah(saldoAwal)],
          ['Saldo Akhir', formatRupiah(saldoAkhir)],
        ],

        margin: { left: 14, right: 14 },

        tableWidth: 182,

        styles: {
          fontSize: 9,
          cellPadding: 4.5,
          textColor: C.body,
          lineColor: C.border,
          lineWidth: 0.4,
          valign: 'middle',
        },

        headStyles: {
          fillColor: C.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9.5,
        },

        alternateRowStyles: {
          fillColor: C.bg,
        },

        columnStyles: {
          0: {
            cellWidth: 90,
            fontStyle: 'bold',
            cellPadding: { top: 4.5, right: 2, bottom: 4.5, left: 10 },
          },

          1: {
            cellWidth: 92,
            halign: 'right',
          },
        },

        didParseCell: (data) => {
          if (data.section !== 'body') return;

          if (data.row.index === 3) {
            data.cell.styles.fillColor = C.primarySoft;
            data.cell.styles.textColor = C.primaryDark;
            data.cell.styles.fontStyle = 'bold';

            if (data.column.index === 1) {
              data.cell.styles.fontSize = 10;
            }
          }
        },

        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const dotColor = summaryDots[data.row.index] ?? C.muted;
            doc.setFillColor(...dotColor);
            doc.circle(
              data.cell.x + 4.3,
              data.cell.y + data.cell.height / 2,
              1.1,
              'F'
            );
          }
        },
      });

      drawFooter(doc, C, pageWidth, pageHeight);

      // =====================================
      // PAGE 2 — DETAIL TRANSAKSI
      // =====================================

      doc.addPage();

      const drawDetailHeader = () => {
        drawBackground(doc, C, pageWidth, pageHeight);
        drawSectionTitle(doc, 'Detail Transaksi', 14, 26, C);

        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.3);
        doc.line(0, 34, pageWidth, 34);
      };

      autoTable(doc, {
        startY: 42,

        theme: 'grid',

        head: [['Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Saldo']],

        body: rows.map((r) => [
          r.tanggal,
          r.keterangan,
          formatRupiah(r.pemasukan || 0),
          formatRupiah(r.pengeluaran || 0),
          formatRupiah(r.saldo),
        ]),

        margin: { top: 42, left: 14, right: 14, bottom: 24 },

        tableWidth: 182,

        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          textColor: C.body,
          lineColor: C.border,
          lineWidth: 0.4,
          valign: 'middle',
          overflow: 'linebreak',
        },

        headStyles: {
          fillColor: C.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
        },

        alternateRowStyles: {
          fillColor: C.bg,
        },

        columnStyles: {
          0: { cellWidth: 26, halign: 'center' },
          1: { cellWidth: 62 },
          2: { cellWidth: 32, halign: 'right' },
          3: { cellWidth: 32, halign: 'right' },
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },

        didParseCell: (data) => {
          // baris saldo pembuka ("Sisa Kasbon")
          if (data.section === 'body' && data.row.index === 0) {
            data.cell.styles.fillColor = C.slateSoft;
            data.cell.styles.fontStyle = 'bold';
          }

          // saldo minus merah
          if (
            data.column.index === 4 &&
            typeof data.cell.raw === 'string' &&
            data.cell.raw.includes('-')
          ) {
            data.cell.styles.textColor = C.danger;
            data.cell.styles.fontStyle = 'bold';
          }

          // pengeluaran merah
          if (data.column.index === 3 && data.section === 'body') {
            data.cell.styles.textColor = C.danger;
          }
        },

        willDrawPage: () => {
          drawDetailHeader();
        },

        didDrawPage: () => {
          drawFooter(doc, C, pageWidth, pageHeight);
        },
      });

      drawPageBadges(doc, C);

      doc.save(`${namaFile}.pdf`);
    };
  };

  return (
    <div className="page-shell py-4">
      <ListPageHeader
        icon={<FiBook />}
        title="Buku Kuning Pengawas"
        description="Kelola transaksi bulanan pengawas"
      />

      <div className="row mb-3">
        <div className="col-12 col-md-4 mb-2">
          <label className="form-label text-dark">Pilih Pengawas</label>
          <select className="form-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
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
          <select className="form-select" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">Tahun</label>
          <input type="number" className="form-control" min={2020} max={2030} value={tahun} onChange={(e) => setTahun(Number(e.target.value))} />
        </div>
      </div>

      {selectedId && rows.length > 0 && (
        <div
          className={
            isMobile
              ? 'd-flex gap-3 mb-4'
              : 'd-flex gap-2 mb-3 justify-content-start flex-wrap'
          }
          style={isMobile ? undefined : { alignItems: 'center' }}
        >
          <button
            className={
              isMobile
                ? 'btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 flex-fill'
                : 'btn btn-sm btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2'
            }
            onClick={handleTutupBuku}
            style={
              isMobile
                ? { height: 52, borderRadius: 14, fontSize: '0.95rem' }
                : { height: 36, padding: '0.4rem 0.75rem' }
            }
          >
            <FiBook size={isMobile ? 18 : 16} />
            Tutup Buku
          </button>
          <button
            className={
              isMobile
                ? 'btn btn-outline-primary fw-semibold d-flex align-items-center justify-content-center gap-2 flex-fill'
                : 'btn btn-sm btn-outline-primary fw-semibold d-flex align-items-center justify-content-center gap-2'
            }
            onClick={handleExportPDF}
            style={
              isMobile
                ? { height: 52, borderRadius: 14, fontSize: '0.95rem' }
                : { height: 36, padding: '0.4rem 0.75rem' }
            }
          >
            <FiPrinter size={isMobile ? 18 : 16} />
            Cetak
          </button>
        </div>
      )}

      {!selectedId && <div className="alert alert-warning text-dark bg-warning-subtle border-warning">⚠️ Silakan pilih pengawas terlebih dahulu.</div>}

      {selectedId && (
        <>
          {rows.length > 0 ? (
            !isMobile && (
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