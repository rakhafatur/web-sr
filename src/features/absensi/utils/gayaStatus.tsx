import type { ReactNode } from 'react';
import { FiCheckCircle, FiCoffee, FiHeart, FiMoon } from 'react-icons/fi';

/** Ikon & warna semantik status absensi. Nilainya sama dengan tampilan di
    AbsensiPage (halaman lama sengaja belum diubah untuk memakai modul ini). */
type GayaStatus = { label: string; icon: ReactNode; color: string; soft: string };

const GAYA_STATUS: Record<string, GayaStatus> = {
  KERJA: { label: 'Kerja', icon: <FiCheckCircle />, color: 'var(--color-income)', soft: 'var(--color-income-soft)' },
  MENS: { label: 'Mens', icon: <FiHeart />, color: 'var(--color-expense)', soft: 'var(--color-expense-soft)' },
  OFF: { label: 'Off', icon: <FiMoon />, color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' },
  SAKIT: { label: 'Sakit', icon: <FiCoffee />, color: 'var(--color-voucher)', soft: 'var(--color-voucher-soft)' },
};

export const gayaStatus = (status: string): GayaStatus =>
  GAYA_STATUS[status] ?? { label: status, icon: <FiCheckCircle />, color: 'var(--color-gray-700)', soft: 'var(--color-gray-200)' };
