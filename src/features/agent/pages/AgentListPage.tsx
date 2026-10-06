import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import MobileListPage from '../../../components/mobile/MobileListPage';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopListCard from '../../../components/desktop/DesktopListCard';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiTrash2, FiUser, FiBriefcase, FiChevronRight } from 'react-icons/fi';

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
    total,
    totalPages,
    keyword,
    setKeyword,
    loading,
    remove,
    refetch,
  } = useEntityList<Agent>('agent', ['nama_agent'], limit);

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus agent ini?');

  // Mobile: MobileListPage (Header app dicabut di MainLayout). Desktop: dk-.
  if (isMobile) {
    return (
      <MobileListPage
        title="Agent"
        backTo="/"
        addLabel="Tambah agent"
        onAdd={() => navigate('/agent-create')}
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari agent..."
        loading={loading}
        items={agentList.map((a) => ({ id: a.id, title: a.nama_agent }))}
        onOpen={(id) => navigate(`/agent-detail/${id}`)}
        onDelete={handleDelete}
        emptyIcon={<FiUser />}
        emptyTitle="Belum ada agent"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    );
  }

  // Desktop (gaya baru dk-, sama dengan Users): header polos, satu kartu
  // dengan cari & tabel beravatar; seluruh baris membuka detail.
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Agent"
        description="Kelola data agent SR Agency"
        actions={
          <button type="button" className="dk-btn dk-btn--primary" onClick={() => navigate('/agent-create')}>
            <FiPlus aria-hidden />
            Tambah agent
          </button>
        }
      />

      <DesktopListCard
        label="Daftar agent"
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari agent..."
        countText={`${total} agent`}
        loading={loading}
        loadingLabel="Memuat data agent"
        isEmpty={agentList.length === 0}
        empty={{
          icon: <FiBriefcase />,
          title: keyword ? 'Agent tidak ditemukan' : 'Belum ada agent',
          text: keyword ? 'Coba kata kunci lain.' : 'Klik "Tambah agent" untuk menambah agent pertama.',
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        <table className="dk-table">
          <thead>
            <tr>
              <th scope="col">Nama agent</th>
              <th scope="col" className="dk-col-actions">
                <span className="visually-hidden">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {agentList.map((a) => (
              <tr key={a.id} className="is-clickable" onClick={() => navigate(`/agent-detail/${a.id}`)}>
                <td>
                  <div className="dk-person">
                    <span className="dk-avatar" aria-hidden>
                      {(a.nama_agent || '?').charAt(0).toUpperCase()}
                    </span>
                    {/* Tombol supaya baris juga bisa dibuka lewat keyboard. */}
                    <button
                      type="button"
                      className="dk-person-name"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/agent-detail/${a.id}`);
                      }}
                    >
                      {a.nama_agent}
                    </button>
                  </div>
                </td>
                <td className="dk-col-actions">
                  <button
                    type="button"
                    className="dk-icon-btn dk-icon-btn--danger"
                    title="Hapus"
                    aria-label={`Hapus ${a.nama_agent}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                  <FiChevronRight className="dk-row-chevron" aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DesktopListCard>
    </div>
  );
};

export default AgentListPage;
