import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../assets/logosr-black.png';
import { useMediaQuery } from 'react-responsive';
import { FiBook, FiPrinter, FiRepeat } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import {
  PDF_COLORS,
  drawBackground,
  drawDecorativeCircles,
  drawFooter,
  drawPageBadges,
  drawSectionTitle,
  drawProfileCard,
  drawStatCard,
} from '../utils/pdfReport';

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

const BIAYA_BULANAN_OUTLETS = ['Royal', 'SA', 'MTR'];
const KASBON_ADMIN_JUMLAH = 500000;
const DOKTER_SPEKULO_JUMLAH = 185000;

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string'
    ? parseFloat(value)
    : value;

  if (!num) return '';

  return `Rp${num.toLocaleString('id-ID')}`;
};

const BukuKuningPage = () => {
  const [rekapAbsensi, setRekapAbsensi] = useState<Absensi[]>([]);
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<Row[]>([]);
  const [generating, setGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });

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
  }, [selectedLadyId, bulan, tahun, refreshKey]);

  const handleGenerateBiayaBulanan = async () => {
    const monthLabel = monthNames[bulan - 1];
    const keteranganKasbon = `Admin ${monthLabel} ${tahun}`;
    const keteranganDokter = `Spekulo ${monthLabel} ${tahun}`;
    const tanggalInput = `${tahun}-${pad(bulan)}-01`;

    const confirm = window.confirm(
      `❗ Generate Kasbon Admin (${formatRupiah(KASBON_ADMIN_JUMLAH)}) & Dokter (${formatRupiah(
        DOKTER_SPEKULO_JUMLAH
      )}) untuk semua ladies aktif outlet ${BIAYA_BULANAN_OUTLETS.join('/')} — ${monthLabel} ${tahun}?`
    );

    if (!confirm) return;

    setGenerating(true);

    const { data: eligibleLadies, error: ladiesError } = await supabase
      .from('ladies')
      .select('id')
      .eq('status', 'active')
      .in('nama_outlet', BIAYA_BULANAN_OUTLETS);

    if (ladiesError || !eligibleLadies) {
      toast.error('Gagal mengambil data ladies: ' + (ladiesError?.message || ''));
      setGenerating(false);
      return;
    }

    if (eligibleLadies.length === 0) {
      toast.info('Tidak ada ladies aktif di outlet Royal/SA/MTR.');
      setGenerating(false);
      return;
    }

    const ladiesIds = eligibleLadies.map((l) => l.id);
    const from = `${tahun}-${pad(bulan)}-01`;
    const to = `${tahun}-${pad(bulan)}-${pad(getLastDay(tahun, bulan))}`;

    const [existingKasbon, existingDokter] = await Promise.all([
      supabase
        .from('kasbon')
        .select('ladies_id')
        .eq('keterangan', keteranganKasbon)
        .in('ladies_id', ladiesIds)
        .gte('tanggal', from)
        .lte('tanggal', to),

      supabase
        .from('dokter')
        .select('ladies_id')
        .eq('keterangan', keteranganDokter)
        .in('ladies_id', ladiesIds)
        .gte('tanggal', from)
        .lte('tanggal', to),
    ]);

    const existingKasbonIds = new Set(
      (existingKasbon.data || []).map((r) => r.ladies_id)
    );

    const existingDokterIds = new Set(
      (existingDokter.data || []).map((r) => r.ladies_id)
    );

    const kasbonPayload = ladiesIds
      .filter((id) => !existingKasbonIds.has(id))
      .map((id) => ({
        ladies_id: id,
        tanggal: tanggalInput,
        jumlah: KASBON_ADMIN_JUMLAH,
        keterangan: keteranganKasbon,
      }));

    const dokterPayload = ladiesIds
      .filter((id) => !existingDokterIds.has(id))
      .map((id) => ({
        ladies_id: id,
        tanggal: tanggalInput,
        jumlah: DOKTER_SPEKULO_JUMLAH,
        keterangan: keteranganDokter,
      }));

    const [kasbonResult, dokterResult] = await Promise.all([
      kasbonPayload.length > 0
        ? supabase.from('kasbon').insert(kasbonPayload)
        : Promise.resolve({ error: null }),

      dokterPayload.length > 0
        ? supabase.from('dokter').insert(dokterPayload)
        : Promise.resolve({ error: null }),
    ]);

    setGenerating(false);

    if (kasbonResult.error || dokterResult.error) {
      toast.error(
        'Gagal generate biaya bulanan: ' +
          (kasbonResult.error?.message || dokterResult.error?.message)
      );
      return;
    }

    toast.success(
      <div>
        Generate biaya bulanan {monthLabel} {tahun} selesai.
        <br />
        Kasbon Admin: {kasbonPayload.length} ditambahkan, {existingKasbonIds.size} sudah ada (dilewati)
        <br />
        Dokter: {dokterPayload.length} ditambahkan, {existingDokterIds.size} sudah ada (dilewati)
      </div>
    );

    setRefreshKey((k) => k + 1);
  };

  const handleTutupBuku = async () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data transaksi.');
      return;
    }

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
      toast.error(
        'Gagal menyimpan saldo: ' +
        error.message
      );
    else
      toast.success(
        'Buku bulan ini ditutup dan saldo disimpan.'
      );
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const img = new Image();

    img.src = logo;

    const selectedLady = ladiesList.find(
      (l) => l.id === selectedLadyId
    );

    const namaFile = selectedLady
      ? `Totalan ${selectedLady.nama_ladies} - ${monthNames[bulan - 1]} ${tahun}`
      : `Totalan - ${monthNames[bulan - 1]} ${tahun}`;

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
            label: 'NAMA',
            value: selectedLady?.nama_ladies || '-',
          },
          {
            icon: 'store',
            label: 'OUTLET',
            value: selectedLady?.nama_outlet || '-',
          },
          {
            icon: 'lock',
            label: 'PIN',
            value: selectedLady?.pin || '-',
          },
        ],
        C
      );

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

      drawSectionTitle(doc, 'Rekap Absensi', 14, cardBottom + 14, C);

      const statsY = cardBottom + 19;
      const statsH = 36;
      const statGap = 3;
      const statW = (182 - statGap * 3) / 4;

      const statItems: {
        label: string;
        value: number;
      }[] = [
        { label: 'KERJA', value: totalKERJA },
        { label: 'MENS', value: totalMENS },
        { label: 'OFF', value: totalOFF },
        { label: 'SAKIT', value: totalSAKIT },
      ];

      statItems.forEach((item, i) => {
        drawStatCard(
          doc,
          {
            x: 14 + i * (statW + statGap),
            y: statsY,
            w: statW,
            h: statsH,
            label: item.label,
            value: `${item.value}`,
            unit: 'Hari',
          },
          C
        );
      });

      const rekapEndY = statsY + statsH;

      // =====================================
      // RINGKASAN KEUANGAN
      // =====================================

      drawSectionTitle(doc, 'Ringkasan Keuangan', 14, rekapEndY + 14, C);

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
        startY: rekapEndY + 19,

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

          // pengeluaran merah
          if (data.column.index === 4 && data.section === 'body') {
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
        title="Buku Kuning Ladies"
        description="Kelola transaksi bulanan ladies (voucher, kasbon, dokter, pemasukan lain)"
      />

      <div className="row mb-3">
        <div className="col-12 col-md-4 mb-2">
          <label className="form-label text-dark">
            Pilih Ladies
          </label>

          <select
            className="form-select"
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
            className="form-select"
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
            className="form-control"
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

      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{ overflow: 'hidden' }}
      >
        <div
          className={
            isMobile
              ? 'p-3 d-flex flex-column gap-3'
              : 'p-3 p-md-4 d-flex align-items-center justify-content-between flex-wrap gap-3'
          }
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'var(--color-voucher-soft)',
                color: 'var(--color-voucher)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FiRepeat size={20} />
            </div>

            <div>
              <div className="fw-bold" style={{ color: 'var(--color-dark)' }}>
                Generate Biaya Bulanan
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-500)' }}>
                Kasbon Admin {formatRupiah(KASBON_ADMIN_JUMLAH)} & Dokter{' '}
                {formatRupiah(DOKTER_SPEKULO_JUMLAH)} untuk semua ladies aktif outlet{' '}
                {BIAYA_BULANAN_OUTLETS.join('/')} — {monthNames[bulan - 1]} {tahun}
              </div>
            </div>
          </div>

          <button
            className={
              isMobile
                ? 'btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 w-100'
                : 'btn btn-sm btn-primary fw-semibold d-flex align-items-center gap-2'
            }
            onClick={handleGenerateBiayaBulanan}
            disabled={generating}
            style={{
              height: isMobile ? 48 : 40,
              padding: isMobile ? undefined : '0 16px',
              flexShrink: 0,
            }}
          >
            {generating ? (
              <div className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <FiRepeat size={16} />
            )}
            {generating ? 'Memproses...' : 'Generate'}
          </button>
        </div>
      </div>

      {selectedLadyId &&
        rows.length > 0 && (
          <div
            className={
              isMobile
                ? 'd-flex gap-3 mb-4'
                : 'd-flex gap-2 mb-3 justify-content-start flex-wrap'
            }
            style={
              isMobile
                ? undefined
                : { alignItems: 'center' }
            }
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
                  ? {
                      height: 52,
                      borderRadius: 14,
                      fontSize: '0.95rem',
                    }
                  : {
                      height: 36,
                      padding: '0.4rem 0.75rem',
                    }
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
                  ? {
                      height: 52,
                      borderRadius: 14,
                      fontSize: '0.95rem',
                    }
                  : {
                      height: 36,
                      padding: '0.4rem 0.75rem',
                    }
              }
            >
              <FiPrinter size={isMobile ? 18 : 16} />
              Cetak
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
            !isMobile && (
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