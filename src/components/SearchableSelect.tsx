import { useEffect, useRef, useState } from 'react';
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

/** Pengganti <select> native buat daftar panjang (Ladies/Pengawas) — bisa
    diketik buat filter, jadi tidak perlu scroll manual satu-satu nyari nama
    di antara puluhan opsi. */
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    // Beri waktu render dulu sebelum fokus, supaya keyboard mobile tidak
    // "menyela" animasi buka panel.
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  const handleSelect = (opt: SearchableOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
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

      {open && (
        <div
          data-ptr-ignore
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
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
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid var(--color-gray-200)',
                  background: 'var(--color-surface-2)',
                  paddingLeft: 32,
                  paddingRight: 10,
                  fontSize: '0.85rem',
                  color: 'var(--color-dark)',
                }}
              />
            </div>
          </div>

          <div
            style={{
              maxHeight: 260,
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
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
