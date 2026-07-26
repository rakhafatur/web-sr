import { useState } from 'react';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';

import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import Button from '../../../components/Button';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      ladies: v.ladies,
    })) as VoucherRow[];

    const grouped: Record<
      string,
      OutletGroup
    > = {};

    let totalVoucher = 0;
    let totalNominal = 0;

    vouchers.forEach((v) => {
      const lady = v.ladies;

      if (!lady) return;

      const outlet =
        lady.nama_outlet || 'Tanpa Outlet';

      const nama = lady.nama_ladies;

      const nominal = Number(v.jumlah);

      const pcs = nominal / 150000;

      totalVoucher += pcs;
      totalNominal += nominal;

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
      } else {
        grouped[outlet].data.push({
          nama_ladies: nama,
          totalVoucher: pcs,
          totalNominal: nominal,
        });
      }
    });

    setDataPerOutlet(
      Object.values(grouped)
    );

    setTotalVoucherAll(totalVoucher);

    setTotalNominalAll(totalNominal);
  };

  const handleExportPDF = () => {
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

          const lastY =
            (doc as any)
              .lastAutoTable.finalY || 0;

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
      {/* HERO */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, var(--color-green), var(--color-accent))',
          color: 'white',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: isMobile
                ? 54
                : 64,

              height: isMobile
                ? 54
                : 64,

              borderRadius: 18,

              background:
                'rgba(255,255,255,0.2)',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              fontSize: isMobile
                ? 22
                : 28,

              backdropFilter:
                'blur(8px)',
            }}
          >
            <FiGift />
          </div>

          <div>
            <h2
              className="fw-bold mb-0"
              style={{
                fontSize: isMobile
                  ? '1rem'
                  : '1.8rem',
              }}
            >
              Rekap Voucher
            </h2>

            <div
              style={{
                opacity: 0.85,

                fontSize: isMobile
                  ? '0.72rem'
                  : '0.92rem',

                marginTop: 2,
              }}
            >
              Monitoring voucher
              per outlet & ladies
            </div>
          </div>
        </div>
      </div>

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
              <Button variant="primary" fullWidth onClick={fetchData} icon={<FiRefreshCw />}>
                Tampilkan
              </Button>
            </div>

            {dataPerOutlet.length > 0 && (
              <div className="col-12 col-md-2">
                <Button variant="secondary" fullWidth onClick={handleExportPDF} icon={<FiDownload />}>
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
                      totalVoucherAll *
                      75000
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
                      totalVoucherAll *
                      225000
                    ),
                  icon: <FiUsers />,
                  bg: '#2a2340',
                  color: '#a78bfa',
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

                const totalHasil =
                  totalVoucher *
                  75000;

                const totalDidapat =
                  totalVoucher *
                  225000;

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
                                        row.totalVoucher *
                                        75000
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

                              render: (
                                row: any
                              ) =>
                                `${row.totalVoucher.toFixed(
                                  0
                                )} pcs`,
                            },

                            {
                              key:
                                'totalNominal',

                              label:
                                'Total Ladies',

                              render: (
                                row: any
                              ) =>
                                formatRupiah(
                                  row.totalNominal
                                ),
                            },

                            {
                              key:
                                'totalHasil',

                              label:
                                'Total Hasil',

                              render: (
                                row: any
                              ) =>
                                formatRupiah(
                                  row.totalVoucher *
                                  75000
                                ),
                            },

                            {
                              key:
                                'totalDidapat',

                              label:
                                'Total Didapat',

                              render: (
                                row: any
                              ) =>
                                formatRupiah(
                                  row.totalVoucher *
                                  225000
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
                                row.totalVoucher * 75000,

                              totalDidapat:
                                row.totalVoucher * 225000,
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