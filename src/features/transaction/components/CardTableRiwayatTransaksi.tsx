import dayjs from 'dayjs';
import {
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useState } from 'react';

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
  editId?: string | null;
  editForm?: {
    jumlah: string;
    keterangan: string;
  };
  setEditForm?: (form: {
    jumlah: string;
    keterangan: string;
  }) => void;
  onSave?: (row: Transaksi) => void;
};

const getTypeStyle = (
  tipe: string
) => {
  switch (tipe) {
    case 'voucher':
      return {
        bg: '#dcfce7',
        text: '#15803d',
        badge: 'Voucher',
      };

    case 'kasbon':
      return {
        bg: '#fee2e2',
        text: '#dc2626',
        badge: 'Kasbon',
      };

    case 'pemasukan_lain':
      return {
        bg: '#dbeafe',
        text: '#2563eb',
        badge: 'Pemasukan',
      };

    default:
      return {
        bg: '#f3f4f6',
        text: '#374151',
        badge: 'Lainnya',
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
  editId,
  editForm,
  setEditForm,
  onSave,
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

  const [openActionId, setOpenActionId] =
    useState<string | null>(
      null
    );

  return (
    <div className="d-flex flex-column gap-3">
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

              borderRadius: 20,

              padding: 16,

              boxShadow:
                '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div
                style={{
                  padding:
                    '4px 10px',

                  borderRadius: 999,

                  background:
                    style.bg,

                  color:
                    style.text,

                  fontSize: 11,

                  fontWeight: 700,

                  letterSpacing:
                    0.4,
                }}
              >
                {style.badge}
              </div>

              <button
                className="btn btn-sm border-0"
                style={{
                  background:
                    '#f8f8f8',

                  borderRadius: 10,

                  width: 34,

                  height: 34,
                }}
                onClick={() =>
                  setOpenActionId(
                    openActionId ===
                      row.id
                      ? null
                      : row.id
                  )
                }
              >
                ⋯
              </button>
            </div>

            {/* JUMLAH */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color:
                  style.text,
                lineHeight: 1.2,
              }}
            >
              {editId ===
              row.id &&
              editForm &&
              setEditForm ? (
                <input
                  className="form-control"
                  style={{
                    borderRadius: 12,
                    border:
                      '1px solid #ddd',

                    fontWeight: 700,

                    fontSize: 20,
                  }}
                  type="text"
                  value={
                    editForm.jumlah
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      jumlah:
                        e.target
                          .value,
                    })
                  }
                />
              ) : (
                <>
                  Rp
                  {Number(
                    row.jumlah
                  ).toLocaleString()}
                </>
              )}
            </div>

            {/* KETERANGAN */}
            <div
              style={{
                marginTop: 6,
                color: '#666',
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {row.tipe ===
              'voucher' ? (
                <>
                  {row.jumlah /
                    150000}{' '}
                  × Voucher
                </>
              ) : editId ===
                  row.id &&
                editForm &&
                setEditForm ? (
                <input
                  className="form-control mt-2"
                  style={{
                    borderRadius: 12,
                    border:
                      '1px solid #ddd',
                  }}
                  type="text"
                  value={
                    editForm.keterangan
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      keterangan:
                        e.target
                          .value,
                    })
                  }
                />
              ) : (
                row.keterangan ||
                '-'
              )}
            </div>

            {/* FOOTER */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div
                style={{
                  fontSize: 12,
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

              {/* ACTIONS */}
              {openActionId ===
                row.id && (
                <div className="d-flex gap-2">
                  {editId ===
                  row.id ? (
                    <button
                      className="btn btn-sm border-0"
                      style={{
                        background:
                          '#dcfce7',

                        color:
                          '#15803d',

                        borderRadius: 999,

                        padding:
                          '6px 14px',

                        fontWeight: 600,
                      }}
                      onClick={() => {
                        onSave?.(
                          row
                        );

                        setOpenActionId(
                          null
                        );
                      }}
                    >
                      Simpan
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm border-0 d-flex align-items-center gap-1"
                      style={{
                        background:
                          '#f3f4f6',

                        color:
                          '#374151',

                        borderRadius: 999,

                        padding:
                          '6px 14px',

                        fontWeight: 600,
                      }}
                      onClick={() => {
                        onEdit?.(
                          row
                        );

                        setOpenActionId(
                          null
                        );
                      }}
                    >
                      <FiEdit2
                        size={
                          14
                        }
                      />
                      Edit
                    </button>
                  )}

                  <button
                    className="btn btn-sm border-0 d-flex align-items-center gap-1"
                    style={{
                      background:
                        '#fee2e2',

                      color:
                        '#dc2626',

                      borderRadius: 999,

                      padding:
                        '6px 14px',

                      fontWeight: 600,
                    }}
                    onClick={() => {
                      onDelete?.(
                        row
                      );

                      setOpenActionId(
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
          </div>
        );
      })}

      {/* PAGINATION */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
        <button
          className="btn border-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
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
            fontSize: 13,
            fontWeight: 600,
            color: '#666',
            minWidth: 60,
            textAlign: 'center',
          }}
        >
          {page + 1} /{' '}
          {totalPages}
        </div>

        <button
          className="btn border-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
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