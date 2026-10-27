import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiCreditCard } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';
import { useMediaQuery } from 'react-responsive';
import LedgerPageMobile from '../components/LedgerPageMobile';
import LedgerPageDesktop from '../components/LedgerPageDesktop';

type Kasbon = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

const KasbonListPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const { selectedMonth, handleMonthChange, prevMonth, nextMonth, isNextDisabled } = useMonthNavigation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { list: kasbonList, loading, refetch } = useLedgerData<Kasbon>(
    'kasbon',
    user?.ladies_id,
    selectedMonth,
    'kasbon',
    'id, tanggal, jumlah, keterangan'
  );

  const totalJumlah = useMemo(
    () => kasbonList.reduce((sum, item) => sum + (item.jumlah || 0), 0),
    [kasbonList]
  );

  const items = kasbonList.map((item) => ({
    id: item.id,
    tanggal: item.tanggal,
    mainValue: <>- Rp{item.jumlah.toLocaleString('id-ID')}</>,
    keterangan: item.keterangan,
  }));

  if (isMobile) {
    return (
      <LedgerPageMobile
        title="Kasbon"
        icon={<FiCreditCard />}
        loading={loading}
        onRefresh={refetch}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onPrev={prevMonth}
        onNext={nextMonth}
        nextDisabled={isNextDisabled}
        summaryLabel="Total Kasbon"
        summaryValue={<>Rp{totalJumlah.toLocaleString('id-ID')}</>}
        items={items}
        valueColor="var(--color-expense)"
        emptyMessage="Belum ada kasbon di bulan ini"
      />
    );
  }

  return (
    <LedgerPageDesktop
      title="Kasbon"
      description="Riwayat pengambilan kasbon kamu per bulan"
      loading={loading}
      selectedMonth={selectedMonth}
      onPrev={prevMonth}
      onNext={nextMonth}
      nextDisabled={isNextDisabled}
      kartu={[
        { label: 'Total kasbon', nilai: <>Rp{totalJumlah.toLocaleString('id-ID')}</>, sub: 'Pengambilan bulan ini', utama: true },
      ]}
      kolomNilai="Jumlah"
      items={items}
      valueColor="var(--color-expense)"
      emptyMessage="Belum ada kasbon di bulan ini"
    />
  );
};

export default KasbonListPage;
