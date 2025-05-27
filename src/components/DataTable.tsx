import React, { useEffect, useState } from 'react';
import './DataTable.css';

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  sortKey?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
};

function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'Tidak ada data.',
  sortKey,
  sortOrder,
  onSort,
}: Props<T>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // inisialisasi saat pertama kali
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSortIcon = (key: keyof T) => {
    if (!onSort || sortKey !== key) return null;
    return (
      <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  if (isMobile) {
    return (
      <div className="d-flex flex-column gap-3">
        {data.length === 0 ? (
          <div className="text-muted text-center">{emptyMessage}</div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="card bg-dark text-light p-3 shadow-sm">
              {columns.map((col) => (
                <div key={String(col.key)} className="mb-2">
                  <div className="fw-bold small text-secondary">{col.label}</div>
                  <div>{col.render ? col.render(item) : (item[col.key] as React.ReactNode)}</div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        className="table table-dark table-bordered table-hover text-light"
        style={{ minWidth: '600px', fontSize: '0.9rem', borderRadius: 8, overflow: 'hidden' }}
      >
        <thead className="table-secondary text-dark">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={{
                  cursor: col.sortable ? 'pointer' : 'default',
                  padding: '10px 12px',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
                {col.sortable && renderSortIcon(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-3">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={String(col.key)} style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                    {col.render ? col.render(item) : (item[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;