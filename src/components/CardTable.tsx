import React from 'react';
import dayjs from 'dayjs';

type Row = {
  tanggal: string;
  keterangan: string;
  voucher?: number | string;
  pemasukan?: number | string;
  pengeluaran?: number | string;
  saldo: number;
};

type Props = {
  data: Row[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
};

const CardTable = ({ data, page, rowsPerPage, onPageChange }: Props) => {
  const paginatedRows = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <>
      {paginatedRows.map((row, index) => (
        <div
          key={index}
          className="p-3 mb-3"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid #ddd',
            borderRadius: '0.75rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          <div><strong>📅 Tanggal:</strong> {dayjs(row.tanggal).format('YYYY-MM-DD')}</div>
          <div><strong>📋 Keterangan:</strong> {row.keterangan}</div>
          {row.voucher && <div><strong>🎫 Voucher:</strong> {row.voucher}</div>}
          {row.pemasukan && <div><strong>💰 Pemasukan:</strong> Rp{Number(row.pemasukan).toLocaleString()}</div>}
          {row.pengeluaran && <div><strong>💸 Pengeluaran:</strong> Rp{Number(row.pengeluaran).toLocaleString()}</div>}
          <div><strong>🧾 Saldo:</strong> Rp{Number(row.saldo).toLocaleString()}</div>
        </div>
      ))}

      <div className="d-flex justify-content-between align-items-center mt-3 px-1">
        <button
          className="btn btn-outline-success"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          ← Sebelumnya
        </button>
        <button
          className="btn btn-outline-success"
          disabled={(page + 1) * rowsPerPage >= data.length}
          onClick={() => onPageChange(page + 1)}
        >
          Selanjutnya →
        </button>
      </div>
    </>
  );
};

export default CardTable;