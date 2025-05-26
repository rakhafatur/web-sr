import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import ListToolbar from '../../../components/ListToolBar';
import AddLadiesModal from '../components/AddLadiesModal';

type Lady = {
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
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [editLady, setEditLady] = useState<Lady | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;
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
      const { error } = await supabase
        .from('ladies')
        .update(safeData)
        .eq('id', editLady.id);

      if (error) {
        alert('❌ Gagal update data: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('ladies').insert([safeData]);

      if (error) {
        alert('❌ Gagal tambah data: ' + error.message);
      }
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
  }, [page, keyword]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4">
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

      <AddLadiesModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditLady(null);
        }}
        onSubmit={handleSaveLady}
        lady={editLady}
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
            render: (lady) => (
              <>
                <button
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => {
                    setEditLady(lady);
                    setShowForm(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(lady.id)}
                >
                  🗑️ Hapus
                </button>
              </>
            ),
          },
        ]}
        data={ladiesList}
      />

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          ← Prev
        </button>
        <span>Halaman {page} dari {totalPages}</span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default LadiesListPage;
