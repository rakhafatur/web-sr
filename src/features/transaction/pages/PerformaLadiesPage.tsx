import { Fragment, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import {
  FiActivity,
  FiDollarSign,
  FiUsers,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import ListLoadingState from '../../../components/ListLoadingState';
import Skeleton from '../../../components/Skeleton';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import MonthPill from '../../ladies/components/MonthPill';
import { ringkasPerforma, posisiBatang } from '../utils/ringkasPerforma';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

const formatRupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
};

type PerformaSummary = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  voucherTotal: number;
  voucherAvg: number;
  kasbon: number;
  pemasukan: number;
  masuk: number;
  pendapatanVoucher: number;
  total: number;
};

type KunciAngka = 'voucherTotal' | 'masuk' | 'voucherAvg' | 'total' | 'pendapatanVoucher' | 'pemasukan' | 'kasbon';
type KunciUrut = KunciAngka | 'nama_ladies';

/** Kolom tabel desktop per mode. Kolom pertama = ukuran utama (diberi batang). */
const KOLOM_PERFORMA: Record<
  'aktivitas' | 'pendapatan',
  { key: KunciAngka; label: string; format: (n: number) => string }[]
> = {
  aktivitas: [
    { key: 'voucherTotal', label: 'Voucher', format: (n) => `${n.toLocaleString('id-ID')} pcs` },
    { key: 'masuk', label: 'Hari masuk', format: (n) => n.toLocaleString('id-ID') },
    {
      key: 'voucherAvg',
      label: 'Voucher / hari',
      format: (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    },
  ],
  pendapatan: [
    { key: 'total', label: 'Total bersih', format: formatRupiah },
    { key: 'pendapatanVoucher', label: 'Dari voucher', format: formatRupiah },
    { key: 'pemasukan', label: 'Pemasukan lain', format: formatRupiah },
    { key: 'kasbon', label: 'Kasbon', format: formatRupiah },
  ],
};

const PerformaLadiesPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [bulan, setBulan] = useState(dayjs().month() + 1);
  const [tahun, setTahun] = useState(dayjs().year());
  const [mode, setMode] = useState<'aktivitas' | 'pendapatan'>('aktivitas');
  const [cari, setCari] = useState('');
  // Khusus desktop: kolom pengurut tabel (null = ukuran utama mode, menurun).
  const [urut, setUrut] = useState<{ key: KunciUrut; arah: 'asc' | 'desc' } | null>(null);

  const { data: ladiesList = [] } = useQuery({
    queryKey: ['performa-ladies-aktif'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet')
        .eq('status', 'active');

      if (error) throw error;
      return (data ?? []) as Lady[];
    },
    meta: { errorLabel: 'data ladies' },
  });

  const { data = [], isLoading: loading, isPlaceholderData } = useQuery({
    queryKey: ['performa-summary', bulan, tahun, ladiesList.length],
    queryFn: async () => {
      const monthStr = String(bulan).padStart(2, '0');
      const startDate = dayjs(`${tahun}-${monthStr}-01`).startOf('month');
      const endDate = dayjs(`${tahun}-${monthStr}-01`).endOf('month');

      const [vouchers, kasbon, pemasukan, absensi] = await Promise.all([
        supabase.from('vouchers').select('jumlah, jumlah_voucher, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
        supabase.from('kasbon').select('jumlah, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
        supabase.from('pemasukan_lain').select('jumlah, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
        supabase.from('absensi').select('status, tanggal, ladies_id').gte('tanggal', startDate.format('YYYY-MM-DD')).lte('tanggal', endDate.format('YYYY-MM-DD')),
      ]);

      const summaryMap: Record<string, PerformaSummary> = {};

      ladiesList.forEach((lady) => {
        summaryMap[lady.id] = {
          id: lady.id,
          nama_ladies: lady.nama_ladies || `Unknown-${lady.id}`,
          nama_outlet: lady.nama_outlet || '-',
          voucherTotal: 0,
          voucherAvg: 0,
          kasbon: 0,
          pemasukan: 0,
          masuk: 0,
          pendapatanVoucher: 0,
          total: 0,
        };
      });

      (vouchers.data || []).forEach((v) => {
        if (v.ladies_id && summaryMap[v.ladies_id]) {
          summaryMap[v.ladies_id].voucherTotal += Number(v.jumlah_voucher || 0);
          summaryMap[v.ladies_id].pendapatanVoucher += Number(v.jumlah || 0);
        }
      });

      (kasbon.data || []).forEach((k) => {
        if (k.ladies_id && summaryMap[k.ladies_id]) summaryMap[k.ladies_id].kasbon += Number(k.jumlah || 0);
      });

      (pemasukan.data || []).forEach((p) => {
        if (p.ladies_id && summaryMap[p.ladies_id]) summaryMap[p.ladies_id].pemasukan += Number(p.jumlah || 0);
      });

      (absensi.data || []).forEach((a) => {
        const id = a.ladies_id;
        const status = (a.status || '').toLowerCase();
        if (!id || !summaryMap[id]) return;
        if (['kerja', 'masuk', 'hadir'].includes(status)) summaryMap[id].masuk += 1;
      });

      return Object.values(summaryMap).map((row) => ({
        ...row,
        voucherAvg: row.masuk > 0 ? row.voucherTotal / row.masuk : 0,
        total: row.pemasukan + row.pendapatanVoucher - row.kasbon,
      }));
    },
    enabled: ladiesList.length > 0,
    // Desktop: saat pindah bulan, tahan data bulan sebelumnya (diredupkan)
    // alih-alih kembali ke skeleton. Mobile tetap seperti sebelumnya.
    placeholderData: isMobile ? undefined : keepPreviousData,
    meta: { errorLabel: 'performa ladies' },
  });

  const memuatUlang = !isMobile && isPlaceholderData;

  const modeOptions = [
    { value: 'aktivitas' as const, label: 'Aktivitas', icon: <FiActivity size={14} /> },
    { value: 'pendapatan' as const, label: 'Pendapatan', icon: <FiDollarSign size={14} /> },
  ];

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout) — daftar peringkat per mode. Angka dari perhitungan di atas,
  // hanya diurutkan untuk tampilan. Desktop: gaya dk- di bawah.
  if (isMobile) {
    const labelBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
    const sekarang = dayjs();
    const diBulanIni = tahun === sekarang.year() && bulan === sekarang.month() + 1;
    const geserBulan = (arah: -1 | 1) => {
      const d = new Date(tahun, bulan - 1 + arah, 1);
      setBulan(d.getMonth() + 1);
      setTahun(d.getFullYear());
    };

    const kataKunci = cari.trim().toLowerCase();
    const peringkat = [...data]
      .sort((a, b) =>
        mode === 'aktivitas'
          ? b.voucherTotal - a.voucherTotal || b.masuk - a.masuk
          : b.total - a.total
      )
      .map((row, i) => ({ ...row, rank: i + 1 }))
      .filter(
        (row) =>
          !kataKunci ||
          row.nama_ladies.toLowerCase().includes(kataKunci) ||
          row.nama_outlet.toLowerCase().includes(kataKunci)
      );

    return (
      <div className="tm-page">
        <MobilePageBar title="Performa Ladies" backTo="/" />

        <div className="tm-stack">
          <MonthPill
            label={labelBulan}
            value={`${tahun}-${String(bulan).padStart(2, '0')}`}
            max={dayjs().format('YYYY-MM')}
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

          <div className="tm-segmented" role="tablist" aria-label="Mode tampilan">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={mode === opt.value}
                className={`tm-segment ${mode === opt.value ? 'is-active' : ''}`}
                onClick={() => setMode(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="tm-search">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Cari nama atau outlet..."
              aria-label="Cari ladies"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>

          {loading ? (
            <ListLoadingState label="Memuat performa ladies" />
          ) : data.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                <div className="tm-empty-title">Belum ada ladies aktif</div>
                <div className="tm-empty-text">Tambahkan data ladies untuk melihat performanya di sini.</div>
              </div>
            </div>
          ) : peringkat.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiSearch /></span>
                <div className="tm-empty-title">Ladies tidak ditemukan</div>
                <div className="tm-empty-text">Coba kata kunci lain.</div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="tm-section-title">
                Peringkat {mode === 'aktivitas' ? 'voucher' : 'pendapatan'} · {labelBulan}
              </h2>
              <div className="tm-group tm-list">
                {peringkat.map((row) => (
                  <div key={row.id}>
                    <div className="tm-row">
                      <span className={`tm-rank ${row.rank <= 3 ? 'is-top' : ''}`} aria-label={`Peringkat ${row.rank}`}>
                        {row.rank}
                      </span>
                      <div className="tm-row-main">
                        <div className="tm-row-title">{row.nama_ladies}</div>
                        <div className="tm-row-sub" style={{ whiteSpace: 'normal' }}>
                          {mode === 'aktivitas'
                            ? `${row.nama_outlet} · ${row.masuk} hari masuk · ${row.voucherAvg.toFixed(1)}/hari`
                            : `Voucher ${formatRupiah(row.pendapatanVoucher)} · Lain ${formatRupiah(row.pemasukan)} · Kasbon ${formatRupiah(row.kasbon)}`}
                        </div>
                      </div>
                      <span
                        className="tm-row-amount"
                        style={
                          mode === 'pendapatan'
                            ? { color: row.total < 0 ? 'var(--color-expense)' : 'var(--color-income)' }
                            : undefined
                        }
                      >
                        {mode === 'aktivitas'
                          ? `${row.voucherTotal.toFixed(0)} pcs`
                          : formatRupiah(row.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop (gaya baru dk-): filter (mode & bulan) satu baris di header,
  // kartu angka ringkasan, lalu tabel peringkat dengan batang di dalam baris —
  // pengganti grafik batang lama yang menumpuk voucher (pcs) & hari masuk di
  // satu sumbu dan nama ladies yang bertabrakan di sumbu X.
  const labelBulan = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
  const sekarang = dayjs();
  const diBulanIni = tahun === sekarang.year() && bulan === sekarang.month() + 1;
  const geserBulan = (arah: -1 | 1) => {
    const d = new Date(tahun, bulan - 1 + arah, 1);
    setBulan(d.getMonth() + 1);
    setTahun(d.getFullYear());
  };

  const ringkas = ringkasPerforma(data);

  // Peringkat selalu menurut ukuran utama mode (sama seperti mobile), apa pun
  // kolom yang sedang dipakai mengurutkan tabel.
  const peringkatId = new Map(
    [...data]
      .sort((a, b) =>
        mode === 'aktivitas' ? b.voucherTotal - a.voucherTotal || b.masuk - a.masuk : b.total - a.total
      )
      .map((row, i) => [row.id, i + 1])
  );

  const kolom = KOLOM_PERFORMA[mode];
  const kolomBatang = kolom[0];
  const nilaiBatang = data.map((row) => row[kolomBatang.key]);
  const adaMinus = nilaiBatang.some((v) => v < 0);
  const urutAktif = urut ?? { key: kolomBatang.key, arah: 'desc' as const };

  const kataKunci = cari.trim().toLowerCase();
  const baris = data
    .filter(
      (row) =>
        !kataKunci ||
        row.nama_ladies.toLowerCase().includes(kataKunci) ||
        row.nama_outlet.toLowerCase().includes(kataKunci)
    )
    .sort((a, b) => {
      const k = urutAktif.key;
      const hasil =
        k === 'nama_ladies'
          ? a.nama_ladies.localeCompare(b.nama_ladies, 'id')
          : a[k] - b[k] || (peringkatId.get(b.id) ?? 0) - (peringkatId.get(a.id) ?? 0);
      return urutAktif.arah === 'asc' ? hasil : -hasil;
    });

  const klikUrut = (key: KunciUrut) =>
    setUrut((prev) => {
      const sekarangAktif = prev ?? { key: kolomBatang.key, arah: 'desc' as const };
      if (sekarangAktif.key === key) return { key, arah: sekarangAktif.arah === 'desc' ? 'asc' : 'desc' };
      return { key, arah: key === 'nama_ladies' ? 'asc' : 'desc' };
    });

  const kepalaUrut = (key: KunciUrut, label: string, angka = false) => {
    const aktif = urutAktif.key === key;
    return (
      <th
        scope="col"
        className={angka ? 'dk-col-num' : undefined}
        aria-sort={aktif ? (urutAktif.arah === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <button type="button" className={`dk-th-sort ${aktif ? 'is-active' : ''}`} onClick={() => klikUrut(key)}>
          {label}
          {aktif ? urutAktif.arah === 'asc' ? <FiArrowUp aria-hidden /> : <FiArrowDown aria-hidden /> : null}
        </button>
      </th>
    );
  };

  const kartuAngka =
    mode === 'aktivitas'
      ? [
          { label: 'Total voucher', nilai: `${ringkas.voucherTotal.toLocaleString('id-ID')} pcs` },
          { label: 'Hari masuk', nilai: `${ringkas.masuk.toLocaleString('id-ID')} hari` },
          {
            label: 'Voucher per hari masuk',
            nilai: ringkas.voucherPerHari.toLocaleString('id-ID', { maximumFractionDigits: 1 }),
          },
          { label: 'Ladies menjual voucher', nilai: `${ringkas.ladiesBervoucher} dari ${data.length}` },
        ]
      : [
          { label: 'Dari voucher', nilai: formatRupiah(ringkas.pendapatanVoucher) },
          { label: 'Pemasukan lain', nilai: formatRupiah(ringkas.pemasukan) },
          { label: 'Kasbon', nilai: formatRupiah(ringkas.kasbon) },
          { label: 'Total bersih', nilai: formatRupiah(ringkas.total), utama: true },
        ];

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Performa ladies"
        description="Aktivitas & pendapatan ladies per bulan"
        actions={
          <>
            <div className="dk-segmented" role="tablist" aria-label="Mode tampilan">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={mode === opt.value}
                  className={`dk-segment ${mode === opt.value ? 'is-active' : ''}`}
                  onClick={() => {
                    setMode(opt.value);
                    setUrut(null);
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="dk-month-nav dk-month-nav--pill">
              <button type="button" className="dk-icon-btn" aria-label="Bulan sebelumnya" onClick={() => geserBulan(-1)}>
                <FiChevronLeft />
              </button>
              <span className="dk-month-label" aria-live="polite">{labelBulan}</span>
              <button
                type="button"
                className="dk-icon-btn"
                aria-label="Bulan berikutnya"
                onClick={() => geserBulan(1)}
                disabled={diBulanIni}
              >
                <FiChevronRight />
              </button>
            </div>
          </>
        }
      />

      {loading ? (
        <div role="status" aria-label="Memuat performa ladies">
          <div className="dk-kpis">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={92} borderRadius="var(--radius-xl)" />
            ))}
          </div>
          <Skeleton height={420} borderRadius="var(--radius-xl)" />
        </div>
      ) : data.length === 0 ? (
        <section className="dk-card">
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiUsers /></span>
            <div className="dk-empty-title">Belum ada ladies aktif</div>
            <div className="dk-empty-text">Tambahkan data ladies untuk melihat performanya di sini.</div>
          </div>
        </section>
      ) : (
        // Saat pindah bulan, data bulan sebelumnya tetap tampil redup sampai
        // data baru datang — tidak ada lompatan tata letak.
        <div className={memuatUlang ? 'dk-refetching' : undefined} aria-busy={memuatUlang || undefined}>
          <section className="dk-kpis" aria-label={`Ringkasan ${labelBulan}`}>
            {kartuAngka.map((k) => (
              <div key={k.label} className={`dk-kpi ${'utama' in k && k.utama ? 'is-main' : ''}`}>
                <span className="dk-kpi-label">{k.label}</span>
                <span className="dk-kpi-value">{k.nilai}</span>
              </div>
            ))}
          </section>

          <section className="dk-card" aria-label={`Peringkat ladies ${labelBulan}`}>
            <div className="dk-toolbar">
              <div className="dk-search">
                <FiSearch aria-hidden />
                <input
                  type="search"
                  placeholder="Cari nama atau outlet..."
                  aria-label="Cari ladies"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                />
              </div>
              <span className="dk-count">
                {kataKunci ? `${baris.length} dari ${data.length} ladies` : `${data.length} ladies aktif`}
              </span>
            </div>

            {baris.length === 0 ? (
              <div className="dk-empty">
                <span className="dk-empty-icon" aria-hidden><FiSearch /></span>
                <div className="dk-empty-title">Ladies tidak ditemukan</div>
                <div className="dk-empty-text">Coba kata kunci lain.</div>
              </div>
            ) : (
              <table className="dk-table dk-table--rank">
                <thead>
                  <tr>
                    <th scope="col" className="dk-col-rank">#</th>
                    {kepalaUrut('nama_ladies', 'Ladies')}
                    {kepalaUrut(kolomBatang.key, kolomBatang.label)}
                    {kolom.slice(1).map((c) => (
                      <Fragment key={c.key}>{kepalaUrut(c.key, c.label, true)}</Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {baris.map((row) => {
                    const rank = peringkatId.get(row.id) ?? 0;
                    const nilai = row[kolomBatang.key];
                    const pos = posisiBatang(nilai, nilaiBatang);
                    const warna =
                      mode === 'aktivitas'
                        ? 'var(--color-voucher)'
                        : nilai < 0
                          ? 'var(--color-expense)'
                          : 'var(--color-income)';

                    return (
                      <tr key={row.id}>
                        <td className="dk-col-rank">
                          <span className={`dk-rank ${rank <= 3 ? 'is-top' : ''}`} aria-label={`Peringkat ${rank}`}>
                            {rank}
                          </span>
                        </td>
                        <td>
                          <div className="dk-person-label">{row.nama_ladies}</div>
                          <div className="dk-person-sub">{row.nama_outlet}</div>
                        </td>
                        <td className="dk-col-bar">
                          <div className="dk-bar">
                            <div className="dk-bar-track" aria-hidden>
                              {adaMinus && <span className="dk-bar-zero" style={{ left: `${pos.nol}%` }} />}
                              {pos.lebar > 0 && (
                                <span
                                  className={`dk-bar-fill ${nilai < 0 ? 'is-neg' : ''}`}
                                  style={{ left: `${pos.kiri}%`, width: `${pos.lebar}%`, background: warna }}
                                />
                              )}
                            </div>
                            <span className="dk-bar-value dk-num">{kolomBatang.format(nilai)}</span>
                          </div>
                        </td>
                        {kolom.slice(1).map((c) => (
                          <td key={c.key} className="dk-col-num dk-num">
                            {c.format(row[c.key])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default PerformaLadiesPage;
