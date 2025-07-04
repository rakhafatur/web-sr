import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';
import bgImage from '../../../assets/bg-home.png';
import { FiCalendar, FiGift, FiTrendingDown } from 'react-icons/fi';
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
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir);

    const { data: vouchers } = await supabase
      .from('vouchers')
      .select('id')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir);

    const { data: kasbon } = await supabase
      .from('kasbon')
      .select('jumlah')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir);

    const voucherCount = vouchers?.length || 0;
    const totalVoucherNominal = voucherCount * 150000;
    const totalKasbon = kasbon?.reduce((sum, k) => sum + k.jumlah, 0) || 0;

    setHariMasuk(absensi?.length || 0);
    setVoucherPcs(voucherCount);
    setVoucherNominal(totalVoucherNominal);
    setPengeluaran(totalKasbon);
  };

  const biayaTetap = 500000 + 185000 + 250000;
  const batasWajar = Math.max(0, voucherNominal - biayaTetap);
  const isOver = batasWajar > 0 && pengeluaran > batasWajar;
  const persentase = isOver ? Math.round(((pengeluaran - batasWajar) / batasWajar) * 100) : 0;
  const persenHadir = Math.round((hariMasuk / 18) * 100);

  return (
    <div className="home-wrapper">
      <img src={bgImage} alt="bg" className="home-background-image" />
      <div className="card-grid-wrapper">
        {/* Card Kehadiran */}
        <motion.div className="rekap-box glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="rekap-header">
            <FiCalendar className="rekap-icon" />
            <p className="rekap-label">Kehadiran</p>
          </div>
          <p className="rekap-value">{hariMasuk} / 18 Hari</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${persenHadir}%` }} />
          </div>
          <p className="rekap-note">
            {hariMasuk >= 18
              ? '✅ Target kehadiran tercapai!'
              : `Kurang ${18 - hariMasuk} hari dari target`}
          </p>
        </motion.div>

        {/* Card Voucher */}
        <motion.div className="rekap-box glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rekap-header">
            <FiGift className="rekap-icon" />
            <p className="rekap-label">Voucher</p>
          </div>
          <p className="rekap-value">{voucherPcs} pcs</p>
          <p className="rekap-subvalue">Rp {voucherNominal.toLocaleString('id-ID')}</p>
          <p className="rekap-note">
            {voucherNominal >= 1500000
              ? '✅ Target voucher tercapai!'
              : `Menuju Rp ${(1500000 - voucherNominal).toLocaleString('id-ID')}`}
          </p>
        </motion.div>

        {/* Card Pengeluaran */}
        <motion.div className="rekap-box glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rekap-header">
            <FiTrendingDown className="rekap-icon" />
            <p className="rekap-label">Pengeluaran</p>
          </div>
          <p className="rekap-value text-red">Rp {pengeluaran.toLocaleString('id-ID')}</p>
          {isOver ? (
            <>
              <p className="rekap-note text-red">⚠️ Melebihi batas wajar {persentase}%</p>
              <p className="rekap-subnote">📌 Wajar = Rp {batasWajar.toLocaleString('id-ID')}</p>
            </>
          ) : (
            <p className="rekap-note text-green">
              {batasWajar > 0
                ? '✅ Masih aman. Keuangan terkendali!'
                : '🔄 Belum ada voucher, tetap semangat!'}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HomeLadiesPage;