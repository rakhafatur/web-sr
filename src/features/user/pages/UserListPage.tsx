import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import { sanitizeSearchKeyword } from '../../../utils/sanitizeSearch';

import Pagination from '../../../components/Pagination';
import ListLoadingState from '../../../components/ListLoadingState';
import PullToRefresh from '../../../components/PullToRefresh';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import '../../../styles/desktop-admin.css';
import SwipeToDelete from '../../../components/SwipeToDelete';
import '../../../styles/mobile-admin.css';

import { useMediaQuery } from 'react-responsive';

import {
  FiPlus,
  FiUsers,
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

  // Jumlah user yang menunggu persetujuan — untuk pengingat (mobile & desktop).
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
    meta: { errorLabel: 'jumlah user menunggu persetujuan' },
  });

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout). Desktop: gaya baru dk- (uji coba) di bawah.
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

  // Desktop (uji coba gaya baru): header polos, satu kartu dengan cari &
  // tabel beravatar; seluruh baris bisa diklik untuk membuka detail.
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Users"
        description="Kelola akun dan akses sistem SR Agency"
        actions={
          <>
            {jumlahMenunggu > 0 && (
              <button type="button" className="dk-btn dk-btn--warn" onClick={() => navigate('/user-approval')}>
                <FiUserCheck aria-hidden />
                {jumlahMenunggu} menunggu persetujuan
                <FiChevronRight aria-hidden />
              </button>
            )}
            <button type="button" className="dk-btn dk-btn--primary" onClick={() => navigate('/user-create')}>
              <FiPlus aria-hidden />
              Tambah user
            </button>
          </>
        }
      />

      <section className="dk-card" aria-label="Daftar user">
        <div className="dk-toolbar">
          <div className="dk-search">
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
          {!loading && <span className="dk-count">{total} user aktif</span>}
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <ListLoadingState label="Memuat data user" />
          </div>
        ) : userList.length === 0 ? (
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiUsers /></span>
            <div className="dk-empty-title">{keyword ? 'User tidak ditemukan' : 'Belum ada user aktif'}</div>
            <div className="dk-empty-text">
              {keyword ? 'Coba kata kunci lain.' : 'Klik "Tambah user" untuk menambah user pertama.'}
            </div>
          </div>
        ) : (
          <table className="dk-table">
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Username</th>
                <th scope="col" className="dk-col-actions">
                  <span className="visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr
                  key={u.id}
                  className="is-clickable"
                  onClick={() => navigate(`/user-detail/${u.id}`)}
                >
                  <td>
                    <div className="dk-person">
                      <span className="dk-avatar" aria-hidden>
                        {(u.nama || u.username || '?').charAt(0).toUpperCase()}
                      </span>
                      {/* Tombol supaya baris juga bisa dibuka lewat keyboard. */}
                      <button
                        type="button"
                        className="dk-person-name"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user-detail/${u.id}`);
                        }}
                      >
                        {u.nama || u.username}
                      </button>
                    </div>
                  </td>
                  <td className="dk-person-sub">@{u.username}</td>
                  <td className="dk-col-actions">
                    <button
                      type="button"
                      className="dk-icon-btn dk-icon-btn--danger"
                      title="Hapus"
                      aria-label={`Hapus ${u.nama || u.username}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(u.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                    {/* Penanda baris bisa diklik (bukan tombol) — ubah dilakukan di detail. */}
                    <FiChevronRight className="dk-row-chevron" aria-hidden />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="dk-footer">
          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>
      </section>
    </div>
  );
};

export default UserListPage;