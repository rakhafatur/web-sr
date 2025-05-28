import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AddUserModal from '../components/AddUserModal';
import bcrypt from 'bcryptjs';
import DataTable from '../../../components/DataTable';
import UserCardList from '../components/UserCardList';
import { useMediaQuery } from 'react-responsive';
import { FiPlus } from 'react-icons/fi';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

const UserListPage = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchUsers = async () => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (keyword.trim() !== '') {
      query = query.or(`username.ilike.%${keyword}%,nama.ilike.%${keyword}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('❌ Gagal ambil data user:', error);
    } else {
      setUserList(data || []);
      setTotal(count || 0);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('❗ Yakin ingin hapus user ini?');
    if (!confirm) return;

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) alert('❌ Gagal hapus user: ' + error.message);
    else fetchUsers();
  };

  const handleSaveUser = async (data: {
    username: string;
    nama: string;
    password?: string;
  }) => {
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    if (editUser) {
      const { error } = await supabase
        .from('users')
        .update({
          username: data.username,
          nama: data.nama,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        })
        .eq('id', editUser.id);
      if (error) alert('❌ Gagal update user: ' + error.message);
    } else {
      const { error } = await supabase.from('users').insert([
        {
          username: data.username,
          nama: data.nama,
          password: hashedPassword,
        },
      ]);
      if (error) alert('❌ Gagal tambah user: ' + error.message);
    }

    setEditUser(null);
    setShowForm(false);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      className="p-4"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1b0036 0%, #0f001e 100%)',
        color: 'white',
        paddingBottom: isMobile ? '100px' : undefined,
      }}
    >
      {/* Mobile Search Input */}
      {isMobile && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control bg-dark text-light border-secondary"
            placeholder="🔍 Cari user..."
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
          />
        </div>
      )}

      {/* Modal Form */}
      <AddUserModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditUser(null);
        }}
        onSubmit={handleSaveUser}
        user={editUser}
      />

      {/* Main List */}
      {isMobile ? (
        <>
          <UserCardList
            users={userList}
            onEdit={(u) => {
              setEditUser(u);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="text-center mt-4" style={{ fontSize: '0.85rem' }}>
              <button
                className="btn btn-outline-light btn-sm me-2"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ← Prev
              </button>
              <span style={{ color: '#bbb' }}>
                Halaman {page} dari {totalPages}
              </span>
              <button
                className="btn btn-outline-light btn-sm ms-2"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Desktop Search + Add */}
          <div className="d-flex justify-content-between align-items-stretch mb-3 gap-2">
            <button
              className="btn btn-warning fw-bold"
              onClick={() => {
                setEditUser(null);
                setShowForm(true);
              }}
            >
              <FiPlus className="me-2" /> Tambah User
            </button>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              placeholder="🔍 Cari user..."
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
              { key: 'username', label: 'Username' },
              { key: 'nama', label: 'Nama Lengkap' },
              {
                key: 'id',
                label: 'Aksi',
                render: (u: User) => (
                  <>
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => {
                        setEditUser(u);
                        setShowForm(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.id)}
                    >
                      🗑️
                    </button>
                  </>
                ),
              },
            ]}
            data={userList}
          />
        </>
      )}

      {/* Floating Add Button for Mobile */}
      {isMobile && (
        <button
          onClick={() => {
            setEditUser(null);
            setShowForm(true);
          }}
          className="btn btn-warning rounded-circle position-fixed"
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
      )}
    </div>
  );
};

export default UserListPage;