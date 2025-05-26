import React from 'react';

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
  const renderSortIcon = (key: keyof T) => {
    if (!onSort || sortKey !== key) return null;
    return (
      <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <table className="table table-dark table-bordered table-hover text-light">
      <thead className="table-secondary text-dark">
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              onClick={() => col.sortable && onSort?.(col.key)}
              style={{ cursor: col.sortable ? 'pointer' : 'default' }}
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
            <td colSpan={columns.length} className="text-center text-muted">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(item) : (item[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default DataTable;