import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
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
          <button
            onClick={() => { setEditLady(null); setShowForm(true); }}
            className="btn btn-success rounded-circle position-fixed"
            style={{ bottom: '20px', right: '20px', width: '56px', height: '56px', fontSize: '24px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            +
          </button>
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
            addLabel="➕ Tambah Ladies"
            buttonColor="btn-warning"
          />

          <DataTable
            columns={[
              { key: 'nama_lengkap', label: 'Nama Lengkap' },
              { key: 'nama_ladies', label: 'Nama Ladies' },
              { key: 'nama_outlet', label: 'Nama Outlet' },
              { key: 'pin', label: 'PIN' },
              {
                key: 'id',
                label: 'Aksi',
                render: (lady: Lady) => (
                  <>
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => { setEditLady(lady); setShowForm(true); }}>
                      ✏️
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(lady.id)}>
                      🗑️
                    </button>
                  </>
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
