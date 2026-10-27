import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiDollarSign } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';
import { useMediaQuery } from 'react-responsive';
import LedgerPageMobile from '../components/LedgerPageMobile';
import LedgerPageDesktop from '../components/LedgerPageDesktop';

type PemasukanLain = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

const PemasukanLainListPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const { selectedMonth, handleMonthChange, prevMonth, nextMonth, isNextDisabled } = useMonthNavigation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { list: pemasukanList, loading, refetch } = useLedgerData<PemasukanLain>(
    'pemasukan_lain',
    user?.ladies_id,
    selectedMonth,
    'pemasukan lain',
    'id, tanggal, jumlah, keterangan'
  );

  const totalJumlah = useMemo(
    () => pemasukanList.reduce((sum, item) => sum + (item.jumlah || 0), 0),
    [pemasukanList]
  );

  const items = pemasukanList.map((item) => ({
    id: item.id,
    tanggal: item.tanggal,
    mainValue: <>+ Rp{item.jumlah.toLocaleString('id-ID')}</>,
    keterangan: item.keterangan,
  }));

  if (isMobile) {
    return (
      <LedgerPageMobile
        title="Pemasukan Lain"
        icon={<FiDollarSign />}
        loading={loading}
        onRefresh={refetch}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onPrev={prevMonth}
        onNext={nextMonth}
        nextDisabled={isNextDisabled}
        summaryLabel="Total Pemasukan"
        summaryValue={<>Rp{totalJumlah.toLocaleString('id-ID')}</>}
        items={items}
        valueColor="var(--color-income)"
        emptyMessage="Belum ada pemasukan di bulan ini"
      />
    );
  }

  return (
    <LedgerPageDesktop
      title="Pemasukan Lain"
      description="Riwayat pemasukan tambahan kamu per bulan"
      loading={loading}
      selectedMonth={selectedMonth}
      onPrev={prevMonth}
      onNext={nextMonth}
      nextDisabled={isNextDisabled}
      kartu={[
        { label: 'Total pemasukan', nilai: <>Rp{totalJumlah.toLocaleString('id-ID')}</>, sub: 'Pemasukan tambahan bulan ini', utama: true },
      ]}
      kolomNilai="Jumlah"
      items={items}
      valueColor="var(--color-income)"
      emptyMessage="Belum ada pemasukan di bulan ini"
    />
  );
};

export default PemasukanLainListPage;
