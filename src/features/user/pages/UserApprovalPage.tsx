import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { sanitizeSearchKeyword } from '../../../utils/sanitizeSearch';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import DataTable from '../../../components/DataTable';
import Pagination from '../../../components/Pagination';
import Button from '../../../components/Button';
import ListPageHeader from '../../../components/ListPageHeader';
import { FiCheck, FiUserCheck, FiSearch } from 'react-icons/fi';
import UserApprovalCardList from '../components/UserApprovalCardList';

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

const UserApprovalPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [userList, setUserList] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const [assignModal, setAssignModal] = useState<{ id: string; show: boolean }>({ id: '', show: false });
  const [assignType, setAssignType] = useState<AssignType | null>(null);
  const [assignList, setAssignList] = useState<AssignItem[]>([]);
  const [selectedAssignId, setSelectedAssignId] = useState<string>('');

  const limit = isMobile ? 5 : 10;

  const fetchUsers = async () => {
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
    if (!error) {
      setUserList(data || []);
      setTotal(count || 0);
    }
  };

  const fetchAssignList = async (type: AssignType) => {
    try {
      if (type === 'ladies') {
        const { data, error } = await supabase
          .from('ladies')
          .select('id, nama_ladies, nama_outlet, pin')
          .order('nama_ladies', { ascending: true });

        if (error) throw error;
        setAssignList(data || []);

      } else if (type === 'pengawas') {
        const { data, error } = await supabase
          .from('pengawas')
          .select('id, nama_panggilan')
          .order('nama_panggilan', { ascending: true });

        if (error) throw error;
        setAssignList(data || []);

      } else if (type === 'agent') {
        const { data, error } = await supabase
          .from('agent')
          .select('id, nama_agent')
          .order('nama_agent', { ascending: true });

        if (error) throw error;
        setAssignList(data || []);
      }
    } catch (err) {
      console.error('❌ Error fetchAssignList:', err);
      setAssignList([]);
    }
  };

  const handleApproveClick = (userId: string) => {
    setAssignModal({ id: userId, show: true });
    setAssignType(null);
    setAssignList([]);
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
    } else {
      toast.success('User berhasil di-assign & diaktifkan!');
      fetchUsers();
      setAssignModal({ id: '', show: false });
      setAssignList([]);
      setAssignType(null);
      setSelectedAssignId('');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]);

  useEffect(() => {
    if (assignType) {
      fetchAssignList(assignType);
    } else {
      setAssignList([]);
    }
  }, [assignType]);

  const totalPages = Math.ceil(total / limit);

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
        {/* TOPBAR */}
        <div className="px-3 py-3 border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <div className="fw-bold">Menunggu Persetujuan</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
                Data user belum aktif
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
                  placeholder="Cari user..."
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
              placeholder="Cari user..."
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
          {isMobile ? (
            <UserApprovalCardList users={userList} onApprove={handleApproveClick} />
          ) : (
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
          )}

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
                          {assignType === 'ladies'
                            ? `${item.nama_ladies} - ${item.nama_outlet} - ${item.pin}`
                            : assignType === 'pengawas'
                            ? `${item.nama_panggilan}`
                            : `${item.nama_agent}`}
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
