import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  FiCalendar, FiMoreVertical, FiEdit2, FiTrash2, FiFileText,
  FiArrowLeft, FiArrowRight, FiDollarSign, FiMinusCircle,
  FiPlusCircle, FiSave, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';

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
  onPageChange,
  onEdit,
  onDelete,
  editId,
  editForm,
  setEditForm,
  onSave,
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const rowsPerPage = isMobile ? 5 : 10;

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    const dateA = dayjs(a.tanggal);
    const dateB = dayjs(b.tanggal);
    return sortOrder === 'asc' ? dateA.diff(dateB) : dateB.diff(dateA);
  });

  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const currentRows = sortedData.slice(start, end);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const tipeIcon = (tipe: string) => {
    if (tipe === 'voucher') return <FiPlusCircle className="me-2 text-success" />;
    if (tipe === 'pemasukan_lain') return <FiDollarSign className="me-2 text-primary" />;
    if (tipe === 'kasbon') return <FiMinusCircle className="me-2 text-danger" />;
    return <FiFileText className="me-2" />;
  };

  const getBorderColor = (tipe: string) => {
    return tipe === 'kasbon' ? 'var(--color-danger)' : 'var(--color-green)';
  };

  return (
    <div className="d-flex flex-column gap-3">
      {isMobile && (
        <div className="d-flex justify-content-end mb-2">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <span>Urut Tanggal</span>
            {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
          </button>
        </div>
      )}

      {currentRows.map((row, i) => (
        <div
          key={row.id}
          className="position-relative rounded shadow-sm p-3"
          style={{
            backgroundColor: 'var(--color-white)',
            border: `1px solid ${getBorderColor(row.tipe)}`,
            fontSize: '0.95rem',
          }}
        >
          {/* Titik tiga */}
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
                    <FiSave /> Simpan
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
          <div className="d-flex align-items-center mb-2 text-muted">
            <FiCalendar className="me-2" />
            {dayjs(row.tanggal).format('YYYY-MM-DD')}
          </div>

          {/* Tipe */}
          <div className="d-flex align-items-center mb-2 fw-medium text-dark">
            {tipeIcon(row.tipe)} {row.tipeLabel}
          </div>

          {/* Jumlah */}
          <div className="d-flex align-items-center mb-2">
            <FiDollarSign className="me-2 text-secondary" />
            {editId === row.id && editForm && setEditForm ? (
              <input
                className="form-control"
                style={{
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-dark)',
                  borderColor: 'var(--color-green)',
                  maxWidth: 120,
                }}
                type="text"
                value={editForm.jumlah}
                onChange={(e) => setEditForm({ ...editForm, jumlah: e.target.value })}
              />
            ) : (
              <span className="fw-semibold text-dark">
                Rp{Number(row.jumlah).toLocaleString()}
              </span>
            )}
          </div>

          {/* Keterangan */}
          <div className="d-flex align-items-start">
            <FiFileText className="me-2 text-secondary mt-1" />
            <div className="text-muted" style={{ maxWidth: '90%' }}>
              {row.tipe === 'voucher'
                ? `Voucher ${row.jumlah / 150000} x 150.000`
                : editId === row.id && editForm && setEditForm ? (
                  <input
                    className="form-control"
                    style={{
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-dark)',
                      borderColor: 'var(--color-green)',
                      maxWidth: 200,
                    }}
                    type="text"
                    value={editForm.keterangan}
                    onChange={(e) =>
                      setEditForm({ ...editForm, keterangan: e.target.value })
                    }
                  />
                ) : (
                  row.keterangan || '-'
                )}
            </div>
          </div>
        </div>
      ))}

      {/* Paging */}
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