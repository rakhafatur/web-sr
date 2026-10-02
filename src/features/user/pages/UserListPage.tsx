import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import { sanitizeSearchKeyword } from '../../../utils/sanitizeSearch';

import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
import ListPageToolbar from '../../../components/ListPageToolbar';
import ListLoadingState from '../../../components/ListLoadingState';
import PullToRefresh from '../../../components/PullToRefresh';
import MobilePageBar from '../../../components/MobilePageBar';
import SwipeToDelete from '../../../components/SwipeToDelete';
import '../../../styles/mobile-admin.css';

import { useMediaQuery } from 'react-responsive';

import {
  FiPlus,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiChevronRight,
  FiUserCheck,
} from 'react-icons/fi';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

const UserListPage = () => {
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const limit = isMobile ? 5 : 10;
  const queryClient = useQueryClient();
  const queryKey = ['user-list', page, limit, keyword];

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('users')
        .select('id, username, nama', { count: 'exact' })
        .eq('is_active', true)
        .range(from, to);

      const safeKeyword = sanitizeSearchKeyword(keyword.trim());

      if (safeKeyword) {
        query = query.or(
          `username.ilike.%${safeKeyword}%,nama.ilike.%${safeKeyword}%`
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return { list: (data as User[]) || [], total: count || 0 };
    },
    meta: { errorLabel: 'data user' },
  });

  const userList = data?.list ?? [];
  const total = data?.total ?? 0;

  /** Optimistic delete — baris langsung hilang dari list, dikembalikan lagi
      kalau ternyata gagal di server. */
  const handleDelete = async (id: string) => {
    const confirmDelete = await confirmDialog('Yakin ingin hapus user?');
    if (!confirmDelete) return;

    await queryClient.cancelQueries({ queryKey });

    const previous = queryClient.getQueryData<{ list: User[]; total: number }>(queryKey);

    queryClient.setQueryData<{ list: User[]; total: number }>(queryKey, (old) =>
      old
        ? { list: old.list.filter((u) => u.id !== id), total: Math.max(0, old.total - 1) }
        : old
    );

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      queryClient.setQueryData(queryKey, previous);
      toast.error('Gagal menghapus data. Coba lagi.');
    } else {
      queryClient.invalidateQueries({ queryKey: ['user-list'] });
    }
  };

  const totalPages = Math.ceil(total / limit);

  // Jumlah user yang menunggu persetujuan — untuk pengingat di mobile.
  // Kunci diawali 'user-approval' supaya ikut disegarkan saat ada yang
  // di-approve (UserApprovalPage meng-invalidate awalan itu).
  const { data: jumlahMenunggu = 0 } = useQuery({
    queryKey: ['user-approval', 'jumlah'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isMobile,
    meta: { errorLabel: 'jumlah user menunggu persetujuan' },
  });

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout). Desktop: tampilan lama di bawah.
  if (isMobile) {
    return (
      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <div className="tm-page">
          <MobilePageBar
            title="Users"
            backTo="/"
            action={{ icon: <FiPlus />, label: 'Tambah user', onClick: () => navigate('/user-create') }}
          />

          <div className="tm-stack">
            {jumlahMenunggu > 0 && (
              <button type="button" className="tm-banner" onClick={() => navigate('/user-approval')}>
                <span className="tm-banner-icon" aria-hidden><FiUserCheck /></span>
                <span className="tm-banner-text">
                  {jumlahMenunggu} user menunggu persetujuan
                </span>
                <FiChevronRight className="tm-chevron" aria-hidden />
              </button>
            )}

            <div className="tm-search">
              <FiSearch aria-hidden />
              <input
                type="search"
                placeholder="Cari username atau nama..."
                aria-label="Cari user"
                value={keyword}
                onChange={(e) => {
                  setPage(1);
                  setKeyword(e.target.value);
                }}
              />
            </div>

            {loading ? (
              <ListLoadingState label="Memuat data user" />
            ) : userList.length === 0 ? (
              <div className="tm-group">
                <div className="tm-empty">
                  <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                  <div className="tm-empty-title">{keyword ? 'User tidak ditemukan' : 'Belum ada user aktif'}</div>
                  <div className="tm-empty-text">
                    {keyword ? 'Coba kata kunci lain.' : 'Ketuk tombol + di kanan atas untuk menambah user.'}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="tm-group tm-list">
                  {userList.map((u) => (
                    <SwipeToDelete key={u.id} onDelete={() => handleDelete(u.id)} borderRadius={0}>
                      <button
                        type="button"
                        className="tm-row tm-row-btn"
                        onClick={() => navigate(`/user-detail/${u.id}`)}
                      >
                        <span className="tm-avatar" aria-hidden>
                          {(u.nama || u.username || '?').charAt(0).toUpperCase()}
                        </span>
                        <div className="tm-row-main">
                          <div className="tm-row-title">{u.nama || u.username}</div>
                          <div className="tm-row-sub">@{u.username}</div>
                        </div>
                        <FiChevronRight className="tm-chevron" aria-hidden />
                      </button>
                    </SwipeToDelete>
                  ))}
                </div>
                <div className="tm-hint">Ketuk untuk detail · geser ke kiri untuk menghapus</div>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
            )}
          </div>
        </div>
      </PullToRefresh>
    );
  }

  return (
    <PullToRefresh onRefresh={async () => { await refetch(); }}>
    <div className="page-shell py-4 px-3 px-md-4">
      <ListPageHeader
        icon={<FiUsers />}
        title="Management User"
        description="Kelola user dan akses sistem SR Agency"
        actions={
          <HeaderActionButton
            icon={<FiPlus />}
            onClick={() => navigate('/user-create')}
          >
            Tambah User
          </HeaderActionButton>
        }
      />

      {/* CONTENT */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <ListPageToolbar
          title="List User"
          subtitle="Data user aktif"
          placeholder="Search user..."
          keyword={keyword}
          onKeywordChange={(value) => {
            setPage(1);
            setKeyword(value);
          }}
        />

        {/* BODY */}
        <div className="p-2 p-md-3">
          {loading ? (
            <ListLoadingState label="Memuat data user" />
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
    </PullToRefresh>
  );
};

export default UserListPage;