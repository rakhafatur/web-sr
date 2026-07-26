import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import dayjs from 'dayjs';
import { FiHeart } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import CardTable from '../../../components/CardTable';
import CardPagination from '../../../components/CardPagination';
import MonthNavigator from '../components/MonthNavigator';
import LedgerSummaryCard from '../components/LedgerSummaryCard';
import LedgerEmptyState from '../components/LedgerEmptyState';
import LedgerLoadingState from '../components/LedgerLoadingState';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';

type Dokter = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

const rowsPerPage = 10;

const DokterListPage = () => {
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

  const { list: dokterList, loading } = useLedgerData<Dokter>(
    'dokter',
    user?.ladies_id,
    selectedMonth,
    'dokter'
  );

  const totalJumlah = useMemo(
    () => dokterList.reduce((sum, item) => sum + (item.jumlah || 0), 0),
    [dokterList]
  );

  if (loading) {
    return <LedgerLoadingState text="Memuat data dokter..." />;
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
        gradient="linear-gradient(135deg, var(--color-medical), var(--color-accent))"
        shadowColor="rgba(139,147,246,0.3)"
        icon={<FiHeart size={18} />}
        label="Total Dokter"
        value={<>Rp {totalJumlah.toLocaleString('id-ID')}</>}
        subtitle={
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            Total pengeluaran kesehatan bulan ini
          </div>
        }
      />

      {dokterList.length === 0 ? (
        <LedgerEmptyState message="Belum ada data dokter di bulan ini ✨" />
      ) : (
        <CardTable
          data={dokterList}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          renderItem={(item) => (
            <div className="d-flex justify-content-between align-items-start">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 600, marginBottom: 6 }}>
                  {dayjs(item.tanggal).format('DD MMM YYYY')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-medical)', lineHeight: 1.1 }}>
                  - Rp {item.jumlah.toLocaleString('id-ID')}
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
                  {item.keterangan || 'Tidak ada catatan'}
                </div>
              </div>
            </div>
          )}
          renderFooter={({ page, totalPages, onPageChange }) => (
            <CardPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        />
      )}
    </div>
  );
};

export default DokterListPage;
