import './momen.css';

type Props = {
  /** `penuh` mengisi seluruh wadah (splash, login); `atas` hanya bagian atas
      lalu memudar ke warna latar (Home). */
  varian?: 'penuh' | 'atas';
};

/**
 * Latar "aurora": tiga orb warna aksen yang bergerak sangat pelan. Murni
 * hiasan — wadahnya harus `position: relative` dan isi di atasnya diberi
 * z-index. Orb berupa radial-gradient (bukan filter blur), jadi murah untuk
 * HP kelas bawah; hanya `transform` yang dianimasikan.
 */
const Aurora = ({ varian = 'penuh' }: Props) => (
  <div className={`aurora aurora--${varian}`} aria-hidden>
    <span className="aurora-orb aurora-orb--1" />
    <span className="aurora-orb aurora-orb--2" />
    <span className="aurora-orb aurora-orb--3" />
  </div>
);

export default Aurora;
