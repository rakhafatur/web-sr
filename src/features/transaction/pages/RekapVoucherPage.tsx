import { useState } from 'react';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import Button from '../../../components/Button';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import EmptyState from '../../../components/EmptyState';
import ListLoadingState from '../../../components/ListLoadingState';

import {
  agregasiRekapVoucher,
  totalPerOutlet,
  type VoucherRow,
  type OutletGroup,
} from '../utils/rekapVoucher';
import { cetakRekapVoucherPdf } from '../utils/rekapVoucherPdf';
import MobilePageBar from '../../../components/MobilePageBar';
import '../../../styles/mobile-admin.css';

import {
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiGift,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiInbox,
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

  // Halaman ini tidak memuat data sendiri — user harus menekan "Tampilkan".
  // Kedua penanda di bawah dipakai untuk membedakan tiga keadaan yang tampak
  // sama-sama kosong: belum pernah dicari, sedang memuat, dan sudah dicari
  // tapi memang tidak ada datanya.
  const [sudahCari, setSudahCari] = useState(false);
  const [memuat, setMemuat] = useState(false);

  const fetchData = async () => {
    setMemuat(true);

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
      setMemuat(false);
      toast.error('Gagal ambil data voucher');
      return;
    }

    // Supabase mengetik relasi `ladies` sebagai array untuk nested select,
    // padahal di sini selalu satu baris — jadi dinormalkan lewat unknown.
    const hasil = agregasiRekapVoucher(data as unknown as VoucherRow[]);

    setDataPerOutlet(hasil.perOutlet);
    setTotalVoucherAll(hasil.totalVoucher);
    setTotalNominalAll(hasil.totalNominal);
    setTotalUntungAll(hasil.totalUntung);

    setSudahCari(true);
    setMemuat(false);
  };

  const handleExportPDF = () =>
    cetakRekapVoucherPdf({ dataPerOutlet, start, end });

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout). Angka tetap dari agregasiRekapVoucher. Desktop: lama.
  if (isMobile) {
    const fmt = (d: string) =>
      new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    // Pintasan periode. "Minggu ini" = definisi bawaan halaman ini (state awal).
    const PINTASAN = [
      {
        label: 'Minggu ini',
        start: dayjs().startOf('week').add(1, 'day'),
        end: dayjs().endOf('week').add(1, 'day'),
      },
      { label: 'Bulan ini', start: dayjs().startOf('month'), end: dayjs().endOf('month') },
      {
        label: 'Bulan lalu',
        start: dayjs().subtract(1, 'month').startOf('month'),
        end: dayjs().subtract(1, 'month').endOf('month'),
      },
    ].map((p) => ({ ...p, start: p.start.format('YYYY-MM-DD'), end: p.end.format('YYYY-MM-DD') }));

    return (
      <div className="tm-page">
        <MobilePageBar title="Rekap Voucher" backTo="/" />

        <div className="tm-stack">
          <div className="tm-card">
            <div className="tm-chips" role="group" aria-label="Pintasan periode">
              {PINTASAN.map((p) => {
                const aktif = start === p.start && end === p.end;
                return (
                  <button
                    key={p.label}
                    type="button"
                    className={`tm-chip ${aktif ? 'is-active' : ''}`}
                    aria-pressed={aktif}
                    onClick={() => {
                      setStart(p.start);
                      setEnd(p.end);
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="tm-date-range">
              <div className="tm-field">
                <label htmlFor="rekap-dari" className="tm-label">Dari</label>
                <input
                  id="rekap-dari"
                  type="date"
                  className="tm-input tm-input--no-icon"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="tm-field">
                <label htmlFor="rekap-sampai" className="tm-label">Sampai</label>
                <input
                  id="rekap-sampai"
                  type="date"
                  className="tm-input tm-input--no-icon"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            <div className={dataPerOutlet.length > 0 ? 'tm-actions tm-actions--top' : 'tm-submit'}>
              <button
                type="button"
                className="tm-btn tm-btn--primary"
                style={{ width: '100%' }}
                onClick={fetchData}
                disabled={memuat}
              >
                <FiRefreshCw aria-hidden />
                {memuat ? 'Memuat...' : 'Tampilkan'}
              </button>
              {dataPerOutlet.length > 0 && (
                <button type="button" className="tm-btn" onClick={handleExportPDF}>
                  <FiDownload aria-hidden />
                  Unduh PDF
                </button>
              )}
            </div>
          </div>

          {memuat ? (
            <ListLoadingState label="Memuat rekap voucher" />
          ) : !sudahCari ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiCalendar /></span>
                <div className="tm-empty-title">Pilih periode dulu</div>
                <div className="tm-empty-text">Tentukan rentang tanggal, lalu tekan Tampilkan.</div>
              </div>
            </div>
          ) : dataPerOutlet.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiInbox /></span>
                <div className="tm-empty-title">Tidak ada voucher</div>
                <div className="tm-empty-text">Tidak ada voucher di periode ini. Coba ubah rentang tanggalnya.</div>
              </div>
            </div>
          ) : (
            <>
              <section className="tm-hero" aria-label="Ringkasan rekap">
                <div className="tm-hero-label">Total didapat</div>
                <div className="tm-hero-value">{formatRupiah(totalNominalAll + totalUntungAll)}</div>
                <div className="tm-hero-sub">
                  {totalVoucherAll.toFixed(0)} pcs · {fmt(start)} – {fmt(end)}
                </div>
                <div className="tm-hero-split">
                  <div>
                    <div className="tm-hero-split-label">Total ladies</div>
                    <div className="tm-hero-split-value">{formatRupiah(totalNominalAll)}</div>
                  </div>
                  <div>
                    <div className="tm-hero-split-label">Total hasil</div>
                    <div className="tm-hero-split-value">{formatRupiah(totalUntungAll)}</div>
                  </div>
                </div>
              </section>

              {dataPerOutlet.map((outletGroup) => {
                const { totalVoucher, totalNominal, totalUntung } = totalPerOutlet(outletGroup);

                return (
                  <section key={outletGroup.outlet} className="tm-group" aria-label={`Outlet ${outletGroup.outlet}`}>
                    <div className="tm-outlet-head">
                      <div className="tm-row-main">
                        <div className="tm-row-title">{outletGroup.outlet}</div>
                        <div className="tm-row-sub">{outletGroup.data.length} ladies</div>
                      </div>
                      <span className="tm-pill">{totalVoucher.toFixed(0)} pcs</span>
                    </div>

                    <div className="tm-list">
                      {outletGroup.data.map((row, i) => (
                        <div key={`${row.nama_ladies}-${i}`}>
                          <div className="tm-row">
                            <span className="tm-avatar" aria-hidden>
                              {(row.nama_ladies || '?').charAt(0).toUpperCase()}
                            </span>
                            <div className="tm-row-main">
                              <div className="tm-row-title">{row.nama_ladies}</div>
                              <div className="tm-row-sub">
                                Ladies {formatRupiah(row.totalNominal)} · Hasil {formatRupiah(row.totalUntung)}
                              </div>
                            </div>
                            <span className="tm-row-amount">{row.totalVoucher.toFixed(0)} pcs</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="tm-outlet-foot">
                      <div>
                        <span>Ladies</span>
                        <strong>{formatRupiah(totalNominal)}</strong>
                      </div>
                      <div>
                        <span>Hasil</span>
                        <strong>{formatRupiah(totalUntung)}</strong>
                      </div>
                      <div>
                        <span>Didapat</span>
                        <strong>{formatRupiah(totalNominal + totalUntung)}</strong>
                      </div>
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

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
                disabled={memuat}
                icon={
                  memuat ? (
                    <div className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <FiRefreshCw />
                  )
                }
                style={{ height: isMobile ? 50 : 56 }}
              >
                {memuat ? 'Memuat...' : 'Tampilkan'}
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

      {/* Tiga keadaan yang sama-sama tampak kosong dibedakan di sini, supaya
          layar kosong tidak lagi terbaca sebagai "datanya tidak ada". */}
      {memuat && <ListLoadingState label="Memuat rekap voucher" />}

      {!memuat && !sudahCari && (
        <EmptyState
          icon="🗓️"
          title="Pilih periode dulu"
          description="Tentukan rentang tanggal di atas, lalu tekan Tampilkan untuk melihat rekapnya."
        />
      )}

      {!memuat && sudahCari && dataPerOutlet.length === 0 && (
        <EmptyState
          icon="📭"
          title="Tidak ada voucher di periode ini"
          description="Coba ubah rentang tanggalnya."
        />
      )}

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

                            fontWeight: 700,

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

                    {/* TABEL LADIES */}
                    {(
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
