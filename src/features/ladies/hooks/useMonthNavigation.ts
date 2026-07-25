import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

/** State navigasi bulan (prev/next/pilih langsung) yang dipakai semua halaman ledger ladies. */
export function useMonthNavigation() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [page, setPage] = useState(0);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newDate = dayjs(`${value}-01`);

    if (!newDate.isValid()) {
      newDate = dayjs().startOf('month');
    }

    setSelectedMonth(newDate);
    setPage(0);
  };

  const prevMonth = () => {
    setSelectedMonth((m) => m.subtract(1, 'month'));
    setPage(0);
  };

  const nextMonth = () => {
    setSelectedMonth((m) => {
      const next = m.add(1, 'month');
      return next.isAfter(dayjs(), 'month') ? m : next;
    });
    setPage(0);
  };

  const isNextDisabled = selectedMonth.isSame(dayjs().startOf('month'), 'month');

  return {
    selectedMonth,
    page,
    setPage,
    handleMonthChange,
    prevMonth,
    nextMonth,
    isNextDisabled,
  };
}
