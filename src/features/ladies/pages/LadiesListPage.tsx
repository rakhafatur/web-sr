import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
import ListPageToolbar from '../../../components/ListPageToolbar';
import ListLoadingState from '../../../components/ListLoadingState';
import PullToRefresh from '../../../components/PullToRefresh';
import MobileListPage from '../../../components/mobile/MobileListPage';

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
    loading,
    remove,
    refetch,
  } = useEntityList<Lady>(
    'ladies',
    ['nama_lengkap', 'nama_ladies', 'nama_outlet'],
    limit,
    'id, nama_lengkap, nama_ladies, nama_outlet, pin, status'
  );

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus data ladies ini?');

  const BADGE_STATUS: Record<string, { label: string; tone: 'on' | 'off' | 'warn' }> = {
    active: { label: 'Aktif', tone: 'on' },
    'not active': { label: 'Nonaktif', tone: 'warn' },
    resign: { label: 'Resign', tone: 'off' },
  };

  // Mobile: MobileListPage (Header app dicabut di MainLayout). Desktop: lama.
  if (isMobile) {
    return (
      <MobileListPage
        title="Ladies"
        backTo="/"
        addLabel="Tambah ladies"
        onAdd={() => navigate('/ladies-create')}
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari nama atau outlet..."
        loading={loading}
        items={ladiesList.map((l) => ({
          id: l.id,
          title: l.nama_ladies,
          sub: [l.nama_outlet, l.pin && `PIN ${l.pin}`].filter(Boolean).join(' · '),
          badge: BADGE_STATUS[l.status],
        }))}
        onOpen={(id) => navigate(`/ladies-detail/${id}`)}
        onDelete={handleDelete}
        emptyIcon={<FiUser />}
        emptyTitle="Belum ada ladies"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRefresh={refetch}
      />
    );
  }

  return (
    <PullToRefresh onRefresh={refetch}>
    <div className="page-shell p-4" style={{ color: 'var(--color-dark)' }}>
      <ListPageHeader
        icon={<FiUser />}
        title="Management Ladies"
        description="Kelola data ladies SR Agency"
        actions={
          <HeaderActionButton
            icon={<FiPlus />}
            onClick={() => navigate('/ladies-create')}
          >
            Tambah Ladies
          </HeaderActionButton>
        }
      />

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <ListPageToolbar
          title="List Ladies"
          subtitle="Data ladies"
          placeholder="Cari ladies..."
          keyword={keyword}
          onKeywordChange={(value) => {
            setPage(1);
            setKeyword(value);
          }}
        />

        {/* BODY */}
        <div className="p-2 p-md-3">
          {loading ? (
            <ListLoadingState label="Memuat data ladies" />
          ) : (
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
                      <ActionIconButton
                        icon={<FiEdit2 size={16} />}
                        variant="warning"
                        title="Edit"
                        onClick={() => navigate(`/ladies-detail/${lady.id}`)}
                      />
                      <ActionIconButton
                        icon={<FiTrash2 size={16} />}
                        variant="danger"
                        title="Hapus"
                        onClick={() => handleDelete(lady.id)}
                      />
                    </div>
                  ),
                },
              ]}
              data={ladiesList}
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

export default LadiesListPage;
