import { useNavigate } from 'react-router-dom';
import { useEntityList } from '../../../hooks/useEntityList';
import MobileListPage from '../../../components/mobile/MobileListPage';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopListCard from '../../../components/desktop/DesktopListCard';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiTrash2, FiUser, FiChevronRight } from 'react-icons/fi';

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
    total,
    totalPages,
    keyword,
    setKeyword,
    loading,
    remove,
    refetch,
  } = useEntityList<Pengawas>(
    'pengawas',
    ['nama_lengkap', 'nama_panggilan'],
    limit,
    'id, nama_lengkap, nama_panggilan'
  );

  const handleDelete = (id: string) => remove(id, 'Yakin ingin hapus pengawas ini?');

  // Mobile: MobileListPage (Header app dicabut di MainLayout). Desktop: dk-.
  if (isMobile) {
    return (
      <MobileListPage
        title="Pengawas"
        backTo="/"
        addLabel="Tambah pengawas"
        onAdd={() => navigate('/pengawas-create')}
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari pengawas..."
        loading={loading}
        items={pengawasList.map((p) => ({
          id: p.id,
          title: p.nama_lengkap,
          sub: p.nama_panggilan ? `Panggilan: ${p.nama_panggilan}` : undefined,
        }))}
        onOpen={(id) => navigate(`/pengawas-detail/${id}`)}
        onDelete={handleDelete}
        emptyIcon={<FiUser />}
        emptyTitle="Belum ada pengawas"
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
        title="Pengawas"
        description="Kelola data pengawas SR Agency"
        actions={
          <button type="button" className="dk-btn dk-btn--primary" onClick={() => navigate('/pengawas-create')}>
            <FiPlus aria-hidden />
            Tambah pengawas
          </button>
        }
      />

      <DesktopListCard
        label="Daftar pengawas"
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari nama atau panggilan..."
        countText={`${total} pengawas`}
        loading={loading}
        loadingLabel="Memuat data pengawas"
        isEmpty={pengawasList.length === 0}
        empty={{
          icon: <FiUser />,
          title: keyword ? 'Pengawas tidak ditemukan' : 'Belum ada pengawas',
          text: keyword ? 'Coba kata kunci lain.' : 'Klik "Tambah pengawas" untuk menambah pengawas pertama.',
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        <table className="dk-table">
          <thead>
            <tr>
              <th scope="col">Nama lengkap</th>
              <th scope="col">Nama panggilan</th>
              <th scope="col" className="dk-col-actions">
                <span className="visually-hidden">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pengawasList.map((p) => (
              <tr key={p.id} className="is-clickable" onClick={() => navigate(`/pengawas-detail/${p.id}`)}>
                <td>
                  <div className="dk-person">
                    <span className="dk-avatar" aria-hidden>
                      {(p.nama_lengkap || p.nama_panggilan || '?').charAt(0).toUpperCase()}
                    </span>
                    {/* Tombol supaya baris juga bisa dibuka lewat keyboard. */}
                    <button
                      type="button"
                      className="dk-person-name"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pengawas-detail/${p.id}`);
                      }}
                    >
                      {p.nama_lengkap}
                    </button>
                  </div>
                </td>
                <td>{p.nama_panggilan || <span className="dk-muted">-</span>}</td>
                <td className="dk-col-actions">
                  <button
                    type="button"
                    className="dk-icon-btn dk-icon-btn--danger"
                    title="Hapus"
                    aria-label={`Hapus ${p.nama_lengkap}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
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

export default PengawasListPage;
