type Props = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
};

/** Placeholder shimmer generik — dipakai untuk menyusun skeleton loading
    per halaman (bentuknya menyesuaikan layout konten aslinya). */
const Skeleton = ({ width = '100%', height = 16, borderRadius = 'var(--radius-md)', style }: Props) => (
  <div
    className="skeleton-shimmer"
    style={{ width, height, borderRadius, ...style }}
  />
);

export default Skeleton;
