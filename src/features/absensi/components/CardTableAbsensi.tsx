import React from 'react';
import dayjs from 'dayjs';
import { FiCalendar, FiEdit2, FiTrash2, FiArrowLeft, FiArrowRight, FiFileText } from 'react-icons/fi';
import { BsFileText, BsCashStack } from 'react-icons/bs';
import { FaMoneyBillWave, FaReceipt } from 'react-icons/fa';

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
  onEdit?: (absen: Absensi) => void;
  onDelete?: (tanggal: string) => void;
};

const CardTableAbsensi = ({ data, page, rowsPerPage, onPageChange, onEdit, onDelete }: Props) => {
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const currentRows = data.slice(start, end);

  return (
    <div className="d-flex flex-column gap-3">
      {currentRows.map((row, i) => (
        <div
          key={i}
          className="rounded shadow-sm p-3"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-green)',
          }}
        >
          <div className="d-flex align-items-center mb-2" style={{ color: 'var(--color-dark)' }}>
            <FiCalendar className="me-2" />
            <strong>Tanggal:</strong>&nbsp;{dayjs(row.tanggal).format('YYYY-MM-DD')}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            <BsFileText className="me-2" />
            <strong>Keterangan:</strong>&nbsp;{row.keterangan || '-'}
          </div>

          <div className="d-flex align-items-center mb-1" style={{ color: 'var(--color-dark)' }}>
            <BsCashStack className="me-2" />
            <strong>Status:</strong>&nbsp;
            <span className={`badge ${row.status === 'KERJA' ? 'bg-success' :
              row.status === 'MENS' ? 'bg-danger' :
              row.status === 'OFF' ? 'bg-secondary' :
              row.status === 'SAKIT' ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
              {row.status}
            </span>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => onEdit?.(row)}
              title="Edit"
            >
              <FiEdit2 />
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete?.(row.tanggal)}
              title="Hapus"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-between align-items-center mt-2">
        <button
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <FiArrowLeft /> <span>Sebelumnya</span>
        </button>
        <button
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => onPageChange(page + 1)}
          disabled={end >= data.length}
        >
          <span>Selanjutnya</span> <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CardTableAbsensi;