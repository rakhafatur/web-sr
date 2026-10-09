import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiEye, FiEyeOff, FiGift, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import Skeleton from '../../../components/Skeleton';
import { TARGET_HARI_KERJA } from '../../absensi/utils/targetAbsensi';
import '../../../styles/desktop-admin.css';

type Props = {
  sapaan: string;
  nama: string;
  bulanIni: string;
  loading: boolean;
  hariMasuk: number;
  voucherPcs: number;
  voucherNominal: number;
  kasbon: number;
  /** null kalau belum ada hari masuk (tampil "–"). */
  rataVoucherPerHari: number | null;
  hideAmount: boolean;
  onToggleHide: () => void;
};

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const TERSEMBUNYI = '••••••••';

/**
 * Home ladies versi desktop — gaya dk-. Datanya sama persis dengan versi
 * mobile (diambil di HomeLadiesPage); komponen ini hanya menampilkan.
 * "Menu Cepat" mobile tidak ada di sini karena semua menunya sudah ada di
 * sidebar.
 */
const HomeLadiesDesktop = ({
  sapaan,
  nama,
  bulanIni,
  loading,
  hariMasuk,
  voucherPcs,
  voucherNominal,
  kasbon,
  rataVoucherPerHari,
  hideAmount,
  onToggleHide,
}: Props) => {
  const sisaHari = Math.max(TARGET_HARI_KERJA - hariMasuk, 0);
  const persenHadir = Math.min(hariMasuk / TARGET_HARI_KERJA, 1) * 100;

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader title={`${sapaan}, ${nama}`} description={`Ringkasan ${bulanIni}`} />

      {loading ? (
        <div className="dk-lh-grid" role="status" aria-label="Memuat ringkasan">
          <Skeleton height={208} borderRadius="var(--radius-xl)" style={{ gridColumn: 'span 2' }} />
          <Skeleton height={208} borderRadius="var(--radius-xl)" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={112} borderRadius="var(--radius-xl)" />
          ))}
        </div>
      ) : (
        <div className="dk-lh-grid">
          {/* Hero: kelas sama dengan mobile (HomeLadiesPage.css), diperbesar
              lewat dk-lh-hero. Selalu navy di kedua tema. */}
          <section className="ladies-home-hero dk-lh-hero" aria-label="Estimasi pendapatan">
            <div className="ladies-home-hero-circle" />

            <div className="ladies-home-hero-top">
              <span className="ladies-home-hero-label">Estimasi Pendapatan</span>
              <button
                type="button"
                className="ladies-home-eye-btn"
                onClick={onToggleHide}
                aria-label={hideAmount ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                aria-pressed={hideAmount}
              >
                {hideAmount ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="ladies-home-hero-amount">{hideAmount ? TERSEMBUNYI : rupiah(voucherNominal)}</div>
            <div className="ladies-home-hero-sub">Dari voucher · {bulanIni}</div>

            <div className="ladies-home-hero-foot">
              <span>Kasbon bulan ini</span>
              <span className="ladies-home-hero-foot-value">{hideAmount ? TERSEMBUNYI : rupiah(kasbon)}</span>
            </div>
          </section>

          <section className="dk-card dk-lh-tile" aria-label="Kehadiran bulan ini">
            <div className="dk-lh-tile-head">
              <span className="dk-kpi-label">Hari masuk</span>
              <span className="dk-lh-icon" aria-hidden><FiCalendar /></span>
            </div>

            <div className="dk-lh-hadir-angka">
              <span className="dk-lh-value">{hariMasuk}</span>
              <span className="dk-lh-unit">dari {TARGET_HARI_KERJA} hari</span>
            </div>

            <div
              className="dk-lh-progress"
              role="progressbar"
              aria-label="Progres target hari kerja"
              aria-valuemin={0}
              aria-valuemax={TARGET_HARI_KERJA}
              aria-valuenow={Math.min(hariMasuk, TARGET_HARI_KERJA)}
            >
              <div
                className={`dk-lh-progress-fill${sisaHari === 0 ? ' is-done' : ''}`}
                style={{ width: `${persenHadir}%` }}
              />
            </div>

            <div className="dk-lh-tile-foot">
              <span className="dk-kpi-sub">
                {sisaHari > 0 ? `${sisaHari} hari lagi menuju target` : 'Target bulan ini tercapai'}
              </span>
              <Link to="/ladies/absensi" className="dk-lh-link">
                Riwayat <FiArrowRight aria-hidden />
              </Link>
            </div>
          </section>

          <Link to="/ladies/voucher" className="dk-card dk-lh-tile dk-lh-tile--link">
            <div className="dk-lh-tile-head">
              <span className="dk-kpi-label">Voucher</span>
              <span className="dk-lh-icon" aria-hidden><FiGift /></span>
            </div>
            <div className="dk-lh-hadir-angka">
              <span className="dk-lh-value">{voucherPcs}</span>
              <span className="dk-lh-unit">pcs</span>
            </div>
            <span className="dk-kpi-sub">Lihat rincian voucher {bulanIni}</span>
          </Link>

          <section className="dk-card dk-lh-tile" aria-label="Rata-rata voucher per hari">
            <div className="dk-lh-tile-head">
              <span className="dk-kpi-label">Rata-rata</span>
              <span className="dk-lh-icon" aria-hidden><FiTrendingUp /></span>
            </div>
            <div className="dk-lh-hadir-angka">
              <span className="dk-lh-value">
                {rataVoucherPerHari === null
                  ? '–'
                  : rataVoucherPerHari.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
              </span>
              <span className="dk-lh-unit">pcs/hari</span>
            </div>
            <span className="dk-kpi-sub">Voucher dibagi hari masuk</span>
          </section>

          <Link to="/smart-chat-ladies" className="dk-card dk-lh-tile dk-lh-tile--link dk-lh-cta">
            <span className="dk-lh-cta-icon" aria-hidden><FiMessageCircle /></span>
            <span className="dk-lh-cta-text">
              <span className="dk-lh-cta-title">Tanya Smart Assistant</span>
              <span className="dk-kpi-sub">Cek voucher & absensi kamu</span>
            </span>
            <span className="dk-lh-cta-arrow" aria-hidden><FiArrowRight /></span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomeLadiesDesktop;
