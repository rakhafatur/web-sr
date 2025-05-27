import { useState } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../assets/logosr-black.png';

type VoucherRow = {
  jumlah: number;
  tanggal: string;
  ladies: {
    id: string;
    nama_ladies: string;
    nama_outlet: string;
  } | null;
};

type OutletGroup = {
  outlet: string;
  data: {
    nama_ladies: string;
    totalVoucher: number;
    totalNominal: number;
  }[];
};

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

const RekapVoucherPage = () => {
  const [start, setStart] = useState(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD'));
  const [dataPerOutlet, setDataPerOutlet] = useState<OutletGroup[]>([]);
  const [totalVoucherAll, setTotalVoucherAll] = useState(0);
  const [totalNominalAll, setTotalNominalAll] = useState(0);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('vouchers')
      .select(`
        jumlah,
        tanggal,
        ladies (
          id,
          nama_ladies,
          nama_outlet
        )
      `)
      .gte('tanggal', start)
      .lte('tanggal', end)
      .not('ladies_id', 'is', null);

    if (error || !data || !Array.isArray(data)) {
      alert('❌ Gagal ambil data voucher');
      return;
    }

    const vouchers = (data as any[]).map((v) => ({
      jumlah: v.jumlah,
      tanggal: v.tanggal,
      ladies: v.ladies as {
        id: string;
        nama_ladies: string;
        nama_outlet: string;
      } | null,
    })) as VoucherRow[];

    const grouped: Record<string, OutletGroup> = {};
    let totalVoucher = 0;
    let totalNominal = 0;

    vouchers.forEach((v) => {
      const lady = v.ladies;
      if (!lady) return;

      const outlet = lady.nama_outlet;
      const nama = lady.nama_ladies;
      const nominal = Number(v.jumlah);
      const pcs = nominal / 150000;

      totalVoucher += pcs;
      totalNominal += nominal;

      if (!grouped[outlet]) {
        grouped[outlet] = { outlet, data: [] };
      }

      const existing = grouped[outlet].data.find((d) => d.nama_ladies === nama);
      if (existing) {
        existing.totalVoucher += pcs;
        existing.totalNominal += nominal;
      } else {
        grouped[outlet].data.push({
          nama_ladies: nama,
          totalVoucher: pcs,
          totalNominal: nominal,
        });
      }
    });

    setDataPerOutlet(Object.values(grouped));
    setTotalVoucherAll(totalVoucher);
    setTotalNominalAll(totalNominal);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.addImage(img, 'PNG', 10, 12, 16, 16);
      doc.setFontSize(14);
      doc.text('REKAP VOUCHER PER OUTLET', 30, 20);
      doc.setFontSize(12);
      doc.text(`Periode: ${start} s/d ${end}`, 30, 26);

      let currentY = 38;

      dataPerOutlet.forEach((outletGroup) => {
        const tableData = outletGroup.data.map((d) => [
          d.nama_ladies,
          d.totalVoucher.toFixed(0),
        ]);
        const totalVoucherOutlet = outletGroup.data.reduce((sum, d) => sum + d.totalVoucher, 0);

        doc.text(`Outlet: ${outletGroup.outlet}`, 14, currentY);

        autoTable(doc, {
          startY: currentY + 6,
          head: [['Nama Ladies', 'Voucher (pcs)']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [43, 7, 82], textColor: 255 },
          bodyStyles: { textColor: 0 },
          styles: { fontSize: 10 },
        });

        const lastY = (doc as any).lastAutoTable.finalY || 0;
        doc.text(`Total Voucher: ${totalVoucherOutlet.toFixed(0)} pcs`, 14, lastY + 6);
        currentY = lastY + 14;
      });

      const today = new Date().toLocaleDateString('id-ID');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(10);
      doc.text(`Dicetak: ${today}`, 14, pageHeight - 10);
      doc.text('SR Agency', pageWidth - 14, pageHeight - 10, { align: 'right' });
      doc.text(`Halaman 1`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      doc.save(`Rekap-Voucher-${start}-sampai-${end}.pdf`);
    };
  };

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold fs-4 mb-4">📊 Rekap Voucher per Outlet</h2>

      <div className="row gy-3 gx-3 align-items-end mb-4">
        <div className="col-md-4">
          <label className="form-label text-light">Dari Tanggal</label>
          <input
            type="date"
            className="form-control bg-dark text-light border-secondary"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label text-light">Sampai Tanggal</label>
          <input
            type="date"
            className="form-control bg-dark text-light border-secondary"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-primary" onClick={fetchData}>
            🔄 Tampilkan
          </button>
        </div>
        {dataPerOutlet.length > 0 && (
          <div className="col-md-2 d-grid">
            <button className="btn btn-outline-light" onClick={handleExportPDF}>
              📄 Export PDF
            </button>
          </div>
        )}
      </div>

      {dataPerOutlet.length > 0 && (
        <>
          {dataPerOutlet.map((outletGroup, idx) => {
            const totalVoucher = outletGroup.data.reduce((sum, d) => sum + d.totalVoucher, 0);
            const totalNominal = outletGroup.data.reduce((sum, d) => sum + d.totalNominal, 0);
            const totalHasil = totalVoucher * 75000;
            const totalDidapat = totalVoucher * 225000;

            return (
              <div key={idx} className="mb-5">
                <h5 className="text-info fw-bold mb-2">Outlet: {outletGroup.outlet}</h5>
                <DataTable
                  columns={[
                    { key: 'nama_ladies', label: 'Nama Ladies' },
                    {
                      key: 'totalVoucher',
                      label: 'Voucher (pcs)',
                      render: (row: any) => row.totalVoucher.toFixed(0),
                    },
                    {
                      key: 'totalNominal',
                      label: 'Total Ladies',
                      render: (row: any) => formatRupiah(row.totalNominal),
                    },
                    {
                      key: 'totalHasil',
                      label: 'Total Hasil',
                      render: (row: any) => formatRupiah(row.totalVoucher * 75000),
                    },
                    {
                      key: 'totalDidapat',
                      label: 'Total Didapat',
                      render: (row: any) => formatRupiah(row.totalVoucher * 225000),
                    },
                  ]}
                  data={outletGroup.data.map((row, i) => ({
                    id: `${outletGroup.outlet}-${i}`,
                    ...row,
                    totalHasil: row.totalVoucher * 75000,
                    totalDidapat: row.totalVoucher * 225000,
                  }))}
                />

                <div className="mt-3 p-3 bg-secondary bg-opacity-10 border border-info rounded">
                  <p className="mb-1 text-light"><strong>Total Voucher:</strong> {totalVoucher.toFixed(0)} pcs</p>
                  <p className="mb-1 text-light"><strong>Total Ladies:</strong> {formatRupiah(totalNominal)}</p>
                  <p className="mb-1 text-light"><strong>Total Hasil:</strong> {formatRupiah(totalHasil)}</p>
                  <p className="mb-0 text-light"><strong>Total Didapat:</strong> {formatRupiah(totalDidapat)}</p>
                </div>
              </div>
            );
          })}

          <div className="mt-5 p-4 bg-dark border border-info rounded-3 shadow-sm">
            <h5 className="text-light mb-3">
              <span className="badge bg-info text-dark me-2">🧾</span>
              Total Keseluruhan
            </h5>
            <ul className="list-group list-group-horizontal-md gap-3 flex-wrap">
              <li className="list-group-item bg-transparent text-light border-secondary">
                <strong>Total Voucher:</strong><br /> {totalVoucherAll.toFixed(0)} pcs
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary">
                <strong>Total Ladies:</strong><br /> {formatRupiah(totalNominalAll)}
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary">
                <strong>Total Hasil:</strong><br /> {formatRupiah(totalVoucherAll * 75000)}
              </li>
              <li className="list-group-item bg-transparent text-light border-secondary">
                <strong>Total Didapat:</strong><br /> {formatRupiah(totalVoucherAll * 225000)}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default RekapVoucherPage;