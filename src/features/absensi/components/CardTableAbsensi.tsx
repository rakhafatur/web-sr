import { useState } from 'react';
import dayjs from 'dayjs';

import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
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
  onDelete?: (tanggal: string) => void;
};

const getStatusStyle = (
  status: string
) => {
  switch (status) {
    case 'KERJA':
      return {
        bg: 'var(--color-income-soft)',
        text: 'var(--color-income)',
        label: 'Kerja',
      };

    case 'MENS':
      return {
        bg: 'var(--color-expense-soft)',
        text: 'var(--color-expense)',
        label: 'Mens',
      };

    case 'OFF':
      return {
        bg: 'var(--color-gray-200)',
        text: 'var(--color-gray-700)',
        label: 'Off',
      };

    case 'SAKIT':
      return {
        bg: 'var(--color-voucher-soft)',
        text: 'var(--color-voucher)',
        label: 'Sakit',
      };

    default:
      return {
        bg: 'var(--color-gray-200)',
        text: 'var(--color-gray-700)',
        label: status,
      };
  }
};

const CardTableAbsensi = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
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
                  'var(--color-surface)',

                border:
                  '1px solid var(--color-gray-200)',

                borderRadius: 16,

                padding:
                  '12px 14px',

                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.04)',

                position:
                  'relative',
              }}
            >

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
                        color: 'var(--color-gray-500)',
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
                      color: 'var(--color-gray-500)',
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
                    background: 'var(--color-expense-soft)',
                    color: 'var(--color-expense)',
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
              'var(--color-surface-2)',
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

            color: 'var(--color-gray-500)',

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
              'var(--color-surface-2)',
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