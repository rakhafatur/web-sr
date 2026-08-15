import { useMediaQuery } from 'react-responsive';
import { FiSearch } from 'react-icons/fi';

export type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  searchText: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
};

/** Filter tipe + kotak pencarian untuk Riwayat Transaksi (ladies & pengawas).
    Sebelumnya blok ini ditulis dua kali dan dibungkus `{!isMobile && ...}`,
    sehingga pengguna HP sama sekali tidak punya cara menyaring transaksi.
    Di mobile: pill di-scroll horizontal, kotak cari full-width di bawahnya. */
const TransaksiFilterBar = ({
  options,
  value,
  onChange,
  searchText,
  onSearchChange,
  placeholder = 'Cari transaksi...',
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const pills = (
    <div
      className="d-flex gap-2"
      style={
        isMobile
          ? {
              // Pill tidak dibungkus ke bawah di layar sempit — digeser
              // horizontal supaya tinggi filter tetap satu baris.
              overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }
          : { flexWrap: 'wrap' }
      }
    >
      {options.map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            className="btn"
            onClick={() => onChange(item.value)}
            style={{
              borderRadius: 999,
              padding: isMobile ? '6px 14px' : '8px 18px',
              fontSize: isMobile ? '0.8rem' : undefined,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              border: active ? 'none' : '1px solid var(--color-gray-200)',
              background: active ? 'var(--color-green)' : 'var(--color-surface)',
              color: active ? '#fff' : 'var(--color-gray-700)',
              fontWeight: 600,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const search = (
    <div style={{ position: 'relative', width: isMobile ? '100%' : 300 }}>
      <FiSearch
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-gray-500)',
        }}
      />

      <input
        type="text"
        className="form-control border-0 shadow-none"
        placeholder={placeholder}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          borderRadius: 999,
          background: 'var(--color-surface-2)',
          paddingLeft: 40,
          height: isMobile ? 42 : 45,
        }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div className="d-flex flex-column gap-2 mb-3">
        {pills}
        {search}
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        {pills}
        {search}
      </div>
    </div>
  );
};

export default TransaksiFilterBar;
