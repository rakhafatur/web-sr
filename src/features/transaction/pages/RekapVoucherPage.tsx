import { useState } from 'react';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import ListLoadingState from '../../../components/ListLoadingState';
import Skeleton from '../../../components/Skeleton';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';

import {
  agregasiRekapVoucher,
  totalPerOutlet,
  totalBeberapaOutlet,
  type VoucherRow,
  type OutletGroup,
} from '../utils/rekapVoucher';
import { cetakRekapVoucherPdf } from '../utils/rekapVoucherPdf';
import MobilePageBar from '../../../components/MobilePageBar';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

import {
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiInbox,
} from 'react-icons/fi';

const formatRupiah = (n: number) =>
  `Rp${n.toLocaleString('id-ID')}`;

const ISO = 'YYYY-MM-DD';

/** Senin minggu ini. dayjs memulai minggu hari Minggu, jadi startOf('week')
    + 1 hari keliru di hari Minggu (jatuh ke Senin besok / minggu depan). */
const seninIni = () => dayjs().subtract((dayjs().day() + 6) % 7, 'day').startOf('day');

/** Pilihan periode cepat (desktop). */
const PRESET_PERIODE: { key: string; label: string; rentang: () => [string, string] }[] = [
  {
    key: 'minggu-ini',
    label: 'Minggu ini',
    rentang: () => [seninIni().format(ISO), seninIni().add(6, 'day').format(ISO)],
  },
  {
    key: 'minggu-lalu',
    label: 'Minggu lalu',
    rentang: () => [seninIni().subtract(7, 'day').format(ISO), seninIni().subtract(1, 'day').format(ISO)],
  },
  {
    key: 'bulan-ini',
    label: 'Bulan ini',
    rentang: () => [dayjs().startOf('month').format(ISO), dayjs().endOf('month').format(ISO)],
  },
  {
    key: 'bulan-lalu',
    label: 'Bulan lalu',
    rentang: () => {
      const b = dayjs().subtract(1, 'month');
      return [b.startOf('month').format(ISO), b.endOf('month').format(ISO)];
    },
  },
];

