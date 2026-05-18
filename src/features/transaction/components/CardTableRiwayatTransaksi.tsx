import dayjs from 'dayjs';
import {
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

type Transaksi = {
  id: string;
  tanggal: string;
  tipe: string;
  tipeLabel: string;
  jumlah: number;
  keterangan: string;
  priority: number;
};

type Props = {
  data: Transaksi[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onDelete?: (row: Transaksi) => void;
};

const getTypeStyle = (
  tipe: string
) => {
  switch (tipe) {
    case 'voucher':
      return {
        bg: '#dcfce7',
        text: '#15803d',
        label: 'Voucher',
      };

    case 'kasbon':
      return {
        bg: '#fee2e2',
        text: '#dc2626',
        label: 'Kasbon',
      };

    case 'pemasukan_lain':
      return {
        bg: '#fef3c7',
        text: '#b45309',
        label: 'Pemasukan',
      };

    case 'dokter':
      return {
        bg: '#dbeafe',
        text: '#2563eb',
        label: 'Dokter',
      };

    default:
      return {
        bg: '#f3f4f6',
        text: '#374151',
        label: 'Lainnya',
      };
  }
};

const CardTableRiwayatTransaksi = ({
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
      {currentRows.map((row) => {
        const style =
          getTypeStyle(
            row.tipe
          );

        return (
          <div
            key={row.id}
            style={{
              background:
                '#fff',

              border:
                '1px solid #f4f4f5',

              borderRadius: 12,

              padding:
                '10px 12px',

              boxShadow:
                '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
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
                      padding:
                        '2px 7px',

                      borderRadius: 999,

                      background:
                        style.bg,

                      color:
                        style.text,

                      fontSize: 9,

                      fontWeight: 700,

                      lineHeight: 1.2,
                    }}
                  >
                    {style.label}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: '#999',
                      fontWeight: 500,
                    }}
                  >
                    {dayjs(
                      row.tanggal
                    ).format(
                      'DD MMM'
                    )}
                  </div>
                </div>

                {/* JUMLAH */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color:
                      style.text,

                    lineHeight: 1.1,
                  }}
                >
                  {row.tipe ===
                    'kasbon' ||
                  row.tipe ===
                    'dokter'
                    ? '- '
                    : '+ '}
                  Rp
                  {Number(
                    row.jumlah
                  ).toLocaleString()}
                </div>

                {/* KETERANGAN */}
                <div
                  style={{
                    fontSize: 11,
                    color: '#777',
                    marginTop: 2,

                    whiteSpace:
                      'nowrap',

                    overflow:
                      'hidden',

                    textOverflow:
                      'ellipsis',
                  }}
                >
                  {row.tipe ===
                  'voucher'
                    ? `${
                        row.jumlah /
                        150000
                      }× voucher`
                    : row.keterangan ||
                      '-'}
                </div>
              </div>

              {/* DELETE */}
              <button
                className="btn border-0 d-flex align-items-center justify-content-center"
                style={{
                  width: 32,
                  height: 32,

                  borderRadius: 10,

                  background:
                    '#fee2e2',

                  color:
                    '#dc2626',

                  flexShrink: 0,
                }}
                onClick={() =>
                  onDelete?.(
                    row
                  )
                }
              >
                <FiTrash2
                  size={13}
                />
              </button>
            </div>
          </div>
        );
      })}

      {/* PAGINATION */}
      <div className="d-flex justify-content-center align-items-center gap-2 mt-1">
        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            width: 32,
            height: 32,

            borderRadius: 10,

            background:
              '#f4f4f5',
          }}
          onClick={() =>
            page > 0 &&
            onPageChange(
              page - 1
            )
          }
          disabled={page === 0}
        >
          <FiChevronLeft size={15} />
        </button>

        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#666',
            minWidth: 42,
            textAlign: 'center',
          }}
        >
          {page + 1}/{totalPages}
        </div>

        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            width: 32,
            height: 32,

            borderRadius: 10,

            background:
              '#f4f4f5',
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
          <FiChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default CardTableRiwayatTransaksi;