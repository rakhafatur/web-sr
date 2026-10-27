import { useMemo, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { FiCreditCard, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { RootState } from '../../../app/store';
import LedgerPageMobile from '../../ladies/components/LedgerPageMobile';
import LedgerPageDesktop from '../../ladies/components/LedgerPageDesktop';
import { useMonthNavigation } from '../../ladies/hooks/useMonthNavigation';
import { useLedgerData } from '../../ladies/hooks/useLedgerData';
import { BERANDA } from '../../../layout/peran';

type Baris = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

type Jenis = 'gaji' | 'pemasukanLain' | 'kasbon';

const KONFIG: Record<
  Jenis,
  {
    tabel: string;
    judul: string;
    ikon: ReactNode;
    tanda: '+' | '-';
    warna: string;
    deskripsi: string;
    subjudul: string;
    kosong: string;
  }
> = {
  gaji: {
    tabel: 'gaji_pengawas',
    judul: 'Gaji',
    ikon: <FiTrendingUp />,
    tanda: '+',
    warna: 'var(--color-income)',
    deskripsi: 'Riwayat gaji kamu per bulan',
    subjudul: 'Gaji bulan ini',
    kosong: 'Belum ada gaji di bulan ini',
  },
  pemasukanLain: {
    tabel: 'pemasukan_lain_pengawas',
    judul: 'Pemasukan Lain',
    ikon: <FiDollarSign />,
    tanda: '+',
    warna: 'var(--color-voucher)',
    deskripsi: 'Riwayat bonus & pemasukan tambahan kamu per bulan',
    subjudul: 'Bonus & pemasukan tambahan bulan ini',
    kosong: 'Belum ada pemasukan lain di bulan ini',
  },
  kasbon: {
    tabel: 'kasbon_pengawas',
    judul: 'Kasbon',
    ikon: <FiCreditCard />,
    tanda: '-',
    warna: 'var(--color-expense)',
    deskripsi: 'Riwayat pengambilan kasbon kamu per bulan',
    subjudul: 'Pengambilan bulan ini',
    kosong: 'Belum ada kasbon di bulan ini',
  },
};

/**
 * Riwayat gaji / pemasukan lain / kasbon milik pengawas yang sedang login —
 * pola sama dengan halaman Kasbon ladies (hanya-baca). Pencatatannya tetap
 * lewat menu Transaksi Pengawas di admin.
 */
const RiwayatPengawasPage = ({ jenis }: { jenis: Jenis }) => {
  const k = KONFIG[jenis];
  const pengawasId = useSelector((state: RootState) => state.user.currentUser?.pengawas_id);

  const { selectedMonth, handleMonthChange, prevMonth, nextMonth, isNextDisabled } = useMonthNavigation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { list, loading, refetch } = useLedgerData<Baris>(
    k.tabel,
    pengawasId,
    selectedMonth,
    k.judul.toLowerCase(),
    'id, tanggal, jumlah, keterangan',
    'pengawas_id'
  );

  const total = useMemo(() => list.reduce((sum, item) => sum + (item.jumlah || 0), 0), [list]);

  const items = list.map((item) => ({
    id: item.id,
    tanggal: item.tanggal,
    mainValue: (
      <>
        {k.tanda} Rp{item.jumlah.toLocaleString('id-ID')}
      </>
    ),
    keterangan: item.keterangan,
  }));

  if (isMobile) {
    return (
      <LedgerPageMobile
        title={k.judul}
        backTo={BERANDA.pengawas}
        icon={k.ikon}
        loading={loading}
        onRefresh={refetch}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onPrev={prevMonth}
        onNext={nextMonth}
        nextDisabled={isNextDisabled}
        summaryLabel={`Total ${k.judul}`}
        summaryValue={<>Rp{total.toLocaleString('id-ID')}</>}
        items={items}
        valueColor={k.warna}
        emptyMessage={k.kosong}
      />
    );
  }

  return (
    <LedgerPageDesktop
      title={k.judul}
      description={k.deskripsi}
      loading={loading}
      selectedMonth={selectedMonth}
      onPrev={prevMonth}
      onNext={nextMonth}
      nextDisabled={isNextDisabled}
      kartu={[
        { label: `Total ${k.judul.toLowerCase()}`, nilai: <>Rp{total.toLocaleString('id-ID')}</>, sub: k.subjudul, utama: true },
      ]}
      kolomNilai="Jumlah"
      items={items}
      valueColor={k.warna}
      emptyMessage={k.kosong}
    />
  );
};

export default RiwayatPengawasPage;
