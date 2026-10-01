import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import PullToRefresh from '../../../components/PullToRefresh';
import Skeleton from '../../../components/Skeleton';
import MonthPill from './MonthPill';
import { buatGridBulan } from '../../absensi/utils/gridKalender';
import {
  hitungRekapAbsensi,
  type StatusAbsensi,
} from '../../absensi/utils/rekapAbsensi';
// Bar atas & hero sengaja memakai kelas yang sama dengan halaman riwayat
// (Voucher/Kasbon/…) supaya tampilannya identik.
import './LedgerPageMobile.css';
import './RiwayatAbsensiMobile.css';

type Props = {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  /** Status per tanggal "YYYY-MM-DD". */
  absensi: Record<string, string>;
  loading: boolean;
  onRefresh: () => Promise<unknown>;
};

const STATUS: Record<StatusAbsensi, { label: string; color: string; soft: string }> = {
  KERJA: { label: 'Kerja', color: 'var(--color-income)', soft: 'var(--color-income-soft)' },
  MENS: { label: 'Mens', color: 'var(--color-expense)', soft: 'var(--color-expense-soft)' },
  OFF: { label: 'Libur', color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' },
  SAKIT: { label: 'Sakit', color: 'var(--color-voucher)', soft: 'var(--color-voucher-soft)' },
};

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const statusDikenal = (s: string | undefined): s is StatusAbsensi =>
  !!s && s in STATUS;

/**
 * Riwayat Absensi versi mobile — selaras dengan halaman riwayat lain: bar
 * atas sendiri, pemilih bulan berbentuk pil, hero navy (hari kerja),
 * ringkasan Mens/Libur/Sakit, dan kalender buatan sendiri (minggu mulai
 * Senin, lingkaran berwarna per status, cincin di hari ini).
 */
const RiwayatAbsensiMobile = ({ currentDate, onMonthChange, absensi, loading, onRefresh }: Props) => {
  const navigate = useNavigate();
  const bulan = dayjs(currentDate);
  const labelBulan = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const hariIni = dayjs().format('YYYY-MM-DD');
  const bulanIniAtauLebih = !bulan.isBefore(dayjs(), 'month');

  const rekap = hitungRekapAbsensi(Object.values(absensi).map((status) => ({ status })));
  const totalTercatat = rekap.KERJA + rekap.MENS + rekap.OFF + rekap.SAKIT;
  const grid = buatGridBulan(bulan.year(), bulan.month());

  return (
    <PullToRefresh onRefresh={async () => { await onRefresh(); }}>
      <div className="lp">
        <header className="lp-bar">
          <button
            type="button"
            className="lp-icon-btn"
            onClick={() => navigate('/ladies/home')}
            aria-label="Kembali ke Home"
          >
            <FiArrowLeft />
          </button>
          <h1 className="lp-bar-title">Riwayat Absensi</h1>
          <span className="lp-icon-btn" aria-hidden />
        </header>

        <div className="lp-month">
          <MonthPill
            label={labelBulan}
            value={bulan.format('YYYY-MM')}
            max={dayjs().format('YYYY-MM')}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m] = e.target.value.split('-').map(Number);
              onMonthChange(new Date(y, m - 1, 1));
            }}
            onPrev={() => onMonthChange(bulan.subtract(1, 'month').startOf('month').toDate())}
            onNext={() => onMonthChange(bulan.add(1, 'month').startOf('month').toDate())}
            nextDisabled={bulanIniAtauLebih}
          />
        </div>

        {loading ? (
          <div className="lp-stack" role="status" aria-label="Memuat riwayat absensi">
            <Skeleton height={130} borderRadius="var(--radius-xl)" />
            <Skeleton height={110} borderRadius="var(--radius-xl)" />
            <Skeleton height={330} borderRadius="var(--radius-xl)" />
          </div>
        ) : (
          <div className="lp-stack">
            {/* HERO — hari kerja */}
            <section className="lp-hero" aria-label="Hari kerja">
              <div className="lp-hero-circle" />
              <div className="lp-hero-top">
                <span className="lp-hero-label">Hari Kerja</span>
                <span className="lp-hero-icon" aria-hidden><FiCalendar /></span>
              </div>
              <div className="lp-hero-value">{rekap.KERJA} hari</div>
              <div className="lp-hero-sub">
                {totalTercatat} hari tercatat · {labelBulan}
              </div>
            </section>

            {/* RINGKASAN — Mens, Libur, Sakit */}
            <section className="ra-overview" aria-label="Ringkasan hari tidak kerja">
              {(['MENS', 'OFF', 'SAKIT'] as const).map((key) => (
                <div key={key} className="ra-stat">
                  <span className="ra-stat-label">
                    <span className="ra-dot" style={{ background: STATUS[key].color }} />
                    {STATUS[key].label}
                  </span>
                  <span className="ra-stat-value">{rekap[key]}</span>
                  <span className="ra-stat-unit">hari</span>
                </div>
              ))}
            </section>

            {/* KALENDER */}
            <section className="ra-calendar" aria-label={`Kalender ${labelBulan}`}>
              <div className="ra-weekdays" aria-hidden>
                {NAMA_HARI.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              <div className="ra-grid">
                {grid.map((tanggal, i) => {
                  if (!tanggal) return <span key={`k${i}`} className="ra-cell" aria-hidden />;

                  const status = absensi[tanggal];
                  const meta = statusDikenal(status) ? STATUS[status] : null;
                  const isHariIni = tanggal === hariIni;
                  const isNanti = tanggal > hariIni;
                  const label = dayjs(tanggal).toDate().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  });

                  return (
                    <span
                      key={tanggal}
                      className="ra-cell"
                      aria-label={`${label}: ${meta ? meta.label : 'belum tercatat'}`}
                    >
                      <span
                        className={`ra-day ${isHariIni ? 'is-today' : ''} ${isNanti ? 'is-future' : ''}`}
                        style={meta ? { background: meta.soft, color: meta.color } : undefined}
                      >
                        {Number(tanggal.slice(8))}
                      </span>
                    </span>
                  );
                })}
              </div>

              <div className="ra-legend">
                {(Object.keys(STATUS) as StatusAbsensi[]).map((key) => (
                  <span key={key} className="ra-legend-item">
                    <span className="ra-dot" style={{ background: STATUS[key].color }} />
                    {STATUS[key].label}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default RiwayatAbsensiMobile;
