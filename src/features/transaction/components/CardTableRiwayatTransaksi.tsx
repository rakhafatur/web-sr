import dayjs from 'dayjs';
import {
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGift,
  FiHeart,
  FiInbox,
  FiTrendingUp,
} from 'react-icons/fi';
import Pagination from '../../../components/Pagination';
import SwipeToDelete from '../../../components/SwipeToDelete';
import '../../../styles/mobile-admin.css';

type Transaksi = {
  id: string;
  tanggal: string;
  tipe: string;
  tipeLabel: string;
  jumlah: number;
  jumlah_voucher?: number;
  keterangan?: string;
  priority: number;
};

type Props = {
  data: Transaksi[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (row: Transaksi) => void;
};

type GayaTipe = {
  label: string;
  icon: React.ReactNode;
  color: string;
  soft: string;
  /** Tanda di depan nominal: '-' untuk pengeluaran, '+' untuk pemasukan. */
  tanda: '+' | '-';
};

/** Tipe ladies & pengawas. Sebelumnya hanya tipe ladies yang dikenal, jadi
    transaksi pengawas tampil sebagai "Lainnya" abu-abu — dan kasbon pengawas
    ditulis "+ Rp" seolah pemasukan. */
const GAYA_TIPE: Record<string, GayaTipe> = {
  voucher: { label: 'Voucher', icon: <FiGift />, color: 'var(--color-income)', soft: 'var(--color-income-soft)', tanda: '+' },
  pemasukan_lain: { label: 'Pemasukan', icon: <FiDollarSign />, color: 'var(--color-income)', soft: 'var(--color-income-soft)', tanda: '+' },
  kasbon: { label: 'Kasbon', icon: <FiCreditCard />, color: 'var(--color-expense)', soft: 'var(--color-expense-soft)', tanda: '-' },
  dokter: { label: 'Dokter', icon: <FiHeart />, color: 'var(--color-medical)', soft: 'var(--color-medical-soft)', tanda: '-' },
  gaji_pengawas: { label: 'Gaji', icon: <FiTrendingUp />, color: 'var(--color-income)', soft: 'var(--color-income-soft)', tanda: '+' },
  kasbon_pengawas: { label: 'Kasbon', icon: <FiCreditCard />, color: 'var(--color-expense)', soft: 'var(--color-expense-soft)', tanda: '-' },
  lainnya_pengawas: { label: 'Lainnya', icon: <FiFileText />, color: 'var(--color-medical)', soft: 'var(--color-medical-soft)', tanda: '-' },
};

const GAYA_DEFAULT: GayaTipe = {
  label: 'Lainnya',
  icon: <FiFileText />,
  color: 'var(--color-gray-700)',
  soft: 'var(--color-gray-200)',
  tanda: '+',
};

const tanggalSingkat = (t: string) =>
  dayjs(t).toDate().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

/** Daftar riwayat transaksi versi mobile (ladies & pengawas): satu kartu
    berkelompok, ikon per tipe, nominal berwarna, geser ke kiri untuk hapus. */
const CardTableRiwayatTransaksi = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onDelete,
}: Props) => {
  const orderedRows = [...data].sort(
    (a, b) => dayjs(b.tanggal).valueOf() - dayjs(a.tanggal).valueOf()
  );

  const start = page * rowsPerPage;
  const currentRows = orderedRows.slice(start, start + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  if (data.length === 0) {
    return (
      <div className="tm-group">
        <div className="tm-empty">
          <span className="tm-empty-icon" aria-hidden><FiInbox /></span>
          <div className="tm-empty-title">Belum ada transaksi</div>
          <div className="tm-empty-text">Coba pilih bulan lain atau ubah filter.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="tm-group tm-list">
        {currentRows.map((row) => {
          const gaya = GAYA_TIPE[row.tipe] ?? GAYA_DEFAULT;
          const catatan =
            row.tipe === 'voucher' ? `${row.jumlah_voucher}× voucher` : row.keterangan;

          const rowContent = (
            <div className="tm-row">
              <span className="tm-row-icon" style={{ background: gaya.soft, color: gaya.color }} aria-hidden>
                {gaya.icon}
              </span>
              <div className="tm-row-main">
                <div className="tm-row-title">{gaya.label}</div>
                <div className="tm-row-sub">
                  {tanggalSingkat(row.tanggal)}
                  {catatan ? ` · ${catatan}` : ''}
                </div>
              </div>
              <span className="tm-row-amount" style={{ color: gaya.color }}>
                {gaya.tanda} Rp{Number(row.jumlah).toLocaleString('id-ID')}
              </span>
            </div>
          );

          return onDelete ? (
            <SwipeToDelete key={row.id} onDelete={() => onDelete(row)} borderRadius={0}>
              {rowContent}
            </SwipeToDelete>
          ) : (
            <div key={row.id}>{rowContent}</div>
          );
        })}
      </div>

      {onDelete && <div className="tm-hint">Geser baris ke kiri untuk menghapus</div>}

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default CardTableRiwayatTransaksi;
