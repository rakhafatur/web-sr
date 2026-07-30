import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import PengawasCardList from '../components/PengawasCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';

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

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus pengawas ini?');

  return (
    <div
      className="page-shell p-4"
      style={{
        color: 'var(--color-dark)',
      }}
    >
      <ListPageHeader
        icon={<FiUser />}
        title="Management Pengawas"
        description="Kelola data pengawas SR Agency"
        actions={
          <HeaderActionButton
            icon={<FiPlus />}
            onClick={() => navigate('/pengawas-create')}
            fullWidth={isMobile}
          >
            Tambah Pengawas
          </HeaderActionButton>
        }
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
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </>
      ) : (
        <>
          <div className="d-flex justify-content-end align-items-stretch mb-3 gap-2">
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
                    <ActionIconButton
                      icon={<FiEdit2 />}
                      variant="warning"
                      title="Edit"
                      onClick={() => navigate(`/pengawas-detail/${p.id}`)}
                    />
                    <ActionIconButton
                      icon={<FiTrash2 />}
                      variant="danger"
                      title="Hapus"
                      onClick={() => handleDelete(p.id)}
                    />
                  </div>
                ),
              },
            ]}
            data={pengawasList}
          />

          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </>
      )}
    </div>
  );
};

export default PengawasListPage;
