import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import AgentCardList from '../components/AgentCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiSearch } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';

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

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus agent ini?');

  return (
    <div
      className="page-shell p-4"
      style={{
        color: 'var(--color-dark)',
      }}
    >
      <ListPageHeader
        icon={<FiUser />}
        title="Management Agent"
        description="Kelola data agent SR Agency"
        actions={
          <HeaderActionButton
            icon={<FiPlus />}
            onClick={() => navigate('/agent-create')}
            fullWidth={isMobile}
          >
            Tambah Agent
          </HeaderActionButton>
        }
      />

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* TOPBAR */}
        <div className="px-3 py-3 border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <div className="fw-bold">List Agent</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
                Data agent
              </div>
            </div>

            {!isMobile && (
              <div style={{ width: 300, position: 'relative' }}>
                <FiSearch
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    color: 'var(--color-gray-500)',
                  }}
                />
                <input
                  className="form-control form-control-sm"
                  style={{ paddingLeft: 35, borderRadius: 10 }}
                  placeholder="Cari agent..."
                  value={keyword}
                  onChange={(e) => {
                    setPage(1);
                    setKeyword(e.target.value);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        {isMobile && (
          <div className="p-2 border-bottom">
            <input
              className="form-control form-control-sm"
              placeholder="Cari agent..."
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
            />
          </div>
        )}

        {/* BODY */}
        <div className="p-2 p-md-3">
          {isMobile ? (
            <AgentCardList
              agents={agentList}
              onEdit={(a) => navigate(`/agent-detail/${a.id}`)}
              onDelete={handleDelete}
            />
          ) : (
            <DataTable
              columns={[
                { key: 'nama_agent', label: 'Nama Agent' },
                {
                  key: 'id',
                  label: 'Aksi',
                  render: (a: Agent) => (
                    <div className="d-flex gap-2">
                      <ActionIconButton
                        icon={<FiEdit2 />}
                        variant="warning"
                        title="Edit"
                        onClick={() => navigate(`/agent-detail/${a.id}`)}
                      />
                      <ActionIconButton
                        icon={<FiTrash2 />}
                        variant="danger"
                        title="Hapus"
                        onClick={() => handleDelete(a.id)}
                      />
                    </div>
                  ),
                },
              ]}
              data={agentList}
            />
          )}

          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentListPage;
