import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import ListToolbar from '../../../components/ListToolBar';
import ListPageHeader from '../../../components/ListPageHeader';
import LadiesCardList from '../components/LadiesCardList';

export type Lady = {
  id: string;
  nama_lengkap: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  nomor_ktp: string;
  tanggal_bergabung: string;
  alamat: string;
  status: string;
  agent_id: string | null;
};

const LadiesListPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const limit = isMobile ? 5 : 10;

  const {
    list: ladiesList,
    page,
    setPage,
    totalPages,
    keyword,
    setKeyword,
    remove,
  } = useEntityList<Lady>('ladies', ['nama_lengkap', 'nama_ladies', 'nama_outlet'], limit);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const backdrop = document.querySelector('.sidebar-backdrop');
      setIsSidebarOpen(!!backdrop);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleDelete = (id: string) => remove(id, '❗ Yakin ingin hapus data ladies ini?');

  return (
    <div className="p-4" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-dark)', paddingBottom: isMobile ? '100px' : undefined }}>
      <ListPageHeader
        icon={<FiUser />}
        title="Management Ladies"
        description="Kelola data ladies SR Agency"
      />

      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control bg-white text-dark border border-success"
            placeholder="🔍 Cari ladies..."
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
          <LadiesCardList
            ladies={ladiesList}
            onEdit={(l) => navigate(`/ladies-detail/${l.id}`)}
            onDelete={handleDelete}
          />
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-outline-success" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                ← Sebelumnya
              </button>
              <button className="btn btn-outline-success" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Selanjutnya →
              </button>
            </div>
          )}
          {!isSidebarOpen && (
            <button onClick={() => navigate('/ladies-create')} className="fab-button">
              <FiPlus />
            </button>
          )}
        </>
      ) : (
        <>
          <ListToolbar
            keyword={keyword}
            onKeywordChange={(val) => {
              setPage(1);
              setKeyword(val);
            }}
            onAddClick={() => navigate('/ladies-create')}
            addLabel={
              <span className="d-flex align-items-center">
                <FiPlus className="me-2" /> Tambah Ladies
              </span>
            }
            buttonColor="btn-success"
          />

          <DataTable
            columns={[
              { key: 'nama_lengkap', label: 'Nama Lengkap' },
              { key: 'nama_ladies', label: 'Nama Ladies' },
              { key: 'nama_outlet', label: 'Nama Outlet' },
              { key: 'pin', label: 'PIN' },
              {
                key: 'status',
                label: 'Status',
                render: (lady: Lady) => {
                  let borderColor = '';
                  let bgColor = '';
                  switch (lady.status) {
                    case 'active':
                      borderColor = 'border-success';
                      bgColor = 'bg-success bg-opacity-10';
                      break;
                    case 'resign':
                      borderColor = 'border-danger';
                      bgColor = 'bg-danger bg-opacity-10';
                      break;
                    case 'not active':
                      borderColor = 'border-warning';
                      bgColor = 'bg-warning bg-opacity-10';
                      break;
                    default:
                      borderColor = 'border-secondary';
                      bgColor = 'bg-light';
                  }

                  return (
                    <span className={`badge ${bgColor} ${borderColor} text-dark border px-2 py-1`}>
                      {lady.status}
                    </span>
                  );
                },
              },
              {
                key: 'id',
                label: 'Aksi',
                render: (lady: Lady) => (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        borderRadius: 6,
                      }}
                      onClick={() => navigate(`/ladies-detail/${lady.id}`)}
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        borderRadius: 6,
                      }}
                      onClick={() => handleDelete(lady.id)}
                      title="Hapus"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={ladiesList}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-outline-success" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                ← Sebelumnya
              </button>
              <button className="btn btn-outline-success" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LadiesListPage;
