import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';

import {
  FiGift,
  FiTrendingDown,
  FiTarget,
  FiZap,
  FiHeart,
} from 'react-icons/fi';

import { motion } from 'framer-motion';

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
  nama_ladies?: string;
};

const HomeLadiesPage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;

  const [hariMasuk, setHariMasuk] = useState(0);
  const [voucherPcs, setVoucherPcs] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [voucherNominal, setVoucherNominal] = useState(0);
  const [loading, setLoading] = useState(true);

  const bulanIni = dayjs().format('MM');
  const tahunIni = dayjs().format('YYYY');

  useEffect(() => {
    if (!user?.ladies_id) return;
    fetchData(user.ladies_id);
  }, [user]);

  const fetchData = async (ladiesId: string) => {
    const start = `${tahunIni}-${bulanIni}-01`;
    const end = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data: absensi } = await supabase
      .from('absensi')
      .select('id')
      .eq('ladies_id', ladiesId)
      .ilike('status', 'kerja')
      .gte('tanggal', start)
      .lte('tanggal', end);

    const { data: vouchers } = await supabase
      .from('vouchers')
      .select('jumlah_voucher')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', start)
      .lte('tanggal', end);

    const { data: kasbon } = await supabase
      .from('kasbon')
      .select('jumlah')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', start)
      .lte('tanggal', end);

    const totalVoucherPcs =
      vouchers?.reduce((s, v) => s + (v.jumlah_voucher || 0), 0) || 0;

    const totalKasbon =
      kasbon?.reduce((s, k) => s + k.jumlah, 0) || 0;

    setHariMasuk(absensi?.length || 0);
    setVoucherPcs(totalVoucherPcs);
    setVoucherNominal(totalVoucherPcs * 150000);
    setPengeluaran(totalKasbon);

    setLoading(false);
  };

  const percent = Math.min(100, Math.round((hariMasuk / 18) * 100));

  const insight = () => {
    if (hariMasuk >= 18) return '🔥 Target kehadiran tercapai!';
    if (voucherPcs >= 20) return '💸 Voucher kamu bagus, pertahankan!';
    if (hariMasuk >= 10) return '✨ Progress kamu sudah oke!';
    return '💚 Tetap semangat ya!';
  };

  if (loading) {
    return (
      <div className="home-loading">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <div className="home-container">

        {/* HERO */}
        <motion.div className="hero">
          <div className="hero-title">
            Halo {user?.nama_ladies} ✨
          </div>
          <div className="hero-sub">
            {dayjs().format('dddd, DD MMMM YYYY')}
          </div>
        </motion.div>

        {/* MAIN STATS */}
        <div className="stat-grid">

          <div className="stat-card">
            <FiTarget className="icon" />
            <div className="value">{hariMasuk}/18</div>
            <div className="label">Kehadiran</div>
            <div className="bar">
              <div style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <FiGift className="icon" />
            <div className="value">{voucherPcs}</div>
            <div className="label">Voucher</div>
          </div>

          <div className="stat-card">
            <FiTrendingDown className="icon danger" />
            <div className="value">
              Rp {pengeluaran.toLocaleString('id-ID')}
            </div>
            <div className="label">Kasbon</div>
          </div>

        </div>

        {/* INSIGHT */}
        <div className="insight">
          <FiZap />
          <span>{insight()}</span>
        </div>

        {/* ESTIMASI */}
        <div className="income">
          <FiHeart />
          <div>
            <div className="income-title">Estimasi Pendapatan</div>
            <div className="income-value">
              Rp {voucherNominal.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeLadiesPage;