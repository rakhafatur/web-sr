import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { useLayarTerbuka } from '../../hooks/useMomenMasuk';

type Props = {
  nilai: number;
  /** Cara menulis angka, mis. rupiah. Bawaan: bilangan bulat format Indonesia. */
  format?: (n: number) => string;
  /** Lama hitungan dalam detik. */
  durasi?: number;
  className?: string;
};

const bulat = (n: number) => Math.round(n).toLocaleString('id-ID');

/**
 * Angka yang menghitung naik dari 0 (atau dari nilai sebelumnya saat data
 * diperbarui). Baru mulai setelah layar terbuka — lihat lib/momenMasuk.
 *
 * Teksnya ditulis langsung ke DOM tiap frame supaya tidak merender ulang
 * React puluhan kali per detik. Pembaca layar mendapat nilai akhirnya saja.
 */
const AngkaNaik = ({ nilai, format = bulat, durasi = 1.2, className }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const posisi = useRef(0);
  const formatRef = useRef(format);
  const terbuka = useLayarTerbuka();
  const kurangiGerak = useReducedMotion();
  // Teks awal dibekukan: React tidak boleh menimpa teks yang sedang dihitung.
  const [awal] = useState(() => format(0));

  useEffect(() => {
    formatRef.current = format;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !terbuka) return;

    if (kurangiGerak) {
      posisi.current = nilai;
      el.textContent = formatRef.current(nilai);
      return;
    }

    const kontrol = animate(posisi.current, nilai, {
      duration: durasi,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        posisi.current = v;
        el.textContent = formatRef.current(v);
      },
    });
    return () => kontrol.stop();
  }, [nilai, terbuka, kurangiGerak, durasi]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden>
        {awal}
      </span>
      <span className="visually-hidden">{format(nilai)}</span>
    </span>
  );
};

export default AngkaNaik;
