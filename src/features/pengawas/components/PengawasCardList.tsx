import { useState } from 'react';
import { FiEdit2, FiTrash2, FiMoreVertical, FiCreditCard, FiCalendar, FiUserPlus } from 'react-icons/fi';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  nomor_ktp: string | null;
  tanggal_lahir: string | null;
  tanggal_bergabung: string | null;
  alamat: string | null;
};

type Props = {
  pengawas: Pengawas[];
  onEdit: (pengawas: Pengawas) => void;
  onDelete: (id: string) => void;
};

const PengawasCardList = ({ pengawas, onEdit, onDelete }: Props) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="d-flex flex-column gap-3">
      {pengawas.map((p) => (
        <div
          key={p.id}
          className="p-3 shadow-sm rounded"
          style={{
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-dark)',
            border: '1px solid var(--color-green-light)',
            position: 'relative',
          }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="fw-bold fs-6">{p.nama_lengkap}</div>
              {p.nama_panggilan && (
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {p.nama_panggilan}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-sm"
                style={{ color: 'var(--color-dark)' }}
                onClick={() =>
                  setOpenMenuId(openMenuId === p.id ? null : p.id)
                }
              >
                <FiMoreVertical />
              </button>
              {openMenuId === p.id && (
                <div
                  className="position-absolute"
                  style={{
                    top: '100%',
                    right: 0,
                    zIndex: 10,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <button
                    className="dropdown-item d-flex align-items-center px-3 py-2"
                    onClick={() => {
                      onEdit(p);
                      setOpenMenuId(null);
                    }}
                  >
                    <FiEdit2 className="me-2" /> Edit
                  </button>
                  <button
                    className="dropdown-item d-flex align-items-center px-3 py-2 text-danger"
                    onClick={() => {
                      onDelete(p.id);
                      setOpenMenuId(null);
                    }}
                  >
                    <FiTrash2 className="me-2" /> Hapus
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2" style={{ fontSize: '0.9rem' }}>
            {p.nomor_ktp && (
              <div className="d-flex align-items-center mb-1">
                <FiCreditCard className="me-2" /> {p.nomor_ktp}
              </div>
            )}
            {p.tanggal_lahir && (
              <div className="d-flex align-items-center mb-1">
                <FiCalendar className="me-2" /> Lahir: {p.tanggal_lahir}
              </div>
            )}
            {p.tanggal_bergabung && (
              <div className="d-flex align-items-center">
                <FiUserPlus className="me-2" /> Bergabung: {p.tanggal_bergabung}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PengawasCardList;