import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
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

  const handleDelete = (id: string) => remove(id, '❗ Yakin ingin hapus data ladies ini?');

  return (
    <div className="page-shell p-4" style={{ color: 'var(--color-dark)' }}>
      <ListPageHeader
        icon={<FiUser />}
        title="Management Ladies"
        description="Kelola data ladies SR Agency"
        actions={
          <HeaderActionButton
            icon={<FiPlus />}
            onClick={() => navigate('/ladies-create')}
            fullWidth={isMobile}
          >
            Tambah Ladies
          </HeaderActionButton>
        }
      />

      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
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
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </>
      ) : (
        <>
          <div className="d-flex justify-content-end align-items-stretch mb-3 gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Cari ladies..."
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

          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </>
      )}
    </div>
  );
};

export default LadiesListPage;
