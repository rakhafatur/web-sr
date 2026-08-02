import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiBookOpen,
} from 'react-icons/fi';

import { motion } from 'framer-motion';

import logo from '../../../assets/logosr-blue.png';
import type { UserWithLadies } from '../../../types/user';

const HomeLadiesPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const navigate = useNavigate();

  const [hariMasuk, setHariMasuk] = useState(0);
  const [voucherPcs, setVoucherPcs] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [voucherNominal, setVoucherNominal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);

  const bulanIni = dayjs().format('MM');
  const tahunIni = dayjs().format('YYYY');

  useEffect(() => {
    if (!user?.ladies_id) return;
    fetchData(user.ladies_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async (ladiesId: string) => {
    const tanggalAwal = `${tahunIni}-${bulanIni}-01`;
    const tanggalAkhir = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data: absensi } = await supabase
      .from('absensi')
      .select('id')
      .eq('ladies_id', ladiesId)
      .ilike('status', 'kerja')
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir);

    const { data: vouchers } = await supabase
      .from('vouchers')
      .select('jumlah_voucher')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir);

    const { data: kasbon } = await supabase
      .from('kasbon')
      .select('jumlah')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir);

    const totalVoucherPcs =
      vouchers?.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0) || 0;

    const totalVoucherNominal = totalVoucherPcs * 150000;

    const totalKasbon = kasbon?.reduce((sum, k) => sum + k.jumlah, 0) || 0;

    setHariMasuk(absensi?.length || 0);
    setVoucherPcs(totalVoucherPcs);
    setVoucherNominal(totalVoucherNominal);
    setPengeluaran(totalKasbon);
    setLoading(false);
  };

  const persenHadir = Math.min(100, Math.round((hariMasuk / 18) * 100));

  const formatRp = (n: number) =>
    hideAmount ? '••••••••' : `Rp${n.toLocaleString('id-ID')}`;

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
      label: 'Pemasukan',
      icon: <FiDollarSign />,
      color: 'var(--color-income)',
      bg: 'var(--color-income-soft)',
      path: '/ladies/pemasukan_lain',
    },
    {
      label: 'Absensi',
      icon: <FiCalendar />,
      color: 'var(--color-green)',
      bg: 'var(--color-green-light)',
      path: '/ladies/absensi',
    },
    {
      label: 'Profil',
      icon: <FiUser />,
      color: 'var(--color-gray-500)',
      bg: 'var(--color-gray-100)',
      path: '/ladies/profile',
    },
    {
      label: 'Peraturan',
      icon: <FiBookOpen />,
      color: 'var(--color-gray-500)',
      bg: 'var(--color-gray-100)',
      path: '/ladies/peraturan',
    },
  ];

  if (loading) {
    return (
      <div className="ladies-home-wrapper ladies-home-loading">
        <div className="ladies-home-loading-content">
          <img src={logo} alt="Loading..." className="ladies-home-loading-logo" />
          <p className="ladies-home-loading-text">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ladies-home-wrapper">
      <div className="content-container d-flex flex-column gap-3">
        {/* GREETING */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="ladies-home-greeting"
        >
          <h1 className="ladies-home-greeting-title">
            Halo, {user?.nama_ladies} 👋
          </h1>
        </motion.div>

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

          <div className="ladies-home-hero-amount">{formatRp(voucherNominal)}</div>
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
              <span className="ladies-home-hero-breakdown-value">{formatRp(pengeluaran)}</span>
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
  );
};

export default HomeLadiesPage;
