import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';
import { FiCalendar, FiGift, FiTrendingDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import bgImage from '../../../assets/bg-home.png';
import logo from '../../../assets/logosr-green.png'; // ✅ Logo hijau ditambahkan

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
  const [openCard, setOpenCard] = useState<'absen' | 'voucher' | 'pengeluaran' | null>(null);
  const [loading, setLoading] = useState(true); // ✅ State loading
  const cardRef = useRef(openCard);

  const bulanIni = dayjs().format('MM');
  const tahunIni = dayjs().format('YYYY');

  useEffect(() => {
    if (!user?.ladies_id) return;
    fetchData(user.ladies_id);
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

    const totalVoucherPcs = vouchers?.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0) || 0;
    const totalVoucherNominal = totalVoucherPcs * 150000;
    const totalKasbon = kasbon?.reduce((sum, k) => sum + k.jumlah, 0) || 0;

    setHariMasuk(absensi?.length || 0);
    setVoucherPcs(totalVoucherPcs);
    setVoucherNominal(totalVoucherNominal);
    setPengeluaran(totalKasbon);
    setLoading(false); // ✅ Selesai loading
  };

  const handleToggle = (type: 'absen' | 'voucher' | 'pengeluaran') => {
    const newValue = openCard === type ? null : type;
    cardRef.current = newValue;
    setOpenCard(newValue);
  };

  const biayaTetap = 500000 + 185000 + 250000;
  const batasWajar = Math.max(0, voucherNominal - biayaTetap);
  const isOver = batasWajar > 0 && pengeluaran > batasWajar;
  const persenHadir = Math.round((hariMasuk / 18) * 100);

  if (loading) {
    return (
      <div className="home-wrapper loading-state">
        <div className="loading-content">
          <img src={logo} alt="SR Agency" className="loading-logo" />
          <p className="loading-text">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <img src={bgImage} alt="bg" className="home-background-image mobile-only" />
      {/* semua elemen asli tetap */}
      ...
    </div>
  );
};

export default HomeLadiesPage;
