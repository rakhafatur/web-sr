import React from 'react';
import Pagination from './Pagination';

type FooterContext = {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
};

type Props<T> = {
  data: T[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Ganti footer pagination default (tombol teks polos) dengan tampilan kustom. */
  renderFooter?: (ctx: FooterContext) => React.ReactNode;
};

function CardTable<T>({ data, page, rowsPerPage, onPageChange, renderItem, renderFooter }: Props<T>) {
  const paginatedRows = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  return (
    <>
      {paginatedRows.map((item, index) => (
        <div
          key={index}
          className="p-3 mb-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: '0.75rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {renderFooter ? (
        renderFooter({ page, totalPages, onPageChange })
      ) : (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}

export default CardTable;
