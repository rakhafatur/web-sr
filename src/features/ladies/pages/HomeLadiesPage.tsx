import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';
import bgImage from '../../../assets/bg-home.png';
import { FiCalendar, FiGift, FiTrendingDown } from 'react-icons/fi';

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
  const persenHadir = Math.round((hariMasuk / 18) * 100);

  return (
    <div className="home-wrapper">
      <img src={bgImage} alt="background" className="home-background-image" />

      <div className="home-overlay scroll-horizontal">
        <div className="card">
          <div className="card-icon"><FiCalendar /></div>
          <p className="card-label">Kehadiran</p>
          <p className="card-value">{hariMasuk} / 18 Hari</p>
          <p className="card-note">{Math.max(0, 18 - hariMasuk)} hari lagi</p>
        </div>

        <div className="card">
          <div className="card-icon"><FiGift /></div>
          <p className="card-label">Voucher</p>
          <p className="card-value">{voucherPcs} pcs</p>
          <p className="card-note">Rp {voucherNominal.toLocaleString('id-ID')}</p>
        </div>

        <div className="card">
          <div className="card-icon"><FiTrendingDown /></div>
          <p className="card-label">Pengeluaran</p>
          <p className="card-value text-red">Rp {pengeluaran.toLocaleString('id-ID')}</p>
          <p className="card-note">
            {isOver
              ? '⚠️ Melebihi batas wajar'
              : batasWajar > 0
              ? '✅ Masih aman'
              : '🔄 Belum ada voucher'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeLadiesPage;