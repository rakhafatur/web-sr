import { ReactNode } from 'react';
import { FiBook, FiPrinter, FiUsers, FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import SearchableSelect, { type SearchableOption } from '../../../components/SearchableSelect';
import Skeleton from '../../../components/Skeleton';
import { ringkasanBukuKuning, type SaldoRow } from '../utils/saldoBerjalan';
import '../../../styles/desktop-admin.css';

type Props = {
  title: string;
  description: string;
  /** "Ladies" / "Pengawas" — dipakai di label & pesan kosong. */
  entitas: string;
  options: SearchableOption[];
  selectedId: string;
  onSelect: (id: string) => void;

  bulan: number;
  tahun: number;
  onPeriodeChange: (bulan: number, tahun: number) => void;

  loading: boolean;
  rows: SaldoRow[];
  labelPemasukan: string;
  labelPengeluaran: string;
  /** Kolom voucher (pcs) — hanya ladies. */
  tampilkanVoucher?: boolean;

  onTutupBuku: () => void;
  onCetak: () => void;
  /** Aksi di header halaman (mis. Generate Biaya Bulanan). */
  aksiHeader?: ReactNode;
};

/** Nominal kosong ('') berarti kolom itu tidak berlaku untuk barisnya. */
const rupiah = (n: number | string) => {
  if (n === '' || n === null || n === undefined) return '';
  const angka = typeof n === 'string' ? parseFloat(n) : n;
  return `Rp${(angka || 0).toLocaleString('id-ID')}`;
};

/** Saldo bertanda: minus diberi "−" supaya terbaca tanpa warna. */
const rupiahSaldo = (n: number) =>
  n < 0 ? `−Rp${Math.abs(n).toLocaleString('id-ID')}` : `Rp${n.toLocaleString('id-ID')}`;

/** "2026-10-06" → "Sel, 6 Okt". */
const tanggalPendek = (t: string) =>
  new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * Buku Kuning versi desktop (ladies & pengawas) — gaya dk-. Pemilih entitas &
 * bulan di satu baris, kartu angka saldo, lalu tabel transaksi dengan saldo
 * berjalan; Tutup Buku & Cetak di kepala tabel karena keduanya bekerja pada
 * entitas & periode yang sedang ditampilkan.
 * Data & aksi datang dari halaman; komponen ini hanya menampilkan.
 */
const BukuKuningDesktop = ({
  title,
  description,
  entitas,
  options,
  selectedId,
  onSelect,
  bulan,
  tahun,
  onPeriodeChange,
  loading,
  rows,
  labelPemasukan,
  labelPengeluaran,
  tampilkanVoucher = false,
  onTutupBuku,
  onCetak,
  aksiHeader,
}: Props) => {
  const ringkasan = ringkasanBukuKuning(rows);
  const labelPeriode = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
  const sekarang = new Date();
  const diBulanIni = tahun === sekarang.getFullYear() && bulan === sekarang.getMonth() + 1;
  const geserBulan = (arah: -1 | 1) => {
    const d = new Date(tahun, bulan - 1 + arah, 1);
    onPeriodeChange(d.getMonth() + 1, d.getFullYear());
  };

  const entitasKecil = entitas.toLowerCase();
  const terpilih = options.find((o) => o.value === selectedId);
  // Baris pertama selalu baris pembuka (saldo awal) dari hitungSaldoBerjalan.
  const [pembuka, ...transaksi] = rows;
  const jumlahKolom = tampilkanVoucher ? 6 : 5;

  const kartuAngka = [
    { label: 'Saldo awal', nilai: rupiahSaldo(ringkasan.saldoAwal), sub: 'Dari tutup buku bulan lalu' },
    { label: labelPemasukan, nilai: `+${rupiah(ringkasan.totalPemasukan)}` },
    { label: labelPengeluaran, nilai: `−${rupiah(ringkasan.totalPengeluaran)}` },
    {
      label: 'Saldo akhir',
      nilai: rupiahSaldo(ringkasan.saldoAkhir),
      sub: `${ringkasan.jumlahTransaksi} transaksi · ${labelPeriode}`,
      utama: true,
    },
  ];

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader title={title} description={description} actions={aksiHeader} />

      <section className="dk-card dk-pickbar" aria-label={`Pilih ${entitasKecil} & periode`}>
        <div className="dk-pickbar-field">
          <span className="dk-label">{entitas}</span>
          <SearchableSelect
            value={selectedId}
            onChange={onSelect}
            options={options}
            placeholder={`Pilih ${entitasKecil}`}
            searchPlaceholder={`Cari nama ${entitasKecil}...`}
            height={44}
            borderRadius={999}
            fontSize="15px"
          />
        </div>

        <div>
          <span className="dk-label">Periode</span>
          <div className="dk-month-nav dk-month-nav--pill">
            <button type="button" className="dk-icon-btn" aria-label="Bulan sebelumnya" onClick={() => geserBulan(-1)}>
              <FiChevronLeft />
            </button>
            <span className="dk-month-label" aria-live="polite">{labelPeriode}</span>
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
        </div>
      </section>

      {!selectedId ? (
        <section className="dk-card">
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiUsers /></span>
            <div className="dk-empty-title">Pilih {entitasKecil} dulu</div>
            <div className="dk-empty-text">Saldo dan daftar transaksi akan muncul setelah {entitasKecil} dipilih.</div>
          </div>
        </section>
      ) : loading ? (
        <div role="status" aria-label="Memuat buku kuning">
          <div className="dk-kpis">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={104} borderRadius="var(--radius-xl)" />
            ))}
          </div>
          <Skeleton height={380} borderRadius="var(--radius-xl)" />
        </div>
      ) : (
        <>
          <section className="dk-kpis" aria-label={`Ringkasan ${labelPeriode}`}>
            {kartuAngka.map((k) => (
              <div key={k.label} className={`dk-kpi ${k.utama ? 'is-main' : ''}`}>
                <span className="dk-kpi-label">{k.label}</span>
                <span className="dk-kpi-value">{k.nilai}</span>
                {k.sub && <span className="dk-kpi-sub">{k.sub}</span>}
              </div>
            ))}
          </section>

          <section className="dk-card" aria-label={`Transaksi ${labelPeriode}`}>
            <div className="dk-card-head dk-card-head--row">
              <div>
                <h2 className="dk-card-title">Transaksi {labelPeriode}</h2>
                <div className="dk-card-sub">
                  {terpilih?.label ?? entitas} · saldo berjalan dari saldo awal
                </div>
              </div>
              <div className="dk-head-actions">
                <button type="button" className="dk-btn" onClick={onCetak}>
                  <FiPrinter aria-hidden />
                  Cetak PDF
                </button>
                <button type="button" className="dk-btn dk-btn--primary" onClick={onTutupBuku}>
                  <FiBook aria-hidden />
                  Tutup buku
                </button>
              </div>
            </div>

            <table className="dk-table dk-table--ledger">
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Keterangan</th>
                  {tampilkanVoucher && <th scope="col" className="dk-col-num">Voucher</th>}
                  <th scope="col" className="dk-col-num">{labelPemasukan}</th>
                  <th scope="col" className="dk-col-num">{labelPengeluaran}</th>
                  <th scope="col" className="dk-col-num">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {pembuka && (
                  <tr className="dk-row-opening">
                    <td colSpan={jumlahKolom - 1}>
                      {pembuka.tanggal} <span className="dk-muted">· saldo awal dari tutup buku bulan lalu</span>
                    </td>
                    <td className="dk-col-num dk-num">{rupiahSaldo(pembuka.saldo)}</td>
                  </tr>
                )}

                {transaksi.length === 0 ? (
                  <tr>
                    <td colSpan={jumlahKolom}>
                      <div className="dk-empty dk-empty--inline">
                        <span className="dk-empty-icon" aria-hidden><FiInbox /></span>
                        <div className="dk-empty-title">Belum ada transaksi di {labelPeriode}</div>
                        <div className="dk-empty-text">Saldo akhir sama dengan saldo awal.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transaksi.map((r, i) => (
                    <tr key={`${r.tanggal}-${i}`}>
                      <td className="dk-nowrap">{tanggalPendek(r.tanggal)}</td>
                      <td>{r.keterangan || <span className="dk-muted">-</span>}</td>
                      {tampilkanVoucher && (
                        <td className="dk-col-num dk-num">{r.voucher === '' ? '' : `${r.voucher} pcs`}</td>
                      )}
                      <td className="dk-col-num dk-num">{r.pemasukan === '' ? '' : `+${rupiah(r.pemasukan)}`}</td>
                      <td className="dk-col-num dk-num">{r.pengeluaran === '' ? '' : `−${rupiah(r.pengeluaran)}`}</td>
                      <td className={`dk-col-num dk-num dk-saldo ${r.saldo < 0 ? 'is-minus' : ''}`}>
                        {rupiahSaldo(r.saldo)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
};

export default BukuKuningDesktop;
