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
  FiChevronRight,
  FiGift,
  FiCreditCard,
  FiHeart,
  FiCalendar,
} from 'react-icons/fi';

import { motion } from 'framer-motion';

import type { UserWithLadies } from '../../../types/user';
import HomeLadiesSkeleton from '../components/HomeLadiesSkeleton';
import PullToRefresh from '../../../components/PullToRefresh';

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
      };
    },
    enabled: !!ladiesId,
    meta: { errorLabel: 'data terbaru' },
  });

  const hariMasuk = data?.hariMasuk ?? 0;
  const voucherPcs = data?.voucherPcs ?? 0;
  const voucherNominal = data?.voucherNominal ?? 0;
  const pengeluaran = data?.pengeluaran ?? 0;
  const loading = isLoading;

  const persenHadir = Math.min(100, Math.round((hariMasuk / 18) * 100));

  const formatRpNumber = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`;

  const menuItems = [
    {
      label: 'Voucher',
      icon: <FiGift />,
      color: 'var(--color-voucher)',
      bg: 'var(--color-voucher-soft)',
      path: '/ladies/voucher',
    },
    {
      label: 'Kasbon',
      icon: <FiCreditCard />,
      color: 'var(--color-expense)',
      bg: 'var(--color-expense-soft)',
      path: '/ladies/kasbon',
    },
    {
      label: 'Dokter',
      icon: <FiHeart />,
      color: 'var(--color-medical)',
      bg: 'var(--color-medical-soft)',
      path: '/ladies/dokter',
    },
    {
      label: 'Absensi',
      icon: <FiCalendar />,
      color: 'var(--color-green)',
      bg: 'var(--color-green-light)',
      path: '/ladies/absensi',
    },
  ];

  if (loading) {
    return <HomeLadiesSkeleton />;
  }

  return (
    <PullToRefresh onRefresh={async () => { await refetch(); }}>
      <div className="ladies-home-wrapper">
        <div className="content-container d-flex flex-column gap-3">
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="ladies-home-hero"
          >
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
            <div className="ladies-home-hero-sub">dari voucher bulan ini ✨</div>

            <div className="ladies-home-hero-progress">
              <div className="ladies-home-hero-progress-labels">
                <span>Kehadiran</span>
                <span>{hariMasuk}/18 hari</span>
              </div>
              <div className="ladies-home-hero-progress-bar">
                <div
                  className="ladies-home-hero-progress-fill"
                  style={{ width: `${persenHadir}%` }}
                />
              </div>
            </div>

            <div className="ladies-home-hero-divider" />

            <div className="ladies-home-hero-breakdown">
              <div className="ladies-home-hero-breakdown-item">
                <span className="ladies-home-hero-breakdown-label">Voucher</span>
                <span className="ladies-home-hero-breakdown-value">{voucherPcs} pcs</span>
              </div>
              <div className="ladies-home-hero-breakdown-sep" />
              <div className="ladies-home-hero-breakdown-item">
                <span className="ladies-home-hero-breakdown-label">Kasbon</span>
                <span className="ladies-home-hero-breakdown-value">
                  {hideAmount ? '••••••••' : formatRpNumber(pengeluaran)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* SMART CHAT CTA */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ladies-home-cta tap-scale"
            onClick={() => navigate('/smart-chat-ladies')}
          >
            <div className="ladies-home-cta-icon">
              <FiMessageCircle />
            </div>
            <div className="ladies-home-cta-text">
              <div className="ladies-home-cta-title">Tanya Smart Assistant</div>
              <div className="ladies-home-cta-subtitle">Cek voucher & absensi kamu ✨</div>
            </div>
            <FiChevronRight className="ladies-home-cta-chevron" />
          </motion.button>

          {/* MENU GRID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="ladies-home-section-label">Menu Cepat</div>
            <div className="ladies-home-menu-grid">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ladies-home-menu-item tap-scale"
                  onClick={() => navigate(item.path)}
                >
                  <div
                    className="ladies-home-menu-icon"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <span className="ladies-home-menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default HomeLadiesPage;
