import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  FiCalendar,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import { BsFileText } from 'react-icons/bs';

type Absensi = {
  status: string;
  keterangan: string | null;
  tanggal: string;
};

type Props = {
  data: Absensi[];
  page: number; // zero-based
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit?: (absen: Absensi) => void;
  onDelete?: (tanggal: string) => void;
};

const CardTableAbsensi = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: Props) => {
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const currentRows = data.slice(start, end);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  return (
    <div className="d-flex flex-column gap-3">
      {currentRows.map((row, i) => (
        <div
          key={i}
          className="position-relative rounded shadow-sm p-3"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-green)',
          }}
        >
          {/* 3-dot menu */}
          <div
            className="position-absolute"
            style={{ top: 10, right: 10, zIndex: 2 }}
          >
            <button
              className="btn btn-sm btn-light border"
              onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}
            >
              <FiMoreVertical />
            </button>

            {openMenuIndex === i && (
              <div
                className="position-absolute bg-white border rounded shadow-sm p-2"
                style={{ top: '110%', right: 0, minWidth: 100, zIndex: 3 }}
              >
                <button
                  className="dropdown-item text-dark d-flex align-items-center gap-2"
                  onClick={() => {
                    onEdit?.(row);
                    setOpenMenuIndex(null);
                  }}
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={() => {
                    onDelete?.(row.tanggal);
                    setOpenMenuIndex(null);
                  }}
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center mb-2" style={{ color: 'var(--color-dark)' }}>
            <FiCalendar className="me-2" />
            <strong>Tanggal:</strong>&nbsp;{dayjs(row.tanggal).format('YYYY-MM-DD')}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            <BsFileText className="me-2" />
            <strong>Keterangan:</strong>&nbsp;{row.keterangan || '-'}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            <strong>Status:</strong>&nbsp;
            <span className={`ms-2 badge ${row.status === 'KERJA' ? 'bg-success' :
              row.status === 'MENS' ? 'bg-danger' :
              row.status === 'OFF' ? 'bg-secondary' :
              row.status === 'SAKIT' ? 'bg-warning text-dark' :
              'bg-light text-dark'}`}>
              {row.status}
            </span>
          </div>
        </div>
      ))}

      {/* PAGINATION MOBILE */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <button
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => page > 0 && onPageChange(page - 1)}
          disabled={page === 0}
        >
          <FiArrowLeft /> <span>Sebelumnya</span>
        </button>
        <span style={{ color: 'var(--color-dark)' }}>
          Halaman {data.length === 0 ? 0 : page + 1} dari {totalPages}
        </span>
        <button
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => page < totalPages - 1 && onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          <span>Selanjutnya</span> <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CardTableAbsensi;