import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../../lib/supabaseClient';

import DataTable from '../../../components/DataTable';
import UserCardList from '../components/UserCardList';

import { useMediaQuery } from 'react-responsive';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
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

  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [userList, setUserList] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] = useState(1);

  const limit = isMobile ? 5 : 10;

  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] =
    useState('');

  const fetchUsers = async () => {
    setLoading(true);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', {
        count: 'exact',
      })
      .eq('is_active', true)
      .range(from, to);

    if (keyword.trim() !== '') {
      query = query.or(
        `username.ilike.%${keyword}%,nama.ilike.%${keyword}%`
      );
    }

    const { data, count, error } =
      await query;

    if (error) {
      console.error(
        '❌ Gagal ambil data user:',
        error
      );
    } else {
      setUserList(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    // eslint-disable-next-line
  }, [page, keyword, isMobile]);

  const handleDelete = async (
    id: string
  ) => {
    const confirm = window.confirm(
      '❗ Yakin ingin hapus user ini?'
    );

    if (!confirm) return;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      alert(
        '❌ Gagal hapus user: ' +
          error.message
      );
    } else {
      fetchUsers();
    }
  };

  const totalPages = Math.ceil(
    total / limit
  );

  return (
    <div
      className="container-fluid py-4 px-md-4 px-3"
      style={{
        background:
          'linear-gradient(to bottom, #f7fff9 0%, #ffffff 100%)',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--color-green), #7be0a9)',
          color: 'white',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -50,
            top: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background:
              'rgba(255,255,255,0.08)',
          }}
        />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 position-relative">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: isMobile
                  ? 56
                  : 68,
                height: isMobile
                  ? 56
                  : 68,
                borderRadius: 22,
                background:
                  'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                fontSize: isMobile
                  ? 24
                  : 30,
                backdropFilter:
                  'blur(10px)',
                flexShrink: 0,
              }}
            >
              <FiUsers />
            </div>

            <div>
              <h2
                className="fw-bold mb-1"
                style={{
                  fontSize: isMobile
                    ? '1.08rem'
                    : '1.9rem',
                }}
              >
                Management User
              </h2>

              <div
                style={{
                  opacity: 0.82,
                  fontSize: isMobile
                    ? '0.74rem'
                    : '0.92rem',
                }}
              >
                Kelola user dan akses
                sistem SR Agency
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={fetchUsers}
                className="btn btn-light fw-semibold d-flex align-items-center gap-2"
                style={{
                  borderRadius: 14,
                  color:
                    'var(--color-green)',
                }}
              >
                <FiRefreshCw />
                Refresh
              </button>

              <button
                className="btn btn-success fw-bold d-flex align-items-center gap-2"
                style={{
                  borderRadius: 14,
                  background:
                    'rgba(255,255,255,0.18)',
                  border:
                    '1px solid rgba(255,255,255,0.3)',
                }}
                onClick={() =>
                  navigate(
                    '/user-create'
                  )
                }
              >
                <FiPlus />
                Tambah User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              overflow: 'hidden',
            }}
          >
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div
                    style={{
                      fontSize:
                        '0.82rem',
                      color: '#666',
                    }}
                  >
                    Total User Aktif
                  </div>

                  <div
                    className="fw-bold mt-1"
                    style={{
                      fontSize:
                        '1.8rem',
                      color:
                        'var(--color-dark)',
                    }}
                  >
                    {total}
                  </div>
                </div>

                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background:
                      '#effff4',
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    color:
                      'var(--color-green)',
                    fontSize: 24,
                  }}
                >
                  <FiUsers />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              overflow: 'hidden',
            }}
          >
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div
                    style={{
                      fontSize:
                        '0.82rem',
                      color: '#666',
                    }}
                  >
                    Status Sistem
                  </div>

                  <div
                    className="fw-bold mt-1"
                    style={{
                      fontSize:
                        '1.1rem',
                      color:
                        'var(--color-dark)',
                    }}
                  >
                    Semua User Aktif
                  </div>
                </div>

                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background:
                      '#effff4',
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    color:
                      'var(--color-green)',
                    fontSize: 24,
                  }}
                >
                  <FiShield />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="card border-0 shadow-sm rounded-4"
        style={{
          overflow: 'hidden',
        }}
      >
        {/* TOPBAR */}
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background:
              'linear-gradient(to right, #fafafa, #ffffff)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div
                className="fw-bold"
                style={{
                  color:
                    'var(--color-dark)',
                }}
              >
                List User
              </div>

              <div
                style={{
                  fontSize: '0.84rem',
                  color: '#666',
                }}
              >
                Data seluruh user aktif
                dalam sistem
              </div>
            </div>

            {!isMobile && (
              <div
                style={{
                  width: 320,
                  position: 'relative',
                }}
              >
                <FiSearch
                  size={18}
                  style={{
                    position:
                      'absolute',
                    top: '50%',
                    left: 16,
                    transform:
                      'translateY(-50%)',
                    color: '#888',
                  }}
                />

                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Cari username / nama..."
                  value={keyword}
                  onChange={(e) => {
                    setPage(1);
                    setKeyword(
                      e.target.value
                    );
                  }}
                  style={{
                    height: 48,
                    borderRadius: 14,
                    paddingLeft: 42,
                    border:
                      '2px solid rgba(25,153,71,0.12)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        {isMobile && (
          <div className="p-3 border-bottom">
            <div
              style={{
                position: 'relative',
              }}
            >
              <FiSearch
                size={18}
                style={{
                  position:
                    'absolute',
                  top: '50%',
                  left: 16,
                  transform:
                    'translateY(-50%)',
                  color: '#888',
                }}
              />

              <input
                type="text"
                className="form-control shadow-none"
                placeholder="Cari user..."
                value={keyword}
                onChange={(e) => {
                  setPage(1);
                  setKeyword(
                    e.target.value
                  );
                }}
                style={{
                  height: 50,
                  borderRadius: 14,
                  paddingLeft: 42,
                  border:
                    '2px solid rgba(25,153,71,0.12)',
                }}
              />
            </div>
          </div>
        )}

        {/* BODY */}
        <div className="p-2 p-md-3">
          {loading ? (
            <div
              className="d-flex align-items-center gap-3 p-4"
              style={{
                color: '#666',
              }}
            >
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />

              <span>
                Mengambil data user...
              </span>
            </div>
          ) : (
            <>
              {isMobile ? (
                <UserCardList
                  users={userList}
                  onEdit={(u) =>
                    navigate(
                      `/user-detail/${u.id}`
                    )
                  }
                  onDelete={
                    handleDelete
                  }
                />
              ) : (
                <DataTable
                  columns={[
                    {
                      key: 'username',
                      label:
                        'Username',
                    },
                    {
                      key: 'nama',
                      label:
                        'Nama Lengkap',
                    },
                    {
                      key: 'id',
                      label: 'Aksi',
                      render: (
                        u: User
                      ) => (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center"
                            style={{
                              width: 34,
                              height: 34,
                              padding: 0,
                              borderRadius: 10,
                            }}
                            onClick={() =>
                              navigate(
                                `/user-detail/${u.id}`
                              )
                            }
                          >
                            <FiEdit2
                              size={
                                15
                              }
                            />
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                            style={{
                              width: 34,
                              height: 34,
                              padding: 0,
                              borderRadius: 10,
                            }}
                            onClick={() =>
                              handleDelete(
                                u.id
                              )
                            }
                          >
                            <FiTrash2
                              size={
                                15
                              }
                            />
                          </button>
                        </div>
                      ),
                    },
                  ]}
                  data={userList}
                />
              )}

              {/* EMPTY */}
              {!loading &&
                userList.length ===
                  0 && (
                  <div
                    className="p-5 text-center"
                    style={{
                      color: '#666',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 46,
                      }}
                    >
                      👤
                    </div>

                    <div className="fw-bold mt-3">
                      User tidak
                      ditemukan
                    </div>

                    <div
                      style={{
                        fontSize:
                          '0.9rem',
                        marginTop: 4,
                      }}
                    >
                      Coba gunakan
                      keyword lain.
                    </div>
                  </div>
                )}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 px-2">
                  <button
                    className="btn btn-outline-success"
                    onClick={() =>
                      setPage(page - 1)
                    }
                    disabled={
                      page <= 1
                    }
                    style={{
                      borderRadius: 12,
                    }}
                  >
                    ← Sebelumnya
                  </button>

                  <div
                    className="fw-semibold"
                    style={{
                      fontSize:
                        '0.88rem',
                      color: '#666',
                    }}
                  >
                    Halaman {page}{' '}
                    dari {totalPages}
                  </div>

                  <button
                    className="btn btn-outline-success"
                    onClick={() =>
                      setPage(page + 1)
                    }
                    disabled={
                      page >=
                      totalPages
                    }
                    style={{
                      borderRadius: 12,
                    }}
                  >
                    Selanjutnya →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListPage;