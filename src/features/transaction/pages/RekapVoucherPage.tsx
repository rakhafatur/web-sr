import { useState } from 'react';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import Button from '../../../components/Button';
import FeaturePageHeader from '../../../components/FeaturePageHeader';

import {
  agregasiRekapVoucher,
  totalPerOutlet,
  type VoucherRow,
  type OutletGroup,
} from '../utils/rekapVoucher';
import { cetakRekapVoucherPdf } from '../utils/rekapVoucherPdf';

import {
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiGift,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
} from 'react-icons/fi';

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
    // padahal di sini selalu satu baris â€” jadi dinormalkan lewat unknown.
    const hasil = agregasiRekapVoucher(data as unknown as VoucherRow[]);

    setDataPerOutlet(hasil.perOutlet);
    setTotalVoucherAll(hasil.totalVoucher);
    setTotalNominalAll(hasil.totalNominal);
    setTotalUntungAll(hasil.totalUntung);
  };

  const handleExportPDF = () =>
    cetakRekapVoucherPdf({ dataPerOutlet, start, end });

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
                const { totalVoucher, totalNominal, totalUntung } =
                  totalPerOutlet(outletGroup);

                const totalHasil = totalUntung;

                const totalDidapat = totalNominal + totalUntung;

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
