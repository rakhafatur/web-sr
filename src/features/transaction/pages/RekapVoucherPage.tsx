import { useState } from 'react';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import Button from '../../../components/Button';
import FeaturePageHeader from '../../../components/FeaturePageHeader';

import logo from '../../../assets/logosr-black.png';

import {
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiGift,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
} from 'react-icons/fi';

type VoucherRow = {
  jumlah: number;
  jumlah_voucher: number;
  outlet: string | null;
  untung: number | null;
  tanggal: string;
  ladies: {
    id: string;
    nama_ladies: string;
    nama_outlet: string;
  } | null;
};

type OutletGroup = {
  outlet: string;
  data: LadiesRekap[];
};

/** Satu baris rekap per ladies dalam sebuah outlet. */
type LadiesRekap = {
  nama_ladies: string;
  totalVoucher: number;
  totalNominal: number;
  totalUntung: number;
};

/** jspdf-autotable menambahkan properti ini ke doc saat runtime. */
type jsPDFWithAutoTable = {
  lastAutoTable?: { finalY: number };
};

const formatRupiah = (n: number) =>
  `Rp${n.toLocaleString('id-ID')}`;

const RekapVoucherPage = () => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [start, setStart] = useState(
    dayjs()
      .startOf('week')
      .add(1, 'day')
      .format('YYYY-MM-DD')
  );

  const [end, setEnd] = useState(
    dayjs()
      .endOf('week')
      .add(1, 'day')
      .format('YYYY-MM-DD')
  );

  const [dataPerOutlet, setDataPerOutlet] =
    useState<OutletGroup[]>([]);

  const [totalVoucherAll, setTotalVoucherAll] =
    useState(0);

  const [totalNominalAll, setTotalNominalAll] =
    useState(0);

  const [totalUntungAll, setTotalUntungAll] =
    useState(0);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('vouchers')
      .select(`
        jumlah,
        jumlah_voucher,
        outlet,
        untung,
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
      toast.error('Gagal ambil data voucher');
      return;
    }

    // Supabase mengetik relasi `ladies` sebagai array untuk nested select,
    // padahal di sini selalu satu baris — jadi dinormalkan lewat unknown.
    const vouchers = data as unknown as VoucherRow[];

    const grouped: Record<
      string,
      OutletGroup
    > = {};

    let totalVoucher = 0;
    let totalNominal = 0;
    let totalUntung = 0;

    vouchers.forEach((v) => {
      const lady = v.ladies;

      if (!lady) return;

      const outlet =
        v.outlet || lady.nama_outlet || 'Tanpa Outlet';

      const nama = lady.nama_ladies;

      const nominal = Number(v.jumlah);

      const pcs = Number(v.jumlah_voucher || 0);

      const untung =
        v.untung != null
          ? Number(v.untung)
          : pcs * 75000;

      totalVoucher += pcs;
      totalNominal += nominal;
      totalUntung += untung;

      if (!grouped[outlet]) {
        grouped[outlet] = {
          outlet,
          data: [],
        };
      }

      const existing =
        grouped[outlet].data.find(
          (d) =>
            d.nama_ladies === nama
        );

      if (existing) {
        existing.totalVoucher += pcs;
        existing.totalNominal += nominal;
        existing.totalUntung += untung;
      } else {
        grouped[outlet].data.push({
          nama_ladies: nama,
          totalVoucher: pcs,
          totalNominal: nominal,
          totalUntung: untung,
        });
      }
    });

    setDataPerOutlet(
      Object.values(grouped)
    );

    setTotalVoucherAll(totalVoucher);

    setTotalNominalAll(totalNominal);

    setTotalUntungAll(totalUntung);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();

    const img = new Image();

    img.src = logo;

    img.onload = () => {
      doc.addImage(
        img,
        'PNG',
        12,
        10,
        16,
        16
      );

      doc.setFontSize(15);

      doc.text(
        'REKAP VOUCHER PER OUTLET',
        32,
        18
      );

      doc.setFontSize(11);

      doc.text(
        `Periode ${start} s/d ${end}`,
        32,
        24
      );

      let currentY = 38;

      dataPerOutlet.forEach(
        (outletGroup) => {
          const tableData =
            outletGroup.data.map((d) => [
              d.nama_ladies,
              d.totalVoucher.toFixed(0),
              formatRupiah(
                d.totalNominal
              ),
            ]);

          const totalVoucherOutlet =
            outletGroup.data.reduce(
              (sum, d) =>
                sum + d.totalVoucher,
              0
            );

          doc.setFontSize(12);

          doc.text(
            `Outlet: ${outletGroup.outlet}`,
            14,
            currentY
          );

          autoTable(doc, {
            startY: currentY + 5,

            head: [
              [
                'Nama Ladies',
                'Voucher',
                'Total',
              ],
            ],

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

          // jspdf-autotable menempelkan `lastAutoTable` ke instance doc saat
          // runtime, tapi tidak ikut di type bawaan jsPDF.
          const lastY =
            (doc as jsPDFWithAutoTable)
              .lastAutoTable?.finalY || 0;

          doc.text(
            `Total Voucher: ${totalVoucherOutlet.toFixed(
              0
            )} pcs`,
            14,
            lastY + 7
          );

          currentY = lastY + 18;
        }
      );

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const pageWidth =
        doc.internal.pageSize.getWidth();

      doc.setFontSize(9);

      doc.text(
        `Dicetak ${dayjs().format(
          'DD/MM/YYYY HH:mm'
        )}`,
        14,
        pageHeight - 10
      );

      doc.text(
        'SR Agency',
        pageWidth - 14,
        pageHeight - 10,
        {
          align: 'right',
        }
      );

      doc.save(
        `Rekap-Voucher-${start}-${end}.pdf`
      );
    };
  };

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <FeaturePageHeader
        icon={<FiGift />}
        title="Rekap Voucher"
        description="Monitoring voucher per outlet & ladies"
      />

      {/* FILTER */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background:
              'linear-gradient(to right, var(--color-green-lighter), var(--color-surface))',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiCalendar
              style={{
                color:
                  'var(--color-green)',
              }}
            />

            <div>
              <div className="fw-bold">
                Filter Periode
              </div>

              <div
                style={{
                  fontSize:
                    '0.82rem',
                  color: 'var(--color-gray-500)',
                }}
              >
                Pilih periode
                voucher
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="fw-semibold mb-2">
                Dari Tanggal
              </label>

              <input
                type="date"
                className="form-control shadow-none"
                value={start}
                onChange={(e) =>
                  setStart(
                    e.target.value
                  )
                }
                style={{
                  height: isMobile
                    ? 50
                    : 56,

                  borderRadius: 16,

                  border:
                    '2px solid var(--color-green-light)',

                  paddingInline: 16,

                  fontSize: isMobile
                    ? '0.84rem'
                    : '0.92rem',
                }}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="fw-semibold mb-2">
                Sampai Tanggal
              </label>

              <input
                type="date"
                className="form-control shadow-none"
                value={end}
                onChange={(e) =>
                  setEnd(
                    e.target.value
                  )
                }
                style={{
                  height: isMobile
                    ? 50
                    : 56,

                  borderRadius: 16,

                  border:
                    '2px solid var(--color-green-light)',

                  paddingInline: 16,

                  fontSize: isMobile
                    ? '0.84rem'
                    : '0.92rem',
                }}
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="fw-semibold mb-2 d-none d-md-block" style={{ visibility: 'hidden' }}>
                Aksi
              </label>
              <Button
                variant="primary"
                fullWidth
                onClick={fetchData}
                icon={<FiRefreshCw />}
                style={{ height: isMobile ? 50 : 56 }}
              >
                Tampilkan
              </Button>
            </div>

            {dataPerOutlet.length > 0 && (
              <div className="col-12 col-md-2">
                <label className="fw-semibold mb-2 d-none d-md-block" style={{ visibility: 'hidden' }}>
                  Aksi
                </label>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleExportPDF}
                  icon={<FiDownload />}
                  style={{ height: isMobile ? 50 : 56 }}
                >
                  PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {dataPerOutlet.length >
        0 && (
          <>
            <div className="row g-3 mb-4">
              {[
                {
                  title:
                    'Total Voucher',
                  value: `${totalVoucherAll.toFixed(
                    0
                  )} pcs`,
                  icon: <FiGift />,
                  bg: 'var(--color-income-soft)',
                  color: 'var(--color-income)',
                },

                {
                  title:
                    'Total Ladies',
                  value:
                    formatRupiah(
                      totalNominalAll
                    ),
                  icon: (
                    <FiDollarSign />
                  ),
                  bg: 'var(--color-medical-soft)',
                  color: 'var(--color-medical)',
                },

                {
                  title:
                    'Total Hasil',
                  value:
                    formatRupiah(
                      totalUntungAll
                    ),
                  icon: (
                    <FiTrendingUp />
                  ),
                  bg: 'var(--color-voucher-soft)',
                  color: 'var(--color-voucher)',
                },

                {
                  title:
                    'Total Didapat',
                  value:
                    formatRupiah(
                      totalNominalAll +
                      totalUntungAll
                    ),
                  icon: <FiUsers />,
                  bg: 'var(--color-purple-soft)',
                  color: 'var(--color-purple)',
                },
              ].map((item) => (
                <div
                  className="col-6 col-lg-3"
                  key={item.title}
                >
                  <div
                    className="h-100"
                    style={{
                      background:
                        item.bg,

                      borderRadius:
                        isMobile
                          ? 16
                          : 22,

                      padding:
                        isMobile
                          ? '14px'
                          : '20px',

                      boxShadow:
                        '0 2px 10px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              isMobile
                                ? '0.68rem'
                                : '0.82rem',

                            color:
                              item.color,

                            fontWeight: 700,

                            opacity: 0.8,
                          }}
                        >
                          {item.title}
                        </div>

                        <div
                          style={{
                            fontSize:
                              isMobile
                                ? '0.95rem'
                                : '1.5rem',

                            fontWeight: 800,

                            lineHeight: 1.2,

                            color:
                              item.color,

                            marginTop: 4,

                            wordBreak:
                              'break-word',
                          }}
                        >
                          {item.value}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize:
                            isMobile
                              ? 18
                              : 24,

                          color:
                            item.color,

                          opacity: 0.7,
                        }}
                      >
                        {item.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* OUTLET */}
            {dataPerOutlet.map(
              (outletGroup, idx) => {
                const totalVoucher =
                  outletGroup.data.reduce(
                    (sum, d) =>
                      sum +
                      d.totalVoucher,
                    0
                  );

                const totalNominal =
                  outletGroup.data.reduce(
                    (sum, d) =>
                      sum +
                      d.totalNominal,
                    0
                  );

                const totalUntung =
                  outletGroup.data.reduce(
                    (sum, d) =>
                      sum +
                      d.totalUntung,
                    0
                  );

                const totalHasil =
                  totalUntung;

                const totalDidapat =
                  totalNominal +
                  totalUntung;

                return (
                  <div
                    key={idx}
                    className="card border-0 shadow-sm rounded-4 mb-4"
                    style={{
                      overflow:
                        'hidden',
                    }}
                  >
                    {/* HEADER */}
                    <div
                      className="px-4 py-3 border-bottom"
                      style={{
                        background:
                          'linear-gradient(to right, var(--color-surface), var(--color-green-lighter))',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div
                            className="fw-bold"
                            style={{
                              fontSize:
                                isMobile
                                  ? '0.95rem'
                                  : '1.05rem',

                              color:
                                'var(--color-dark)',
                            }}
                          >
                            {
                              outletGroup.outlet
                            }
                          </div>

                          <div
                            style={{
                              fontSize:
                                '0.78rem',

                              color:
                                'var(--color-gray-500)',
                            }}
                          >
                            {
                              outletGroup
                                .data
                                .length
                            }{' '}
                            ladies
                          </div>
                        </div>

                        <div
                          className="badge"
                          style={{
                            background:
                              'var(--color-income-soft)',

                            color:
                              'var(--color-income)',

                            fontSize:
                              '0.72rem',

                            padding:
                              '8px 12px',

                            borderRadius: 999,
                          }}
                        >
                          {totalVoucher.toFixed(
                            0
                          )}{' '}
                          pcs
                        </div>
                      </div>
                    </div>

                    {/* MOBILE CARD */}
                    {isMobile ? (
                      <div className="p-2">
                        {outletGroup.data.map(
                          (
                            row,
                            i
                          ) => (
                            <div
                              key={i}
                              className="mb-2"
                              style={{
                                border:
                                  '1px solid var(--color-gray-200)',

                                borderRadius: 18,

                                padding: 14,

                                background:
                                  'var(--color-surface)',
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-start gap-2">
                                <div
                                  style={{
                                    minWidth: 0,
                                  }}
                                >
                                  <div
                                    className="fw-bold"
                                    style={{
                                      fontSize:
                                        '0.84rem',

                                      color:
                                        'var(--color-dark)',
                                    }}
                                  >
                                    {
                                      row.nama_ladies
                                    }
                                  </div>

                                  <div
                                    style={{
                                      fontSize:
                                        '0.72rem',

                                      color:
                                        'var(--color-gray-500)',

                                      marginTop: 2,
                                    }}
                                  >
                                    Voucher{' '}
                                    {row.totalVoucher.toFixed(
                                      0
                                    )}{' '}
                                    pcs
                                  </div>
                                </div>

                                <div
                                  className="badge"
                                  style={{
                                    background:
                                      'var(--color-income-soft)',

                                    color:
                                      'var(--color-income)',

                                    borderRadius: 999,

                                    padding:
                                      '6px 10px',

                                    fontSize:
                                      '0.7rem',
                                  }}
                                >
                                  {row.totalVoucher.toFixed(
                                    0
                                  )}
                                </div>
                              </div>

                              <div className="row g-2 mt-2">
                                <div className="col-6">
                                  <div
                                    style={{
                                      background:
                                        'var(--color-surface-2)',

                                      borderRadius: 12,

                                      padding:
                                        '10px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize:
                                          '0.65rem',

                                        color:
                                          'var(--color-gray-500)',
                                      }}
                                    >
                                      Total Ladies
                                    </div>

                                    <div
                                      className="fw-bold"
                                      style={{
                                        fontSize:
                                          '0.74rem',
                                      }}
                                    >
                                      {formatRupiah(
                                        row.totalNominal
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="col-6">
                                  <div
                                    style={{
                                      background:
                                        'var(--color-surface-2)',

                                      borderRadius: 12,

                                      padding:
                                        '10px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize:
                                          '0.65rem',

                                        color:
                                          'var(--color-gray-500)',
                                      }}
                                    >
                                      Total Hasil
                                    </div>

                                    <div
                                      className="fw-bold"
                                      style={{
                                        fontSize:
                                          '0.74rem',
                                      }}
                                    >
                                      {formatRupiah(
                                        row.totalUntung
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="p-3">
                        <DataTable
                          columns={[
                            {
                              key:
                                'nama_ladies',
                              label:
                                'Nama Ladies',
                            },

                            {
                              key:
                                'totalVoucher',

                              label:
                                'Voucher',

                              render: (row) =>
                                `${row.totalVoucher.toFixed(
                                  0
                                )} pcs`,
                            },

                            {
                              key:
                                'totalNominal',

                              label:
                                'Total Ladies',

                              render: (row) =>
                                formatRupiah(
                                  row.totalNominal
                                ),
                            },

                            {
                              key:
                                'totalHasil',

                              label:
                                'Total Hasil',

                              render: (row) =>
                                formatRupiah(
                                  row.totalUntung
                                ),
                            },

                            {
                              key:
                                'totalDidapat',

                              label:
                                'Total Didapat',

                              render: (row) =>
                                formatRupiah(
                                  row.totalNominal +
                                  row.totalUntung
                                ),
                            },
                          ]}
                          data={outletGroup.data.map(
                            (
                              row,
                              i
                            ) => ({
                              id: `${outletGroup.outlet}-${i}`,

                              ...row,

                              totalHasil:
                                row.totalUntung,

                              totalDidapat:
                                row.totalNominal + row.totalUntung,
                            })
                          )}
                        />
                      </div>
                    )}

                    {/* FOOTER */}
                    <div
                      className="px-4 py-3 border-top"
                      style={{
                        background:
                          'var(--color-surface-2)',
                      }}
                    >
                      <div className="row g-2">
                        {[
                          {
                            label:
                              'Voucher',
                            value: `${totalVoucher.toFixed(
                              0
                            )} pcs`,
                          },

                          {
                            label:
                              'Total Ladies',
                            value:
                              formatRupiah(
                                totalNominal
                              ),
                          },

                          {
                            label:
                              'Total Hasil',
                            value:
                              formatRupiah(
                                totalHasil
                              ),
                          },

                          {
                            label:
                              'Total Didapat',
                            value:
                              formatRupiah(
                                totalDidapat
                              ),
                          },
                        ].map((item) => (
                          <div
                            className="col-6 col-lg-3"
                            key={
                              item.label
                            }
                          >
                            <div
                              style={{
                                background:
                                  'var(--color-surface)',

                                border:
                                  '1px solid var(--color-gray-200)',

                                borderRadius: 14,

                                padding:
                                  isMobile
                                    ? '10px'
                                    : '14px',
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    isMobile
                                      ? '0.65rem'
                                      : '0.75rem',

                                  color:
                                    'var(--color-gray-500)',
                                }}
                              >
                                {
                                  item.label
                                }
                              </div>

                              <div
                                className="fw-bold"
                                style={{
                                  fontSize:
                                    isMobile
                                      ? '0.78rem'
                                      : '0.92rem',

                                  marginTop: 2,

                                  color:
                                    'var(--color-dark)',
                                }}
                              >
                                {
                                  item.value
                                }
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </>
        )}
    </div>
  );
};

export default RekapVoucherPage;