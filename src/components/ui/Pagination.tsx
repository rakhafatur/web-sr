import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from './Button';

type Props = {
  /** Berbasis 1, bukan 0 — sesuai yang ditampilkan ke pengguna. */
  halaman: number;
  totalHalaman: number;
  /** Kalau diketahui, keterangannya jadi "1–10 dari 47" alih-alih "Halaman 1 dari 5". */
  totalData?: number;
  perHalaman?: number;
  onUbah: (halaman: number) => void;
};

/**
 * Navigasi halaman.
 *
 * Versi lama hanya menampilkan "1/5", sehingga pengguna tidak pernah tahu ada
 * berapa data seluruhnya — padahal itu yang paling sering ingin diketahui saat
 * menelusuri daftar.
 */
const Pagination = ({ halaman, totalHalaman, totalData, perHalaman, onUbah }: Props) => {
  const bisaMundur = halaman > 1;
  const bisaMaju = halaman < totalHalaman;

  let keterangan: string;
  if (totalData !== undefined && perHalaman !== undefined) {
    const mulai = (halaman - 1) * perHalaman + 1;
    const selesai = Math.min(halaman * perHalaman, totalData);
    keterangan = `${mulai}–${selesai} dari ${totalData}`;
  } else {
    keterangan = `Halaman ${halaman} dari ${totalHalaman}`;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="tabular text-xs text-fg-muted">{keterangan}</p>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          aria-label="Halaman sebelumnya"
          disabled={!bisaMundur}
          onClick={() => bisaMundur && onUbah(halaman - 1)}
          icon={<FiChevronLeft aria-hidden="true" />}
        >
          <span className="sr-only md:not-sr-only">Sebelumnya</span>
        </Button>

        <Button
          size="sm"
          variant="secondary"
          aria-label="Halaman berikutnya"
          disabled={!bisaMaju}
          onClick={() => bisaMaju && onUbah(halaman + 1)}
        >
          <span className="sr-only md:not-sr-only">Berikutnya</span>
          <FiChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
