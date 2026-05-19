import { useState } from 'react';
import dayjs from 'dayjs';

import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiMoreVertical,
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

const getStatusStyle = (
  status: string
) => {
  switch (status) {
    case 'KERJA':
      return {
        bg: '#dcfce7',
        text: '#15803d',
        label: 'Kerja',
      };

    case 'MENS':
      return {
        bg: '#fee2e2',
        text: '#dc2626',
        label: 'Mens',
      };

    case 'OFF':
      return {
        bg: '#e5e7eb',
        text: '#374151',
        label: 'Off',
      };

    case 'SAKIT':
      return {
        bg: '#fef3c7',
        text: '#b45309',
        label: 'Sakit',
      };

    default:
      return {
        bg: '#f3f4f6',
        text: '#374151',
        label: status,
      };
  }
};

const CardTableAbsensi = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: Props) => {
  const orderedRows = [
    ...data,
  ].sort(
    (a, b) =>
      dayjs(
        b.tanggal
      ).valueOf() -
      dayjs(
        a.tanggal
      ).valueOf()
  );

  const start =
    page * rowsPerPage;

  const end =
    start + rowsPerPage;

  const currentRows =
    orderedRows.slice(
      start,
      end
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        data.length /
        rowsPerPage
      )
    );

  const [
    openMenuIndex,
    setOpenMenuIndex,
  ] = useState<
    number | null
  >(null);

  return (
    <div className="d-flex flex-column gap-2">
      {currentRows.map(
        (row, index) => {
          const style =
            getStatusStyle(
              row.status
            );

          return (
            <div
              key={
                row.tanggal
              }
              style={{
                background:
                  '#fff',

                border:
                  '1px solid #f1f5f9',

                borderRadius: 16,

                padding:
                  '12px 14px',

                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.04)',

                position:
                  'relative',
              }}
            >
              {/* MENU */}
              <div
                style={{
                  position:
                    'absolute',

                  top: 10,

                  right: 10,
                }}
              >
                <button
                  className="btn border-0 d-flex align-items-center justify-content-center"
                  style={{
                    width: 32,
                    height: 32,

                    borderRadius: 10,

                    background:
                      '#f8fafc',

                    color:
                      '#64748b',
                  }}
                  onClick={() =>
                    setOpenMenuIndex(
                      openMenuIndex ===
                        index
                        ? null
                        : index
                    )
                  }
                >
                  <FiMoreVertical
                    size={15}
                  />
                </button>

                {openMenuIndex ===
                  index && (
                    <div
                      style={{
                        position:
                          'absolute',

                        top: '110%',

                        right: 0,

                        background:
                          '#fff',

                        border:
                          '1px solid #e5e7eb',

                        borderRadius: 14,

                        padding: 6,

                        minWidth: 120,

                        boxShadow:
                          '0 10px 30px rgba(0,0,0,0.08)',

                        zIndex: 20,
                      }}
                    >
                      <button
                        className="btn w-100 border-0 d-flex align-items-center gap-2"
                        style={{
                          borderRadius: 10,

                          fontSize: 13,

                          color:
                            '#334155',
                        }}
                        onClick={() => {
                          onEdit?.(
                            row
                          );

                          setOpenMenuIndex(
                            null
                          );
                        }}
                      >
                        <FiEdit2
                          size={14}
                        />
                        Edit
                      </button>

                      <button
                        className="btn w-100 border-0 d-flex align-items-center gap-2"
                        style={{
                          borderRadius: 10,

                          fontSize: 13,

                          color:
                            '#dc2626',
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
                        <FiTrash2
                          size={14}
                        />
                        Hapus
                      </button>
                    </div>
                  )}
              </div>

              {/* CONTENT */}
              <div className="d-flex justify-content-between align-items-start">
                {/* LEFT */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* BADGE + DATE */}
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div
                      style={{
                        padding: '4px 9px',
                        borderRadius: 999,
                        background: style.bg,
                        color: style.text,
                        fontSize: 10,
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {style.label}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {dayjs(row.tanggal).format(
                        'DD MMM YYYY'
                      )}
                    </div>
                  </div>

                  {/* KETERANGAN */}
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      marginTop: 4,
                      lineHeight: 1.4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.keterangan ||
                      'Tidak ada keterangan'}
                  </div>
                </div>

                {/* DELETE */}
                <button
                  className="btn border-0 d-flex align-items-center justify-content-center"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background: '#fee2e2',
                    color: '#dc2626',
                    flexShrink: 0,
                    marginLeft: 10,
                  }}
                  onClick={() =>
                    onDelete?.(row.tanggal)
                  }
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          );
        }
      )}

      {/* PAGINATION */}
      <div className="d-flex justify-content-center align-items-center gap-2 mt-1">
        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            width: 34,
            height: 34,

            borderRadius: 12,

            background:
              '#f1f5f9',
          }}
          onClick={() =>
            page > 0 &&
            onPageChange(
              page - 1
            )
          }
          disabled={page === 0}
        >
          <FiChevronLeft
            size={15}
          />
        </button>

        <div
          style={{
            fontSize: 11,

            fontWeight: 700,

            color: '#64748b',

            minWidth: 42,

            textAlign: 'center',
          }}
        >
          {page + 1}/
          {totalPages}
        </div>

        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            width: 34,
            height: 34,

            borderRadius: 12,

            background:
              '#f1f5f9',
          }}
          onClick={() =>
            page <
            totalPages -
            1 &&
            onPageChange(
              page + 1
            )
          }
          disabled={
            page >=
            totalPages - 1
          }
        >
          <FiChevronRight
            size={15}
          />
        </button>
      </div>
    </div>
  );
};

export default CardTableAbsensi;