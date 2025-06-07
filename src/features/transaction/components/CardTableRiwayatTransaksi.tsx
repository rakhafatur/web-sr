import dayjs from 'dayjs';
import {
  FiCalendar, FiMoreVertical, FiEdit2, FiTrash2, FiFileText,
  FiDollarSign, FiMinusCircle, FiPlusCircle,
  FiArrowLeft, FiArrowRight,
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
  page: number; // zero-based
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit?: (row: Transaksi) => void;
  onDelete?: (row: Transaksi) => void;
  editId?: string | null;
  editForm?: { jumlah: string; keterangan: string };
  setEditForm?: (form: { jumlah: string; keterangan: string }) => void;
  onSave?: (row: Transaksi) => void;
};

const tipeStyle = (tipe: string) => {
  switch (tipe) {
    case 'voucher':
      return {
        icon: <FiPlusCircle className="me-2" style={{ color: 'var(--color-green)' }} />,
        border: '2px solid var(--color-green)',
        jumlahColor: 'var(--color-green)',
      };
    case 'kasbon':
      return {
        icon: <FiMinusCircle className="me-2" style={{ color: 'var(--color-danger)' }} />,
        border: '2px solid var(--color-danger)',
        jumlahColor: 'var(--color-danger)',
      };
    case 'pemasukan_lain':
      return {
        icon: <FiDollarSign className="me-2" style={{ color: 'var(--color-primary)' }} />,
        border: '2px solid var(--color-primary)',
        jumlahColor: 'var(--color-primary)',
      };
    default:
      return {
        icon: <FiFileText className="me-2" />,
        border: '1px solid var(--color-green)',
        jumlahColor: 'var(--color-dark)',
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
  // Order by tanggal DESC khusus mobile
  const orderedRows = [...data].sort((a, b) => dayjs(b.tanggal).valueOf() - dayjs(a.tanggal).valueOf());
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const currentRows = orderedRows.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  return (
    <div className="d-flex flex-column gap-3">
      {currentRows.map((row, i) => {
        const style = tipeStyle(row.tipe);

        return (
          <div
            key={row.id}
            className="position-relative rounded shadow-sm p-3"
            style={{
              backgroundColor: 'var(--color-white)',
              border: style.border,
              transition: 'border-color .2s',
            }}
          >
            {/* 3-dot menu */}
            <div className="position-absolute" style={{ top: 10, right: 10, zIndex: 2 }}>
              <button
                className="btn btn-sm btn-light border"
                onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}
              >
                <FiMoreVertical />
              </button>
              {openMenuIndex === i && (
                <div
                  className="position-absolute bg-white border rounded shadow-sm p-2"
                  style={{ top: '110%', right: 0, minWidth: 110, zIndex: 3 }}
                >
                  {editId === row.id ? (
                    <button
                      className="dropdown-item text-success d-flex align-items-center gap-2"
                      onClick={() => {
                        onSave?.(row);
                        setOpenMenuIndex(null);
                      }}
                    >
                      💾 Simpan
                    </button>
                  ) : (
                    <button
                      className="dropdown-item text-dark d-flex align-items-center gap-2"
                      onClick={() => {
                        onEdit?.(row);
                        setOpenMenuIndex(null);
                      }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}
                  <button
                    className="dropdown-item text-danger d-flex align-items-center gap-2"
                    onClick={() => {
                      onDelete?.(row);
                      setOpenMenuIndex(null);
                    }}
                  >
                    <FiTrash2 /> Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Tanggal */}
            <div className="d-flex align-items-center mb-2" style={{ color: 'var(--color-dark)' }}>
              <FiCalendar className="me-2" />
              <strong>{dayjs(row.tanggal).format('YYYY-MM-DD')}</strong>
            </div>

            {/* Icon & Jumlah */}
            <div className="d-flex align-items-center mb-1" style={{ color: style.jumlahColor, fontWeight: 600, fontSize: 18 }}>
              {style.icon}
              {editId === row.id && editForm && setEditForm ? (
                <input
                  className="form-control"
                  style={{
                    backgroundColor: 'var(--color-white)',
                    color: style.jumlahColor,
                    borderColor: style.jumlahColor,
                    maxWidth: 120,
                    display: 'inline-block'
                  }}
                  type="text"
                  value={editForm.jumlah}
                  onChange={e => setEditForm({ ...editForm, jumlah: e.target.value })}
                />
              ) : (
                `Rp${Number(row.jumlah).toLocaleString()}`
              )}
            </div>

            {/* Keterangan */}
            <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
              <FiFileText className="me-2" />
              {row.tipe === 'voucher'
                ? `Voucher ${row.jumlah / 150000} x 150.000`
                : editId === row.id && editForm && setEditForm
                  ? (
                    <input
                      className="form-control"
                      style={{
                        backgroundColor: 'var(--color-white)',
                        color: 'var(--color-dark)',
                        borderColor: style.jumlahColor,
                        maxWidth: 180,
                        display: 'inline-block'
                      }}
                      type="text"
                      value={editForm.keterangan}
                      onChange={e => setEditForm({ ...editForm, keterangan: e.target.value })}
                    />
                  )
                  : (row.keterangan || '-')
              }
            </div>
          </div>
        );
      })}

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <button
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => page > 0 && onPageChange(page - 1)}
          disabled={page === 0}
        >
          <FiArrowLeft /> <span>Sebelumnya</span>
        </button>
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

export default CardTableRiwayatTransaksi;