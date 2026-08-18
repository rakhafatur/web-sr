import type { SaldoRow } from './saldoBerjalan';
import { hitungTotalBukuKuning } from './totalBukuKuning';
import { monthNames, formatRupiah } from './biayaBulanan';
import logo from '../../../assets/logosr-black.png';
import {
  PDF_COLORS,
  drawBackground,
  drawDecorativeCircles,
  drawFooter,
  drawPageBadges,
  drawSectionTitle,
  drawProfileCard,
  drawStatCard,
} from './pdfReport';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

type Absensi = {
  tanggal: string;
  status: string;
  keterangan: string | null;
};

/**
 * Cetak Buku Kuning satu ladies ke PDF.
 *
 * Dipisah dari komponen karena tidak ada hubungannya dengan render — dulu 421
 * baris di dalam halaman, lebih dari separuh isinya. jspdf & jspdf-autotable
 * tetap diimpor dinamis supaya tidak ikut ke bundle halaman kalau tombol cetak
 * tidak pernah ditekan.
 */
export async function cetakBukuKuningPdf(opts: {
  rows: SaldoRow[];
  rekapAbsensi: Absensi[];
  ladiesList: Lady[];
  selectedLadyId: string;
  bulan: number;
  tahun: number;
}) {
  const { rows, rekapAbsensi, ladiesList, selectedLadyId, bulan, tahun } = opts;

  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF('p', 'mm', 'a4');
  const img = new Image();

  img.src = logo;

  const selectedLady = ladiesList.find(
    (l) => l.id === selectedLadyId
  );

  const namaFile = selectedLady
    ? `Totalan ${selectedLady.nama_ladies} - ${monthNames[bulan - 1]} ${tahun}`
    : `Totalan - ${monthNames[bulan - 1]} ${tahun}`;

  // Seluruh angka ringkasan dihitung di satu fungsi murni yang ada test-nya
  // (totalBukuKuning.ts) — sebelumnya lima blok reduce berjejer di sini.
  const {
    totalVoucher,
    totalPemasukanVoucher,
    totalPengeluaran,
    totalDokter,
    totalPemasukanLain,
    saldoAwal,
    saldoAkhir,
  } = hitungTotalBukuKuning(rows);

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
}
