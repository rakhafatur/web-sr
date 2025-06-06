import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  FiCalendar, FiMoreVertical, FiEdit2, FiTrash2, FiFileText, FiArrowLeft, FiArrowRight, FiDollarSign, FiMinusCircle, FiPlusCircle
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
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const currentRows = data.slice(start, end);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const tipeIcon = (tipe: string) => {
    if (tipe === 'voucher') return <FiPlusCircle className="me-2 text-success" />;
    if (tipe === 'pemasukan_lain') return <FiDollarSign className="me-2 text-primary" />;
    if (tipe === 'kasbon') return <FiMinusCircle className="me-2 text-danger" />;
    return <FiFileText className="me-2" />;
  };

  return (
    <div className="d-flex flex-column gap-3">
      {currentRows.map((row, i) => (
        <div
          key={row.id}
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

          {/* Info */}
          <div className="d-flex align-items-center mb-2" style={{ color: 'var(--color-dark)' }}>
            <FiCalendar className="me-2" />
            <strong>Tanggal:</strong>&nbsp;{dayjs(row.tanggal).format('YYYY-MM-DD')}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            {tipeIcon(row.tipe)}
            <strong>Tipe:</strong>&nbsp;{row.tipeLabel}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            <FiDollarSign className="me-2" />
            <strong>Jumlah:</strong>&nbsp;
            {editId === row.id && editForm && setEditForm ? (
              <input
                className="form-control"
                style={{
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-dark)',
                  borderColor: 'var(--color-green)',
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

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            <FiFileText className="me-2" />
            <strong>Keterangan:</strong>&nbsp;
            {row.tipe === 'voucher'
              ? `Voucher ${row.jumlah / 150000} x 150.000`
              : editId === row.id && editForm && setEditForm
                ? (
                  <input
                    className="form-control"
                    style={{
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-dark)',
                      borderColor: 'var(--color-green)',
                      maxWidth: 180,
                      display: 'inline-block'
                    }}
                    type="text"
                    value={editForm.keterangan}
                    onChange={e => setEditForm({ ...editForm, keterangan: e.target.value })}
                  />
                )
                : row.keterangan || '-'
            }
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