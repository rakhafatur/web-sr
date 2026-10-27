import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiEye,
  FiEyeOff,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';

import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import PullToRefresh from '../../../components/PullToRefresh';
import Skeleton from '../../../components/Skeleton';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import HomeLadiesSkeleton from '../../ladies/components/HomeLadiesSkeleton';
import { useLedgerData } from '../../ladies/hooks/useLedgerData';
import { TARGET_HARI_KERJA } from '../../absensi/utils/targetAbsensi';
import type { BarisTarget } from '../../absensi/utils/targetLadies';
import { HALAMAN_PENGAWAS } from '../../../layout/menu';
import { useTargetLadies } from '../hooks/useTargetLadies';
// Kerangka Home (sapaan, hero navy, ringkasan, menu cepat) sama dengan Home
// Ladies, jadi kelasnya dipakai bersama.
import '../../ladies/pages/HomeLadiesPage.css';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';
import '../pengawas.css';

const sapaanWaktu = (jam: number) => {
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const TERSEMBUNYI = '••••••••';
/** Berapa ladies yang ditampilkan di "Paling kurang" sebelum tautan Lihat semua. */
const JUMLAH_SOROTAN = 3;

type Nominal = { jumlah: number };

// Home selalu bulan berjalan, jadi "tidak tercapai" di sini berarti tidak
// terkejar lagi dengan sisa hari bulan ini.
const labelKurang = (b: BarisTarget) =>
  b.status === 'tidak-tercapai' ? `Kurang ${b.kurang} hari · tidak terkejar` : `Kurang ${b.kurang} hari`;

/**
 * Home pengawas: pemasukan (gaji + lain) & kasbon miliknya bulan ini, plus ringkasan target
 * absen ladies (siapa yang paling kurang). Datanya memakai hook yang sama
 * dengan halaman Gaji/Kasbon/Target Absen, jadi cache-nya terpakai bersama.
 */
const HomePengawasPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const pengawasId = useSelector((state: RootState) => state.user.currentUser?.pengawas_id);
  const namaUser = useSelector((state: RootState) => state.user.currentUser?.nama);
  const [sembunyikan, setSembunyikan] = useState(false);

  // dayjs() dibekukan sekali per render pertama — kunci cache tetap stabil.
  const [bulanIni] = useState(() => dayjs().startOf('month'));
  const labelBulan = bulanIni.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Hanya untuk sapaan — kalau gagal, jatuh ke nama akun.
  const { data: namaPengawas } = useQuery({
    queryKey: ['pengawas-saya', pengawasId],
    queryFn: async () => {
      const { data } = await supabase
        .from('pengawas')
        .select('nama_panggilan')
        .eq('id', pengawasId as string)
        .maybeSingle();
      return data?.nama_panggilan ?? null;
    },
    enabled: !!pengawasId,
  });

  // Kolom sama dengan halaman Gaji/Pemasukan Lain/Kasbon, jadi cache-nya terpakai bersama.
  const KOLOM = 'id, tanggal, jumlah, keterangan';
  const gaji = useLedgerData<Nominal>('gaji_pengawas', pengawasId, bulanIni, 'gaji', KOLOM, 'pengawas_id');
  const lain = useLedgerData<Nominal>('pemasukan_lain_pengawas', pengawasId, bulanIni, 'pemasukan lain', KOLOM, 'pengawas_id');
  const kasbon = useLedgerData<Nominal>('kasbon_pengawas', pengawasId, bulanIni, 'kasbon', KOLOM, 'pengawas_id');
  const target = useTargetLadies(bulanIni);

  const total = (list: Nominal[]) => list.reduce((s, r) => s + (r.jumlah || 0), 0);
  const totalPemasukan = total(gaji.list) + total(lain.list);
  const totalKasbon = total(kasbon.list);

  const kurang = target.baris.filter((b) => b.status !== 'tercapai');
  const tercapai = target.baris.length - kurang.length;
  const sorotan = kurang.slice(0, JUMLAH_SOROTAN);

  const nama = namaPengawas || namaUser || 'Pengawas';
  const sapaan = sapaanWaktu(new Date().getHours());
  const loading = gaji.loading || lain.loading || kasbon.loading || target.loading;

  const refresh = async () => {
    await Promise.all([gaji.refetch(), lain.refetch(), kasbon.refetch(), target.refetch()]);
  };

  // Pengaturan tidak di sini — sudah ada di tab Menu navbar bawah.
  const menuCepat = [
    { label: 'Gaji', icon: <FiTrendingUp />, path: HALAMAN_PENGAWAS.gaji.rute },
    { label: 'Pemasukan Lain', icon: <FiDollarSign />, path: HALAMAN_PENGAWAS.pemasukanLain.rute },
    { label: 'Kasbon', icon: <FiCreditCard />, path: HALAMAN_PENGAWAS.kasbon.rute },
    { label: 'Target Absen', icon: <FiTarget />, path: HALAMAN_PENGAWAS.absenLadies.rute },
  ];

  const tombolMata = (kelas: string) => (
    <button
      type="button"
      className={kelas}
      onClick={() => setSembunyikan((v) => !v)}
      aria-label={sembunyikan ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
      aria-pressed={sembunyikan}
    >
      {sembunyikan ? <FiEyeOff /> : <FiEye />}
    </button>
  );

  const isiHero = (
    <>
      <div className="ladies-home-hero-circle" />
      <div className="ladies-home-hero-top">
        <span className="ladies-home-hero-label">Pemasukan Bulan Ini</span>
        {tombolMata(`ladies-home-eye-btn${isMobile ? ' tap-scale' : ''}`)}
      </div>
      <div className="ladies-home-hero-amount">{sembunyikan ? TERSEMBUNYI : rupiah(totalPemasukan)}</div>
      <div className="ladies-home-hero-sub">Gaji + pemasukan lain · {labelBulan}</div>
      <div className="ladies-home-hero-foot">
        <span>Kasbon bulan ini</span>
        <span className="ladies-home-hero-foot-value">{sembunyikan ? TERSEMBUNYI : rupiah(totalKasbon)}</span>
      </div>
    </>
  );

  // =========================================================
  // DESKTOP
  // =========================================================
  if (!isMobile) {
    return (
      <div className="page-shell dk-page">
        <DesktopPageHeader title={`${sapaan}, ${nama}`} description={`Ringkasan ${labelBulan}`} />

        {loading ? (
          <div className="dk-lh-grid" role="status" aria-label="Memuat ringkasan">
            <Skeleton height={208} borderRadius="var(--radius-xl)" style={{ gridColumn: 'span 2' }} />
            <Skeleton height={208} borderRadius="var(--radius-xl)" />
            <Skeleton height={220} borderRadius="var(--radius-xl)" style={{ gridColumn: '1 / -1' }} />
          </div>
        ) : (
          <div className="dk-lh-grid">
            <section className="ladies-home-hero dk-lh-hero" aria-label="Pemasukan bulan ini">
              {isiHero}
            </section>

            <section className="dk-card dk-lh-tile" aria-label="Target absen ladies">
              <div className="dk-lh-tile-head">
                <span className="dk-kpi-label">Kurang target</span>
                <span className="dk-lh-icon" aria-hidden><FiTarget /></span>
              </div>
              <div className="dk-lh-hadir-angka">
                <span className="dk-lh-value">{kurang.length}</span>
                <span className="dk-lh-unit">dari {target.baris.length} ladies</span>
              </div>
              <div className="dk-lh-tile-foot">
                <span className="dk-kpi-sub">
                  {tercapai} sudah {TARGET_HARI_KERJA} hari kerja
                </span>
                <Link to={HALAMAN_PENGAWAS.absenLadies.rute} className="dk-lh-link">
                  Rincian <FiArrowRight aria-hidden />
                </Link>
              </div>
            </section>

            <section className="dk-card" style={{ gridColumn: '1 / -1' }} aria-label="Ladies paling kurang target">
              <div className="dk-card-head">
                <h2 className="dk-card-title">Paling kurang target</h2>
                <div className="dk-card-sub">Ladies dengan kekurangan hari kerja terbanyak di {labelBulan}</div>
              </div>
              {sorotan.length === 0 ? (
                <div className="dk-empty">
                  <span className="dk-empty-icon" aria-hidden><FiCheckCircle /></span>
                  <div className="dk-empty-title">Semua ladies sudah memenuhi target</div>
                </div>
              ) : (
                <table className="dk-table">
                  <tbody>
                    {sorotan.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div className="dk-person">
                            <span className="dk-avatar" aria-hidden>{(b.nama || '?').charAt(0).toUpperCase()}</span>
                            <div style={{ minWidth: 0 }}>
                              <div className="dk-person-label">{b.nama}</div>
                              <div className="dk-person-sub">{b.outlet || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="dk-num">
                          {b.hariKerja} / {TARGET_HARI_KERJA} hari
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`dk-status ${b.status === 'mengejar' ? 'is-warn' : 'is-off'}`}>
                            {labelKurang(b)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {kurang.length > JUMLAH_SOROTAN && (
                <div className="dk-footer">
                  <Link to={HALAMAN_PENGAWAS.absenLadies.rute} className="dk-lh-link">
                    Lihat semua {kurang.length} ladies <FiArrowRight aria-hidden />
                  </Link>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // MOBILE
  // =========================================================
  if (loading) {
    return <HomeLadiesSkeleton />;
  }

  const muncul = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  });

  const ringkasan = [
    { label: 'Kurang target', nilai: kurang.length, satuan: 'ladies', icon: <FiTarget /> },
    { label: 'Tercapai', nilai: tercapai, satuan: 'ladies', icon: <FiCheckCircle /> },
    { label: 'Target', nilai: TARGET_HARI_KERJA, satuan: 'hari/bulan', icon: <FiTrendingUp /> },
  ];

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="ladies-home-wrapper">
        <div className="content-container d-flex flex-column">
          {/* Di mobile, MainLayout tidak merender Header di halaman ini. */}
          <motion.div {...muncul(0)} className="ladies-home-top">
            <div className="ladies-home-topbar">
              <span className="ladies-home-avatar" aria-hidden>
                {nama.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ladies-home-greeting-time">{sapaan},</div>
            <h1 className="ladies-home-greeting-name">{nama}</h1>
          </motion.div>

          <motion.section {...muncul(0.05)} className="ladies-home-hero" aria-label="Pemasukan bulan ini">
            {isiHero}
          </motion.section>

          <motion.section {...muncul(0.1)} className="ladies-home-overview" aria-label="Target absen ladies">
            <div className="ladies-home-card-head">
              <h2 className="ladies-home-card-title">Target Absen Ladies</h2>
              <span className="ladies-home-chip">{labelBulan}</span>
            </div>

            <div className="ladies-home-stats">
              {ringkasan.map((s) => (
                <div key={s.label} className="ladies-home-stat">
                  <span className="ladies-home-stat-label">{s.label}</span>
                  <span className="ladies-home-stat-value">{s.nilai}</span>
                  <div className="ladies-home-stat-foot">
                    <span className="ladies-home-stat-unit">{s.satuan}</span>
                    <span className="ladies-home-stat-icon" aria-hidden>{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section {...muncul(0.15)} className="ladies-home-card" aria-label="Ladies paling kurang target">
            <div className="ladies-home-card-head">
              <h2 className="ladies-home-card-title">Paling Kurang</h2>
              <button
                type="button"
                className="ph-link tap-scale"
                onClick={() => navigate(HALAMAN_PENGAWAS.absenLadies.rute)}
              >
                Lihat semua <FiArrowRight aria-hidden />
              </button>
            </div>

            {sorotan.length === 0 ? (
              <div className="ph-kosong">
                <FiCheckCircle aria-hidden />
                Semua ladies sudah memenuhi target
              </div>
            ) : (
              <ul className="tm-tg-list ph-list">
                {sorotan.map((b) => {
                  const warna = b.status === 'mengejar' ? 'voucher' : 'expense';
                  return (
                    <li key={b.id} className="tm-tg-row">
                      <span
                        className="tm-tg-avatar"
                        style={{ background: `var(--color-${warna}-soft)`, color: `var(--color-${warna})` }}
                        aria-hidden
                      >
                        {(b.nama || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="tm-row-main">
                        <span className="tm-row-title">{b.nama}</span>
                        <span className="tm-row-sub">
                          {b.hariKerja} dari {TARGET_HARI_KERJA} hari · {b.outlet || '-'}
                        </span>
                      </span>
                      <span
                        className="tm-tg-badge"
                        style={{ background: `var(--color-${warna}-soft)`, color: `var(--color-${warna})` }}
                      >
                        Kurang {b.kurang} hari
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.section>

          <motion.section {...muncul(0.2)} className="ladies-home-card" aria-label="Menu cepat">
            <h2 className="ladies-home-card-title">Menu Cepat</h2>
            <div className="ladies-home-menu-grid">
              {menuCepat.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ladies-home-menu-item tap-scale"
                  onClick={() => navigate(item.path)}
                >
                  <div className="ladies-home-menu-icon">{item.icon}</div>
                  <span className="ladies-home-menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default HomePengawasPage;
