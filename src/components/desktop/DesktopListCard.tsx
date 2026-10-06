import { ReactNode } from 'react';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../Pagination';
import ListLoadingState from '../ListLoadingState';
import '../../styles/desktop-admin.css';

type Props = {
  /** Label aksesibel kartu, mis. "Daftar agent". */
  label: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  searchPlaceholder: string;
  /** Teks jumlah di kanan toolbar, mis. "12 agent". Disembunyikan saat memuat. */
  countText?: string;
  loading: boolean;
  loadingLabel: string;
  isEmpty: boolean;
  empty: { icon: ReactNode; title: string; text: string };
  /** Halaman 1-based, sama seperti useEntityList. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Isi daftar (biasanya <table className="dk-table">). */
  children: ReactNode;
};

/**
 * Kartu daftar admin desktop gaya baru: toolbar cari berbentuk pil + jumlah,
 * lalu skeleton / state kosong / isi, dan kaki paginasi.
 */
const DesktopListCard = ({
  label,
  keyword,
  onKeywordChange,
  searchPlaceholder,
  countText,
  loading,
  loadingLabel,
  isEmpty,
  empty,
  page,
  totalPages,
  onPageChange,
  children,
}: Props) => (
  <section className="dk-card" aria-label={label}>
    <div className="dk-toolbar">
      <div className="dk-search">
        <FiSearch aria-hidden />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder.replace(/\.+$/, '')}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>
      {!loading && countText && <span className="dk-count">{countText}</span>}
    </div>

    {loading ? (
      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
        <ListLoadingState label={loadingLabel} />
      </div>
    ) : isEmpty ? (
      <div className="dk-empty">
        <span className="dk-empty-icon" aria-hidden>{empty.icon}</span>
        <div className="dk-empty-title">{empty.title}</div>
        <div className="dk-empty-text">{empty.text}</div>
      </div>
    ) : (
      children
    )}

    <div className="dk-footer">
      {totalPages > 1 && (
        <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => onPageChange(p + 1)} />
      )}
    </div>
  </section>
);

export default DesktopListCard;