const RekapVoucherPage = () => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  // Desktop: bawaan minggu ini (Senin–Minggu). Mobile: kosong — admin mengisi sendiri.
  const [start, setStart] = useState(() =>
    isMobile ? '' : PRESET_PERIODE[0].rentang()[0]
  );

  const [end, setEnd] = useState(() =>
    isMobile ? '' : PRESET_PERIODE[0].rentang()[1]
  );

  // Rentang data yang sedang tampil — label & PDF desktop memakai ini, bukan
  // isian tanggal yang bisa saja sudah diubah setelah Tampilkan ditekan.
  const [periodeTampil, setPeriodeTampil] = useState<{ start: string; end: string } | null>(null);

  // Pilihan outlet di mobile ('' = semua) — muncul setelah data ditampilkan.
  const [outletDipilih, setOutletDipilih] = useState('');

  const [dataPerOutlet, setDataPerOutlet] =
    useState<OutletGroup[]>([]);

  // Halaman ini tidak memuat data sendiri — user harus menekan "Tampilkan".
  // Kedua penanda di bawah dipakai untuk membedakan tiga keadaan yang tampak
  // sama-sama kosong: belum pernah dicari, sedang memuat, dan sudah dicari
  // tapi memang tidak ada datanya.
  const [sudahCari, setSudahCari] = useState(false);
  const [memuat, setMemuat] = useState(false);

  /** Tanpa argumen: memakai isian tanggal (mobile & tombol Tampilkan).
      Dengan argumen: pilihan periode cepat desktop, yang mengisi tanggal
      sekaligus memuat sebelum state tanggal sempat diperbarui. */
  const fetchData = async (dari: string = start, sampai: string = end) => {
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
      .gte('tanggal', dari)
      .lte('tanggal', sampai)
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

    setOutletDipilih('');
    setPeriodeTampil({ start: dari, end: sampai });
    setSudahCari(true);
    setMemuat(false);
  };

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout). Angka tetap dari agregasiRekapVoucher. Desktop: gaya dk- di bawah.
  if (isMobile) {
    const fmt = (d: string) =>
      new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    const tanggalLengkap = !!start && !!end;
    const tanggalTerbalik = tanggalLengkap && start > end;

    const tampilkan = () => {
      if (!tanggalLengkap) {
        toast.error('Isi tanggal Dari dan Sampai dulu.');
        return;
      }
      if (tanggalTerbalik) {
        toast.error('Tanggal "Dari" tidak boleh setelah "Sampai".');
        return;
      }
      fetchData();
    };

    // Data yang ditampilkan & dicetak mengikuti pilihan outlet.
    const outletTampil = outletDipilih
      ? dataPerOutlet.filter((o) => o.outlet === outletDipilih)
      : dataPerOutlet;
    const ringkas = totalBeberapaOutlet(outletTampil);

    return (
      <div className="tm-page">
        <MobilePageBar title="Rekap Voucher" backTo="/" />

        <div className="tm-stack">
          <div className="tm-card">
            <div className="tm-date-range">
              <div className="tm-field" style={{ marginTop: 0 }}>
                <label htmlFor="rekap-dari" className="tm-label">Dari</label>
                <input
                  id="rekap-dari"
                  type="date"
                  className="tm-input tm-input--no-icon"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="tm-field" style={{ marginTop: 0 }}>
                <label htmlFor="rekap-sampai" className="tm-label">Sampai</label>
                <input
                  id="rekap-sampai"
                  type="date"
                  min={start || undefined}
                  className={`tm-input tm-input--no-icon ${tanggalTerbalik ? 'is-invalid' : ''}`}
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
                onClick={tampilkan}
                disabled={memuat || !tanggalLengkap}
              >
                <FiRefreshCw aria-hidden />
                {memuat ? 'Memuat...' : 'Tampilkan'}
              </button>
              {dataPerOutlet.length > 0 && (
                <button
                  type="button"
                  className="tm-btn"
                  onClick={() => cetakRekapVoucherPdf({ dataPerOutlet: outletTampil, start, end })}
                >
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
                <div className="tm-empty-text">Isi tanggal Dari dan Sampai, lalu tekan Tampilkan.</div>
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
              <div className="tm-chips tm-chips--scroll" role="radiogroup" aria-label="Pilih outlet">
                {[{ value: '', label: 'Semua outlet' }, ...dataPerOutlet.map((o) => ({ value: o.outlet, label: o.outlet }))].map(
                  (o) => (
                    <button
                      key={o.value || 'semua'}
                      type="button"
                      role="radio"
                      aria-checked={outletDipilih === o.value}
                      className={`tm-chip ${outletDipilih === o.value ? 'is-active' : ''}`}
                      onClick={() => setOutletDipilih(o.value)}
                    >
                      {o.label}
                    </button>
                  )
                )}
              </div>

              <section className="tm-hero" aria-label="Ringkasan rekap">
                <div className="tm-hero-label">
                  Total didapat{outletDipilih ? ` · ${outletDipilih}` : ''}
                </div>
                <div className="tm-hero-value">{formatRupiah(ringkas.totalNominal + ringkas.totalUntung)}</div>
                <div className="tm-hero-sub">
                  {ringkas.totalVoucher.toFixed(0)} pcs · {fmt(start)} – {fmt(end)}
                </div>
                <div className="tm-hero-split">
                  <div>
                    <div className="tm-hero-split-label">Total ladies</div>
                    <div className="tm-hero-split-value">{formatRupiah(ringkas.totalNominal)}</div>
                  </div>
                  <div>
                    <div className="tm-hero-split-label">Total hasil</div>
                    <div className="tm-hero-split-value">{formatRupiah(ringkas.totalUntung)}</div>
                  </div>
                </div>
              </section>

              {outletTampil.map((outletGroup) => {
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

  // Desktop (gaya baru dk-): satu baris filter (tanggal + periode cepat),
  // pilihan outlet, kartu angka, lalu satu kartu tabel per outlet dengan
  // baris total. Angka tetap dari agregasiRekapVoucher / totalPerOutlet.
  const tanggalLengkap = !!start && !!end;
  const tanggalTerbalik = tanggalLengkap && start > end;

  const tampilkanDesktop = () => {
    if (!tanggalLengkap) {
      toast.error('Isi tanggal Dari dan Sampai dulu.');
      return;
    }
    if (tanggalTerbalik) {
      toast.error('Tanggal "Dari" tidak boleh setelah "Sampai".');
      return;
    }
    fetchData();
  };

  const pilihPreset = (rentang: [string, string]) => {
    setStart(rentang[0]);
    setEnd(rentang[1]);
    fetchData(rentang[0], rentang[1]);
  };

  const presetAktif = PRESET_PERIODE.find((p) => {
    const [s, e] = p.rentang();
    return s === start && e === end;
  })?.key;

  const tglPanjang = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const labelPeriode = periodeTampil ? `${tglPanjang(periodeTampil.start)} – ${tglPanjang(periodeTampil.end)}` : '';

  // Data yang ditampilkan & dicetak mengikuti pilihan outlet (sama seperti mobile).
  const outletTampil = outletDipilih ? dataPerOutlet.filter((o) => o.outlet === outletDipilih) : dataPerOutlet;
  const ringkas = totalBeberapaOutlet(outletTampil);

  const kartuAngka: { label: string; nilai: string; sub?: string; utama?: boolean }[] = [
    { label: 'Total voucher', nilai: `${ringkas.totalVoucher.toLocaleString('id-ID')} pcs` },
    { label: 'Bagian ladies', nilai: formatRupiah(ringkas.totalNominal) },
    { label: 'Hasil (untung agency)', nilai: formatRupiah(ringkas.totalUntung) },
    {
      label: 'Total didapat',
      nilai: formatRupiah(ringkas.totalNominal + ringkas.totalUntung),
      sub: 'Bagian ladies + hasil',
      utama: true,
    },
  ];

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Rekap voucher"
        description="Voucher per outlet & ladies — bagian ladies, hasil agency, dan total didapat"
        actions={
          dataPerOutlet.length > 0 && periodeTampil ? (
            <button
              type="button"
              className="dk-btn"
              onClick={() =>
                cetakRekapVoucherPdf({ dataPerOutlet: outletTampil, start: periodeTampil.start, end: periodeTampil.end })
              }
            >
              <FiDownload aria-hidden />
              Unduh PDF{outletDipilih ? ` · ${outletDipilih}` : ''}
            </button>
          ) : undefined
        }
      />

      <section className="dk-card dk-filterbar" aria-label="Periode rekap">
        <div className="dk-filterbar-dates">
          <div>
            <label htmlFor="dk-rekap-dari" className="dk-label">Dari</label>
            <input
              id="dk-rekap-dari"
              type="date"
              className="dk-input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <span className="dk-filterbar-sep" aria-hidden>–</span>
          <div>
            <label htmlFor="dk-rekap-sampai" className="dk-label">Sampai</label>
            <input
              id="dk-rekap-sampai"
              type="date"
              min={start || undefined}
              className={`dk-input ${tanggalTerbalik ? 'is-invalid' : ''}`}
              aria-invalid={tanggalTerbalik || undefined}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="dk-btn dk-btn--primary dk-filterbar-go"
            onClick={tampilkanDesktop}
            disabled={memuat || !tanggalLengkap}
          >
            <FiRefreshCw aria-hidden />
            {memuat ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>

        <div className="dk-filterbar-presets">
          <span className="dk-label" id="dk-rekap-preset-label">Periode cepat</span>
          <div className="dk-chips" role="group" aria-labelledby="dk-rekap-preset-label">
            {PRESET_PERIODE.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`dk-chip ${presetAktif === p.key ? 'is-active' : ''}`}
                aria-pressed={presetAktif === p.key}
                disabled={memuat}
                onClick={() => pilihPreset(p.rentang())}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {memuat && !sudahCari ? (
        <div role="status" aria-label="Memuat rekap voucher">
          <div className="dk-kpis">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={104} borderRadius="var(--radius-xl)" />
            ))}
          </div>
          <Skeleton height={320} borderRadius="var(--radius-xl)" />
        </div>
      ) : !sudahCari ? (
        <section className="dk-card">
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiCalendar /></span>
            <div className="dk-empty-title">Pilih periode dulu</div>
            <div className="dk-empty-text">Pilih periode cepat, atau isi tanggal lalu tekan Tampilkan.</div>
          </div>
        </section>
      ) : dataPerOutlet.length === 0 ? (
        <section className={`dk-card ${memuat ? 'dk-refetching' : ''}`}>
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiInbox /></span>
            <div className="dk-empty-title">Tidak ada voucher</div>
            <div className="dk-empty-text">Tidak ada voucher di {labelPeriode}. Coba ubah rentang tanggalnya.</div>
          </div>
        </section>
      ) : (
        // Memuat ulang (ganti periode): hasil sebelumnya ditahan redup.
        <div className={memuat ? 'dk-refetching' : undefined} aria-busy={memuat || undefined}>
          <div className="dk-rekap-bar">
            <div className="dk-chips" role="radiogroup" aria-label="Pilih outlet">
              {[{ value: '', label: 'Semua outlet' }, ...dataPerOutlet.map((o) => ({ value: o.outlet, label: o.outlet }))].map(
                (o) => (
                  <button
                    key={o.value || 'semua'}
                    type="button"
                    role="radio"
                    aria-checked={outletDipilih === o.value}
                    className={`dk-chip ${outletDipilih === o.value ? 'is-active' : ''}`}
                    onClick={() => setOutletDipilih(o.value)}
                  >
                    {o.label}
                  </button>
                )
              )}
            </div>
            <span className="dk-count">{labelPeriode}</span>
          </div>

          <section className="dk-kpis" aria-label="Ringkasan rekap">
            {kartuAngka.map((k) => (
              <div key={k.label} className={`dk-kpi ${k.utama ? 'is-main' : ''}`}>
                <span className="dk-kpi-label">{k.label}</span>
                <span className="dk-kpi-value">{k.nilai}</span>
                {k.sub && <span className="dk-kpi-sub">{k.sub}</span>}
              </div>
            ))}
          </section>

          <div className="dk-outlet-list">
            {outletTampil.map((outletGroup) => {
              const { totalVoucher, totalNominal, totalUntung } = totalPerOutlet(outletGroup);

              return (
                <section key={outletGroup.outlet} className="dk-card" aria-label={`Outlet ${outletGroup.outlet}`}>
                  <div className="dk-card-head dk-card-head--row">
                    <div>
                      <h2 className="dk-card-title">{outletGroup.outlet}</h2>
                      <div className="dk-card-sub">{outletGroup.data.length} ladies</div>
                    </div>
                    <span className="dk-pill">{totalVoucher.toLocaleString('id-ID')} pcs</span>
                  </div>

                  <table className="dk-table">
                    <thead>
                      <tr>
                        <th scope="col">Ladies</th>
                        <th scope="col" className="dk-col-num">Voucher</th>
                        <th scope="col" className="dk-col-num">Bagian ladies</th>
                        <th scope="col" className="dk-col-num">Hasil</th>
                        <th scope="col" className="dk-col-num">Didapat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outletGroup.data.map((row, i) => (
                        <tr key={`${row.nama_ladies}-${i}`}>
                          <td>
                            <div className="dk-person">
                              <span className="dk-avatar" aria-hidden>
                                {(row.nama_ladies || '?').charAt(0).toUpperCase()}
                              </span>
                              <span className="dk-person-label">{row.nama_ladies}</span>
                            </div>
                          </td>
                          <td className="dk-col-num dk-num">{row.totalVoucher.toLocaleString('id-ID')} pcs</td>
                          <td className="dk-col-num dk-num">{formatRupiah(row.totalNominal)}</td>
                          <td className="dk-col-num dk-num">{formatRupiah(row.totalUntung)}</td>
                          <td className="dk-col-num dk-num dk-strong">{formatRupiah(row.totalNominal + row.totalUntung)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row">Total {outletGroup.outlet}</th>
                        <td className="dk-col-num dk-num">{totalVoucher.toLocaleString('id-ID')} pcs</td>
                        <td className="dk-col-num dk-num">{formatRupiah(totalNominal)}</td>
                        <td className="dk-col-num dk-num">{formatRupiah(totalUntung)}</td>
                        <td className="dk-col-num dk-num">{formatRupiah(totalNominal + totalUntung)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapVoucherPage;
