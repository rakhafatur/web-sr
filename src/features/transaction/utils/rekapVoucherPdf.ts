import dayjs from 'dayjs';
import logo from '../../../assets/logosr-black.png';
import { totalPerOutlet, type OutletGroup } from './rekapVoucher';

/** jspdf-autotable menempelkan properti ini ke instance doc saat runtime,
    tapi tidak ikut di type bawaan jsPDF. */
type jsPDFWithAutoTable = {
  lastAutoTable?: { finalY: number };
};

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

/**
 * Cetak Rekap Voucher per outlet ke PDF.
 *
 * Dipisah dari komponen karena tidak ada hubungannya dengan render — dan
 * jspdf beserta jspdf-autotable diimpor dinamis di sini supaya kedua library
 * itu (±550 KB) tidak ikut ke bundle halaman kalau tombol cetak tidak ditekan.
 */
export async function cetakRekapVoucherPdf(opts: {
  dataPerOutlet: OutletGroup[];
  start: string;
  end: string;
}) {
  const { dataPerOutlet, start, end } = opts;

  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    doc.addImage(img, 'PNG', 12, 10, 16, 16);

    doc.setFontSize(15);
    doc.text('REKAP VOUCHER PER OUTLET', 32, 18);

    doc.setFontSize(11);
    doc.text(`Periode ${start} s/d ${end}`, 32, 24);

    let currentY = 38;

    dataPerOutlet.forEach((outletGroup) => {
      const tableData = outletGroup.data.map((d) => [
        d.nama_ladies,
        d.totalVoucher.toFixed(0),
        formatRupiah(d.totalNominal),
      ]);

      const totalVoucherOutlet = totalPerOutlet(outletGroup).totalVoucher;

      doc.setFontSize(12);
      doc.text(`Outlet: ${outletGroup.outlet}`, 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Nama Ladies', 'Voucher', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: 255,
        },
        styles: {
          fontSize: 10,
        },
      });

      const lastY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 0;

      doc.text(`Total Voucher: ${totalVoucherOutlet.toFixed(0)} pcs`, 14, lastY + 7);

      currentY = lastY + 18;
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(9);
    doc.text(`Dicetak ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, pageHeight - 10);
    doc.text('SR Agency', pageWidth - 14, pageHeight - 10, { align: 'right' });

    doc.save(`Rekap-Voucher-${start}-${end}.pdf`);
  };
}
