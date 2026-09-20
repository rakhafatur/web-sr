import { Link, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

import { cariRuteAktif, type GrupNav } from '../../layout/navItems';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

type Props = {
  grup: GrupNav[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  namaUser: string;
  peran: string;
  onLogout: () => void;
};

/**
 * Sidebar desktop.
 *
 * Grup berlabel dengan semua item selalu terlihat, menggantikan accordion
 * yang default tertutup dan tidak pernah disinkronkan ke URL — akibatnya di
 * halaman dalam, sidebar lama tidak menunjukkan posisi pengguna sama sekali.
 *
 * Data user disuntikkan lewat props, bukan dibaca dari Redux di sini, supaya
 * komponennya bisa diuji tanpa store.
 */
const Sidebar = ({
  grup,
  collapsed,
  onToggleCollapse,
  namaUser,
  peran,
  onLogout,
}: Props) => {
  const { pathname } = useLocation();
  const aktif = cariRuteAktif(pathname, grup);

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 flex flex-col',
        'bg-card border-r border-line',
        'transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-14 px-3 shrink-0 border-b border-line">
        <div className="flex items-center justify-center size-8 shrink-0 rounded-md bg-brand text-fg-on-brand text-xs font-semibold">
          SR
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg truncate">SR Agency</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {grup.map((g) => (
          <div key={g.label} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-fg-faint">
                {g.label}
              </p>
            )}

            <ul className="flex flex-col gap-0.5">
              {g.items.map((item) => {
                const Ikon = item.ikon;
                const ini = aktif === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      aria-current={ini ? 'page' : undefined}
                      className={[
                        'flex items-center gap-2.5 rounded-md h-9 px-2',
                        'text-sm transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-brand focus-visible:ring-offset-1',
                        'focus-visible:ring-offset-card',
                        ini
                          ? 'bg-brand-subtle text-brand-fg font-medium'
                          : 'text-fg-muted hover:bg-hover hover:text-fg',
                        collapsed ? 'justify-center px-0' : '',
                      ].join(' ')}
                    >
                      <Ikon className="size-4 shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kaki: akun + tema + ciutkan. Header 68px dibubarkan, dan isinya
          pindah ke sini. */}
      <div className="shrink-0 border-t border-line p-2 flex flex-col gap-2">
        {!collapsed && (
          <>
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="flex items-center justify-center size-8 shrink-0 rounded-full bg-brand-subtle text-brand-fg text-xs font-semibold">
                {namaUser.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-fg truncate">{namaUser}</div>
                <div className="text-xs text-fg-faint truncate">{peran}</div>
              </div>
            </div>

            <ThemeToggle />
          </>
        )}

        <div className={collapsed ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
          {collapsed && <ThemeToggle ringkas />}

          <Button
            variant="ghost"
            size="sm"
            fullWidth={!collapsed}
            aria-label="Keluar"
            onClick={onLogout}
            icon={<FiLogOut aria-hidden="true" />}
          >
            {!collapsed && 'Keluar'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={collapsed ? 'Lebarkan menu' : 'Ciutkan menu'}
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <FiChevronRight aria-hidden="true" />
            ) : (
              <FiChevronLeft aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
