import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiUsers } from 'react-icons/fi';

import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import ListLoadingState from '../../../components/ListLoadingState';
import PullToRefresh from '../../../components/PullToRefresh';
import Skeleton from '../../../components/Skeleton';
import MonthPill from '../../ladies/components/MonthPill';
import { useMonthNavigation } from '../../ladies/hooks/useMonthNavigation';
import { TARGET_HARI_KERJA } from '../../absensi/utils/targetAbsensi';
import type { BarisTarget, StatusTarget } from '../../absensi/utils/targetLadies';
import { BERANDA } from '../../../layout/peran';
import { useTargetLadies } from '../hooks/useTargetLadies';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';
import '../pengawas.css';

type Filter = 'kurang' | 'semua';

/** Warna semantik per status: hijau tercapai, kuning masih bisa dikejar, merah tidak. */
const GAYA: Record<StatusTarget, { label: string; color: string; soft: string }> = {
  tercapai: { label: 'Tercapai', color: 'var(--color-income)', soft: 'var(--color-income-soft)' },
  mengejar: { label: 'Masih bisa dikejar', color: 'var(--color-voucher)', soft: 'var(--color-voucher-soft)' },
  'tidak-tercapai': { label: 'Tidak tercapai', color: 'var(--color-expense)', soft: 'var(--color-expense-soft)' },
};

const namaBulan = (d: Dayjs) => d.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

const labelBadge = (b: BarisTarget) => (b.status === 'tercapai' ? 'Tercapai' : `Kurang ${b.kurang} hari`);

/** Keterangan di bawah nama: outlet + kenapa statusnya begitu. */
const keterangan = (b: BarisTarget, bulanBerjalan: boolean) => {
  const bagian = [b.outlet || '-'];
  if (bulanBerjalan && b.status !== 'tercapai') {
    bagian.push(b.status === 'mengejar' ? `sisa ${b.sisaHari} hari` : `sisa ${b.sisaHari} hari · tidak terkejar`);
  }
  return bagian.join(' · ');
};

const persen = (b: BarisTarget) => Math.min(b.hariKerja / TARGET_HARI_KERJA, 1);

/**
 * Target Absen (pengawas): semua ladies aktif dalam satu bulan — siapa yang
 * belum mencapai target hari kerja, kurang berapa hari, dan apakah masih
 * terkejar dengan sisa hari bulan itu. Hanya-baca; absensi tetap dicatat
 * admin. Perhitungannya di absensi/utils/targetLadies.ts.
 */
const TargetAbsenPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { selectedMonth, handleMonthChange, prevMonth, nextMonth, isNextDisabled } = useMonthNavigation();
  const [filter, setFilter] = useState<Filter>('kurang');

  const { baris, loading, refetch } = useTargetLadies(selectedMonth);

  const bulan = namaBulan(selectedMonth);
  const bulanBerjalan = selectedMonth.isSame(dayjs(), 'month');

  const hitung = (s: StatusTarget) => baris.filter((b) => b.status === s).length;
  const jumlah = { tercapai: hitung('tercapai'), mengejar: hitung('mengejar'), tidak: hitung('tidak-tercapai') };
  const jumlahKurang = jumlah.mengejar + jumlah.tidak;
  const terlihat = filter === 'kurang' ? baris.filter((b) => b.status !== 'tercapai') : baris;

  // "Masih bisa dikejar" hanya mungkin di bulan berjalan — bulan yang sudah
  // lewat tidak punya sisa hari.
  const statusTampil: StatusTarget[] = bulanBerjalan
    ? ['tercapai', 'mengejar', 'tidak-tercapai']
    : ['tercapai', 'tidak-tercapai'];
  const jumlahStatus: Record<StatusTarget, number> = {
    tercapai: jumlah.tercapai,
    mengejar: jumlah.mengejar,
    'tidak-tercapai': jumlah.tidak,
  };

  const opsiFilter: { key: Filter; label: string; jumlah: number }[] = [
    { key: 'kurang', label: 'Kurang target', jumlah: jumlahKurang },
    { key: 'semua', label: 'Semua', jumlah: baris.length },
  ];

  const ringkasTeks =
    baris.length === 0
      ? 'Belum ada ladies aktif'
      : jumlahKurang === 0
        ? 'Semua ladies sudah memenuhi target'
        : `${jumlahKurang} dari ${baris.length} ladies belum mencapai ${TARGET_HARI_KERJA} hari kerja`;

  const kosong =
    baris.length === 0
      ? { icon: <FiUsers />, judul: 'Belum ada ladies aktif', teks: 'Ladies berstatus aktif akan muncul di sini.' }
      : { icon: <FiCheckCircle />, judul: 'Semua sudah memenuhi target', teks: `Tidak ada ladies yang kurang target di ${bulan}.` };

  // =========================================================
  // MOBILE
  // =========================================================
  if (isMobile) {
    return (
      <PullToRefresh onRefresh={refetch}>
        <div className="tm-page">
          <MobilePageBar title="Target Absen" backTo={BERANDA.pengawas} />

          <div className="tm-stack">
            <MonthPill
              label={bulan}
              value={selectedMonth.format('YYYY-MM')}
              max={dayjs().format('YYYY-MM')}
              onChange={handleMonthChange}
              onPrev={prevMonth}
              onNext={nextMonth}
              nextDisabled={isNextDisabled}
            />

            <section className="tm-card" aria-label="Ringkasan target">
              {loading ? (
                <div role="status" aria-label="Memuat ringkasan target">
                  <Skeleton width="40%" height={13} />
                  <Skeleton width="55%" height={30} style={{ marginTop: 10 }} />
                  <Skeleton width="80%" height={13} style={{ marginTop: 14 }} />
                </div>
              ) : (
                <>
                  <span className="tm-label" style={{ marginBottom: 2 }}>Kurang target</span>
                  <div className="tm-ah-count">
                    <strong>{jumlahKurang}</strong>
                    <span>/ {baris.length} ladies</span>
                  </div>

                  <div className="tm-ah-legend">
                    {statusTampil.map((s) => (
                      <span key={s}>
                        <span className="tm-dot" style={{ background: GAYA[s].color }} aria-hidden />
                        {GAYA[s].label} <strong>{jumlahStatus[s]}</strong>
                      </span>
                    ))}
                  </div>

                  <div className="tm-help" style={{ marginBottom: 0 }}>
                    Target {TARGET_HARI_KERJA} hari kerja sebulan.
                    {bulanBerjalan && ' Sisa hari = tanggal tersisa bulan ini yang belum diabsen.'}
                  </div>
                </>
              )}
            </section>

            <div className="tm-segmented" role="group" aria-label="Saring daftar">
              {opsiFilter.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  className={`tm-segment ${filter === f.key ? 'is-active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label} ({loading ? '–' : f.jumlah})
                </button>
              ))}
            </div>

            {loading ? (
              <ListLoadingState label="Memuat daftar ladies" rows={6} />
            ) : terlihat.length === 0 ? (
              <div className="tm-group">
                <div className="tm-empty">
                  <span className="tm-empty-icon" aria-hidden>{kosong.icon}</span>
                  <div className="tm-empty-title">{kosong.judul}</div>
                  <div className="tm-empty-text">{kosong.teks}</div>
                </div>
              </div>
            ) : (
              <ul className="tm-group tm-tg-list">
                {terlihat.map((b) => {
                  const g = GAYA[b.status];
                  return (
                    <li key={b.id} className="tm-tg-row">
                      <span className="tm-tg-avatar" style={{ background: g.soft, color: g.color }} aria-hidden>
                        {(b.nama || '?').charAt(0).toUpperCase()}
                      </span>

                      <span className="tm-row-main">
                        <span className="tm-row-title">{b.nama}</span>
                        <span className="tm-row-sub">{keterangan(b, bulanBerjalan)}</span>
                        <span className="tm-tg-bar" aria-hidden>
                          <span
                            className="tm-tg-bar-fill"
                            style={{ background: g.color, transform: `scaleX(${persen(b)})` }}
                          />
                        </span>
                      </span>

                      <span className="tm-tg-angka">
                        <span className="tm-tg-hari">
                          {b.hariKerja}
                          <span>/{TARGET_HARI_KERJA} hari</span>
                        </span>
                        <span className="tm-tg-badge" style={{ background: g.soft, color: g.color }}>
                          {labelBadge(b)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </PullToRefresh>
    );
  }

  // =========================================================
  // DESKTOP
  // =========================================================
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Target Absen Ladies"
        description={`Target ${TARGET_HARI_KERJA} hari kerja per bulan · semua ladies aktif`}
        actions={
          <div className="dk-month-nav dk-month-nav--pill">
            <button type="button" className="dk-icon-btn" aria-label="Bulan sebelumnya" onClick={prevMonth}>
              <FiChevronLeft />
            </button>
            <span className="dk-month-label" aria-live="polite">{bulan}</span>
            <button
              type="button"
              className="dk-icon-btn"
              aria-label="Bulan berikutnya"
              onClick={nextMonth}
              disabled={isNextDisabled}
            >
              <FiChevronRight />
            </button>
          </div>
        }
      />

      <div className="dk-tg-summary">
        <section className="dk-card dk-tg-utama" aria-label="Ringkasan target">
          {loading ? (
            <div role="status" aria-label="Memuat ringkasan target">
              <Skeleton width="35%" height={13} />
              <Skeleton width="50%" height={30} style={{ marginTop: 10 }} />
              <Skeleton width="70%" height={13} style={{ marginTop: 10 }} />
            </div>
          ) : (
            <>
              <span className="dk-stat-label">Kurang target</span>
              <div className="dk-ah-count">
                <span className="dk-ah-count-value">{jumlahKurang}</span>
                <span className="dk-ah-count-total">/ {baris.length} ladies</span>
              </div>
              <span className="dk-card-sub">{ringkasTeks}</span>
            </>
          )}
        </section>

        {(['tercapai', 'mengejar', 'tidak-tercapai'] as StatusTarget[]).map((s) => (
          <div key={s} className="dk-stat">
            <span className="dk-stat-label">
              <span className="dk-dot" style={{ background: GAYA[s].color }} />
              {GAYA[s].label}
            </span>
            <span className="dk-stat-value">
              {loading || (s === 'mengejar' && !bulanBerjalan) ? '–' : jumlahStatus[s]}{' '}
              <span className="dk-stat-unit">orang</span>
            </span>
          </div>
        ))}
      </div>

      <section className="dk-card" aria-label={`Target absen ${bulan}`}>
        <div className="dk-toolbar">
          <div className="dk-segmented" role="group" aria-label="Saring daftar">
            {opsiFilter.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                className={`dk-segment ${filter === f.key ? 'is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className="dk-ah-segment-count">{loading ? '–' : f.jumlah}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="dk-card-body" role="status" aria-label="Memuat daftar ladies">
            <div className="dk-stack" style={{ gap: 'var(--space-3)' }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="d-flex align-items-center gap-3">
                  <Skeleton width={36} height={36} borderRadius="var(--radius-full)" />
                  <div className="flex-grow-1 d-flex flex-column gap-2">
                    <Skeleton width="30%" height={13} />
                    <Skeleton width="20%" height={11} />
                  </div>
                  <Skeleton width={120} height={13} />
                  <Skeleton width={100} height={24} borderRadius="var(--radius-full)" />
                </div>
              ))}
            </div>
          </div>
        ) : terlihat.length === 0 ? (
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden>{kosong.icon}</span>
            <div className="dk-empty-title">{kosong.judul}</div>
            <div className="dk-empty-text">{kosong.teks}</div>
          </div>
        ) : (
          <table className="dk-table">
            <thead>
              <tr>
                <th scope="col">Ladies</th>
                <th scope="col">Hari kerja</th>
                <th scope="col">Status</th>
                <th scope="col">Sisa hari</th>
              </tr>
            </thead>
            <tbody>
              {terlihat.map((b) => {
                const g = GAYA[b.status];
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="dk-person">
                        <span className="dk-avatar" style={{ background: g.soft, color: g.color }} aria-hidden>
                          {(b.nama || '?').charAt(0).toUpperCase()}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div className="dk-person-label">{b.nama}</div>
                          <div className="dk-person-sub">{b.outlet || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="dk-tg-hari">
                      <span className="dk-num">
                        <strong>{b.hariKerja}</strong> / {TARGET_HARI_KERJA}
                      </span>
                      <div className="dk-tg-bar" aria-hidden>
                        <div
                          className="dk-tg-bar-fill"
                          style={{ background: g.color, transform: `scaleX(${persen(b)})` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="dk-tg-badge" style={{ background: g.soft, color: g.color }}>
                        {labelBadge(b)}
                      </span>
                      {b.status === 'tidak-tercapai' && bulanBerjalan && (
                        <div className="dk-person-sub">tidak terkejar</div>
                      )}
                    </td>
                    <td className="dk-num">
                      {bulanBerjalan ? `${b.sisaHari} hari` : <span className="dk-muted">–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && baris.length > 0 && (
          <div className="dk-footer">
            <span className="dk-count">
              Menampilkan {terlihat.length} dari {baris.length} ladies aktif
              {bulanBerjalan && ' · sisa hari = tanggal tersisa bulan ini yang belum diabsen'}
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default TargetAbsenPage;
