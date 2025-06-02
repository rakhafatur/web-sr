import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiEdit2, FiTrash2, FiUser, FiInfo } from 'react-icons/fi';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  nomor_ktp: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  tanggal_bergabung: string | null;
};

type Props = {
  pengawas: Pengawas[];
  onEdit: (p: Pengawas) => void;
  onDelete: (id: string) => void;
};

const PengawasCardList = ({ pengawas, onEdit, onDelete }: Props) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (id: string) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {pengawas.map((p) => (
        <div
          key={p.id}
          className="p-3 mb-3 rounded position-relative shadow-sm"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-green)',
            color: 'var(--color-dark)',
          }}
        >
          {/* Titik Tiga */}
          <div className="position-absolute" style={{ top: 10, right: 10 }}>
            <button
              className="btn btn-sm border-0"
              style={{
                backgroundColor: '#f1f1f1',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
              onClick={() => toggleMenu(p.id)}
            >
              <FiMoreHorizontal size={18} />
            </button>

            {activeMenu === p.id && (
              <div
                ref={menuRef}
                className="position-absolute bg-white border rounded shadow-sm p-2"
                style={{ top: '110%', right: 0, minWidth: 120, zIndex: 1000 }}
              >
                <button
                  className="dropdown-item text-success d-flex align-items-center gap-2"
                  onClick={() => {
                    onEdit(p);
                    setActiveMenu(null);
                  }}
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={() => {
                    onDelete(p.id);
                    setActiveMenu(null);
                  }}
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            )}
          </div>

          {/* Konten Card */}
          <div className="mb-2 d-flex align-items-center">
            <FiUser className="me-2" /> <strong>Nama:</strong>&nbsp;{p.nama_lengkap}
          </div>
          <div className="mb-1 d-flex align-items-center">
            <FiInfo className="me-2" /> <strong>Panggilan:</strong>&nbsp;{p.nama_panggilan || '-'}
          </div>
          <div className="mb-1 d-flex align-items-center">
            <strong>NIK:</strong>&nbsp;{p.nomor_ktp || '-'}
          </div>
          <div className="mb-1 d-flex align-items-center">
            <strong>Lahir:</strong>&nbsp;{p.tanggal_lahir || '-'}
          </div>
          <div className="mb-1 d-flex align-items-center">
            <strong>Bergabung:</strong>&nbsp;{p.tanggal_bergabung || '-'}
          </div>
        </div>
      ))}
    </>
  );
};

export default PengawasCardList;