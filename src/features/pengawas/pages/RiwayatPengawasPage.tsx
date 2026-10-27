import { useMemo, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { FiCreditCard, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { RootState } from '../../../app/store';
import CardTable from '../../../components/CardTable';
import PullToRefresh from '../../../components/PullToRefresh';
import MonthNavigator from '../../ladies/components/MonthNavigator';
import LedgerSummaryCard from '../../ladies/components/LedgerSummaryCard';
import LedgerEmptyState from '../../ladies/components/LedgerEmptyState';
import LedgerLoadingState from '../../ladies/components/LedgerLoadingState';
import LedgerCardRowV2 from '../../ladies/components/LedgerCardRowV2';
import LedgerPageMobile from '../../ladies/components/LedgerPageMobile';
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
    warnaSoft: string;
    gradient: string;
    bayangan: string;
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
    warnaSoft: 'var(--color-income-soft)',
    gradient: 'linear-gradient(135deg, var(--color-income), var(--color-income-deep))',
    bayangan: 'rgba(var(--color-success-rgb),0.3)',
    subjudul: 'Total gaji bulan ini',
    kosong: 'Belum ada gaji di bulan ini',
  },
  pemasukanLain: {
    tabel: 'pemasukan_lain_pengawas',
    judul: 'Pemasukan Lain',
    ikon: <FiDollarSign />,
    tanda: '+',
    warna: 'var(--color-voucher)',
    warnaSoft: 'var(--color-voucher-soft)',
    gradient: 'linear-gradient(135deg, var(--color-voucher), var(--color-voucher-deep))',
    bayangan: 'rgba(var(--color-warning-solid-rgb),0.3)',
    subjudul: 'Bonus & pemasukan tambahan bulan ini',
    kosong: 'Belum ada pemasukan lain di bulan ini',
  },
  kasbon: {
    tabel: 'kasbon_pengawas',
    judul: 'Kasbon',
    ikon: <FiCreditCard />,
    tanda: '-',
    warna: 'var(--color-expense)',
    warnaSoft: 'var(--color-expense-soft)',
    gradient: 'linear-gradient(135deg, var(--color-expense), var(--color-expense-deep))',
    bayangan: 'rgba(var(--color-danger-solid-rgb),0.3)',
    subjudul: 'Total pengambilan bulan ini',
    kosong: 'Belum ada kasbon di bulan ini',
  },
};

const rowsPerPage = 5;

/**
 * Riwayat gaji / pemasukan lain / kasbon milik pengawas yang sedang login — pola sama dengan
 * halaman Kasbon ladies (hanya-baca). Pencatatannya tetap lewat menu
 * Transaksi Pengawas di admin.
 */
const RiwayatPengawasPage = ({ jenis }: { jenis: Jenis }) => {
  const k = KONFIG[jenis];
  const pengawasId = useSelector((state: RootState) => state.user.currentUser?.pengawas_id);

  const { selectedMonth, page, setPage, handleMonthChange, prevMonth, nextMonth, isNextDisabled } =
    useMonthNavigation();
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
        items={list.map((item) => ({
          id: item.id,
          tanggal: item.tanggal,
          mainValue: (
            <>
              {k.tanda} Rp{item.jumlah.toLocaleString('id-ID')}
            </>
          ),
          keterangan: item.keterangan,
        }))}
        valueColor={k.warna}
        emptyMessage={k.kosong}
      />
    );
  }

  if (loading) {
    return <LedgerLoadingState text={`Memuat data ${k.judul.toLowerCase()}...`} />;
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
          gradient={k.gradient}
          shadowColor={k.bayangan}
          icon={k.ikon}
          label={`Total ${k.judul}`}
          value={<>Rp {total.toLocaleString('id-ID')}</>}
          subtitle={<div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>{k.subjudul}</div>}
        />

        {list.length === 0 ? (
          <LedgerEmptyState message={k.kosong} />
        ) : (
          <CardTable
            data={list}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            rowClassName="p-2 mb-2"
            renderItem={(item, index) => (
              <LedgerCardRowV2
                tanggal={item.tanggal}
                label={k.judul}
                color={k.warna}
                colorSoft={k.warnaSoft}
                mainValue={
                  <>
                    {k.tanda} Rp {item.jumlah.toLocaleString('id-ID')}
                  </>
                }
                keterangan={item.keterangan}
                index={index}
              />
            )}
          />
        )}
      </div>
    </PullToRefresh>
  );
};

export default RiwayatPengawasPage;
