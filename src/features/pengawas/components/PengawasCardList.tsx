import React from 'react';

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
  return (
    <>
      {pengawas.map((p) => (
        <div
          key={p.id}
          className="p-3 mb-3 rounded"
          style={{ backgroundColor: '#1e0036', border: '1px solid #999' }}
        >
          <div><strong>🧑‍🏫 Nama Lengkap:</strong> {p.nama_lengkap}</div>
          <div><strong>🏷️ Nama Panggilan:</strong> {p.nama_panggilan || '-'}</div>
          <div><strong>🪪 No. KTP:</strong> {p.nomor_ktp || '-'}</div>
          <div><strong>🎂 Tanggal Lahir:</strong> {p.tanggal_lahir || '-'}</div>
          <div><strong>🏠 Alamat:</strong> {p.alamat || '-'}</div>
          <div><strong>📅 Bergabung:</strong> {p.tanggal_bergabung || '-'}</div>

          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={() => onEdit(p)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(p.id)}
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default PengawasCardList;