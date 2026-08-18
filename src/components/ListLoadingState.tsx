import { FiLoader } from 'react-icons/fi';

type Props = {
  /** Dibacakan pembaca layar saat daftar sedang diambil. */
  label?: string;
};

/** Indikator memuat standar untuk halaman daftar admin (Users, Ladies,
    Pengawas, Agent, Outlet). Sebelumnya sebagian halaman menuliskan JSX ini
    sendiri dan sebagian lain tidak menampilkan apa pun, sehingga daftarnya
    tampak kosong dulu lalu isinya muncul mendadak. */
const ListLoadingState = ({ label = 'Memuat data' }: Props) => (
  <div
    className="d-flex justify-content-center p-3"
    role="status"
    aria-label={label}
  >
    <FiLoader size={20} className="spinner-icon" />
  </div>
);

export default ListLoadingState;
