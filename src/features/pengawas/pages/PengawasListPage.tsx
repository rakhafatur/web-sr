import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import PengawasCardList from '../components/PengawasCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  nomor_ktp: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  tanggal_bergabung: string | null;
};

const PengawasListPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const limit = isMobile ? 5 : 10;

  const {
    list: pengawasList,
    page,
    setPage,
    totalPages,
    keyword,
    setKeyword,
    remove,
  } = useEntityList<Pengawas>('pengawas', ['nama_lengkap', 'nama_panggilan'], limit);

  // ⬇️ Tambahan: untuk deteksi sidebar terbuka
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const backdrop = document.querySelector('.sidebar-backdrop');
      setIsSidebarOpen(!!backdrop);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus pengawas ini?');

  return (
    <div
      className="page-shell p-4"
      style={{
        color: 'var(--color-dark)',
        paddingBottom: isMobile ? '100px' : undefined,
      }}
    >
      <ListPageHeader
        icon={<FiUser />}
        title="Management Pengawas"
        description="Kelola data pengawas SR Agency"
      />

      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Cari pengawas..."
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>
      )}

      {isMobile ? (
        <>
          <PengawasCardList
            pengawas={pengawasList}
            onEdit={(p) => navigate(`/pengawas-detail/${p.id}`)}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ← Sebelumnya
              </button>
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}

          {/* ⬇️ FAB tidak tampil jika sidebar sedang terbuka */}
          {!isSidebarOpen && (
            <button onClick={() => navigate('/pengawas-create')} className="fab-button">
              <FiPlus />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-stretch mb-3 gap-2">
            <button
              className="btn btn-success fw-bold"
              onClick={() => navigate('/pengawas-create')}
            >
              <FiPlus className="me-2" /> Tambah Pengawas
            </button>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Cari pengawas..."
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
              style={{ maxWidth: 300 }}
            />
          </div>

          <DataTable
            columns={[
              { key: 'nama_lengkap', label: 'Nama Lengkap' },
              { key: 'nama_panggilan', label: 'Panggilan' },
              {
                key: 'id',
                label: 'Aksi',
                render: (p: Pengawas) => (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => navigate(`/pengawas-detail/${p.id}`)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p.id)}
                      title="Hapus"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ),
              },
            ]}
            data={pengawasList}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ← Sebelumnya
              </button>
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PengawasListPage;
