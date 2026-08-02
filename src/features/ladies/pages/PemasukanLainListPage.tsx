import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiDollarSign } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import CardTable from '../../../components/CardTable';
import MonthNavigator from '../components/MonthNavigator';
import LedgerSummaryCard from '../components/LedgerSummaryCard';
import LedgerEmptyState from '../components/LedgerEmptyState';
import LedgerLoadingState from '../components/LedgerLoadingState';
import LedgerCardRow from '../components/LedgerCardRow';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';

type PemasukanLain = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

const rowsPerPage = 10;

const PemasukanLainListPage = () => {
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

  const { list: pemasukanList, loading } = useLedgerData<PemasukanLain>(
    'pemasukan_lain',
    user?.ladies_id,
    selectedMonth,
    'pemasukan lain'
  );

  const totalJumlah = useMemo(
    () => pemasukanList.reduce((sum, item) => sum + (item.jumlah || 0), 0),
    [pemasukanList]
  );

  if (loading) {
    return <LedgerLoadingState text="Memuat data pemasukan..." />;
  }

  return (
    <div className="page-shell d-flex flex-column gap-3" style={{ paddingBottom: 20, maxWidth: 560 }}>
      <MonthNavigator
        selectedMonth={selectedMonth}
        onChange={handleMonthChange}
        onPrev={prevMonth}
        onNext={nextMonth}
        nextDisabled={isNextDisabled}
      />

      <LedgerSummaryCard
        gradient="linear-gradient(135deg, var(--color-voucher), #a16207)"
        shadowColor="rgba(var(--color-warning-solid-rgb),0.3)"
        icon={<FiDollarSign size={18} />}
        label="Total Pemasukan"
        value={<>Rp {totalJumlah.toLocaleString('id-ID')}</>}
        subtitle={
          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
            Total pemasukan tambahan bulan ini
          </div>
        }
      />

      {pemasukanList.length === 0 ? (
        <LedgerEmptyState message="Belum ada data pemasukan bulan ini ✨" />
      ) : (
        <CardTable
          data={pemasukanList}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          renderItem={(item) => (
            <LedgerCardRow
              tanggal={item.tanggal}
              color="var(--color-voucher)"
              mainLine={<>+ Rp {item.jumlah.toLocaleString('id-ID')}</>}
              keterangan={item.keterangan}
            />
          )}
        />
      )}
    </div>
  );
};

export default PemasukanLainListPage;
