import logo from '../../assets/logosr-blue.png';
import './momen.css';

type Props = {
  /** Diameter lingkaran dalam px. */
  ukuran?: number;
  /** Di atas bidang gradien (tirai): lingkaran putih supaya logo biru terbaca. */
  diAtasGradien?: boolean;
};

/**
 * Tanda brand: logo SR di dalam lingkaran kaca dengan cincin gradien yang
 * berputar pelan. Dipakai splash, login, daftar, dan tirai masuk supaya
 * keempatnya terasa satu rangkaian.
 */
const TandaSR = ({ ukuran = 96, diAtasGradien = false }: Props) => (
  <span
    className={`tanda-sr${diAtasGradien ? ' tanda-sr--terang' : ''}`}
    style={{ width: ukuran, height: ukuran }}
    aria-hidden
  >
    <span className="tanda-sr-cincin" />
    <span className="tanda-sr-isi">
      {/* Gambar aslinya punya banyak ruang kosong di tepi, jadi diperbesar. */}
      <img src={logo} alt="" draggable={false} />
    </span>
  </span>
);

export default TandaSR;
