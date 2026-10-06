import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiTrash2, FiUser, FiChevronRight } from 'react-icons/fi';
import { useEntityList } from '../../../hooks/useEntityList';
import MobileListPage from '../../../components/mobile/MobileListPage';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopListCard from '../../../components/desktop/DesktopListCard';

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
    total,
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

  // Mobile: MobileListPage (Header app dicabut di MainLayout). Desktop: dk-.
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

  // Desktop (gaya baru dk-, sama dengan Users): header polos, satu kartu
  // dengan cari & tabel beravatar; seluruh baris membuka detail.
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Ladies"
        description="Kelola data ladies SR Agency"
        actions={
          <button type="button" className="dk-btn dk-btn--primary" onClick={() => navigate('/ladies-create')}>
            <FiPlus aria-hidden />
            Tambah ladies
          </button>
        }
      />

      <DesktopListCard
        label="Daftar ladies"
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari nama atau outlet..."
        countText={`${total} ladies`}
        loading={loading}
        loadingLabel="Memuat data ladies"
        isEmpty={ladiesList.length === 0}
        empty={{
          icon: <FiUser />,
          title: keyword ? 'Ladies tidak ditemukan' : 'Belum ada ladies',
          text: keyword ? 'Coba kata kunci lain.' : 'Klik "Tambah ladies" untuk menambah ladies pertama.',
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        <table className="dk-table">
          <thead>
            <tr>
              <th scope="col">Nama</th>
              <th scope="col">Outlet</th>
              <th scope="col">PIN</th>
              <th scope="col">Status</th>
              <th scope="col" className="dk-col-actions">
                <span className="visually-hidden">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ladiesList.map((l) => {
              const badge = BADGE_STATUS[l.status];

              return (
                <tr key={l.id} className="is-clickable" onClick={() => navigate(`/ladies-detail/${l.id}`)}>
                  <td>
                    <div className="dk-person">
                      <span className="dk-avatar" aria-hidden>
                        {(l.nama_ladies || l.nama_lengkap || '?').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        {/* Tombol supaya baris juga bisa dibuka lewat keyboard. */}
                        <button
                          type="button"
                          className="dk-person-name"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ladies-detail/${l.id}`);
                          }}
                        >
                          {l.nama_ladies || l.nama_lengkap}
                        </button>
                        {l.nama_lengkap && l.nama_lengkap !== l.nama_ladies && (
                          <div className="dk-person-sub">{l.nama_lengkap}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{l.nama_outlet || <span className="dk-muted">-</span>}</td>
                  <td className="dk-num">{l.pin || <span className="dk-muted">-</span>}</td>
                  <td>
                    {badge ? (
                      <span className={`dk-status is-${badge.tone}`}>{badge.label}</span>
                    ) : (
                      <span className="dk-muted">{l.status || '-'}</span>
                    )}
                  </td>
                  <td className="dk-col-actions">
                    <button
                      type="button"
                      className="dk-icon-btn dk-icon-btn--danger"
                      title="Hapus"
                      aria-label={`Hapus ${l.nama_ladies || l.nama_lengkap}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(l.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                    <FiChevronRight className="dk-row-chevron" aria-hidden />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DesktopListCard>
    </div>
  );
};

export default LadiesListPage;
