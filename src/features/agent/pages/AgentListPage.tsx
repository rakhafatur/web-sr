import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import AgentCardList from '../components/AgentCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
import ListPageToolbar from '../../../components/ListPageToolbar';
import ListLoadingState from '../../../components/ListLoadingState';
import PullToRefresh from '../../../components/PullToRefresh';

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
    loading,
    remove,
    refetch,
  } = useEntityList<Agent>('agent', ['nama_agent'], limit);

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus agent ini?');

  return (
    <PullToRefresh onRefresh={refetch}>
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
        <ListPageToolbar
          title="List Agent"
          subtitle="Data agent"
          placeholder="Cari agent..."
          keyword={keyword}
          onKeywordChange={(value) => {
            setPage(1);
            setKeyword(value);
          }}
        />

        {/* BODY */}
        <div className="p-2 p-md-3">
          {loading ? (
            <ListLoadingState label="Memuat data agent" />
          ) : isMobile ? (
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
                        icon={<FiEdit2 size={16} />}
                        variant="warning"
                        title="Edit"
                        onClick={() => navigate(`/agent-detail/${a.id}`)}
                      />
                      <ActionIconButton
                        icon={<FiTrash2 size={16} />}
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
    </PullToRefresh>
  );
};

export default AgentListPage;
