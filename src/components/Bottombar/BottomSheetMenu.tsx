import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FiChevronRight, FiLogOut, FiX } from 'react-icons/fi';

export type SheetItem = {
  icon: React.ReactNode;
  label: string;
  /** Satu baris penjelasan singkat di bawah nama menu. */
  desc: string;
  path: string;
};

export type SheetSection = {
  /** Judul bagian (opsional) — huruf biasa, bukan kapital semua. */
  judul?: string;
  items: SheetItem[];
};

type Props = {
  title: string;
  sections: SheetSection[];
  /** true kalau item ini adalah halaman yang sedang dibuka. */
  isAktif: (path: string) => boolean;
  onNavigate: (path: string) => void;
  onClose: () => void;
  /** Kalau diisi, tampil tombol "Keluar" di bagian paling bawah. */
  onLogout?: () => void;
};

/**
 * Bottom sheet menu untuk navbar bawah (ladies & admin). Gaya selaras dengan
 * daftar Riwayat & Menu Cepat: satu kartu berkelompok per bagian, ikon
 * lingkaran, penjelasan singkat per item, dan penanda halaman aktif.
 */
const BottomSheetMenu = ({ title, sections, isAktif, onNavigate, onClose, onLogout }: Props) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  // onClose dari navbar dibuat ulang tiap render; disimpan di ref supaya efek
  // di bawah hanya jalan sekali saat sheet dibuka (fokus tidak melompat).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    // Fokus ke wadah dialog (bukan input) — aman di iOS, tidak memunculkan
    // keyboard maupun zoom. Supaya pembaca layar & Escape langsung bekerja.
    sheetRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return ReactDOM.createPortal(
    <div className="bottom-modal-backdrop" onClick={onClose}>
      <div
        className="bottom-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={sheetRef}
        data-ptr-ignore
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet-handle-wrapper">
          <div className="bottom-sheet-handle" />
        </div>

        <div className="bs-header">
          <h2 className="bs-title">{title}</h2>
          <button type="button" className="bs-close" onClick={onClose} aria-label="Tutup">
            <FiX />
          </button>
        </div>

        {sections.map((section, si) => (
          <div key={si} className="bs-section">
            {section.judul && <div className="bs-section-title">{section.judul}</div>}

            <div className="bs-group">
              {section.items.map((item) => {
                const aktif = isAktif(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`bs-item ${aktif ? 'is-active' : ''}`}
                    onClick={() => onNavigate(item.path)}
                    aria-current={aktif ? 'page' : undefined}
                  >
                    <span className="bs-icon" aria-hidden>{item.icon}</span>
                    <span className="bs-text">
                      <span className="bs-label">{item.label}</span>
                      <span className="bs-desc">{item.desc}</span>
                    </span>
                    {aktif && <span className="bs-active-dot" aria-hidden />}
                    <FiChevronRight className="bs-chevron" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {onLogout && (
          <div className="bs-section">
            <div className="bs-group">
              <button type="button" className="bs-item bs-item--danger" onClick={onLogout}>
                <span className="bs-icon" aria-hidden><FiLogOut /></span>
                <span className="bs-text">
                  <span className="bs-label">Keluar</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default BottomSheetMenu;
