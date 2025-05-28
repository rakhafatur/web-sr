import React from 'react';

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
  return (
    <>
      {users.map((u) => (
        <div
          key={u.id}
          className="p-3 mb-3 rounded"
          style={{ backgroundColor: '#1e0036', border: '1px solid #999' }}
        >
          <div><strong>👤 Username:</strong> {u.username}</div>
          <div><strong>🪪 Nama:</strong> {u.nama || '-'}</div>
          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => onEdit(u)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(u.id)}
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default UserCardList;