import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../../lib/supabaseClient';

import DataTable from '../../../components/DataTable';
import UserCardList from '../components/UserCardList';

import { useMediaQuery } from 'react-responsive';

import {
  FiPlus,
  FiUsers,
  FiRefreshCw,
  FiSearch,
  FiShield,
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
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        background: 'linear-gradient(to bottom, #f7fff9, #fff)',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <div
        className="mb-3 p-3 p-md-4 rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--color-green), #7be0a9)',
          color: 'white',
        }}
      >
        <div className="d-flex gap-3 align-items-center">
          <div
            style={{
              width: isMobile ? 48 : 62,
              height: isMobile ? 48 : 62,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 20 : 26,
            }}
          >
            <FiUsers />
          </div>

          <div className="flex-grow-1">
            <div
              className="fw-bold"
              style={{
                fontSize: isMobile ? '1rem' : '1.6rem',
              }}
            >
              Management User
            </div>

            <div
              style={{
                fontSize: isMobile ? '0.72rem' : '0.9rem',
                opacity: 0.85,
              }}
            >
              Kelola user dan akses sistem SR Agency
            </div>

            {/* 🔥 BUTTON COMPACT DI BAWAH JUDUL */}
            <div className="mt-2 d-flex gap-2 flex-wrap">
              <button
                onClick={() => navigate('/user-create')}
                className="btn btn-light btn-sm d-flex align-items-center gap-1"
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                }}
              >
                <FiPlus size={14} />
                Tambah User
              </button>

              <button
                onClick={fetchUsers}
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                style={{
                  borderRadius: 12,
                }}
              >
                <FiRefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY (COMPACT MOBILE) */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div
            className="card border-0 shadow-sm rounded-4 p-2 p-md-3"
            style={{ background: '#fff' }}
          >
            <div style={{ fontSize: isMobile ? '0.7rem' : '0.82rem', color: '#666' }}>
              Total User
            </div>
            <div
              className="fw-bold"
              style={{
                fontSize: isMobile ? '1.2rem' : '1.6rem',
              }}
            >
              {total}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div
            className="card border-0 shadow-sm rounded-4 p-2 p-md-3"
            style={{ background: '#fff' }}
          >
            <div style={{ fontSize: isMobile ? '0.7rem' : '0.82rem', color: '#666' }}>
              Status
            </div>
            <div
              className="fw-bold"
              style={{
                fontSize: isMobile ? '0.9rem' : '1.1rem',
              }}
            >
              Active
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* TOPBAR */}
        <div className="px-3 py-3 border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <div className="fw-bold">List User</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
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
                    color: '#888',
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
            <div className="p-3 text-muted">Loading...</div>
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
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate(`/user-detail/${u.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]}
              data={userList}
            />
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-sm btn-outline-success"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>

              <div className="small">
                {page} / {totalPages}
              </div>

              <button
                className="btn btn-sm btn-outline-success"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListPage;