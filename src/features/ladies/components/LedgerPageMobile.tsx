import { ReactNode } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { FiInbox } from 'react-icons/fi';
import PullToRefresh from '../../../components/PullToRefresh';
import Skeleton from '../../../components/Skeleton';
import MonthPill from './MonthPill';
import LadiesPageBar from './LadiesPageBar';
import './LedgerPageMobile.css';

export type LedgerItemMobile = {
  id: string;
  tanggal: string;
  mainValue: ReactNode;
  subValue?: ReactNode;
  keterangan?: string | null;
};

type Props = {
  title: string;
  icon: ReactNode;
  loading: boolean;
  onRefresh: () => Promise<unknown>;

  selectedMonth: Dayjs;
  onMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;

  summaryLabel: string;
  summaryValue: ReactNode;
  /** Baris kaki hero (opsional), mis. Estimasi Pendapatan di Voucher. */
  summaryFoot?: { label: string; value: ReactNode };

  items: LedgerItemMobile[];
  /** Warna nilai per baris — semantik kategori (kasbon merah, dst.). */
  valueColor: string;
  emptyMessage: string;
};

const namaBulan = (d: Dayjs) =>
  d.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

const tanggalPanjang = (t: string) =>
  dayjs(t).toDate().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });

const bulanSingkat = (t: string) =>
  dayjs(t).toDate().toLocaleDateString('id-ID', { month: 'short' });

/**
 * Tampilan mobile untuk halaman riwayat ladies (Voucher, Kasbon, Dokter,
 * Pemasukan Lain) — selaras dengan Home Ladies & Smart Chat: bar atas
 * sendiri (Header app dicabut di MainLayout), pemilih bulan berbentuk pil,
 * hero navy, dan daftar berkelompok tanpa paginasi. Desktop tetap memakai
 * tampilan lama di masing-masing halaman.
 */
const LedgerPageMobile = ({
  title,
  icon,
  loading,
  onRefresh,
  selectedMonth,
  onMonthChange,
  onPrev,
  onNext,
  nextDisabled,
  summaryLabel,
  summaryValue,
  summaryFoot,
  items,
  valueColor,
  emptyMessage,
}: Props) => {
  const bulan = namaBulan(selectedMonth);

  return (
    <PullToRefresh onRefresh={async () => { await onRefresh(); }}>
      <div className="lp">
        <LadiesPageBar title={title} />

        <div className="lp-month">
          <MonthPill
            label={bulan}
            value={selectedMonth.format('YYYY-MM')}
            max={dayjs().format('YYYY-MM')}
            onChange={onMonthChange}
            onPrev={onPrev}
            onNext={onNext}
            nextDisabled={nextDisabled}
          />
        </div>

        {loading ? (
          <div role="status" aria-label={`Memuat ${title.toLowerCase()}`} className="lp-stack">
            <Skeleton height={150} borderRadius="var(--radius-xl)" />
            <Skeleton width={90} height={16} />
            <div className="lp-group">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="lp-row">
                  <Skeleton width={44} height={44} borderRadius="var(--radius-md)" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={11} />
                  </div>
                  <Skeleton width={70} height={14} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="lp-stack">
            {/* HERO */}
            <section className="lp-hero" aria-label={summaryLabel}>
              <div className="lp-hero-circle" />
              <div className="lp-hero-top">
                <span className="lp-hero-label">{summaryLabel}</span>
                <span className="lp-hero-icon" aria-hidden>{icon}</span>
              </div>
              <div className="lp-hero-value">{summaryValue}</div>
              <div className="lp-hero-sub">
                {items.length} catatan · {bulan}
              </div>
              {summaryFoot && (
                <div className="lp-hero-foot">
                  <span>{summaryFoot.label}</span>
                  <span className="lp-hero-foot-value">{summaryFoot.value}</span>
                </div>
              )}
            </section>

            {/* RIWAYAT */}
            <div className="lp-section-head">
              <h2 className="lp-section-title">Riwayat</h2>
            </div>

            <div className="lp-group">
              {items.length === 0 ? (
                <div className="lp-empty">
                  <span className="lp-empty-icon" aria-hidden><FiInbox /></span>
                  <div className="lp-empty-text">{emptyMessage}</div>
                  <div className="lp-empty-hint">Coba pilih bulan lain</div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="lp-row">
                    <div className="lp-date" aria-hidden>
                      <span className="lp-date-day">{dayjs(item.tanggal).format('D')}</span>
                      <span className="lp-date-month">{bulanSingkat(item.tanggal)}</span>
                    </div>
                    <div className="lp-row-main">
                      <div className="lp-row-title">{tanggalPanjang(item.tanggal)}</div>
                      {item.keterangan && <div className="lp-row-note">{item.keterangan}</div>}
                    </div>
                    <div className="lp-row-value">
                      <div className="lp-row-amount" style={{ color: valueColor }}>{item.mainValue}</div>
                      {item.subValue && <div className="lp-row-sub">{item.subValue}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default LedgerPageMobile;
