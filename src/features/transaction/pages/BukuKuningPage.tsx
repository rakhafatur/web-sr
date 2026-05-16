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

const BukuKuningPage = () => {
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

      const [vouchers, kasbon, pemasukan, dokter] = await Promise.all([
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
      const pageWidth =
        doc.internal.pageSize.getWidth();

      // =====================================
      // PAGE 1
      // =====================================

      doc.setFillColor(
        248,
        250,
        252
      );

      doc.rect(
        0,
        0,
        210,
        297,
        'F'
      );

      // TOP ACCENT
      doc.setFillColor(
        22,
        163,
        74
      );

      doc.rect(
        0,
        0,
        210,
        5,
        'F'
      );

      // HEADER
      doc.setFillColor(
        255,
        255,
        255
      );

      doc.rect(
        0,
        5,
        210,
        36,
        'F'
      );

      // LOGO
      doc.addImage(
        img,
        'PNG',
        168,
        10,
        24,
        24
      );

      // TITLE
      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(28);

      doc.setTextColor(
        20,
        20,
        20
      );

      doc.text(
        'Laporan',
        14,
        22
      );

      doc.setTextColor(
        22,
        163,
        74
      );

      doc.text(
        'Transaksi',
        58,
        22
      );

      doc.setFontSize(12);

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(120);

      doc.text(
        `${monthNames[bulan - 1]
        } ${tahun}`,
        14,
        30
      );

      // =====================================
      // CARD DETAIL
      // =====================================

      doc.setDrawColor(230);

      doc.setFillColor(
        255,
        255,
        255
      );

      doc.roundedRect(
        14,
        46,
        182,
        42,
        6,
        6,
        'FD'
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(11);

      doc.setTextColor(
        22,
        163,
        74
      );

      doc.text(
        'DETAIL LADIES',
        20,
        58
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(11);

      doc.setTextColor(40);

      doc.text(
        'Nama',
        20,
        70
      );

      doc.text(
        ':',
        42,
        70
      );

      doc.text(
        selectedLady?.nama_ladies ||
        '-',
        46,
        70
      );

      doc.text(
        'Outlet',
        20,
        78
      );

      doc.text(
        ':',
        42,
        78
      );

      doc.text(
        selectedLady?.nama_outlet ||
        '-',
        46,
        78
      );

      doc.text(
        'PIN',
        120,
        70
      );

      doc.text(
        ':',
        135,
        70
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(16);

      doc.text(
        selectedLady?.pin || '-',
        140,
        70
      );

      // =====================================
      // SECTION TITLE
      // =====================================

      doc.setDrawColor(220);

      doc.line(
        72,
        103,
        196,
        103
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(16);

      doc.setTextColor(25);

      doc.text(
        'Ringkasan Keuangan',
        14,
        105
      );

      // =====================================
      // SUMMARY TABLE
      // =====================================

      autoTable(doc, {
        startY: 112,

        theme: 'plain',

        head: [
          [
            'Ringkasan',
            'Nominal',
          ],
        ],

        body: [
          [
            'Total Voucher',
            `${totalVoucher}`,
          ],

          [
            'Voucher Rp',
            formatRupiah(
              totalPemasukanVoucher
            ),
          ],

          [
            'Pemasukan Lain',
            formatRupiah(
              totalPemasukanLain
            ),
          ],

          [
            'Kasbon',
            formatRupiah(
              totalPengeluaran
            ),
          ],

          [
            'Dokter',
            formatRupiah(
              totalDokter
            ),
          ],

          [
            'Saldo Awal',
            formatRupiah(
              saldoAwal
            ),
          ],

          [
            'Saldo Akhir',
            formatRupiah(
              saldoAkhir
            ),
          ],
        ],

        margin: {
          left: 14,
          right: 14,
        },

        styles: {
          fontSize: 10,
          cellPadding: 6,
          textColor: 40,
          lineColor: [
            235,
            235,
            235,
          ],
          lineWidth: 0.3,
        },

        headStyles: {
          fillColor: [
            240,
            253,
            244,
          ],
          textColor: [
            22,
            163,
            74,
          ],
          fontStyle: 'bold',
        },

        alternateRowStyles: {
          fillColor: [
            250,
            250,
            250,
          ],
        },

        columnStyles: {
          0: {
            cellWidth: 90,
            fontStyle: 'bold',
          },

          1: {
            halign: 'right',
            cellWidth: 80,
          },
        },

        didParseCell: (
          data
        ) => {
          if (
            data.row.index === 6 &&
            data.column.index === 1
          ) {
            data.cell.styles.textColor =
              [22, 163, 74];

            data.cell.styles.fontStyle =
              'bold';
          }
        },
      });

      // =====================================
      // FOOTER PAGE 1
      // =====================================

      doc.setDrawColor(230);

      doc.line(
        14,
        284,
        196,
        284
      );

      doc.setTextColor(120);

      doc.setFontSize(9);

      doc.text(
        `Dicetak ${new Date().toLocaleDateString(
          'id-ID'
        )}`,
        14,
        289
      );

      doc.text(
        'SR Agency System',
        196,
        289,
        {
          align: 'right',
        }
      );

      // =====================================
      // PAGE 2
      // =====================================

      doc.addPage();

      doc.setFillColor(
        248,
        250,
        252
      );

      doc.rect(
        0,
        0,
        210,
        297,
        'F'
      );

      // HEADER
      doc.setFillColor(
        255,
        255,
        255
      );

      doc.rect(
        0,
        0,
        210,
        28,
        'F'
      );

      doc.setFillColor(
        22,
        163,
        74
      );

      doc.rect(
        0,
        0,
        210,
        5,
        'F'
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(22);

      doc.setTextColor(20);

      doc.text(
        'Detail Transaksi',
        14,
        20
      );

      // CARD TABLE
      doc.setFillColor(
        255,
        255,
        255
      );

      doc.setDrawColor(230);

      doc.roundedRect(
        10,
        34,
        190,
        238,
        6,
        6,
        'FD'
      );

      // TABLE
      autoTable(doc, {
        startY: 42,

        theme: 'plain',

        head: [[
          'Tanggal',
          'Keterangan',
          'Voucher',
          'Pemasukan',
          'Pengeluaran',
          'Saldo',
        ]],

        body: rows.map(
          (r) => [
            r.tanggal,
            r.keterangan,
            r.voucher || '',
            formatRupiah(
              r.pemasukan || 0
            ),
            formatRupiah(
              r.pengeluaran || 0
            ),
            formatRupiah(r.saldo),
          ]
        ),

        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: 40,
          lineColor: [
            235,
            235,
            235,
          ],
          lineWidth: 0.3,
        },

        headStyles: {
          fillColor: [
            240,
            253,
            244,
          ],
          textColor: [
            22,
            163,
            74,
          ],
          fontStyle: 'bold',
        },

        alternateRowStyles: {
          fillColor: [
            250,
            250,
            250,
          ],
        },

        margin: {
          left: 14,
          right: 14,
        },

        columnStyles: {
          0: {
            cellWidth: 26,
          },

          1: {
            cellWidth: 46,
          },

          2: {
            cellWidth: 24,
            halign: 'center',
          },

          3: {
            cellWidth: 28,
            halign: 'right',
          },

          4: {
            cellWidth: 28,
            halign: 'right',
          },

          5: {
            cellWidth: 32,
            halign: 'right',
          },
        },

        didParseCell: (
          data
        ) => {
          if (
            data.column.index === 5 &&
            typeof data.cell.raw ===
            'string' &&
            data.cell.raw.includes(
              '-'
            )
          ) {
            data.cell.styles.textColor =
              [220, 38, 38];
          }
        },

        didDrawPage: () => {
          doc.setDrawColor(230);

          doc.line(
            14,
            284,
            196,
            284
          );

          doc.setFontSize(9);

          doc.setTextColor(120);

          doc.text(
            `Halaman ${doc.getNumberOfPages()}`,
            pageWidth / 2,
            289,
            {
              align: 'center',
            }
          );

          doc.text(
            'SR Agency System',
            196,
            289,
            {
              align: 'right',
            }
          );
        },
      });

      doc.save(
        `Buku-Kuning-${namaLabel}-${bulan}-${tahun}.pdf`
      );
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