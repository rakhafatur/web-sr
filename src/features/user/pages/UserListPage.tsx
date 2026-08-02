import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../../lib/supabaseClient';

import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
import UserCardList from '../components/UserCardList';

import { useMediaQuery } from 'react-responsive';

import {
  FiPlus,
  FiUsers,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLoader,
} from 'react-icons/fi';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

const UserListPage = () => {
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const limit = isMobile ? 5 : 10;

  const fetchUsers = async () => {
    setLoading(true);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(from, to);

    if (keyword.trim()) {
      query = query.or(
        `username.ilike.%${keyword}%,nama.ilike.%${keyword}%`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setUserList(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword, isMobile]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Yakin ingin hapus user?');
    if (!confirmDelete) return;

    await supabase.from('users').delete().eq('id', id);
    fetchUsers();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page-shell py-4 px-3 px-md-4">
      <ListPageHeader
        icon={<FiUsers />}
        title="Management User"
        description="Kelola user dan akses sistem SR Agency"
        actions={
          <HeaderActionButton
            icon={<FiPlus />}
            onClick={() => navigate('/user-create')}
            fullWidth={isMobile}
          >
            Tambah User
          </HeaderActionButton>
        }
      />

      {/* CONTENT */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* TOPBAR */}
        <div className="px-3 py-3 border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <div className="fw-bold">List User</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
                Data user aktif
              </div>
            </div>

            {!isMobile && (
              <div style={{ width: 300, position: 'relative' }}>
                <FiSearch
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    color: 'var(--color-gray-500)',
                  }}
                />
                <input
                  className="form-control form-control-sm"
                  style={{ paddingLeft: 35, borderRadius: 10 }}
                  placeholder="Search user..."
                  value={keyword}
                  onChange={(e) => {
                    setPage(1);
                    setKeyword(e.target.value);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        {isMobile && (
          <div className="p-2 border-bottom">
            <input
              className="form-control form-control-sm"
              placeholder="Search user..."
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
            />
          </div>
        )}

        {/* BODY */}
        <div className="p-2 p-md-3">
          {loading ? (
            <div
              className="d-flex justify-content-center p-3"
              role="status"
              aria-label="Loading"
            >
              <FiLoader size={20} className="spinner-icon" />
            </div>
          ) : isMobile ? (
            <UserCardList
              users={userList}
              onEdit={(u) => navigate(`/user-detail/${u.id}`)}
              onDelete={handleDelete}
            />
          ) : (
            <DataTable
              columns={[
                { key: 'username', label: 'Username' },
                { key: 'nama', label: 'Nama' },
                {
                  key: 'id',
                  label: 'Aksi',
                  render: (u: User) => (
                    <div className="d-flex gap-2">
                      <ActionIconButton
                        icon={<FiEdit2 size={16} />}
                        variant="warning"
                        title="Edit"
                        onClick={() => navigate(`/user-detail/${u.id}`)}
                      />
                      <ActionIconButton
                        icon={<FiTrash2 size={16} />}
                        variant="danger"
                        title="Hapus"
                        onClick={() => handleDelete(u.id)}
                      />
                    </div>
                  ),
                },
              ]}
              data={userList}
            />
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListPage;