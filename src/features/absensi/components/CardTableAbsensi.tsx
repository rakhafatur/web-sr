import dayjs from 'dayjs';
import Pagination from '../../../components/Pagination';
import SwipeToDelete from '../../../components/SwipeToDelete';

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

  return (
    <div className="d-flex flex-column gap-2">
      {currentRows.map(
        (row) => {
          const style =
            getStatusStyle(
              row.status
            );

          const rowContent = (
            <div
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
          );

          return onDelete ? (
            <SwipeToDelete
              key={row.tanggal}
              borderRadius={16}
              onDelete={() => onDelete(row.tanggal)}
            >
              {rowContent}
            </SwipeToDelete>
          ) : (
            <div key={row.tanggal}>{rowContent}</div>
          );
        }
      )}

      {/* PAGINATION */}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default CardTableAbsensi;