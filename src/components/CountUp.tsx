import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

type Props = {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
};

const defaultFormatter = (n: number) => Math.round(n).toLocaleString('id-ID');

/** Angka yang "menghitung naik" ke nilai barunya alih-alih langsung loncat —
    dipakai untuk figure yang cukup menonjol untuk layak dilihat animasinya
    (mis. angka besar di hero card), bukan dipasang di semua angka. */
const CountUp = ({ value, duration = 0.8, formatter = defaultFormatter }: Props) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const controls = animate(prevRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });

    prevRef.current = value;

    return () => controls.stop();
  }, [value, duration]);

  return <>{formatter(display)}</>;
};

export default CountUp;
