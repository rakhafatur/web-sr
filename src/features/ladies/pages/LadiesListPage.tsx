import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import ListToolbar from '../../../components/ListToolBar';
import AddLadiesModal from '../components/AddLadiesModal';
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
  status: string; // ✅ tambahkan field status
};

const LadiesListPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [editLady, setEditLady] = useState<Lady | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const limit = isMobile ? 5 : 10;
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const backdrop = document.querySelector('.sidebar-backdrop');
      setIsSidebarOpen(!!backdrop);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const fetchLadies = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('ladies')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (keyword.trim() !== '') {
      query = query.or(`nama_lengkap.ilike.%${keyword}%,nama_ladies.ilike.%${keyword}%,nama_outlet.ilike.%${keyword}%`);
    }

    const { data, count, error } = await query;

    if (error) console.error('❌ Gagal ambil data ladies:', error);
    else {
      setLadiesList(data || []);
      setTotal(count || 0);
    }
  };

  const handleSaveLady = async (data: Omit<Lady, 'id'>) => {
    const safeData = {
      ...data,
      tanggal_bergabung: data.tanggal_bergabung || null,
    };

    if (editLady) {
      const { error } = await supabase.from('ladies').update(safeData).eq('id', editLady.id);
      if (error) alert('❌ Gagal update data: ' + error.message);
    } else {
      const { error } = await supabase.from('ladies').insert([safeData]);
      if (error) alert('❌ Gagal tambah data: ' + error.message);
    }

    setEditLady(null);
    setShowForm(false);
    fetchLadies();
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('❗ Yakin ingin hapus data ladies ini?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('ladies').delete().eq('id', id);
    if (error) alert('❌ Gagal hapus data: ' + error.message);
    else fetchLadies();
  };

  useEffect(() => {
    fetchLadies();
    // eslint-disable-next-line
  }, [page, keyword, isMobile]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-dark)', paddingBottom: isMobile ? '100px' : undefined }}>
      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control bg-white text-dark border border-success"
            placeholder="🔍 Cari ladies..."
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>
      )}

      <AddLadiesModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditLady(null);
        }}
        onSubmit={handleSaveLady}
        lady={editLady}
      />

      {isMobile ? (
        <>
          <LadiesCardList ladies={ladiesList} onEdit={(l) => { setEditLady(l); setShowForm(true); }} onDelete={handleDelete} />
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-outline-success" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                ← Sebelumnya
              </button>
              <button className="btn btn-outline-success" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Selanjutnya →
              </button>
            </div>
          )}
          {!isSidebarOpen && (
            <button
              onClick={() => {
                setEditLady(null);
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
          <ListToolbar
            keyword={keyword}
            onKeywordChange={(val) => {
              setPage(1);
              setKeyword(val);
            }}
            onAddClick={() => {
              setEditLady(null);
              setShowForm(true);
            }}
            addLabel={
              <span className="d-flex align-items-center">
                <FiPlus className="me-2" /> Tambah Ladies
              </span>
            }
            buttonColor="btn-success"
          />

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
                    <button
                      className="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        borderRadius: 6,
                      }}
                      onClick={() => {
                        setEditLady(lady);
                        setShowForm(true);
                      }}
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        borderRadius: 6,
                      }}
                      onClick={() => handleDelete(lady.id)}
                      title="Hapus"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={ladiesList}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button className="btn btn-outline-success" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                ← Sebelumnya
              </button>
              <button className="btn btn-outline-success" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LadiesListPage;