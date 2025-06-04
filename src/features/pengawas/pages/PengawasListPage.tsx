import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AddPengawasModal from '../components/AddPengawasModal';
import DataTable from '../../../components/DataTable';
import PengawasCardList from '../components/PengawasCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
  const [editPengawas, setEditPengawas] = useState<Pengawas | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const limit = isMobile ? 5 : 10;
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
    if (error) console.error('Gagal ambil data pengawas:', error);
    else {
      setPengawasList(data || []);
      setTotal(count || 0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin hapus pengawas ini?')) return;
    const { error } = await supabase.from('pengawas').delete().eq('id', id);
    if (error) alert('Gagal hapus pengawas: ' + error.message);
    else fetchPengawas();
  };

  const handleSavePengawas = async (data: Omit<Pengawas, 'id'>) => {
    if (editPengawas) {
      const { error } = await supabase
        .from('pengawas')
        .update(data)
        .eq('id', editPengawas.id);

      if (error) alert('Gagal update pengawas: ' + error.message);
    } else {
      const { error } = await supabase.from('pengawas').insert([data]);
      if (error) alert('Gagal tambah pengawas: ' + error.message);
    }
    setEditPengawas(null);
    setShowForm(false);
    fetchPengawas();
  };

  useEffect(() => {
    fetchPengawas();
    // eslint-disable-next-line
  }, [page, keyword, isMobile]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      className="p-4"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-dark)',
        paddingBottom: isMobile ? '100px' : undefined,
      }}
    >
      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control bg-white text-dark border border-success"
            placeholder="🔍 Cari pengawas..."
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>
      )}

      <AddPengawasModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditPengawas(null);
        }}
        onSubmit={handleSavePengawas}
        pengawas={editPengawas}
      />

      {isMobile ? (
        <>
          <PengawasCardList
            pengawas={pengawasList}
            onEdit={(p) => {
              setEditPengawas(p);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ← Sebelumnya
              </button>
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setEditPengawas(null);
              setShowForm(true);
            }}
            className="btn btn-success rounded-circle position-fixed"
            style={{
              bottom: '20px',
              right: '20px',
              width: '56px',
              height: '56px',
              fontSize: '24px',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <FiPlus />
          </button>
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-stretch mb-3 gap-2">
            <button
              className="btn btn-success fw-bold"
              onClick={() => {
                setEditPengawas(null);
                setShowForm(true);
              }}
            >
              <FiPlus className="me-2" /> Tambah Pengawas
            </button>
            <input
              type="text"
              className="form-control bg-white text-dark border border-success"
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
                    <button
                      className="btn btn-sm d-flex align-items-center justify-content-center p-0"
                      style={{
                        background: "#fff",
                        border: "1.5px solid #212121",
                        color: "#212121",
                        width: 28,
                        height: 28,
                        transition: "all 0.14s",
                        borderRadius: 6,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#f0f0f0";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff";
                      }}
                      onClick={() => {
                        setEditPengawas(p);
                        setShowForm(true);
                      }}
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      className="btn btn-sm d-flex align-items-center justify-content-center p-0"
                      style={{
                        background: "#fff",
                        border: "1.5px solid #212121",
                        color: "#212121",
                        width: 28,
                        height: 28,
                        transition: "all 0.14s",
                        borderRadius: 6,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#f0f0f0";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff";
                      }}
                      onClick={() => handleDelete(p.id)}
                      title="Hapus"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={pengawasList}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ← Sebelumnya
              </button>
              <button
                className="btn btn-outline-success"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PengawasListPage;