import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AddAgentModal from '../components/AddAgentModal';
import DataTable from '../../../components/DataTable';
import AgentCardList from '../components/AgentCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export type Agent = {
  id: string;
  nama_agent: string;
};

const AgentListPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const limit = isMobile ? 5 : 10;
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

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

  const fetchAgents = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('agent')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (keyword.trim() !== '') {
      query = query.or(`nama_agent.ilike.%${keyword}%`);
    }

    const { data, count, error } = await query;
    if (error) console.error('Gagal ambil data agent:', error);
    else {
      setAgentList(data || []);
      setTotal(count || 0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin hapus agent ini?')) return;
    const { error } = await supabase.from('agent').delete().eq('id', id);
    if (error) alert('Gagal hapus agent: ' + error.message);
    else fetchAgents();
  };

  const handleSaveAgent = async (data: Omit<Agent, 'id'>) => {
    if (editAgent) {
      const { error } = await supabase
        .from('agent')
        .update(data)
        .eq('id', editAgent.id);

      if (error) alert('Gagal update agent: ' + error.message);
    } else {
      const { error } = await supabase.from('agent').insert([data]);
      if (error) alert('Gagal tambah agent: ' + error.message);
    }

    setEditAgent(null);
    setShowForm(false);
    fetchAgents();
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line
  }, [page, keyword, isMobile]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      className="p-4"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-dark)',
        paddingBottom: isMobile ? '100px' : undefined,
      }}
    >
      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control bg-white text-dark border border-success"
            placeholder="🔍 Cari agent..."
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>
      )}

      <AddAgentModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditAgent(null);
        }}
        onSubmit={handleSaveAgent}
        agent={editAgent}
      />

      {isMobile ? (
        <>
          <AgentCardList
            agents={agentList}
            onEdit={(a) => {
              setEditAgent(a);
              setShowForm(true);
            }}
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
            <button
              onClick={() => {
                setEditAgent(null);
                setShowForm(true);
              }}
              className="fab-button"
            >
              <FiPlus />
            </button>
          )}
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-stretch mb-3 gap-2">
            <button
              className="btn btn-success fw-bold"
              onClick={() => {
                setEditAgent(null);
                setShowForm(true);
              }}
            >
              <FiPlus className="me-2" /> Tambah Agent
            </button>
            <input
              type="text"
              className="form-control bg-white text-dark border border-success"
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
                      onClick={() => {
                        setEditAgent(a);
                        setShowForm(true);
                      }}
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
