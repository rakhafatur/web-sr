import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AddUserModal from '../components/AddUserModal';
import bcrypt from 'bcryptjs';
import DataTable from '../../../components/DataTable';
import ListToolbar from '../../../components/ListToolBar';
import UserCardList from '../components/UserCardList';
import { useMediaQuery } from 'react-responsive';

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
      }}
    >
      <ListToolbar
        keyword={keyword}
        onKeywordChange={(val) => {
          setPage(1);
          setKeyword(val);
        }}
        onAddClick={() => {
          setEditUser(null);
          setShowForm(true);
        }}
        addLabel="➕ Tambah User"
        buttonColor="btn-warning"
      />

      <AddUserModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditUser(null);
        }}
        onSubmit={handleSaveUser}
        user={editUser}
      />

      {isMobile ? (
        <UserCardList
          users={userList}
          onEdit={(u) => {
            setEditUser(u);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      ) : (
        <DataTable
          columns={[
            { key: 'username', label: 'Username' },
            { key: 'nama', label: 'Nama Lengkap' },
            {
              key: 'id',
              label: 'Aksi',
              render: (u) => (
                <>
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => {
                      setEditUser(u);
                      setShowForm(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    🗑️ Hapus
                  </button>
                </>
              ),
            },
          ]}
          data={userList}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-light"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          ← Prev
        </button>
        <span>Halaman {page} dari {totalPages}</span>
        <button
          className="btn btn-outline-light"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default UserListPage;