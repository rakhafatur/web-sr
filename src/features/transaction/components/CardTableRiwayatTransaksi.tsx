import dayjs from 'dayjs';
import {
  FiEdit2,
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
  onEdit?: (row: Transaksi) => void;
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
        bg: '#dbeafe',
        text: '#2563eb',
        label: 'Pemasukan',
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
                '1px solid #f1f1f1',

              borderRadius: 14,

              padding:
                '12px 14px',

              boxShadow:
                '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* TOP */}
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div
                  style={{
                    display:
                      'inline-flex',

                    padding:
                      '3px 8px',

                    borderRadius: 999,

                    background:
                      style.bg,

                    color:
                      style.text,

                    fontSize: 10,

                    fontWeight: 700,

                    marginBottom: 6,
                  }}
                >
                  {style.label}
                </div>

                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color:
                      style.text,
                    lineHeight: 1.1,
                  }}
                >
                  Rp
                  {Number(
                    row.jumlah
                  ).toLocaleString()}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: '#777',
                    marginTop: 2,
                  }}
                >
                  {row.tipe ===
                  'voucher'
                    ? `${
                        row.jumlah /
                        150000
                      } × voucher`
                    : row.keterangan ||
                      '-'}
                </div>
              </div>

              {/* ACTION */}
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm border-0"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      '#f3f4f6',

                    color: '#444',
                  }}
                  onClick={() =>
                    onEdit?.(row)
                  }
                >
                  <FiEdit2
                    size={14}
                  />
                </button>

                <button
                  className="btn btn-sm border-0"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      '#fee2e2',

                    color:
                      '#dc2626',
                  }}
                  onClick={() =>
                    onDelete?.(
                      row
                    )
                  }
                >
                  <FiTrash2
                    size={14}
                  />
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="mt-2"
              style={{
                fontSize: 11,
                color: '#999',
                fontWeight: 500,
              }}
            >
              {dayjs(
                row.tanggal
              ).format(
                'DD MMM YYYY'
              )}
            </div>
          </div>
        );
      })}

      {/* PAGINATION */}
      <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
        <button
          className="btn border-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background:
              '#f3f4f6',
          }}
          onClick={() =>
            page > 0 &&
            onPageChange(
              page - 1
            )
          }
          disabled={page === 0}
        >
          <FiChevronLeft />
        </button>

        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#666',
            minWidth: 50,
            textAlign: 'center',
          }}
        >
          {page + 1}/{totalPages}
        </div>

        <button
          className="btn border-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background:
              '#f3f4f6',
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
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default CardTableRiwayatTransaksi;