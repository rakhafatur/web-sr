import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../constant';
import { cocokRute } from '../../utils/cocokRute';
import type { ItemMenu, MenuSidebar } from './menuSidebar';
import './Sidebar.css';

type Props = {
  menu: MenuSidebar;
  /** Nama landmark navigasi untuk pembaca layar. */
  label: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Angka badge per `to` menu (mis. jumlah pendaftar menunggu). 0 = tanpa badge. */
  badge?: Partial<Record<string, number>>;
};

type Tooltip = { teks: string; top: number };

const teksBadge = (n: number) => (n > 99 ? '99+' : String(n));

/**
 * Sidebar desktop bersama untuk admin & ladies — isinya dari `menuSidebar`.
 *
 * Semua menu selalu terlihat (tanpa akordeon) dan dikelompokkan dengan judul
 * bagian. Saat diciutkan, judul bagian diganti garis pemisah dan nama menu
 * muncul sebagai tooltip. Tooltip memakai `position: fixed` karena daftar
 * menu bisa di-scroll (overflow) dan akan memotong tooltip yang absolut.
 */
function SidebarNav({ menu, label, isCollapsed, onToggleCollapse, badge }: Props) {
  const { pathname } = useLocation();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // Tooltip hanya ada di mode ciut; jangan tertinggal saat sidebar dilebarkan.
  useEffect(() => {
    if (!isCollapsed) setTooltip(null);
  }, [isCollapsed]);

  const renderItem = (item: ItemMenu) => {
    const aktif = cocokRute([item.to, ...(item.cocok ?? [])], pathname);
    const jumlah = badge?.[item.to] ?? 0;
    const nama = item.namaLengkap ?? item.label;
    const namaDenganBadge = jumlah > 0 ? `${nama}, ${jumlah} menunggu` : nama;

    const tampilkanTooltip = (el: HTMLElement) => {
      if (!isCollapsed) return;
      const r = el.getBoundingClientRect();
      setTooltip({ teks: namaDenganBadge, top: r.top + r.height / 2 });
    };

    return (
      <li key={item.to}>
        <Link
          to={item.to}
          className={`sidebar-link${aktif ? ' is-active' : ''}`}
          aria-current={aktif ? 'page' : undefined}
          aria-label={isCollapsed ? namaDenganBadge : undefined}
          onMouseEnter={(e) => tampilkanTooltip(e.currentTarget)}
          onFocus={(e) => tampilkanTooltip(e.currentTarget)}
          onMouseLeave={() => setTooltip(null)}
          onBlur={() => setTooltip(null)}
        >
          <span className="sidebar-icon" aria-hidden>
            {item.ikon}
            {isCollapsed && jumlah > 0 && <span className="sidebar-dot" />}
          </span>
          {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
          {!isCollapsed && jumlah > 0 && (
            <span className="sidebar-badge">
              {teksBadge(jumlah)}
              <span className="visually-hidden"> menunggu</span>
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <nav
      className={`sidebar${isCollapsed ? ' is-collapsed' : ''}`}
      style={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      aria-label={label}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="sidebar-toggle-btn"
        title={isCollapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
        aria-label={isCollapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      <div className="sidebar-scroll" onScroll={() => setTooltip(null)}>
        {menu.bagian.map((bagian, i) => (
          <div key={bagian.judul ?? `bagian-${i}`}>
            {i > 0 &&
              (isCollapsed ? (
                <div className="sidebar-divider" aria-hidden />
              ) : bagian.judul ? (
                <div className="sidebar-section" aria-hidden>
                  {bagian.judul}
                </div>
              ) : (
                <div className="sidebar-gap" aria-hidden />
              ))}
            <ul className="sidebar-list" aria-label={bagian.judul}>
              {bagian.items.map(renderItem)}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <ul className="sidebar-list">{menu.bawah.map(renderItem)}</ul>
      </div>

      {tooltip && (
        <div
          className="sidebar-tooltip"
          // Visual saja — nama menu sudah dibacakan lewat aria-label link.
          aria-hidden
          style={{ top: tooltip.top, left: SIDEBAR_COLLAPSED_WIDTH + 6 }}
        >
          {tooltip.teks}
        </div>
      )}
    </nav>
  );
}

export default SidebarNav;
