import { ReactNode } from 'react';
import { FiChevronRight, FiPlus, FiSearch } from 'react-icons/fi';
import MobilePageBar from '../MobilePageBar';
import SwipeToDelete from '../SwipeToDelete';
import Pagination from '../Pagination';
import ListLoadingState from '../ListLoadingState';
import PullToRefresh from '../PullToRefresh';
import '../../styles/mobile-admin.css';

export type MobileListItem = {
  id: string;
  title: string;
  sub?: string;
  /** Pil status di bawah judul (opsional). */
  badge?: { label: string; tone: 'on' | 'off' | 'warn' };
};

type Props = {
  title: string;
  backTo: string;
  addLabel: string;
  onAdd: () => void;

  keyword: string;
  onKeywordChange: (value: string) => void;
  searchPlaceholder: string;

  loading: boolean;
  items: MobileListItem[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;

  emptyIcon: ReactNode;
  /** Judul saat daftar benar-benar kosong (tanpa kata kunci). */
  emptyTitle: string;

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<unknown>;
};

const WARNA_BADGE: Record<'on' | 'off' | 'warn', React.CSSProperties> = {
  on: { background: 'var(--color-income-soft)', color: 'var(--color-income)' },
  off: { background: 'var(--color-expense-soft)', color: 'var(--color-expense)' },
  warn: { background: 'var(--color-voucher-soft)', color: 'var(--color-voucher)' },
};

/**
 * Halaman daftar data master versi mobile (Pengawas, Ladies, Agent, ...):
 * bar dengan tombol +, cari berbentuk pil, daftar beravatar inisial — ketuk
 * untuk detail, geser ke kiri untuk hapus. Data & aksi dari halaman.
 */
const MobileListPage = ({
  title,
  backTo,
  addLabel,
  onAdd,
  keyword,
  onKeywordChange,
  searchPlaceholder,
  loading,
  items,
  onOpen,
  onDelete,
  emptyIcon,
  emptyTitle,
  page,
  totalPages,
  onPageChange,
  onRefresh,
}: Props) => (
  <PullToRefresh onRefresh={async () => { await onRefresh(); }}>
    <div className="tm-page">
      <MobilePageBar title={title} backTo={backTo} action={{ icon: <FiPlus />, label: addLabel, onClick: onAdd }} />

      <div className="tm-stack">
        <div className="tm-search">
          <FiSearch aria-hidden />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>

        {loading ? (
          <ListLoadingState label={`Memuat ${title.toLowerCase()}`} />
        ) : items.length === 0 ? (
          <div className="tm-group">
            <div className="tm-empty">
              <span className="tm-empty-icon" aria-hidden>{emptyIcon}</span>
              <div className="tm-empty-title">{keyword ? 'Data tidak ditemukan' : emptyTitle}</div>
              <div className="tm-empty-text">
                {keyword ? 'Coba kata kunci lain.' : 'Ketuk tombol + di kanan atas untuk menambah data.'}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="tm-group tm-list">
              {items.map((item) => (
                <SwipeToDelete key={item.id} onDelete={() => onDelete(item.id)} borderRadius={0}>
                  <button type="button" className="tm-row tm-row-btn" onClick={() => onOpen(item.id)}>
                    <span className="tm-avatar" aria-hidden>
                      {(item.title || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="tm-row-main">
                      <div className="tm-row-title">{item.title || '-'}</div>
                      {(item.sub || item.badge) && (
                        <div className="tm-row-sub">
                          {item.badge && (
                            <span className="tm-status" style={WARNA_BADGE[item.badge.tone]}>
                              {item.badge.label}
                            </span>
                          )}
                          {item.badge && item.sub ? ' ' : ''}
                          {item.sub}
                        </div>
                      )}
                    </div>
                    <FiChevronRight className="tm-chevron" aria-hidden />
                  </button>
                </SwipeToDelete>
              ))}
            </div>
            <div className="tm-hint">Ketuk untuk detail · geser ke kiri untuk menghapus</div>
          </div>
        )}

        {totalPages > 1 && <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => onPageChange(p + 1)} />}
      </div>
    </div>
  </PullToRefresh>
);

export default MobileListPage;
