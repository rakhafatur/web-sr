import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useMediaQuery } from 'react-responsive';
import { FiChevronDown, FiSearch, FiCheck, FiX } from 'react-icons/fi';

export type SearchableOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  height?: number;
  borderRadius?: number;
  fontSize?: string;
};

const PANEL_MAX_HEIGHT = 320;

/** Pengganti <select> native buat daftar panjang (Ladies/Pengawas) — bisa
    diketik buat filter, jadi tidak perlu scroll manual satu-satu nyari nama
    di antara puluhan opsi.

    DUA MODE, sengaja berbeda:

    - Desktop: dropdown yang menempel ke tombol, di-render lewat portal ke
      document.body. Portal-nya perlu karena kalau di-render di alur dokumen
      biasa, panel ke-clip oleh card pembungkus yang hampir semua punya
      `overflow: hidden`.

    - Mobile: pemilih LAYAR PENUH, seperti picker aplikasi native. Model
      "menempel ke tombol" tidak bisa dipakai di layar kecil karena begitu
      kolom cari disentuh, keyboard muncul dan browser men-scroll halaman
      sendiri — panel jadi ikut bergeser, tertutup keyboard, atau menutup
      sendiri. Layar penuh menghilangkan seluruh kelas masalah itu: tidak ada
      perhitungan posisi, tidak ada tabrakan dengan keyboard, dan kolom cari
      selalu di atas sehingga keyboard (yang selalu di bawah) tidak menutupinya. */
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Cari...',
  height = 54,
  borderRadius = 16,
  fontSize = '0.9rem',
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : options;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  // Hanya dipakai mode desktop — hitung posisi panel dari tombol trigger,
  // dan "flip" ke atas kalau ruang di bawah tidak cukup.
  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < PANEL_MAX_HEIGHT && rect.top > spaceBelow;

    setPanelStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
    });
  };

  useEffect(() => {
    if (!open || isMobile) return;

    updatePosition();

    // Panel desktop menempel ke tombol; kalau halaman di-scroll, posisinya
    // nyasar — jadi ditutup saja. Scroll capture-phase juga kepicu oleh
    // scroll di DALAM daftar panel sendiri, itu harus diabaikan.
    const handleScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, isMobile]);

  // Klik di luar hanya relevan untuk dropdown desktop. Mode mobile menutup
  // lewat tombol X-nya sendiri.
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  useEffect(() => {
    if (!open) return;

    // Auto-focus HANYA di desktop. Di iOS, `.focus()` di luar gesture user
    // langsung tetap memindahkan fokus (halaman ikut ter-zoom) tapi keyboard
    // ditolak muncul. Di mobile biarkan user menyentuh kolom carinya sendiri.
    if (isMobile) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open, isMobile]);

  // Kunci scroll halaman selama pemilih layar penuh terbuka, supaya latar
  // belakang tidak ikut bergeser di balik overlay.
  useEffect(() => {
    if (!open || !isMobile) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isMobile]);

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value);
    close();
  };

  const searchInput = (
    <div style={{ position: 'relative' }}>
      <FiSearch
        size={15}
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-gray-500)',
        }}
      />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        style={{
          width: '100%',
          height: isMobile ? 46 : 38,
          borderRadius: 10,
          border: '1px solid var(--color-gray-200)',
          background: 'var(--color-surface-2)',
          paddingLeft: 32,
          paddingRight: 10,
          // 16px itu ambang batas iOS: font di bawah itu bikin Safari
          // otomatis nge-zoom halaman saat input difokus.
          fontSize: isMobile ? 16 : '0.85rem',
          color: 'var(--color-dark)',
        }}
      />
    </div>
  );

  const optionList = (
    <>
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '16px 12px',
            textAlign: 'center',
            fontSize: isMobile ? '0.9rem' : '0.8rem',
            color: 'var(--color-gray-500)',
          }}
        >
          Tidak ditemukan
        </div>
      ) : (
        filtered.map((opt) => {
          const active = opt.value === value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt)}
              className="searchable-select-option"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: isMobile ? '14px 16px' : '10px 14px',
                border: 'none',
                borderBottom: isMobile ? '1px solid var(--color-gray-200)' : undefined,
                background: active ? 'var(--color-green-lighter)' : 'transparent',
                color: 'var(--color-dark)',
                fontSize: isMobile ? '0.95rem' : '0.85rem',
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </span>

              {active && (
                <FiCheck size={16} style={{ flexShrink: 0, color: 'var(--color-green)' }} />
              )}
            </button>
          );
        })
      )}
    </>
  );

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          height,
          borderRadius,
          border: '2px solid var(--color-green-light)',
          background: 'var(--color-surface)',
          color: selected ? 'var(--color-dark)' : 'var(--color-gray-500)',
          fontWeight: 600,
          fontSize,
          padding: '0 40px 0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selected ? selected.label : placeholder}
        </span>

        <FiChevronDown
          style={{
            flexShrink: 0,
            marginLeft: 8,
            color: 'var(--color-gray-500)',
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* ===== MODE MOBILE: pemilih layar penuh ===== */}
      {open &&
        isMobile &&
        ReactDOM.createPortal(
          <div
            ref={panelRef}
            data-ptr-ignore
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 3000,
              background: 'var(--color-bg)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: 12,
                borderBottom: '1px solid var(--color-gray-200)',
                background: 'var(--color-surface)',
                flexShrink: 0,
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--color-dark)',
                    flex: 1,
                  }}
                >
                  {placeholder.replace(/^--\s*|\s*--$/g, '')}
                </div>

                <button
                  type="button"
                  onClick={close}
                  aria-label="Tutup"
                  className="btn border-0 d-flex align-items-center justify-content-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-gray-500)',
                    flexShrink: 0,
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>

              {searchInput}
            </div>

            {/* Daftar mengisi sisa ruang. Keyboard muncul dari bawah dan
                memperkecil area ini — kolom cari di header tetap terlihat. */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {optionList}
            </div>
          </div>,
          document.body
        )}

      {/* ===== MODE DESKTOP: dropdown menempel ke tombol ===== */}
      {open &&
        !isMobile &&
        ReactDOM.createPortal(
          <div
            ref={panelRef}
            data-ptr-ignore
            style={{
              ...panelStyle,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 16,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3000,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 8, borderBottom: '1px solid var(--color-gray-200)' }}>
              {searchInput}
            </div>

            <div
              style={{
                maxHeight: PANEL_MAX_HEIGHT - 54,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {optionList}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SearchableSelect;
