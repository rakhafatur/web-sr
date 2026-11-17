import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMediaQuery } from 'react-responsive';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
// Kelas hero (ladies-home-hero*) masih dipakai tampilan desktop.
import './HomeLadiesPage.css';

import { FiMessageCircle, FiTrendingUp, FiGift, FiCreditCard, FiHeart, FiCalendar } from 'react-icons/fi';

import type { UserWithLadies } from '../../../types/user';
import HomeLadiesDesktop from '../components/HomeLadiesDesktop';
import NotificationBell from '../../../components/Header/NotificationBell';
import AngkaNaik from '../../../components/beranda/AngkaNaik';
import CincinProgres from '../../../components/beranda/CincinProgres';
import BerandaSkeleton from '../../../components/beranda/BerandaSkeleton';
import {
  BarisHero,
  BerandaAtas,
  BerandaShell,
  KartuHero,
  KisiPetak,
  MenuCepat,
  Petak,
  Strip,
} from '../../../components/beranda/BerandaMobile';
import { TARGET_HARI_KERJA } from '../../absensi/utils/targetAbsensi';
import { sapaanWaktu } from '../../../utils/sapaanWaktu';

const TERSEMBUNYI = '••••••••';

const HomeLadiesPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const navigate = useNavigate();
  // Mobile: tampilan di bawah (components/beranda). Desktop: HomeLadiesDesktop (gaya dk-).
  const isMobile = useMediaQuery({ maxWidth: 768 });

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

  if (!isMobile) {
    return (
      <HomeLadiesDesktop
        sapaan={sapaanWaktu(new Date().getHours())}
        nama={nama}
        bulanIni={bulanIni}
        loading={loading}
        hariMasuk={hariMasuk}
        voucherPcs={voucherPcs}
        voucherNominal={voucherNominal}
        kasbon={pengeluaran}
        rataVoucherPerHari={rataVoucherPerHari}
        hideAmount={hideAmount}
        onToggleHide={() => setHideAmount((v) => !v)}
      />
    );
  }

  if (loading) {
    return <BerandaSkeleton />;
  }

  const sisaHari = Math.max(0, TARGET_HARI_KERJA - hariMasuk);

  const menuItems = [
    { label: 'Voucher', ikon: <FiGift />, onClick: () => navigate('/ladies/voucher') },
    { label: 'Kasbon', ikon: <FiCreditCard />, onClick: () => navigate('/ladies/kasbon') },
    { label: 'Dokter', ikon: <FiHeart />, onClick: () => navigate('/ladies/dokter') },
    { label: 'Absensi', ikon: <FiCalendar />, onClick: () => navigate('/ladies/absensi') },
  ];

  return (
    <BerandaShell onRefresh={refetch}>
      {/* Di mobile, MainLayout tidak merender Header di halaman ini. */}
      <BerandaAtas
        sapaan={sapaanWaktu(new Date().getHours())}
        nama={nama}
        onAvatar={() => navigate('/ladies/profile')}
        labelAvatar="Buka profil"
        kanan={ladiesId ? <NotificationBell ladiesId={ladiesId} /> : undefined}
      />

      <KartuHero
        label="Estimasi Pendapatan"
        ariaLabel="Estimasi pendapatan"
        sembunyi={{ aktif: hideAmount, onToggle: () => setHideAmount((v) => !v) }}
        sub={<>Dari voucher · {bulanIni}</>}
        kaki={
          <BarisHero label="Kasbon bulan ini">{hideAmount ? TERSEMBUNYI : formatRpNumber(pengeluaran)}</BarisHero>
        }
      >
        {hideAmount ? (
          <span className="is-uang">{TERSEMBUNYI}</span>
        ) : (
          <AngkaNaik className="is-uang" nilai={voucherNominal} format={formatRpNumber} />
        )}
      </KartuHero>

      <KisiPetak>
        <Petak
          lebar
          label="Hari masuk bulan ini"
          hiasan={
            <CincinProgres nilai={hariMasuk / TARGET_HARI_KERJA} ukuran={76} tebal={8}>
              {Math.min(100, Math.round((hariMasuk / TARGET_HARI_KERJA) * 100))}%
            </CincinProgres>
          }
          satuan={`dari ${TARGET_HARI_KERJA} hari`}
          sub={sisaHari === 0 ? 'Target bulan ini tercapai' : `Kurang ${sisaHari} hari untuk mencapai target`}
          onClick={() => navigate('/ladies/absensi')}
        >
          <AngkaNaik nilai={hariMasuk} />
        </Petak>

        <Petak label="Voucher" nada="aksen3" ikon={<FiGift />} satuan="pcs" sub={bulanIni}>
          <AngkaNaik nilai={voucherPcs} />
        </Petak>

        <Petak label="Rata-rata" nada="aksen2" ikon={<FiTrendingUp />} satuan="pcs/hari" sub="Voucher per hari masuk">
          {rataVoucherPerHari === null ? (
            '–'
          ) : (
            <AngkaNaik
              nilai={rataVoucherPerHari}
              format={(n) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
            />
          )}
        </Petak>
      </KisiPetak>

      <MenuCepat items={menuItems} />

      <Strip
        ikon={<FiMessageCircle />}
        judul="Tanya Smart Assistant"
        sub="Cek voucher & absensi kamu"
        onClick={() => navigate('/smart-chat-ladies')}
      />
    </BerandaShell>
  );
};

export default HomeLadiesPage;
