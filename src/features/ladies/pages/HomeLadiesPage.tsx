import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';
import bgImage from '../../../assets/bg-home.png'; // ✅ path fix

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

    setHariMasuk(absensi?.length || 0);
    setVoucherPcs(vouchers?.length || 0);
    setPengeluaran(kasbon?.reduce((sum, k) => sum + k.jumlah, 0) || 0);
  };

  return (
    <div className="home-wrapper">
      <img src={bgImage} alt="bg" className="home-background-image" />

      <div className="home-overlay">
        <motion.h1
          className="text-xl font-bold text-center text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Halo, {user?.nama_ladies?.split(' ')[0] || 'Ladies'} 👋
        </motion.h1>

        <motion.p
          className="text-sm text-center text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Work hard, party harder ✨
        </motion.p>

        <div className="space-y-4 pt-4">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="font-medium">Hari Masuk Bulan Ini</p>
            <p className="text-2xl font-bold">{hariMasuk}</p>
            <p className="text-xs text-gray-500">
              Kurang {Math.max(0, 18 - hariMasuk)} hari dari target 18 hari
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <p className="font-medium">Voucher Didapat</p>
            <p className="text-2xl font-bold">{voucherPcs} pcs</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <p className="font-medium">Pengeluaran Bulan Ini</p>
            <p className="text-2xl font-bold text-red-500">
              Rp {pengeluaran.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLadiesPage;