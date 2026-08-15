import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useMediaQuery } from 'react-responsive';
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';

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

    Panel-nya di-render lewat portal ke document.body (bukan di dalam alur
    dokumen biasa) — kalau tidak, dia ke-clip oleh card pembungkus yang
    hampir semua punya `overflow: hidden` (buat merapikan sudut header
    card), jadi kelihatan cuma sedikit padahal daftarnya lebih panjang. */
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

  // Hitung posisi panel dari posisi tombol trigger di viewport — dipanggil
  // ulang tiap kali dibuka, dan otomatis "flip" ke atas kalau ruang di
  // bawah tidak cukup buat menampung panelnya.
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
    if (!open) return;

    updatePosition();

    // Panel-nya position:fixed relatif ke viewport — kalau HALAMAN di-scroll
    // selagi terbuka, posisinya bisa nyasar dari tombol trigger, jadi ditutup
    // saja. Tapi scroll capture-phase di window juga kepicu oleh scroll di
    // DALAM daftar panel sendiri (overflowY:auto) — itu harus diabaikan,
    // bukan dianggap "scroll di luar".
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
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
      setQuery('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    // Auto-focus HANYA di desktop. Di iOS, `.focus()` yang dipanggil di luar
    // gesture user langsung (di sini: dalam setTimeout) tetap memindahkan
    // fokus — sehingga halaman ikut nge-zoom ke input — tapi keyboard-nya
    // ditolak muncul oleh Safari. Hasilnya: layar ke-zoom tanpa keyboard.
    // Di mobile biarkan user yang menyentuh kolom cari; tap itu gesture sah,
    // jadi keyboard muncul normal.
    if (isMobile) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open, isMobile]);

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

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

      {open &&
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
                    height: isMobile ? 44 : 38,
                    borderRadius: 10,
                    border: '1px solid var(--color-gray-200)',
                    background: 'var(--color-surface-2)',
                    paddingLeft: 32,
                    paddingRight: 10,
                    // 16px itu ambang batas iOS: font di bawah itu bikin
                    // Safari otomatis nge-zoom halaman saat input difokus.
                    // Jangan turunkan di bawah 16 untuk mobile.
                    fontSize: isMobile ? 16 : '0.85rem',
                    color: 'var(--color-dark)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                maxHeight: PANEL_MAX_HEIGHT - 54,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
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
                        padding: '10px 14px',
                        border: 'none',
                        background: active ? 'var(--color-green-lighter)' : 'transparent',
                        color: 'var(--color-dark)',
                        fontSize: '0.85rem',
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
                        <FiCheck size={14} style={{ flexShrink: 0, color: 'var(--color-green)' }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SearchableSelect;
