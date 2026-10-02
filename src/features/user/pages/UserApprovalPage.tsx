import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { sanitizeSearchKeyword } from '../../../utils/sanitizeSearch';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import Button from '../../../components/Button';
import ListPageHeader from '../../../components/ListPageHeader';
import ListPageToolbar from '../../../components/ListPageToolbar';
import { FiCheck, FiUserCheck, FiSearch } from 'react-icons/fi';
import MobilePageBar from '../../../components/MobilePageBar';
import ModalWrapper from '../../../components/ModalWrapper';
import SearchableSelect from '../../../components/SearchableSelect';
import ListLoadingState from '../../../components/ListLoadingState';
import '../../../styles/mobile-admin.css';

type User = {
  id: string;
  username: string;
  nama: string | null;
};

type AssignItem = {
  id: string;
  nama_ladies?: string;
  nama_panggilan?: string;
  nama_outlet?: string;
  pin?: string;
  nama_agent?: string;
};

type AssignType = 'ladies' | 'pengawas' | 'agent';

/** Sumber daftar yang bisa di-assign, per tipe. */
const ASSIGN_SOURCE: Record<AssignType, { table: string; columns: string; orderBy: string }> = {
  ladies: { table: 'ladies', columns: 'id, nama_ladies, nama_outlet, pin', orderBy: 'nama_ladies' },
  pengawas: { table: 'pengawas', columns: 'id, nama_panggilan', orderBy: 'nama_panggilan' },
  agent: { table: 'agent', columns: 'id, nama_agent', orderBy: 'nama_agent' },
};

const UserApprovalPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const [assignModal, setAssignModal] = useState<{ id: string; show: boolean }>({ id: '', show: false });
  const [assignType, setAssignType] = useState<AssignType | null>(null);
  const [selectedAssignId, setSelectedAssignId] = useState<string>('');

  const limit = isMobile ? 5 : 10;

  const { data: userData, isLoading: loading } = useQuery({
    queryKey: ['user-approval', page, limit, keyword],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('users')
        .select('id, username, nama', { count: 'exact' })
        .eq('is_active', false)
        .range(from, to);

      const safeKeyword = sanitizeSearchKeyword(keyword.trim());

      if (safeKeyword !== '') {
        query = query.or(`username.ilike.%${safeKeyword}%,nama.ilike.%${safeKeyword}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      return { list: (data ?? []) as User[], total: count ?? 0 };
    },
    meta: { errorLabel: 'user menunggu persetujuan' },
  });

  const userList = userData?.list ?? [];
  const total = userData?.total ?? 0;

  const { data: assignList = [] } = useQuery({
    queryKey: ['assign-options', assignType],
    queryFn: async () => {
      const source = ASSIGN_SOURCE[assignType as AssignType];

      const { data, error } = await supabase
        .from(source.table)
        .select(source.columns)
        .order(source.orderBy, { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as AssignItem[];
    },
    enabled: !!assignType,
    meta: { errorLabel: 'daftar penugasan' },
  });

  const handleApproveClick = (userId: string) => {
    setAssignModal({ id: userId, show: true });
    setAssignType(null);
    setSelectedAssignId('');
  };

  const handleAssign = async () => {
    if (!assignType || !selectedAssignId) return;

    const { error } = await supabase
      .from('users')
      .update({
        [`${assignType}_id`]: selectedAssignId,
        is_active: true,
      })
      .eq('id', assignModal.id);

    if (error) {
      toast.error('Gagal assign: ' + error.message);
      return;
    }

    toast.success('User berhasil di-assign & diaktifkan!');

    // User yang baru diaktifkan hilang dari daftar "menunggu persetujuan",
    // dan muncul di halaman Management User — segarkan keduanya.
    queryClient.invalidateQueries({ queryKey: ['user-approval'] });
    queryClient.invalidateQueries({ queryKey: ['user-list'] });

    setAssignModal({ id: '', show: false });
    setAssignType(null);
    setSelectedAssignId('');
  };

  const totalPages = Math.ceil(total / limit);

  const labelAssign = (item: AssignItem) =>
    assignType === 'ladies'
      ? `${item.nama_ladies} - ${item.nama_outlet} - ${item.pin}`
      : assignType === 'pengawas'
      ? `${item.nama_panggilan}`
      : `${item.nama_agent}`;

  const tutupAssign = () => setAssignModal({ id: '', show: false });

  // Mobile: tampilan baru (Header app dicabut di MainLayout) — daftar dengan
  // tombol Setujui, dan penugasan lewat bottom sheet (chip peran + pemilih
  // bercari) menggantikan modal Bootstrap berisi dua <select>. Desktop: lama.
  if (isMobile) {
    const userDipilih = userList.find((u) => u.id === assignModal.id);
    const PERAN: { value: AssignType; label: string }[] = [
      { value: 'ladies', label: 'Ladies' },
      { value: 'pengawas', label: 'Pengawas' },
      { value: 'agent', label: 'Agent' },
    ];
    const labelPeran = PERAN.find((r) => r.value === assignType)?.label ?? '';

    return (
      <div className="tm-page">
        <MobilePageBar title="Persetujuan User" backTo="/users" />

        <div className="tm-stack">
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
            <ListLoadingState label="Memuat user menunggu persetujuan" />
          ) : userList.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUserCheck /></span>
                <div className="tm-empty-title">
                  {keyword ? 'User tidak ditemukan' : 'Tidak ada yang menunggu'}
                </div>
                <div className="tm-empty-text">
                  {keyword
                    ? 'Coba kata kunci lain.'
                    : 'Semua pendaftar sudah disetujui. User baru akan muncul di sini setelah mendaftar.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="tm-group tm-list">
              {userList.map((u) => (
                <div key={u.id}>
                  <div className="tm-row">
                    <span className="tm-avatar" aria-hidden>
                      {(u.nama || u.username || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="tm-row-main">
                      <div className="tm-row-title">{u.nama || u.username}</div>
                      <div className="tm-row-sub">@{u.username}</div>
                    </div>
                    <button type="button" className="tm-btn-sm" onClick={() => handleApproveClick(u.id)}>
                      <FiCheck aria-hidden />
                      Setujui
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>

        <ModalWrapper
          show={assignModal.show}
          title={<div className="fw-bold">Setujui {userDipilih?.nama || userDipilih?.username || 'user'}</div>}
          onClose={tutupAssign}
          footer={
            <div className="tm-sheet-footer">
              <button type="button" className="tm-btn" onClick={tutupAssign}>Batal</button>
              <button
                type="button"
                className="tm-btn tm-btn--primary"
                onClick={handleAssign}
                disabled={!selectedAssignId}
              >
                Aktifkan
              </button>
            </div>
          }
        >
          <div className="tm-sheet-form">
            <div className="tm-field">
              <span className="tm-label" id="assign-peran-label">Jadikan sebagai</span>
              <div className="tm-chips" role="radiogroup" aria-labelledby="assign-peran-label">
                {PERAN.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={assignType === r.value}
                    className={`tm-chip ${assignType === r.value ? 'is-active' : ''}`}
                    onClick={() => {
                      setAssignType(r.value);
                      setSelectedAssignId('');
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {assignType && (
              <div className="tm-field">
                <span className="tm-label">Pilih {labelPeran.toLowerCase()}</span>
                <SearchableSelect
                  value={selectedAssignId}
                  onChange={setSelectedAssignId}
                  options={assignList.map((item) => ({ value: item.id, label: labelAssign(item) }))}
                  placeholder={`Pilih ${labelPeran.toLowerCase()}`}
                  searchPlaceholder={`Cari ${labelPeran.toLowerCase()}...`}
                  height={52}
                  borderRadius={16}
                  fontSize="1rem"
                />
                <div className="tm-help">
                  Setelah diaktifkan, user bisa login sebagai {labelPeran.toLowerCase()} ini.
                </div>
              </div>
            )}
          </div>
        </ModalWrapper>
      </div>
    );
  }

  return (
    <div
      className="page-shell p-4"
      style={{
        color: 'var(--color-dark)',
      }}
    >
      <ListPageHeader
        icon={<FiUserCheck />}
        title="Persetujuan User"
        description="Aktifkan & assign user baru sebelum bisa login"
      />

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <ListPageToolbar
          title="Menunggu Persetujuan"
          subtitle="Data user belum aktif"
          placeholder="Cari user..."
          keyword={keyword}
          onKeywordChange={(value) => {
            setPage(1);
            setKeyword(value);
          }}
        />

        {/* BODY */}
        <div className="p-2 p-md-3">
            <DataTable
              columns={[
                { key: 'username', label: 'Username' },
                { key: 'nama', label: 'Nama Lengkap' },
                {
                  key: 'id',
                  label: 'Aksi',
                  render: (u: User) => (
                    <button
                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                      onClick={() => handleApproveClick(u.id)}
                    >
                      <FiCheck /> Approve
                    </button>
                  ),
                },
              ]}
              data={userList}
            />

          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>
      </div>

      {assignModal.show && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAssignModal({ id: '', show: false })}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tipe</label>
                  <select
                    className="form-select"
                    value={assignType || ''}
                    onChange={(e) => {
                      const tipe = e.target.value as AssignType;
                      setAssignType(tipe);
                      setSelectedAssignId('');
                    }}
                  >
                    <option value="">-- Pilih Tipe --</option>
                    <option value="ladies">Ladies</option>
                    <option value="pengawas">Pengawas</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>

                {assignType && (
                  <div className="mb-3">
                    <label className="form-label">Pilih {assignType}</label>
                    <select
                      className="form-select"
                      value={selectedAssignId}
                      onChange={(e) => setSelectedAssignId(e.target.value)}
                    >
                      <option value="">-- Pilih {assignType} --</option>
                      {assignList.map((item) => (
                        <option key={item.id} value={item.id}>
                          {labelAssign(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setAssignModal({ id: '', show: false })}>
                  Batal
                </Button>
                <Button variant="primary" disabled={!selectedAssignId} onClick={handleAssign}>
                  Aktifkan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApprovalPage;
