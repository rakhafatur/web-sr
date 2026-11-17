import type { Variants } from 'framer-motion';

/**
 * Varian animasi masuk bersama: wadah memunculkan anak-anaknya berurutan,
 * tiap anak naik sedikit sambil membesar dengan pegas.
 *
 * Pemakaian: wadah diberi `variants={wadahMuncul} initial="sembunyi"
 * animate={terbuka ? 'tampil' : 'sembunyi'}` (terbuka dari useLayarTerbuka),
 * lalu tiap blok di dalamnya cukup `variants={anakMuncul}`.
 */
export const wadahMuncul: Variants = {
  sembunyi: {},
  tampil: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } },
};

export const anakMuncul: Variants = {
  sembunyi: { opacity: 0, y: 26, scale: 0.96 },
  tampil: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 250, damping: 24, mass: 0.9 },
  },
};
