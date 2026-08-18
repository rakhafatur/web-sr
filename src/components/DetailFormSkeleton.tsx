import Skeleton from './Skeleton';

type Props = {
  label?: string;
  /** Jumlah field yang ditiru — samakan dengan jumlah field halaman aslinya. */
  fields?: number;
};

/**
 * Status memuat untuk halaman Detail entitas (Ladies/Pengawas/Agent/User).
 *
 * Keempatnya punya susunan yang sama — banner, kartu identitas, lalu kartu
 * berisi deretan field — jadi bentuk tiruannya cukup satu. Sebelumnya tiap
 * halaman menampilkan ikon berputar di tengah layar kosong, yang tidak
 * memberi tahu apa pun tentang apa yang sedang ditunggu.
 */
const DetailFormSkeleton = ({ label = 'Memuat data', fields = 5 }: Props) => (
  <div
    className="page-shell py-4 px-md-4 px-3 d-flex flex-column gap-3"
    style={{ maxWidth: 760 }}
    role="status"
    aria-busy="true"
    aria-label={label}
  >
    {/* BANNER */}
    <Skeleton height={112} borderRadius="var(--radius-xl)" />

    {/* KARTU IDENTITAS */}
    <Skeleton height={88} borderRadius="var(--radius-lg)" />

    {/* KARTU FIELD */}
    <div
      className="p-4 d-flex flex-column gap-3"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-gray-200)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Skeleton width="40%" height={16} />

      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="d-flex flex-column gap-2">
          <Skeleton width="28%" height={11} />
          <Skeleton height={42} borderRadius="var(--radius-md)" />
        </div>
      ))}
    </div>
  </div>
);

export default DetailFormSkeleton;
