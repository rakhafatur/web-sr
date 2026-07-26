import dayjs from 'dayjs';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import { FiTrash2 } from 'react-icons/fi';

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
        bg: 'var(--color-income-soft)',
        text: 'var(--color-income)',
        label: 'Voucher',
      };

    case 'kasbon':
      return {
        bg: 'var(--color-expense-soft)',
        text: 'var(--color-expense)',
        label: 'Kasbon',
      };

    case 'pemasukan_lain':
      return {
        bg: 'var(--color-voucher-soft)',
        text: 'var(--color-voucher)',
        label: 'Pemasukan',
      };

    case 'dokter':
      return {
        bg: 'var(--color-medical-soft)',
        text: 'var(--color-medical)',
        label: 'Dokter',
      };

    default:
      return {
        bg: 'var(--color-gray-200)',
        text: 'var(--color-gray-700)',
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
                'var(--color-surface)',

              border:
                '1px solid var(--color-gray-200)',

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
                      color: 'var(--color-gray-500)',
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
                    color: 'var(--color-gray-500)',
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
              <ActionIconButton
                icon={<FiTrash2 size={13} />}
                variant="danger"
                title="Hapus"
                onClick={() => onDelete?.(row)}
              />
            </div>
          </div>
        );
      })}

      {/* PAGINATION */}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default CardTableRiwayatTransaksi;