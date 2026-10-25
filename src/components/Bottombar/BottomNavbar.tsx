import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { confirmDialog } from '../ConfirmDialog';
import { halamanAktif, type Halaman, type TabNavbar } from '../../layout/menu';
import BottomSheetMenu, { type SheetSection } from './BottomSheetMenu';
import './BottomNavbar.css';

type Props<Id extends string> = {
  halaman: Record<Id, Halaman>;
  tabs: TabNavbar<Id>[];
};

/**
 * Navbar bawah mobile (admin & ladies) — isinya dari daftar menu bersama
 * (layout/menu.tsx). Tab berupa tautan langsung atau pembuka bottom sheet.
 *
 * Tab sheet juga menyala berdasarkan URL, bukan hanya selama sheet terbuka:
 * tanpa itu, setelah membuka mis. halaman Kasbon tidak ada penanda posisi
 * sama sekali di navigasi bawah.
 */
function BottomNavbar<Id extends string>({ halaman, tabs }: Props<Id>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Indeks tab sheet yang sedang terbuka.
  const [sheetTerbuka, setSheetTerbuka] = useState<number | null>(null);

  const aktif = (id: Id) => halamanAktif(halaman[id], location.pathname);

  const tabAktif = tabs.findIndex((t) =>
    t.jenis === 'link' ? aktif(t.halaman) : t.bagian.some((b) => b.items.some(aktif))
  );

  // Selama sheet terbuka, tab itulah yang menyala; kalau tidak, URL yang menentukan.
  const menyala = (i: number) => (sheetTerbuka !== null ? sheetTerbuka === i : tabAktif === i);

  const tutup = () => setSheetTerbuka(null);

  const buka = (path: string) => {
    navigate(path);
    tutup();
  };

  // Di mobile banyak halaman tanpa Header app, jadi sheet yang punya
  // `keluar` adalah tempat utama untuk keluar dari akun.
  const handleLogout = async () => {
    if (!(await confirmDialog('Keluar dari akun ini?'))) return;
    tutup();
    logout();
    navigate('/login');
  };

  const sheet = sheetTerbuka !== null ? tabs[sheetTerbuka] : null;

  const sections: SheetSection[] =
    sheet?.jenis === 'sheet'
      ? sheet.bagian.map((b) => ({
          judul: b.judul,
          items: b.items.map((id) => {
            const h = halaman[id];
            return {
              icon: h.mobile?.ikon ?? h.ikon,
              label: h.mobile?.label ?? h.label,
              desc: h.desc ?? '',
              path: h.rute,
            };
          }),
        }))
      : [];

  const perRute = new Map<string, Halaman>(Object.values<Halaman>(halaman).map((h) => [h.rute, h]));

  return (
    <>
      <div className="bottom-navbar-wrapper">
        <div className="bottom-navbar">
          {tabs.map((t, i) => {
            const Ikon = t.ikon;

            if (t.jenis === 'link') {
              const disini = aktif(t.halaman);
              return (
                <button
                  key={t.label}
                  type="button"
                  className={`nav-item ${sheetTerbuka === null && disini ? 'active' : ''}`}
                  aria-label={t.label}
                  aria-current={disini ? 'page' : undefined}
                  onClick={() => buka(halaman[t.halaman].rute)}
                >
                  <div className="nav-icon-wrapper">
                    <Ikon className="nav-icon" />
                  </div>
                  <span>{t.label}</span>
                </button>
              );
            }

            return (
              <button
                key={t.label}
                type="button"
                className={`nav-item ${menyala(i) ? 'active' : ''}`}
                aria-label={t.label}
                aria-expanded={sheetTerbuka === i}
                aria-current={tabAktif === i ? 'page' : undefined}
                onClick={() => setSheetTerbuka(i)}
              >
                <div className="nav-icon-wrapper">
                  <Ikon className="nav-icon" />
                </div>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {sheet?.jenis === 'sheet' && (
        <BottomSheetMenu
          title={sheet.judul}
          sections={sections}
          isAktif={(path) => {
            const h = perRute.get(path);
            return !!h && halamanAktif(h, location.pathname);
          }}
          onNavigate={buka}
          onClose={tutup}
          onLogout={sheet.keluar ? handleLogout : undefined}
        />
      )}
    </>
  );
}

export default BottomNavbar;
