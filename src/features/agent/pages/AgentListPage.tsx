import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import AgentCardList from '../components/AgentCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';

export type Agent = {
  id: string;
  nama_agent: string;
};

const AgentListPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const limit = isMobile ? 5 : 10;

  const {
    list: agentList,
    page,
    setPage,
    totalPages,
    keyword,
    setKeyword,
    remove,
  } = useEntityList<Agent>('agent', ['nama_agent'], limit);

  // Deteksi sidebar terbuka
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const backdrop = document.querySelector('.sidebar-backdrop');
      setIsSidebarOpen(!!backdrop);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus agent ini?');

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
        title="Management Agent"
        description="Kelola data agent SR Agency"
      />

      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Cari agent..."
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
          <AgentCardList
            agents={agentList}
            onEdit={(a) => navigate(`/agent-detail/${a.id}`)}
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

          {/* FAB */}
          {!isSidebarOpen && (
            <button onClick={() => navigate('/agent-create')} className="fab-button">
              <FiPlus />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-stretch mb-3 gap-2">
            <button className="btn btn-success fw-bold" onClick={() => navigate('/agent-create')}>
              <FiPlus className="me-2" /> Tambah Agent
            </button>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Cari agent..."
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
              { key: 'nama_agent', label: 'Nama Agent' },
              {
                key: 'id',
                label: 'Aksi',
                render: (a: Agent) => (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => navigate(`/agent-detail/${a.id}`)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(a.id)}
                      title="Hapus"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ),
              },
            ]}
            data={agentList}
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

export default AgentListPage;
