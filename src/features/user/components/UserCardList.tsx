import React, { useState } from 'react';
import { FiMoreHorizontal, FiEdit, FiTrash2 } from 'react-icons/fi';

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

  const toggleMenu = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <>
      {users.map((u) => (
        <div
          key={u.id}
          className="p-3 mb-3 rounded position-relative"
          style={{ backgroundColor: '#1e0036', border: '1px solid #999' }}
        >
          <div><strong>👤 Username:</strong> {u.username}</div>
          <div><strong>🪪 Nama:</strong> {u.nama || '-'}</div>

          <div className="mt-2 d-flex justify-content-end">
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => toggleMenu(u.id)}
              title="Aksi"
            >
              <FiMoreHorizontal />
            </button>
          </div>

          {activeMenu === u.id && (
            <div
              className="position-absolute bg-dark border p-2 rounded shadow"
              style={{
                top: '60%',
                right: '10px',
                zIndex: 1000,
                minWidth: '120px',
              }}
            >
              <button
                className="dropdown-item text-warning d-flex align-items-center gap-2"
                onClick={() => {
                  onEdit(u);
                  setActiveMenu(null);
                }}
              >
                <FiEdit /> Edit
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
      ))}
    </>
  );
};

export default UserCardList;