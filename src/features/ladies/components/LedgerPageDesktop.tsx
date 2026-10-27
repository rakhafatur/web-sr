import { ReactNode } from 'react';
import type { Dayjs } from 'dayjs';
import { FiChevronLeft, FiChevronRight, FiInbox } from 'react-icons/fi';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import Skeleton from '../../../components/Skeleton';
import type { LedgerItemMobile } from './LedgerPageMobile';
import '../../../styles/desktop-admin.css';

export type KartuAngka = {
  label: string;
  nilai: ReactNode;
  sub?: string;
  /** Kartu utama disorot (warna aksen), mis. total bulan ini. */
  utama?: boolean;
};

type Props = {
  title: string;
  description: string;
  loading: boolean;

  selectedMonth: Dayjs;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;

  /** Kartu angka di atas tabel. Kartu "Catatan" (jumlah baris) ditambahkan otomatis. */
  kartu: KartuAngka[];

  /** Judul kolom nilai utama (mis. "Jumlah", "Voucher"). */
  kolomNilai: string;
  /** Judul kolom `subValue` kalau ada (mis. "Pendapatan" di Voucher). */
  kolomSub?: string;

  items: LedgerItemMobile[];
  /** Warna nilai per baris — semantik kategori (kasbon merah, dst.). */
  valueColor: string;
  emptyMessage: string;
};

const namaBulan = (d: Dayjs) => d.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

/** "2026-10-06" → "Sel, 6 Okt 2026". */
const tanggalPendek = (t: string) =>
  new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * Tampilan desktop halaman riwayat per jenis — ladies (Voucher, Kasbon,
 * Dokter, Pemasukan Lain) dan pengawas (Gaji, Pemasukan Lain, Kasbon).
 * Gaya dk- seperti Buku Kuning: header + navigasi bulan, kartu angka, lalu
 * tabel. Isinya sama dengan LedgerPageMobile; halaman yang menyusun datanya.
 */
const LedgerPageDesktop = ({
  title,
  description,
  loading,
  selectedMonth,
  onPrev,
  onNext,
  nextDisabled,
  kartu,
  kolomNilai,
  kolomSub,
  items,
  valueColor,
  emptyMessage,
}: Props) => {
  const bulan = namaBulan(selectedMonth);
  const semuaKartu: KartuAngka[] = [...kartu, { label: 'Catatan', nilai: items.length, sub: bulan }];
  const kolomKartu = { gridTemplateColumns: `repeat(${semuaKartu.length}, minmax(0, 1fr))` };

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title={title}
        description={description}
        actions={
          <div className="dk-month-nav dk-month-nav--pill">
            <button type="button" className="dk-icon-btn" aria-label="Bulan sebelumnya" onClick={onPrev}>
              <FiChevronLeft />
            </button>
            <span className="dk-month-label" aria-live="polite">{bulan}</span>
            <button
              type="button"
              className="dk-icon-btn"
              aria-label="Bulan berikutnya"
              onClick={onNext}
              disabled={nextDisabled}
            >
              <FiChevronRight />
            </button>
          </div>
        }
      />

      {loading ? (
        <div role="status" aria-label={`Memuat ${title.toLowerCase()}`}>
          <div className="dk-kpis" style={kolomKartu}>
            {semuaKartu.map((k) => (
              <Skeleton key={k.label} height={104} borderRadius="var(--radius-xl)" />
            ))}
          </div>
          <Skeleton height={320} borderRadius="var(--radius-xl)" />
        </div>
      ) : (
        <>
          <section className="dk-kpis" style={kolomKartu} aria-label={`Ringkasan ${bulan}`}>
            {semuaKartu.map((k) => (
              <div key={k.label} className={`dk-kpi ${k.utama ? 'is-main' : ''}`}>
                <span className="dk-kpi-label">{k.label}</span>
                <span className="dk-kpi-value">{k.nilai}</span>
                {k.sub && <span className="dk-kpi-sub">{k.sub}</span>}
              </div>
            ))}
          </section>

          <section className="dk-card" aria-label={`Riwayat ${bulan}`}>
            <div className="dk-card-head">
              <h2 className="dk-card-title">Riwayat {bulan}</h2>
              <div className="dk-card-sub">Terbaru di atas</div>
            </div>

            {items.length === 0 ? (
              <div className="dk-empty">
                <span className="dk-empty-icon" aria-hidden><FiInbox /></span>
                <div className="dk-empty-title">{emptyMessage}</div>
                <div className="dk-empty-text">Coba pilih bulan lain.</div>
              </div>
            ) : (
              <table className="dk-table">
                <thead>
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Keterangan</th>
                    {kolomSub && <th scope="col" className="dk-col-num">{kolomSub}</th>}
                    <th scope="col" className="dk-col-num">{kolomNilai}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="dk-nowrap">{tanggalPendek(item.tanggal)}</td>
                      <td>{item.keterangan || <span className="dk-muted">-</span>}</td>
                      {kolomSub && <td className="dk-col-num dk-num">{item.subValue}</td>}
                      <td className="dk-col-num dk-num dk-strong" style={{ color: valueColor }}>
                        {item.mainValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default LedgerPageDesktop;
