import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiHeart } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';
import { useMediaQuery } from 'react-responsive';
import LedgerPageMobile from '../components/LedgerPageMobile';
import LedgerPageDesktop from '../components/LedgerPageDesktop';

type Dokter = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

const DokterListPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const { selectedMonth, handleMonthChange, prevMonth, nextMonth, isNextDisabled } = useMonthNavigation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { list: dokterList, loading, refetch } = useLedgerData<Dokter>(
    'dokter',
    user?.ladies_id,
    selectedMonth,
    'dokter',
    'id, tanggal, jumlah, keterangan'
  );

  const totalJumlah = useMemo(
    () => dokterList.reduce((sum, item) => sum + (item.jumlah || 0), 0),
    [dokterList]
  );

  const items = dokterList.map((item) => ({
    id: item.id,
    tanggal: item.tanggal,
    mainValue: <>- Rp{item.jumlah.toLocaleString('id-ID')}</>,
    keterangan: item.keterangan,
  }));

  if (isMobile) {
    return (
      <LedgerPageMobile
        title="Dokter"
        icon={<FiHeart />}
        loading={loading}
        onRefresh={refetch}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onPrev={prevMonth}
        onNext={nextMonth}
        nextDisabled={isNextDisabled}
        summaryLabel="Total Dokter"
        summaryValue={<>Rp{totalJumlah.toLocaleString('id-ID')}</>}
        items={items}
        valueColor="var(--color-medical)"
        emptyMessage="Belum ada data dokter di bulan ini"
      />
    );
  }

  return (
    <LedgerPageDesktop
      title="Dokter"
      description="Riwayat biaya kesehatan kamu per bulan"
      loading={loading}
      selectedMonth={selectedMonth}
      onPrev={prevMonth}
      onNext={nextMonth}
      nextDisabled={isNextDisabled}
      kartu={[
        { label: 'Total dokter', nilai: <>Rp{totalJumlah.toLocaleString('id-ID')}</>, sub: 'Biaya kesehatan bulan ini', utama: true },
      ]}
      kolomNilai="Jumlah"
      items={items}
      valueColor="var(--color-medical)"
      emptyMessage="Belum ada data dokter di bulan ini"
    />
  );
};

export default DokterListPage;
