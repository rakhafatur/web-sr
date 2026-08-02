import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiGift } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import CardTable from '../../../components/CardTable';
import MonthNavigator from '../components/MonthNavigator';
import LedgerSummaryCard from '../components/LedgerSummaryCard';
import LedgerEmptyState from '../components/LedgerEmptyState';
import LedgerLoadingState from '../components/LedgerLoadingState';
import LedgerCardRow from '../components/LedgerCardRow';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';

type Voucher = {
  id: string;
  tanggal: string;
  jumlah_voucher: number;
  keterangan?: string;
};

const rowsPerPage = 10;
const HARGA_PER_VOUCHER = 150000;

const VoucherListPage = () => {
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

  const { list: vouchers, loading } = useLedgerData<Voucher>(
    'vouchers',
    user?.ladies_id,
    selectedMonth,
    'voucher'
  );

  const totalPcs = useMemo(
    () => vouchers.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0),
    [vouchers]
  );

  const totalRp = totalPcs * HARGA_PER_VOUCHER;

  if (loading) {
    return <LedgerLoadingState text="Memuat voucher..." />;
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
        gradient="linear-gradient(135deg, var(--color-green), var(--color-accent))"
        shadowColor="rgba(var(--color-primary-rgb),0.3)"
        icon={<FiGift size={18} />}
        label="Total Voucher"
        value={<>{totalPcs} pcs</>}
        subtitle={
          <>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>Estimasi Pendapatan</div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginTop: 2 }}>
              Rp {totalRp.toLocaleString('id-ID')}
            </div>
          </>
        }
      />

      {vouchers.length === 0 ? (
        <LedgerEmptyState message="Belum ada voucher di bulan ini ✨" />
      ) : (
        <CardTable
          data={vouchers}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          renderItem={(row) => (
            <LedgerCardRow
              tanggal={row.tanggal}
              color="var(--color-income)"
              mainLine={<>{row.jumlah_voucher} pcs</>}
              extraLine={<>Rp {(row.jumlah_voucher * HARGA_PER_VOUCHER).toLocaleString('id-ID')}</>}
              keterangan={row.keterangan}
            />
          )}
        />
      )}
    </div>
  );
};

export default VoucherListPage;
