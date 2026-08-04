import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiCreditCard } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import CardTable from '../../../components/CardTable';
import PullToRefresh from '../../../components/PullToRefresh';
import MonthNavigator from '../components/MonthNavigator';
import LedgerSummaryCard from '../components/LedgerSummaryCard';
import LedgerEmptyState from '../components/LedgerEmptyState';
import LedgerLoadingState from '../components/LedgerLoadingState';
import LedgerCardRow from '../components/LedgerCardRow';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';

type Kasbon = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

const rowsPerPage = 10;

const KasbonListPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const {
    selectedMonth,
    page,
    setPage,
    handleMonthChange,
    prevMonth,
    nextMonth,
    isNextDisabled,
  } = useMonthNavigation();

  const { list: kasbonList, loading, refetch } = useLedgerData<Kasbon>(
    'kasbon',
    user?.ladies_id,
    selectedMonth,
    'kasbon'
  );

  const totalJumlah = useMemo(
    () => kasbonList.reduce((sum, item) => sum + (item.jumlah || 0), 0),
    [kasbonList]
  );

  if (loading) {
    return <LedgerLoadingState text="Memuat data kasbon..." />;
  }

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="page-shell d-flex flex-column gap-3" style={{ paddingBottom: 20, maxWidth: 560 }}>
        <MonthNavigator
          selectedMonth={selectedMonth}
          onChange={handleMonthChange}
          onPrev={prevMonth}
          onNext={nextMonth}
          nextDisabled={isNextDisabled}
        />

        <LedgerSummaryCard
          gradient="linear-gradient(135deg, var(--color-expense), var(--color-expense-deep))"
          shadowColor="rgba(var(--color-danger-solid-rgb),0.3)"
          icon={<FiCreditCard size={18} />}
          label="Total Kasbon"
          value={<>Rp {totalJumlah.toLocaleString('id-ID')}</>}
          subtitle={
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
              Total pengambilan bulan ini
            </div>
          }
        />

        {kasbonList.length === 0 ? (
          <LedgerEmptyState message="Belum ada kasbon di bulan ini ✨" />
        ) : (
          <CardTable
            data={kasbonList}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            renderItem={(item) => (
              <LedgerCardRow
                tanggal={item.tanggal}
                color="var(--color-expense)"
                mainLine={<>- Rp {item.jumlah.toLocaleString('id-ID')}</>}
                keterangan={item.keterangan}
              />
            )}
          />
        )}
      </div>
    </PullToRefresh>
  );
};

export default KasbonListPage;
