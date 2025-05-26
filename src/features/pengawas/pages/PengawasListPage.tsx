  import { useEffect, useState } from 'react';
  import { supabase } from '../../../lib/supabaseClient';
  import AddPengawasModal from '../components/AddPengawasModal';
  import DataTable from '../../../components/DataTable';
  import ListToolbar from '../../../components/ListToolBar';

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
    const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editPengawas, setEditPengawas] = useState<Pengawas | null>(null);

    const [page, setPage] = useState(1);
    const limit = 10;
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState('');

    const fetchPengawas = async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('pengawas')
        .select('*', { count: 'exact' })
        .range(from, to);

      if (keyword.trim() !== '') {
        query = query.or(`nama_lengkap.ilike.%${keyword}%,nama_panggilan.ilike.%${keyword}%`);
      }

      const { data, count, error } = await query;

      if (error) console.error('❌ Gagal ambil data pengawas:', error);
      else {
        setPengawasList(data || []);
        setTotal(count || 0);
      }
    };

    const handleDelete = async (id: string) => {
      const confirmDelete = window.confirm('❗ Yakin ingin hapus pengawas ini?');
      if (!confirmDelete) return;

      const { error } = await supabase.from('pengawas').delete().eq('id', id);
      if (error) alert('❌ Gagal hapus pengawas: ' + error.message);
      else fetchPengawas();
    };

    const handleSavePengawas = async (data: Omit<Pengawas, 'id'>) => {
      if (editPengawas) {
        const { error } = await supabase
          .from('pengawas')
          .update(data)
          .eq('id', editPengawas.id);

        if (error) alert('❌ Gagal update pengawas: ' + error.message);
      } else {
        const { error } = await supabase.from('pengawas').insert([data]);
        if (error) alert('❌ Gagal tambah pengawas: ' + error.message);
      }

      setEditPengawas(null);
      setShowForm(false);
      fetchPengawas();
    };

    useEffect(() => {
      fetchPengawas();
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
            setEditPengawas(null);
            setShowForm(true);
          }}
          addLabel="➕ Tambah Pengawas"
          buttonColor="btn-warning"
        />

        <AddPengawasModal
          show={showForm}
          onClose={() => {
            setShowForm(false);
            setEditPengawas(null);
          }}
          onSubmit={handleSavePengawas}
          pengawas={editPengawas}
        />

        <DataTable
          columns={[
            { key: 'nama_lengkap', label: 'Nama Lengkap' },
            { key: 'nama_panggilan', label: 'Panggilan' },
            {
              key: 'id',
              label: 'Aksi',
              render: (p) => (
                <>
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => {
                      setEditPengawas(p);
                      setShowForm(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    🗑️ Hapus
                  </button>
                </>
              ),
            },
          ]}
          data={pengawasList}
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

  export default PengawasListPage;