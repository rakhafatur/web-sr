import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';
import bgImage from '../../../assets/bg-home.png';

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
  const overLimit = pengeluaran - batasWajar;
  const isOver = overLimit > 0;
  const persentase = isOver ? Math.round((overLimit / batasWajar) * 100) : 0;

  return (
    <div className="home-wrapper">
      <img src={bgImage} alt="bg" className="home-background-image" />
      <div className="home-overlay">
        <div className="rekap-grid">

          {/* Kehadiran */}
          <div className="rekap-box">
            <p className="rekap-label">Kehadiran</p>
            <p className="rekap-value">{hariMasuk} / 18 Hari</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(hariMasuk / 18) * 100}%` }} />
            </div>
            <p className="rekap-note">Kurang {Math.max(0, 18 - hariMasuk)} hari dari target</p>
          </div>

          {/* Voucher */}
          <div className="rekap-box yellow-box">
            <p className="rekap-label">Voucher</p>
            <p className="rekap-value">{voucherPcs} pcs</p>
            <p className="rekap-subvalue">Rp {voucherNominal.toLocaleString('id-ID')}</p>
          </div>

          {/* Pengeluaran */}
          <div className="rekap-box red-box">
            <p className="rekap-label">Pengeluaran</p>
            <p className="rekap-value text-red">Rp {pengeluaran.toLocaleString('id-ID')}</p>
            {isOver ? (
              <>
                <p className="rekap-note text-red">
                  ⚠️ Melebihi batas wajar {persentase}%
                </p>
                <p className="rekap-subnote">📌 Wajar = Rp {batasWajar.toLocaleString('id-ID')}</p>
              </>
            ) : (
              <p className="rekap-note text-green">
                ✅ Masih aman. Keuangan terkendali!
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomeLadiesPage;