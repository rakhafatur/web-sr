import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLayarTerbuka } from '../../hooks/useMomenMasuk';

type Props = {
  /** Kemajuan 0–1. Di luar rentang itu dijepit. */
  nilai: number;
  /** Diameter dalam px. */
  ukuran?: number;
  tebal?: number;
  /** Isi di tengah cincin (mis. persen). */
  children?: ReactNode;
};

/**
 * Cincin kemajuan bergradien aksen yang "menggambar" dirinya saat layar
 * terbuka. Murni hiasan data — beri teks/label di sekitarnya untuk pembaca
 * layar.
 */
const CincinProgres = ({ nilai, ukuran = 68, tebal = 7, children }: Props) => {
  const id = useId();
  const terbuka = useLayarTerbuka();
  const aman = Math.max(0, Math.min(1, Number.isFinite(nilai) ? nilai : 0));
  const jari = (ukuran - tebal) / 2;
  const tengah = ukuran / 2;

  return (
    <span className="bm-cincin" style={{ width: ukuran, height: ukuran }} aria-hidden>
      <svg width={ukuran} height={ukuran} viewBox={`0 0 ${ukuran} ${ukuran}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--brand-1)' }} />
            <stop offset="55%" style={{ stopColor: 'var(--brand-2)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--brand-3)' }} />
          </linearGradient>
        </defs>
        <circle
          cx={tengah}
          cy={tengah}
          r={jari}
          fill="none"
          strokeWidth={tebal}
          style={{ stroke: 'var(--border-translucent)' }}
        />
        {aman > 0 && (
          <motion.circle
            cx={tengah}
            cy={tengah}
            r={jari}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={tebal}
            strokeLinecap="round"
            // Mulai dari jam 12, searah jarum jam.
            transform={`rotate(-90 ${tengah} ${tengah})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: terbuka ? aman : 0 }}
            transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </svg>
      {children && <span className="bm-cincin-tengah">{children}</span>}
    </span>
  );
};

export default CincinProgres;
