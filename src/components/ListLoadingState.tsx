import Skeleton from './Skeleton';

type Props = {
  label?: string;
  /** Jumlah baris tiruan. Sesuaikan dengan tinggi daftar yang biasanya muncul,
      supaya isi halaman tidak melompat begitu data datang. */
  rows?: number;
};

/**
 * Status memuat untuk area daftar/tabel.
 *
 * Bentuknya meniru baris yang sedang ditunggu, bukan ikon berputar di tengah
 * ruang kosong: user langsung melihat berapa banyak dan sebesar apa isinya,
 * dan tata letaknya tidak melompat saat data datang.
 *
 * Aturan yang dipakai di seluruh aplikasi: skeleton untuk daftar & kartu,
 * ikon berputar hanya di dalam tombol aksi.
 */
const ListLoadingState = ({ label = 'Memuat data', rows = 4 }: Props) => (
  <div
    className="d-flex flex-column gap-2"
    role="status"
    aria-busy="true"
    aria-label={label}
  >
    {Array.from({ length: rows }, (_, i) => (
      <div
        key={i}
        className="d-flex align-items-center gap-3 p-3"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Skeleton width={38} height={38} borderRadius="var(--radius-md)" />

        <div className="flex-grow-1 d-flex flex-column gap-2" style={{ minWidth: 0 }}>
          <Skeleton width="45%" height={13} />
          <Skeleton width="70%" height={11} />
        </div>

        <Skeleton width={54} height={22} borderRadius="var(--radius-md)" />
      </div>
    ))}
  </div>
);

export default ListLoadingState;
