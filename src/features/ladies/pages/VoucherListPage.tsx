import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import dayjs from 'dayjs';
import { FiGift } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import CardTable from '../../../components/CardTable';
import MonthNavigator from '../components/MonthNavigator';
import LedgerSummaryCard from '../components/LedgerSummaryCard';
import LedgerEmptyState from '../components/LedgerEmptyState';
import LedgerLoadingState from '../components/LedgerLoadingState';
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
    <div className="page-shell d-flex flex-column gap-3" style={{ paddingBottom: 20 }}>
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
            <div style={{ fontSize: 12, opacity: 0.9 }}>Estimasi Pendapatan</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
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
            <div className="d-flex justify-content-between align-items-start">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: 6 }}>
                  {dayjs(row.tanggal).format('DD MMM YYYY')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-income)', lineHeight: 1.1 }}>
                  {row.jumlah_voucher} pcs
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-gray-700)', marginTop: 3, fontWeight: 600 }}>
                  Rp {(row.jumlah_voucher * HARGA_PER_VOUCHER).toLocaleString('id-ID')}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-gray-500)',
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.keterangan || 'Tidak ada catatan'}
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default VoucherListPage;
