import React, { useState } from 'react';
import dayjs from 'dayjs';

import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

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

const statusConfig: Record<
  string,
  {
    label: string;
    bg: string;
    color: string;
  }
> = {
  KERJA: {
    label: 'KERJA',
    bg: 'rgba(25,135,84,0.12)',
    color: '#198754',
  },

  MENS: {
    label: 'MENS',
    bg: 'rgba(220,53,69,0.12)',
    color: '#dc3545',
  },

  OFF: {
    label: 'OFF',
    bg: 'rgba(108,117,125,0.12)',
    color: '#6c757d',
  },

  SAKIT: {
    label: 'SAKIT',
    bg: 'rgba(255,193,7,0.15)',
    color: '#d39e00',
  },
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

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / rowsPerPage)
  );

  const [openMenuIndex, setOpenMenuIndex] =
    useState<number | null>(null);

  return (
    <div className="d-flex flex-column gap-3">
      {currentRows.map((row, i) => {
        const status =
          statusConfig[row.status] ||
          statusConfig.KERJA;

        return (
          <div
            key={i}
            className="position-relative"
            style={{
              borderRadius: 24,
              background: 'white',
              padding: 18,
              boxShadow:
                '0 4px 16px rgba(0,0,0,0.06)',
              border:
                '1px solid rgba(0,0,0,0.05)',
            }}
          >
            {/* TOP */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#888',
                    marginBottom: 4,
                  }}
                >
                  Tanggal
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize: 17,
                    color:
                      'var(--color-dark)',
                  }}
                >
                  {dayjs(row.tanggal).format(
                    'DD MMMM YYYY'
                  )}
                </div>
              </div>

              {/* MENU */}
              <div className="position-relative">
                <button
                  className="btn btn-sm"
                  style={{
                    borderRadius: 12,
                    background:
                      'rgba(0,0,0,0.04)',
                  }}
                  onClick={() =>
                    setOpenMenuIndex(
                      openMenuIndex === i
                        ? null
                        : i
                    )
                  }
                >
                  <FiMoreVertical />
                </button>

                {openMenuIndex === i && (
                  <div
                    className="position-absolute"
                    style={{
                      top: '110%',
                      right: 0,
                      zIndex: 10,
                      background: 'white',
                      borderRadius: 16,
                      minWidth: 130,
                      overflow: 'hidden',
                      boxShadow:
                        '0 10px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <button
                      className="btn w-100 d-flex align-items-center gap-2 px-3 py-2"
                      style={{
                        border: 'none',
                        background:
                          'transparent',
                      }}
                      onClick={() => {
                        onEdit?.(row);
                        setOpenMenuIndex(
                          null
                        );
                      }}
                    >
                      <FiEdit2 />
                      Edit
                    </button>

                    <button
                      className="btn w-100 d-flex align-items-center gap-2 px-3 py-2 text-danger"
                      style={{
                        border: 'none',
                        background:
                          'transparent',
                      }}
                      onClick={() => {
                        onDelete?.(
                          row.tanggal
                        );

                        setOpenMenuIndex(
                          null
                        );
                      }}
                    >
                      <FiTrash2 />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* STATUS */}
            <div className="mb-3">
              <div
                style={{
                  fontSize: 13,
                  color: '#888',
                  marginBottom: 8,
                }}
              >
                Status
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding:
                    '10px 14px',
                  borderRadius: 999,
                  background: status.bg,
                  color: status.color,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background:
                      status.color,
                  }}
                />

                {status.label}
              </div>
            </div>

            {/* KETERANGAN */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: '#888',
                  marginBottom: 8,
                }}
              >
                Keterangan
              </div>

              <div
                style={{
                  color:
                    'var(--color-dark)',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {row.keterangan ||
                  'Tidak ada keterangan'}
              </div>
            </div>
          </div>
        );
      })}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button
            className="btn btn-light border d-flex align-items-center gap-2"
            onClick={() =>
              page > 0 &&
              onPageChange(page - 1)
            }
            disabled={page === 0}
            style={{
              borderRadius: 14,
              padding:
                '10px 14px',
            }}
          >
            <FiChevronLeft />
            Prev
          </button>

          <div
            className="fw-semibold"
            style={{
              color:
                'var(--color-dark)',
            }}
          >
            {page + 1} / {totalPages}
          </div>

          <button
            className="btn btn-light border d-flex align-items-center gap-2"
            onClick={() =>
              page < totalPages - 1 &&
              onPageChange(page + 1)
            }
            disabled={
              page >= totalPages - 1
            }
            style={{
              borderRadius: 14,
              padding:
                '10px 14px',
            }}
          >
            Next
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default CardTableAbsensi;