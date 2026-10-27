import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { FiGift } from 'react-icons/fi';
import type { UserWithLadies } from '../../../types/user';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useLedgerData } from '../hooks/useLedgerData';
import { useMediaQuery } from 'react-responsive';
import LedgerPageMobile from '../components/LedgerPageMobile';
import LedgerPageDesktop from '../components/LedgerPageDesktop';

type Voucher = {
  id: string;
  tanggal: string;
  jumlah: number;
  jumlah_voucher: number;
  keterangan?: string;
};

const VoucherListPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const { selectedMonth, handleMonthChange, prevMonth, nextMonth, isNextDisabled } = useMonthNavigation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { list: vouchers, loading, refetch } = useLedgerData<Voucher>(
    'vouchers',
    user?.ladies_id,
    selectedMonth,
    'voucher',
    // keterangan: tipe harga ("Voucher - Single") untuk transaksi baru.
    'id, tanggal, jumlah, jumlah_voucher, keterangan'
  );

  const totalPcs = useMemo(
    () => vouchers.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0),
    [vouchers]
  );

  const totalRp = useMemo(
    () => vouchers.reduce((sum, v) => sum + (v.jumlah || 0), 0),
    [vouchers]
  );

  const items = vouchers.map((item) => ({
    id: item.id,
    tanggal: item.tanggal,
    mainValue: <>{item.jumlah_voucher} pcs</>,
    subValue: <>Rp{(item.jumlah || 0).toLocaleString('id-ID')}</>,
    keterangan: item.keterangan,
  }));

  if (isMobile) {
    return (
      <LedgerPageMobile
        title="Voucher"
        icon={<FiGift />}
        loading={loading}
        onRefresh={refetch}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onPrev={prevMonth}
        onNext={nextMonth}
        nextDisabled={isNextDisabled}
        summaryLabel="Total Voucher"
        summaryValue={<>{totalPcs} pcs</>}
        summaryFoot={{ label: 'Estimasi Pendapatan', value: <>Rp{totalRp.toLocaleString('id-ID')}</> }}
        items={items}
        valueColor="var(--color-voucher)"
        emptyMessage="Belum ada voucher di bulan ini"
      />
    );
  }

  return (
    <LedgerPageDesktop
      title="Voucher"
      description="Riwayat voucher & estimasi pendapatan kamu per bulan"
      loading={loading}
      selectedMonth={selectedMonth}
      onPrev={prevMonth}
      onNext={nextMonth}
      nextDisabled={isNextDisabled}
      kartu={[
        { label: 'Total voucher', nilai: <>{totalPcs} pcs</>, sub: 'Bulan ini', utama: true },
        { label: 'Estimasi pendapatan', nilai: <>Rp{totalRp.toLocaleString('id-ID')}</>, sub: 'Bagian kamu dari voucher' },
      ]}
      kolomNilai="Voucher"
      kolomSub="Pendapatan"
      items={items}
      valueColor="var(--color-voucher)"
      emptyMessage="Belum ada voucher di bulan ini"
    />
  );
};

export default VoucherListPage;
