import React from 'react';
import dayjs from 'dayjs';

type Absensi = {
  status: string;
  keterangan: string | null;
  tanggal: string;
};

type Props = {
  data: Absensi[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit?: (absen: Absensi) => void;
  onDelete?: (tanggal: string) => void;
};

const CardTableAbsensi = ({ data, page, rowsPerPage, onPageChange, onEdit, onDelete }: Props) => {
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const currentRows = data.slice(start, end);

  return (
    <div>
      {currentRows.map((row, i) => (
        <div key={i} className="card mb-3" style={{ background: 'var(--color-white)', borderColor: 'var(--color-green)' }}>
          <div className="card-body">
            <h6 className="card-title fw-bold mb-2" style={{ color: 'var(--color-dark)' }}>
              📅 {dayjs(row.tanggal).format('DD MMM YYYY')}
            </h6>
            <p className="card-text mb-1">
              <strong>Status:</strong>{' '}
              <span className={`badge ${row.status === 'KERJA' ? 'bg-success' :
                row.status === 'MENS' ? 'bg-danger' :
                row.status === 'OFF' ? 'bg-secondary' :
                row.status === 'SAKIT' ? 'bg-warning text-dark' :
                'bg-light text-dark'}`}>
                {row.status}
              </span>
            </p>
            <p className="card-text mb-2"><strong>Keterangan:</strong> {row.keterangan || '-'}</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-outline-warning" onClick={() => onEdit?.(row)}>✏️</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete?.(row.tanggal)}>🗑️</button>
            </div>
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-success btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          ← Prev
        </button>
        <span style={{ color: 'var(--color-dark)' }}>Halaman {page + 1}</span>
        <button
          className="btn btn-outline-success btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={end >= data.length}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default CardTableAbsensi;