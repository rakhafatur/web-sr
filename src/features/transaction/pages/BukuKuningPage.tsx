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

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

type Row = {
  tanggal: string;
  keterangan: string;
  voucher: number | string;
  pemasukan: number | string;
  pengeluaran: number | string;
  saldo: number;
};

type Absensi = {
  tanggal: string;
  status: string;
  keterangan: string | null;
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

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string'
    ? parseFloat(value)
    : value;

  if (!num) return '';

  return `Rp${num.toLocaleString('id-ID')}`;
};

const PDF_COLORS = {
  primary: [22, 163, 74] as [number, number, number],
  primaryDark: [21, 128, 61] as [number, number, number],
  primarySoft: [220, 252, 231] as [number, number, number],
  ink: [15, 23, 42] as [number, number, number],
  body: [51, 65, 85] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dangerSoft: [255, 228, 230] as [number, number, number],
  rose: [225, 29, 72] as [number, number, number],
  roseSoft: [255, 228, 230] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  amberSoft: [254, 243, 199] as [number, number, number],
  slateSoft: [241, 245, 249] as [number, number, number],
};

const BukuKuningPage = () => {
  const [rekapAbsensi, setRekapAbsensi] = useState<Absensi[]>([]);
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<Row[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isSmallMobile = useMediaQuery({ maxWidth: 480 });
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const pad = (n: number) => String(n).padStart(2, '0');

  const getLastDay = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

  useEffect(() => {
    const fetchLadies = async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin, status')
        .eq('status', 'active');

      if (error) {
        console.error('Gagal mengambil ladies:', error.message);
      } else {
        setLadiesList(data || []);
      }
    };

    fetchLadies();
  }, []);

  useEffect(() => {
    if (!selectedLadyId) return;

    const from = `${tahun}-${pad(bulan)}-01`;
    const to = `${tahun}-${pad(bulan)}-${pad(
      getLastDay(tahun, bulan)
    )}`;

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

      const [vouchers, kasbon, pemasukan, dokter, absensi] = await Promise.all([
        supabase
          .from('vouchers')
          .select('tanggal, jumlah')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('kasbon')
          .select('tanggal, jumlah, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('pemasukan_lain')
          .select('tanggal, jumlah, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('dokter')
          .select('tanggal, jumlah, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('absensi')
          .select('tanggal, status, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to)
          .order('tanggal', { ascending: true })
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

      (dokter?.data || []).forEach((d) => {
        transaksi.push({
          tanggal: d.tanggal,
          keterangan: `Dokter - ${d.keterangan || ''}`,
          voucher: '',
          pemasukan: '',
          pengeluaran: Number(d.jumlah),
          saldo: 0,
        });
      });

      transaksi.sort((a, b) =>
        a.tanggal.localeCompare(b.tanggal)
      );

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
        const pemasukan =
          trx.pemasukan === ''
            ? 0
            : Number(trx.pemasukan);

        const pengeluaran =
          trx.pengeluaran === ''
            ? 0
            : Number(trx.pengeluaran);

        saldo += pemasukan - pengeluaran;

        fullRows.push({
          ...trx,
          saldo,
        });
      });

      setRekapAbsensi(absensi?.data || []);

      setRows(fullRows);

    };

    fetchData();
  }, [selectedLadyId, bulan, tahun]);

  const handleTutupBuku = async () => {
    if (rows.length === 0)
      return alert('❌ Tidak ada data transaksi.');

    const lady = ladiesList.find(
      (l) => l.id === selectedLadyId
    );

    const nama = lady
      ? lady.nama_ladies
      : 'Unknown';

    const confirm = window.confirm(
      `❗ Yakin tutup buku - ${nama} - ${monthNames[bulan - 1]
      } - ${tahun}?`
    );

    if (!confirm) return;

    const lastSaldo = rows[rows.length - 1].saldo;

    const { error } = await supabase
      .from('rekap_bulanan')
      .upsert(
        {
          ladies_id: selectedLadyId,
          bulan,
          tahun,
          saldo_akhir: lastSaldo,
        },
        {
          onConflict:
            'ladies_id,bulan,tahun',
        }
      );

    if (error)
      alert(
        '❌ Gagal menyimpan saldo: ' +
        error.message
      );
    else
      alert(
        '✅ Buku bulan ini ditutup dan saldo disimpan.'
      );
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const img = new Image();

    img.src = logo;

    const selectedLady = ladiesList.find(
      (l) => l.id === selectedLadyId
    );

    const namaLabel = selectedLady
      ? `${selectedLady.nama_ladies} - ${selectedLady.nama_outlet} (${selectedLady.pin})`
      : 'Nama tidak ditemukan';

    const totalVoucher = rows.reduce(
      (sum, r) =>
        sum +
        (typeof r.voucher === 'number'
          ? r.voucher
          : 0),
      0
    );

    const totalPemasukanVoucher =
      rows
        .filter(
          (r) =>
            r.keterangan === 'Voucher'
        )
        .reduce(
          (sum, r) =>
            sum +
            (typeof r.pemasukan === 'number'
              ? r.pemasukan
              : 0),
          0
        );

    const totalPengeluaran = rows
      .filter(
        (r) =>
          !r.keterangan?.startsWith(
            'Dokter -'
          )
      )
      .reduce(
        (sum, r) =>
          sum +
          (typeof r.pengeluaran === 'number'
            ? r.pengeluaran
            : 0),
        0
      );

    const totalDokter = rows
      .filter((r) =>
        r.keterangan?.startsWith(
          'Dokter -'
        )
      )
      .reduce(
        (sum, r) =>
          sum +
          (typeof r.pengeluaran === 'number'
            ? r.pengeluaran
            : 0),
        0
      );

    const totalPemasukanLain = rows
      .filter(
        (r) =>
          r.keterangan !== 'Voucher'
      )
      .reduce(
        (sum, r) =>
          sum +
          (typeof r.pemasukan === 'number'
            ? r.pemasukan
            : 0),
        0
      );

    const saldoAwal =
      rows[0]?.saldo || 0;

    const saldoAkhir =
      rows[rows.length - 1]?.saldo || 0;

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const C = PDF_COLORS;

      const drawBackground = () => {
        doc.setFillColor(...C.bg);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      };

      const drawFooter = () => {
        const lineY = pageHeight - 20;

        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.3);
        doc.line(14, lineY, pageWidth - 14, lineY);

        doc.setFillColor(...C.primary);
        doc.circle(15, lineY + 5.8, 0.8, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.muted);
        doc.text(
          `Dicetak ${new Date().toLocaleDateString('id-ID')}  •  Halaman ${doc.getNumberOfPages()}`,
          18,
          lineY + 7
        );

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...C.primaryDark);
        doc.text('SR Agency System', pageWidth - 14, lineY + 7, {
          align: 'right',
        });
      };

      // =====================================
      // PAGE 1 — HERO HEADER
      // =====================================

      drawBackground();

      const bannerH = 50;

      doc.setFillColor(...C.primaryDark);
      doc.rect(0, 0, pageWidth, bannerH, 'F');

      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: 0.08 }));
      doc.setFillColor(...C.white);
      doc.circle(pageWidth - 18, -8, 46, 'F');
      doc.circle(8, bannerH + 12, 26, 'F');
      doc.restoreGraphicsState();

      // logo badge
      doc.setFillColor(...C.white);
      doc.roundedRect(pageWidth - 46, 9, 32, 32, 6, 6, 'F');
      doc.addImage(img, 'PNG', pageWidth - 42, 13, 24, 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(23);
      doc.setTextColor(...C.white);
      doc.text('Laporan Transaksi', 14, 27);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...C.primarySoft);
      doc.text(`${monthNames[bulan - 1]} ${tahun}`, 14, 37);

      // =====================================
      // PROFILE CARD (floating over the banner)
      // =====================================

      const cardY = bannerH - 10;
      const cardH = 36;

      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: 0.08 }));
      doc.setFillColor(...C.ink);
      doc.roundedRect(14.8, cardY + 1.6, 182, cardH, 5, 5, 'F');
      doc.restoreGraphicsState();

      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.setFillColor(...C.white);
      doc.roundedRect(14, cardY, 182, cardH, 5, 5, 'FD');

      const profileCols: {
        label: string;
        value: string;
        color: [number, number, number];
        x: number;
      }[] = [
        {
          label: 'NAMA',
          value: selectedLady?.nama_ladies || '-',
          color: C.primary,
          x: 24,
        },
        {
          label: 'OUTLET',
          value: selectedLady?.nama_outlet || '-',
          color: C.amber,
          x: 82,
        },
        {
          label: 'PIN',
          value: selectedLady?.pin || '-',
          color: C.muted,
          x: 148,
        },
      ];

      profileCols.forEach((col, i) => {
        if (i > 0) {
          doc.setDrawColor(...C.border);
          doc.setLineWidth(0.3);
          doc.line(col.x - 8, cardY + 8, col.x - 8, cardY + 28);
        }

        doc.setFillColor(...col.color);
        doc.roundedRect(col.x, cardY + 9, 3, 3, 1, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        doc.text(col.label, col.x + 5.5, cardY + 11.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...C.ink);
        doc.text(col.value, col.x, cardY + 23, { maxWidth: 54 });
      });

      const cardBottom = cardY + cardH;

      // =====================================
      // REKAP ABSENSI
      // =====================================

      const totalKERJA = rekapAbsensi.filter(
        (r) => r.status === 'KERJA'
      ).length;

      const totalMENS = rekapAbsensi.filter(
        (r) => r.status === 'MENS'
      ).length;

      const totalOFF = rekapAbsensi.filter(
        (r) => r.status === 'OFF'
      ).length;

      const totalSAKIT = rekapAbsensi.filter(
        (r) => r.status === 'SAKIT'
      ).length;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...C.ink);
      doc.text('Rekap Absensi', 14, cardBottom + 14);

      const absensiColors: [number, number, number][] = [
        C.primary,
        C.rose,
        C.muted,
        C.amber,
      ];

      const absensiTints: [number, number, number][] = [
        C.primarySoft,
        C.roseSoft,
        C.slateSoft,
        C.amberSoft,
      ];

      autoTable(doc, {
        startY: cardBottom + 19,

        theme: 'grid',

        head: [['KERJA', 'MENS', 'OFF', 'SAKIT']],

        body: [[
          `${totalKERJA} Hari`,
          `${totalMENS} Hari`,
          `${totalOFF} Hari`,
          `${totalSAKIT} Hari`,
        ]],

        margin: { left: 14, right: 14 },

        tableWidth: 182,

        styles: {
          fontSize: 9,
          cellPadding: 4.5,
          halign: 'center',
          valign: 'middle',
          textColor: C.body,
          lineColor: C.border,
          lineWidth: 0.4,
        },

        headStyles: {
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9.5,
        },

        columnStyles: {
          0: { cellWidth: 45.5 },
          1: { cellWidth: 45.5 },
          2: { cellWidth: 45.5 },
          3: { cellWidth: 45.5 },
        },

        didParseCell: (data) => {
          const col = data.column.index;

          if (data.section === 'head') {
            data.cell.styles.fillColor = absensiColors[col];
          } else if (data.section === 'body') {
            data.cell.styles.fillColor = absensiTints[col];
            data.cell.styles.textColor = absensiColors[col];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      const rekapEndY = (doc as any).lastAutoTable.finalY;

      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(14, rekapEndY + 10, pageWidth - 14, rekapEndY + 10);

      // =====================================
      // RINGKASAN KEUANGAN
      // =====================================

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...C.ink);
      doc.text('Ringkasan Keuangan', 14, rekapEndY + 20);

      const summaryDots: [number, number, number][] = [
        C.muted,
        C.primary,
        C.primary,
        C.danger,
        C.danger,
        C.muted,
        C.primary,
      ];

      autoTable(doc, {
        startY: rekapEndY + 25,

        theme: 'grid',

        head: [['Ringkasan', 'Nominal']],

        body: [
          ['Total Voucher', `${totalVoucher}`],
          ['Voucher Rp', formatRupiah(totalPemasukanVoucher)],
          ['Pemasukan Lain', formatRupiah(totalPemasukanLain)],
          ['Kasbon', formatRupiah(totalPengeluaran)],
          ['Dokter', formatRupiah(totalDokter)],
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

          if (data.row.index === 6) {
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

      drawFooter();

      // =====================================
      // PAGE 2 — DETAIL TRANSAKSI
      // =====================================

      doc.addPage();

      const drawDetailHeader = () => {
        drawBackground();

        doc.setFillColor(...C.primary);
        doc.rect(0, 0, pageWidth, 4, 'F');

        doc.setFillColor(...C.white);
        doc.rect(0, 4, pageWidth, 26, 'F');

        doc.setFillColor(...C.primary);
        doc.roundedRect(14, 12, 3, 12, 1.5, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...C.ink);
        doc.text('Detail Transaksi', 21, 21);

        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.3);
        doc.line(0, 30, pageWidth, 30);
      };

      autoTable(doc, {
        startY: 38,

        theme: 'grid',

        head: [[
          'Tanggal',
          'Keterangan',
          'Voucher',
          'Pemasukan',
          'Pengeluaran',
          'Saldo',
        ]],

        body: rows.map((r) => [
          r.tanggal,
          r.keterangan,
          r.voucher || '',
          formatRupiah(r.pemasukan || 0),
          formatRupiah(r.pengeluaran || 0),
          formatRupiah(r.saldo),
        ]),

        margin: { top: 38, left: 14, right: 14, bottom: 24 },

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
          0: { cellWidth: 24, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 28, halign: 'right' },
          5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
        },

        didParseCell: (data) => {
          // baris saldo pembuka ("Sisa Kasbon")
          if (data.section === 'body' && data.row.index === 0) {
            data.cell.styles.fillColor = C.slateSoft;
            data.cell.styles.fontStyle = 'bold';
          }

          // saldo minus merah
          if (
            data.column.index === 5 &&
            typeof data.cell.raw === 'string' &&
            data.cell.raw.includes('-')
          ) {
            data.cell.styles.textColor = C.danger;
            data.cell.styles.fontStyle = 'bold';
          }

          // pengeluaran merah soft
          if (data.column.index === 4 && data.section === 'body') {
            data.cell.styles.textColor = C.danger;
          }

          // pemasukan hijau
          if (data.column.index === 3 && data.section === 'body') {
            data.cell.styles.textColor = C.primary;
          }
        },

        willDrawPage: () => {
          drawDetailHeader();
        },

        didDrawPage: () => {
          drawFooter();
        },
      });

      doc.save(`Buku-Kuning-${namaLabel}-${bulan}-${tahun}.pdf`);
    };
  };

  return (
    <div className="container py-4">
      <h2 className="text-dark fw-bold fs-4 mb-4">
        📒 Buku Kuning Ladies
      </h2>

      <div className="row mb-3">
        <div className="col-12 col-md-4 mb-2">
          <label className="form-label text-dark">
            Pilih Ladies
          </label>

          <select
            className="form-select bg-white text-dark border-success"
            value={selectedLadyId}
            onChange={(e) =>
              setSelectedLadyId(
                e.target.value
              )
            }
          >
            <option value="">
              -- Pilih --
            </option>

            {ladiesList.map((lady) => (
              <option
                key={lady.id}
                value={lady.id}
              >
                {lady.nama_ladies} -{' '}
                {lady.nama_outlet} (
                {lady.pin})
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">
            Bulan
          </label>

          <select
            className="form-select bg-white text-dark border-success"
            value={bulan}
            onChange={(e) =>
              setBulan(
                Number(
                  e.target.value
                )
              )
            }
          >
            {monthNames.map(
              (name, index) => (
                <option
                  key={index + 1}
                  value={index + 1}
                >
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">
            Tahun
          </label>

          <input
            type="number"
            className="form-control bg-white text-dark border-success"
            min={2020}
            max={2030}
            value={tahun}
            onChange={(e) =>
              setTahun(
                Number(
                  e.target.value
                )
              )
            }
          />
        </div>
      </div>

      {selectedLadyId &&
        rows.length > 0 && (
          <div
            className="d-flex gap-2 mb-3 justify-content-start flex-wrap"
            style={{
              alignItems: 'center',
            }}
          >
            <button
              className="btn btn-sm btn-success fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={
                handleTutupBuku
              }
              title={
                isSmallMobile
                  ? 'Tutup Buku'
                  : ''
              }
              style={{
                minWidth:
                  isSmallMobile
                    ? 44
                    : 'auto',
                height: 36,
                padding:
                  isSmallMobile
                    ? '0.4rem'
                    : '0.4rem 0.75rem',
              }}
            >
              <FiBook size={16} />

              {isSmallMobile
                ? null
                : 'Tutup Buku'}
            </button>

            <button
              className="btn btn-sm btn-outline-success fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={
                handleExportPDF
              }
              title={
                isSmallMobile
                  ? 'Cetak PDF'
                  : ''
              }
              style={{
                minWidth:
                  isSmallMobile
                    ? 44
                    : 'auto',
                height: 36,
                padding:
                  isSmallMobile
                    ? '0.4rem'
                    : '0.4rem 0.75rem',
              }}
            >
              <FiPrinter
                size={16}
              />

              {isSmallMobile
                ? null
                : 'Cetak'}
            </button>
          </div>
        )}

      {!selectedLadyId && (
        <div className="alert alert-warning text-dark bg-warning-subtle border-warning">
          ⚠️ Silakan pilih ladies
          terlebih dahulu.
        </div>
      )}

      {selectedLadyId && (
        <>
          {rows.length > 0 ? (
            isMobile ? (
              <CardTable
                data={rows
                  .filter(
                    (r) =>
                      r.tanggal !==
                      'Sisa Kasbon'
                  )
                  .sort(
                    (a, b) =>
                      dayjs(
                        b.tanggal
                      ).unix() -
                      dayjs(
                        a.tanggal
                      ).unix()
                  )}
                page={page}
                rowsPerPage={
                  rowsPerPage
                }
                onPageChange={
                  setPage
                }
              />
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'tanggal',
                    label:
                      'Tanggal',
                  },
                  {
                    key: 'keterangan',
                    label:
                      'Keterangan',
                  },
                  {
                    key: 'voucher',
                    label:
                      'Voucher',
                  },
                  {
                    key: 'pemasukan',
                    label:
                      'Pemasukan',
                    render: (
                      row
                    ) =>
                      formatRupiah(
                        row.pemasukan
                      ),
                  },
                  {
                    key: 'pengeluaran',
                    label:
                      'Pengeluaran',
                    render: (
                      row
                    ) =>
                      formatRupiah(
                        row.pengeluaran
                      ),
                  },
                  {
                    key: 'saldo',
                    label:
                      'Saldo',
                    render: (
                      row
                    ) =>
                      formatRupiah(
                        row.saldo
                      ),
                  },
                ]}
                data={rows.map(
                  (row, i) => ({
                    id: `${i}`,
                    ...row,
                  })
                )}
              />
            )
          ) : (
            <div className="alert alert-info">
              ℹ️ Tidak ada transaksi
              di bulan ini.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BukuKuningPage;