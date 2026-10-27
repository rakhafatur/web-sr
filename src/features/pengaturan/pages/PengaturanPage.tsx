import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { FiCheck } from 'react-icons/fi';
import { RootState } from '../../../app/store';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import { useTema } from '../../../hooks/useTema';
import type { PilihanTema, TemaAktif } from '../../../lib/tema';
import MenuAplikasi from '../components/MenuAplikasi';
import { BERANDA, peranDari } from '../../../layout/peran';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';
import './Pengaturan.css';

const OPSI_TEMA: { value: PilihanTema; label: string; sub: (temaAktif: TemaAktif) => string }[] = [
  {
    value: 'sistem',
    label: 'Ikuti sistem',
    sub: (t) => `Sekarang ${t === 'gelap' ? 'gelap' : 'terang'}, mengikuti HP`,
  },
  { value: 'terang', label: 'Terang', sub: () => 'Latar terang, nyaman di siang hari' },
  { value: 'gelap', label: 'Gelap', sub: () => 'Latar gelap, nyaman di malam hari' },
];

/** Gambar mini tema — 'sistem' dibelah dua: separuh gelap, separuh terang. */
const Pratinjau = ({ pilihan }: { pilihan: PilihanTema }) => {
  const sisi = (tema: 'gelap' | 'terang') => (
    <span className={`pg-pv pg-pv--${tema}`}>
      <span className="pg-pv-card">
        <span className="pg-pv-line is-accent" />
        <span className="pg-pv-line" />
        <span className="pg-pv-line is-short" />
      </span>
    </span>
  );

  return (
    <span className="pg-preview" aria-hidden>
      {pilihan === 'sistem' ? (
        <>
          {sisi('gelap')}
          {sisi('terang')}
        </>
      ) : (
        sisi(pilihan)
      )}
    </span>
  );
};

/**
 * Pengaturan — dipakai admin, ladies & pengawas.
 * - Tampilan: pilihan tema (bawaan: ikuti sistem), tersimpan di perangkat
 *   ini, berlaku langsung tanpa memuat ulang. Lihat src/lib/tema.ts.
 * - Menu aplikasi (khusus admin): saklar menu, berlaku untuk semua pengguna.
 */
const PengaturanPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const user = useSelector((state: RootState) => state.user.currentUser);
  const peran = peranDari(user);
  const isAdmin = peran === 'admin';
  const { pilihan, tema, setPilihan } = useTema();

  const pilihanTema = (
    <div className="pg-tema" role="radiogroup" aria-label="Tema tampilan">
      {OPSI_TEMA.map((o) => {
        const aktif = pilihan === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={aktif}
            className={`pg-opsi ${aktif ? 'is-active' : ''}`}
            onClick={() => setPilihan(o.value)}
          >
            <Pratinjau pilihan={o.value} />
            <span className="pg-opsi-text">
              <span className="pg-opsi-label">{o.label}</span>
              <span className="pg-opsi-sub">{o.sub(tema)}</span>
            </span>
            {aktif && <FiCheck className="pg-check" aria-hidden />}
          </button>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Pengaturan" backTo={BERANDA[peran]} />

        <div className="tm-stack">
          <h2 className="tm-section-title">Tampilan</h2>
          {pilihanTema}
          <div className="tm-help">
            Pilihan ini tersimpan di HP ini saja. "Ikuti sistem" otomatis berganti saat mode gelap HP dinyalakan
            atau dimatikan.
          </div>

          {isAdmin && (
            <>
              <h2 className="tm-section-title">Menu aplikasi</h2>
              <div className="tm-help" style={{ marginTop: 0 }}>
                Berlaku untuk <strong>semua pengguna</strong>, bukan hanya HP ini. Menu yang dimatikan hilang dari
                navigasi dan tidak bisa dibuka lewat tautan.
              </div>
              <MenuAplikasi varian="tm" />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Pengaturan"
        description={isAdmin ? 'Atur tampilan perangkat ini dan menu aplikasi' : 'Atur tampilan aplikasi di perangkat ini'}
      />

      <section className="dk-card" aria-label="Tampilan">
        <div className="dk-card-head">
          <h2 className="dk-card-title">Tampilan</h2>
          <div className="dk-card-sub">
            Tersimpan di perangkat ini saja. "Ikuti sistem" otomatis berganti mengikuti mode gelap komputer/HP.
          </div>
        </div>
        <div className="dk-card-body">{pilihanTema}</div>
      </section>

      {isAdmin && (
        <section className="dk-card pg-menu-card" aria-label="Menu aplikasi">
          <div className="dk-card-head">
            <h2 className="dk-card-title">Menu aplikasi</h2>
            <div className="dk-card-sub">
              Berlaku untuk <strong>semua pengguna</strong>, bukan hanya perangkat ini. Menu yang dimatikan hilang
              dari sidebar & navbar dan tidak bisa dibuka lewat tautan.
            </div>
          </div>
          <div className="dk-card-body">
            <MenuAplikasi varian="dk" />
          </div>
        </section>
      )}
    </div>
  );
};

export default PengaturanPage;
