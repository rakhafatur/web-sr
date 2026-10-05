import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';

import {
  FiEye,
  FiEyeOff,
  FiMessageCircle,
  FiArrowRight,
  FiTrendingUp,
  FiGift,
  FiCreditCard,
  FiHeart,
  FiCalendar,
} from 'react-icons/fi';

import { motion } from 'framer-motion';

import type { UserWithLadies } from '../../../types/user';
import HomeLadiesSkeleton from '../components/HomeLadiesSkeleton';
import PullToRefresh from '../../../components/PullToRefresh';
import NotificationBell from '../../../components/Header/NotificationBell';
import { TARGET_HARI_KERJA } from '../../absensi/utils/targetAbsensi';

const sapaanWaktu = (jam: number) => {
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const HomeLadiesPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const navigate = useNavigate();

  const [hideAmount, setHideAmount] = useState(false);

  const ladiesId = user?.ladies_id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['home-ladies', ladiesId],
    queryFn: async () => {
      const tanggalAwal = dayjs().startOf('month').format('YYYY-MM-DD');
      const tanggalAkhir = dayjs().endOf('month').format('YYYY-MM-DD');

      const [
        { data: absensi, error: absensiError },
        { data: vouchers, error: vouchersError },
        { data: kasbon, error: kasbonError },
        { data: ladies },
      ] = await Promise.all([
        supabase
          .from('absensi')
          .select('id')
          .eq('ladies_id', ladiesId as string)
          .ilike('status', 'kerja')
          .gte('tanggal', tanggalAwal)
          .lte('tanggal', tanggalAkhir),

        supabase
          .from('vouchers')
          .select('jumlah, jumlah_voucher')
          .eq('ladies_id', ladiesId as string)
          .gte('tanggal', tanggalAwal)
          .lte('tanggal', tanggalAkhir),

        supabase
          .from('kasbon')
          .select('jumlah')
          .eq('ladies_id', ladiesId as string)
          .gte('tanggal', tanggalAwal)
          .lte('tanggal', tanggalAkhir),

        // Hanya untuk sapaan — kalau gagal, jatuh ke user.nama, jadi error-nya
        // sengaja tidak menggagalkan seluruh halaman.
        supabase
          .from('ladies')
          .select('nama_ladies')
          .eq('id', ladiesId as string)
          .maybeSingle(),
      ]);

      if (absensiError || vouchersError || kasbonError) {
        throw absensiError || vouchersError || kasbonError;
      }

      const totalVoucherPcs =
        vouchers?.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0) || 0;

      const totalVoucherNominal =
        vouchers?.reduce((sum, v) => sum + (v.jumlah || 0), 0) || 0;

      return {
        hariMasuk: absensi?.length || 0,
        voucherPcs: totalVoucherPcs,
        voucherNominal: totalVoucherNominal,
        pengeluaran: kasbon?.reduce((sum, k) => sum + k.jumlah, 0) || 0,
        nama: ladies?.nama_ladies ?? null,
      };
    },
    enabled: !!ladiesId,
    meta: { errorLabel: 'data terbaru' },
  });

  const hariMasuk = data?.hariMasuk ?? 0;
  const voucherPcs = data?.voucherPcs ?? 0;
  const voucherNominal = data?.voucherNominal ?? 0;
  const pengeluaran = data?.pengeluaran ?? 0;
  const nama = data?.nama || user?.nama || 'Ladies';
  const loading = isLoading;

  // null (tampil "–") kalau belum ada hari masuk, supaya tidak membagi dengan nol.
  const rataVoucherPerHari = hariMasuk > 0 ? voucherPcs / hariMasuk : null;
  const bulanIni = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const formatRpNumber = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`;

  const menuItems = [
    {
      label: 'Voucher',
      icon: <FiGift />,
      path: '/ladies/voucher',
    },
    {
      label: 'Kasbon',
      icon: <FiCreditCard />,
      path: '/ladies/kasbon',
    },
    {
      label: 'Dokter',
      icon: <FiHeart />,
      path: '/ladies/dokter',
    },
    {
      label: 'Absensi',
      icon: <FiCalendar />,
      path: '/ladies/absensi',
    },
  ];

  // Pola "angka besar + satuan kecil" dari kartu Health Overview referensi.
  const ringkasan = [
    { label: 'Hari Masuk', nilai: hariMasuk, satuan: `dari ${TARGET_HARI_KERJA} hari`, icon: <FiCalendar /> },
    { label: 'Voucher', nilai: voucherPcs, satuan: 'pcs', icon: <FiGift /> },
    {
      label: 'Rata-rata',
      nilai:
        rataVoucherPerHari === null
          ? '–'
          : rataVoucherPerHari.toLocaleString('id-ID', { maximumFractionDigits: 1 }),
      satuan: 'pcs/hari',
      icon: <FiTrendingUp />,
    },
  ];

  const muncul = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  });

  if (loading) {
    return <HomeLadiesSkeleton />;
  }

  return (
    <PullToRefresh onRefresh={async () => { await refetch(); }}>
      <div className="ladies-home-wrapper">
        <div className="content-container d-flex flex-column">
          {/* ATAS: avatar + lonceng + sapaan (pola referensi). Di mobile,
              MainLayout tidak merender Header di halaman ini. */}
          <motion.div {...muncul(0)} className="ladies-home-top">
            <div className="ladies-home-topbar">
              <button
                type="button"
                className="ladies-home-avatar tap-scale"
                onClick={() => navigate('/ladies/profile')}
                aria-label="Buka profil"
              >
                {nama.charAt(0).toUpperCase()}
              </button>
              {ladiesId && <NotificationBell ladiesId={ladiesId} />}
            </div>

            <div className="ladies-home-greeting-time">{sapaanWaktu(new Date().getHours())},</div>
            <h1 className="ladies-home-greeting-name">{nama}</h1>
          </motion.div>

          {/* HERO */}
          <motion.div {...muncul(0.05)} className="ladies-home-hero">
            <div className="ladies-home-hero-circle" />

            <div className="ladies-home-hero-top">
              <span className="ladies-home-hero-label">Estimasi Pendapatan</span>
              <button
                type="button"
                className="ladies-home-eye-btn tap-scale"
                onClick={() => setHideAmount((v) => !v)}
                aria-label={hideAmount ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
              >
                {hideAmount ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="ladies-home-hero-amount">
              {hideAmount ? '••••••••' : formatRpNumber(voucherNominal)}
            </div>
            <div className="ladies-home-hero-sub">Dari voucher · {bulanIni}</div>

            <div className="ladies-home-hero-foot">
              <span>Kasbon bulan ini</span>
              <span className="ladies-home-hero-foot-value">
                {hideAmount ? '••••••••' : formatRpNumber(pengeluaran)}
              </span>
            </div>
          </motion.div>

          {/* RINGKASAN */}
          <motion.section {...muncul(0.1)} className="ladies-home-overview" aria-label="Ringkasan bulan ini">
            <div className="ladies-home-card-head">
              <h2 className="ladies-home-card-title">Ringkasan Bulan Ini</h2>
              <span className="ladies-home-chip">{bulanIni}</span>
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

          {/* MENU CEPAT */}
          <motion.section {...muncul(0.15)} className="ladies-home-card" aria-label="Menu cepat">
            <h2 className="ladies-home-card-title">Menu Cepat</h2>
            <div className="ladies-home-menu-grid">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ladies-home-menu-item tap-scale"
                  onClick={() => navigate(item.path)}
                >
                  <div className="ladies-home-menu-icon">
                    {item.icon}
                  </div>
                  <span className="ladies-home-menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* SMART CHAT CTA */}
          <motion.button
            type="button"
            {...muncul(0.2)}
            className="ladies-home-cta tap-scale"
            onClick={() => navigate('/smart-chat-ladies')}
          >
            <div className="ladies-home-cta-icon">
              <FiMessageCircle />
            </div>
            <div className="ladies-home-cta-text">
              <div className="ladies-home-cta-title">Tanya Smart Assistant</div>
              <div className="ladies-home-cta-subtitle">Cek voucher & absensi kamu</div>
            </div>
            <span className="ladies-home-arrow-btn" aria-hidden>
              <FiArrowRight />
            </span>
          </motion.button>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default HomeLadiesPage;
