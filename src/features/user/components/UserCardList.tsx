import React, { useState, useRef, useEffect } from 'react';
import {
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiType,
} from 'react-icons/fi';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
};

const UserCardList = ({ users, onEdit, onDelete }: Props) => {
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
      {users.map((u) => (
        <div
          key={u.id}
          className="p-3 mb-3 rounded position-relative shadow-sm"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-green)',
            color: 'var(--color-dark)',
          }}
        >
          {/* Tombol 3 titik */}
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
              onClick={() => toggleMenu(u.id)}
            >
              <FiMoreHorizontal size={18} />
            </button>

            {activeMenu === u.id && (
              <div
                ref={menuRef}
                className="position-absolute bg-white border rounded shadow-sm p-2"
                style={{
                  top: '110%',
                  right: 0,
                  minWidth: 120,
                  zIndex: 1000,
                }}
              >
                <button
                  className="dropdown-item text-success d-flex align-items-center gap-2"
                  onClick={() => {
                    onEdit(u);
                    setActiveMenu(null);
                  }}
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={() => {
                    onDelete(u.id);
                    setActiveMenu(null);
                  }}
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            )}
          </div>

          {/* Isi Kartu */}
          <div className="mb-2 d-flex align-items-center" style={{ color: 'var(--color-dark)' }}>
            <FiUser className="me-2" /> <strong>Username:</strong>&nbsp;{u.username}
          </div>
          <div className="d-flex align-items-center" style={{ color: 'var(--color-dark)' }}>
            <FiType className="me-2" /> <strong>Nama:</strong>&nbsp;{u.nama || '-'}
          </div>
        </div>
      ))}
    </>
  );
};

export default UserCardList;