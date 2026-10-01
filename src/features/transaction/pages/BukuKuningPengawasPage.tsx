import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import DataTable from '../../../components/DataTable';
import logo from '../../../assets/logosr-black.png';
import { useMediaQuery } from 'react-responsive';
import { FiBook, FiPrinter, FiTrendingDown, FiTrendingUp, FiRotateCcw, FiUsers } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import EmptyState from '../../../components/EmptyState';
import ListLoadingState from '../../../components/ListLoadingState';
import {
  PDF_COLORS,
  drawBackground,
  drawDecorativeCircles,
  drawFooter,
  drawPageBadges,
  drawSectionTitle,
  drawProfileCard,
} from '../utils/pdfReport';
import { hitungSaldoBerjalan, ringkasanBukuKuning, type SaldoRow } from '../utils/saldoBerjalan';
import MobilePageBar from '../../../components/MobilePageBar';
import SearchableSelect from '../../../components/SearchableSelect';
import MonthPill from '../../ladies/components/MonthPill';
import '../components/TransaksiMobile.css';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num) return '';
  return `Rp${num.toLocaleString('id-ID')}`;
};

type Row = SaldoRow;

const BukuKuningPengawasPage = () => {
  const [selectedId, setSelectedId] = useState('');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const pad = (n: number) => String(n).padStart(2, '0');
  const getLastDay = (year: number, month: number) => new Date(year, month, 0).getDate();

  const { data: pengawasList = [] } = useQuery({
    queryKey: ['bukukuning-pengawas-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pengawas').select('id, nama_panggilan');
      if (error) throw error;
      return data ?? [];
    },
    meta: { errorLabel: 'data pengawas' },
  });

  const { data: bukuData, isLoading: loadingBuku } = useQuery({
    queryKey: ['bukukuning-pengawas-data', selectedId, bulan, tahun],
    queryFn: async () => {
      const from = `${tahun}-${pad(bulan)}-01`;
      const to = `${tahun}-${pad(bulan)}-${pad(getLastDay(tahun, bulan))}`;
      const prevMonth = bulan === 1 ? 12 : bulan - 1;
      const prevYear = bulan === 1 ? tahun - 1 : tahun;

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

      const transaksi: Row[] = [];

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

      return hitungSaldoBerjalan(saldoAwal, transaksi);
    },
    enabled: !!selectedId,
    meta: { errorLabel: 'data buku kuning pengawas' },
  });

  const rows = bukuData ?? [];

  // === Perubahan hanya di sini: logic tutup buku ===
  const handleTutupBuku = async () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data transaksi.');
      return;
    }

    const selected = pengawasList.find((l) => l.id === selectedId);
    const nama = selected ? selected.nama_panggilan : 'Unknown';

    const confirm = await confirmDialog(`Tutup buku ${nama} untuk ${monthNames[bulan - 1]} ${tahun}?`);
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

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('p', 'mm', 'a4');
    const img = new Image();
    img.src = logo;

    const selected = pengawasList.find((l) => l.id === selectedId);

    const namaFile = selected
      ? `Totalan ${selected.nama_panggilan} - ${monthNames[bulan - 1]} ${tahun}`
      : `Totalan - ${monthNames[bulan - 1]} ${tahun}`;

    // Angka ringkasan dari fungsi murni yang sama dengan tampilan mobile.
    const {
      totalPemasukan: totalGaji,
      totalPengeluaran: totalKasbon,
      saldoAwal,
      saldoAkhir,
    } = ringkasanBukuKuning(rows);

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

  // Mobile: tampilan baru selaras Transaksi Pengawas. Desktop: tabel lama.
  // Sebelumnya mobile sama sekali tidak menampilkan daftar transaksi
  // (DataTable hanya untuk desktop) — admin hanya melihat tombol Tutup Buku.
  if (isMobile) {
    const ringkasan = ringkasanBukuKuning(rows);
    const labelPeriode = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    const sekarang = new Date();
    const diBulanIni = tahun === sekarang.getFullYear() && bulan === sekarang.getMonth() + 1;

    const geserBulan = (arah: -1 | 1) => {
      const d = new Date(tahun, bulan - 1 + arah, 1);
      setBulan(d.getMonth() + 1);
      setTahun(d.getFullYear());
    };

    const tanggalSingkat = (t: string) =>
      new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

    return (
      <div className="tm-page">
        <MobilePageBar title="Buku Kuning Pengawas" backTo="/" />

        <div className="tm-stack">
          <h2 className="tm-section-title">Pengawas</h2>
          <SearchableSelect
            value={selectedId}
            onChange={setSelectedId}
            options={pengawasList.map((p) => ({ value: p.id, label: p.nama_panggilan ?? '-' }))}
            placeholder="Pilih pengawas"
            searchPlaceholder="Cari nama pengawas..."
            height={52}
            borderRadius={999}
            fontSize="1rem"
          />

          <h2 className="tm-section-title">Periode</h2>
          <MonthPill
            label={labelPeriode}
            value={`${tahun}-${pad(bulan)}`}
            max={`${sekarang.getFullYear()}-${pad(sekarang.getMonth() + 1)}`}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m] = e.target.value.split('-').map(Number);
              setTahun(y);
              setBulan(m);
            }}
            onPrev={() => geserBulan(-1)}
            onNext={() => geserBulan(1)}
            nextDisabled={diBulanIni}
          />

          {!selectedId ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                <div className="tm-empty-title">Pilih pengawas dulu</div>
                <div className="tm-empty-text">
                  Saldo dan daftar transaksi akan muncul setelah pengawas dipilih.
                </div>
              </div>
            </div>
          ) : loadingBuku ? (
            <ListLoadingState label="Memuat buku kuning" rows={4} />
          ) : (
            <>
              <section className="tm-hero" aria-label="Ringkasan saldo">
                <div className="tm-hero-label">Saldo akhir</div>
                <div className="tm-hero-value">{formatRupiah(ringkasan.saldoAkhir) || 'Rp0'}</div>
                <div className="tm-hero-sub">
                  Saldo awal {formatRupiah(ringkasan.saldoAwal) || 'Rp0'} · {labelPeriode}
                </div>
                <div className="tm-hero-split">
                  <div>
                    <div className="tm-hero-split-label">Gaji</div>
                    <div className="tm-hero-split-value">+ {formatRupiah(ringkasan.totalPemasukan) || 'Rp0'}</div>
                  </div>
                  <div>
                    <div className="tm-hero-split-label">Kasbon</div>
                    <div className="tm-hero-split-value">− {formatRupiah(ringkasan.totalPengeluaran) || 'Rp0'}</div>
                  </div>
                </div>
              </section>

              <div className="tm-actions">
                <button type="button" className="tm-btn tm-btn--primary" onClick={handleTutupBuku}>
                  <FiBook aria-hidden />
                  Tutup Buku
                </button>
                <button type="button" className="tm-btn" onClick={handleExportPDF}>
                  <FiPrinter aria-hidden />
                  Cetak PDF
                </button>
              </div>

              <h2 className="tm-section-title">Transaksi ({ringkasan.jumlahTransaksi})</h2>
              <div className="tm-group tm-list">
                {/* Baris pembuka: saldo bawaan bulan lalu */}
                <div>
                  <div className="tm-row tm-row--opening">
                    <span
                      className="tm-row-icon"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-gray-700)' }}
                      aria-hidden
                    >
                      <FiRotateCcw />
                    </span>
                    <div className="tm-row-main">
                      <div className="tm-row-title">Saldo bulan lalu</div>
                      <div className="tm-row-sub">Sisa kasbon dari tutup buku sebelumnya</div>
                    </div>
                    <div className="tm-row-value">
                      <div className="tm-row-amount">{formatRupiah(ringkasan.saldoAwal) || 'Rp0'}</div>
                    </div>
                  </div>
                </div>

                {rows.slice(1).map((r, i) => {
                  const isGaji = typeof r.pemasukan === 'number' && r.pemasukan !== 0;
                  const nominal = isGaji ? r.pemasukan : r.pengeluaran;
                  const warna = isGaji ? 'var(--color-income)' : 'var(--color-expense)';
                  return (
                    <div key={`${r.tanggal}-${i}`}>
                      <div className="tm-row">
                        <span
                          className="tm-row-icon"
                          style={{
                            background: isGaji ? 'var(--color-income-soft)' : 'var(--color-expense-soft)',
                            color: warna,
                          }}
                          aria-hidden
                        >
                          {isGaji ? <FiTrendingUp /> : <FiTrendingDown />}
                        </span>
                        <div className="tm-row-main">
                          <div className="tm-row-title">{isGaji ? 'Gaji' : 'Kasbon'}</div>
                          <div className="tm-row-sub">
                            {tanggalSingkat(r.tanggal)}
                            {r.keterangan ? ` · ${r.keterangan}` : ''}
                          </div>
                        </div>
                        <div className="tm-row-value">
                          <div className="tm-row-amount" style={{ color: warna }}>
                            {isGaji ? '+' : '−'} {formatRupiah(nominal)}
                          </div>
                          <div className="tm-row-saldo">Saldo {formatRupiah(r.saldo) || 'Rp0'}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {ringkasan.jumlahTransaksi === 0 && (
                  <div className="tm-empty" style={{ paddingTop: 'var(--space-5)' }}>
                    <div className="tm-empty-title">Belum ada transaksi</div>
                    <div className="tm-empty-text">Tidak ada gaji atau kasbon di periode ini.</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

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
          {loadingBuku ? (
            <ListLoadingState label="Memuat buku kuning" rows={5} />
          ) : rows.length > 0 ? (
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
            <EmptyState
              icon="ℹ️"
              title="Tidak ada transaksi di bulan ini"
            />
          )}
        </>
      )}
    </div>
  );
};

export default BukuKuningPengawasPage;