import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
} from 'react-icons/fi';

import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib, validasiAngka } from '../../../utils/validasiForm';
import { useEntityList } from '../../../hooks/useEntityList';
import { confirmDialog } from '../../../components/ConfirmDialog';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
import ListPageToolbar from '../../../components/ListPageToolbar';
import ActionIconButton from '../../../components/ActionIconButton';
import ModalWrapper from '../../../components/ModalWrapper';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import Pagination from '../../../components/Pagination';
import EmptyState from '../../../components/EmptyState';

type Outlet = {
  id: string;
  nama_outlet: string;
  is_active: boolean;
};

type OutletTier = {
  id: string;
  outlet_id: string;
  tier_name: string | null;
  harga_ladies: number;
  untung: number;
  is_active: boolean;
};

const rowsPerPage = 10;

const OutletListPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const queryClient = useQueryClient();

  const {
    list: outlets,
    page,
    setPage,
    totalPages,
    keyword,
    setKeyword,
    loading,
    remove,
    save,
  } = useEntityList<Outlet>(
    'outlets',
    ['nama_outlet'],
    rowsPerPage,
    'id, nama_outlet, is_active'
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [outletModal, setOutletModal] = useState<{ show: boolean; editId: string | null }>({
    show: false,
    editId: null,
  });
  const [outletForm, setOutletForm] = useState({ nama_outlet: '', is_active: true });

  const [tierModal, setTierModal] = useState<{
    show: boolean;
    outletId: string | null;
    editId: string | null;
  }>({ show: false, outletId: null, editId: null });
  const [tierForm, setTierForm] = useState({
    tier_name: '',
    harga_ladies: '',
    untung: '',
    is_active: true,
  });

  const tiersQuery = useQuery({
    queryKey: ['outlet-pricing-admin', expandedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outlet_pricing')
        .select('*')
        .eq('outlet_id', expandedId as string)
        .order('created_at');

      if (error) throw error;
      return (data ?? []) as OutletTier[];
    },
    enabled: !!expandedId,
    meta: { errorLabel: 'tier harga outlet' },
  });

  const invalidateTiers = (outletId: string) =>
    queryClient.invalidateQueries({ queryKey: ['outlet-pricing-admin', outletId] });

  // ===== Outlet modal =====
  const openAddOutlet = () => {
    setOutletForm({ nama_outlet: '', is_active: true });
    setOutletModal({ show: true, editId: null });
  };

  const openEditOutlet = (o: Outlet) => {
    setOutletForm({ nama_outlet: o.nama_outlet, is_active: o.is_active });
    setOutletModal({ show: true, editId: o.id });
  };

  const handleSaveOutlet = async () => {
    const errorValidasi = validasiWajib([
      { label: 'Nama outlet', value: outletForm.nama_outlet },
    ]);

    if (errorValidasi) {
      toast.error(errorValidasi);
      return;
    }

    const ok = await save(
      { nama_outlet: outletForm.nama_outlet.trim(), is_active: outletForm.is_active },
      outletModal.editId
    );

    if (ok) {
      toast.success(outletModal.editId ? 'Outlet diperbarui.' : 'Outlet ditambahkan.');
      setOutletModal({ show: false, editId: null });
    }
  };

  const handleDeleteOutlet = (o: Outlet) =>
    remove(
      o.id,
      `❗ Hapus outlet "${o.nama_outlet}"? Tier harganya juga akan ikut terhapus.`
    );

  // ===== Tier modal =====
  const openAddTier = (outletId: string) => {
    setTierForm({ tier_name: '', harga_ladies: '', untung: '', is_active: true });
    setTierModal({ show: true, outletId, editId: null });
  };

  const openEditTier = (t: OutletTier) => {
    setTierForm({
      tier_name: t.tier_name ?? '',
      harga_ladies: String(t.harga_ladies),
      untung: String(t.untung),
      is_active: t.is_active,
    });
    setTierModal({ show: true, outletId: t.outlet_id, editId: t.id });
  };

  const closeTierModal = () =>
    setTierModal({ show: false, outletId: null, editId: null });

  const handleSaveTier = async () => {
    if (!tierModal.outletId) return;

    // `Number('')` bernilai 0 dan lolos isNaN — sebelumnya field nominal yang
    // dikosongkan diam-diam tersimpan sebagai 0.
    const errorValidasi = validasiAngka([
      { label: 'Harga ladies', value: tierForm.harga_ladies },
      { label: 'Untung', value: tierForm.untung },
    ]);

    if (errorValidasi) {
      toast.error(errorValidasi);
      return;
    }

    const payload = {
      outlet_id: tierModal.outletId,
      tier_name: tierForm.tier_name.trim() || null,
      harga_ladies: Number(tierForm.harga_ladies),
      untung: Number(tierForm.untung),
      is_active: tierForm.is_active,
    };

    const { error } = tierModal.editId
      ? await supabase.from('outlet_pricing').update(payload).eq('id', tierModal.editId)
      : await supabase.from('outlet_pricing').insert([payload]);

    if (error) {
      toast.error('Gagal menyimpan tier: ' + error.message);
      return;
    }

    toast.success(tierModal.editId ? 'Tier diperbarui.' : 'Tier ditambahkan.');
    invalidateTiers(tierModal.outletId);
    closeTierModal();
  };

  const handleDeleteTier = async (t: OutletTier) => {
    if (!(await confirmDialog(`❗ Hapus tier "${t.tier_name || 'Flat'}"?`))) return;

    const { error } = await supabase.from('outlet_pricing').delete().eq('id', t.id);

    if (error) {
      toast.error('Gagal menghapus tier: ' + error.message);
      return;
    }

    invalidateTiers(t.outlet_id);
  };

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <ListPageHeader
        icon={<FiMapPin />}
        title="Management Outlet"
        description="Kelola outlet & harga voucher per tier"
        actions={
          <HeaderActionButton icon={<FiPlus />} onClick={openAddOutlet} fullWidth={isMobile}>
            Tambah Outlet
          </HeaderActionButton>
        }
      />

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <ListPageToolbar
          title="List Outlet"
          subtitle="Data outlet"
          placeholder="Cari outlet..."
          keyword={keyword}
          onKeywordChange={(value) => {
            setPage(1);
            setKeyword(value);
          }}
        />

        <div className="p-2 p-md-3">
          {loading ? (
            <div className="d-flex justify-content-center p-3" role="status" aria-label="Loading">
              <FiLoader size={20} className="spinner-icon" />
            </div>
          ) : outlets.length === 0 ? (
            <EmptyState title="Belum ada outlet" />
          ) : (
            <div className="d-flex flex-column gap-2">
              {outlets.map((o) => {
                const isExpanded = expandedId === o.id;

                return (
                  <div
                    key={o.id}
                    className="rounded-4"
                    style={{
                      border: '1px solid var(--color-gray-200)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-between p-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        <span className="fw-bold">{o.nama_outlet}</span>
                        <span
                          className="badge"
                          style={{
                            background: o.is_active
                              ? 'var(--color-income-soft)'
                              : 'var(--color-gray-200)',
                            color: o.is_active
                              ? 'var(--color-income)'
                              : 'var(--color-gray-700)',
                          }}
                        >
                          {o.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <ActionIconButton
                          icon={<FiEdit2 size={16} />}
                          variant="warning"
                          title="Edit"
                          onClick={() => openEditOutlet(o)}
                        />
                        <ActionIconButton
                          icon={<FiTrash2 size={16} />}
                          variant="danger"
                          title="Hapus"
                          onClick={() => handleDeleteOutlet(o)}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="p-3 border-top"
                        style={{
                          background: 'var(--color-surface-2)',
                          borderColor: 'var(--color-gray-200)',
                        }}
                      >
                        {tiersQuery.isLoading ? (
                          <div className="text-center p-2">
                            <FiLoader className="spinner-icon" />
                          </div>
                        ) : (tiersQuery.data ?? []).length === 0 ? (
                          <div
                            className="mb-2"
                            style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}
                          >
                            Belum ada tier harga untuk outlet ini.
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-2 mb-3">
                            {(tiersQuery.data ?? []).map((t) => (
                              <div
                                key={t.id}
                                className="d-flex align-items-center justify-content-between p-2 rounded-3"
                                style={{ background: 'var(--color-surface)' }}
                              >
                                <div>
                                  <div className="fw-semibold">
                                    {t.tier_name || 'Flat (tanpa tier)'}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.78rem',
                                      color: 'var(--color-gray-500)',
                                    }}
                                  >
                                    Ladies Rp{t.harga_ladies.toLocaleString('id-ID')} · Untung Rp
                                    {t.untung.toLocaleString('id-ID')}
                                    {!t.is_active && ' · Nonaktif'}
                                  </div>
                                </div>

                                <div className="d-flex gap-2">
                                  <ActionIconButton
                                    icon={<FiEdit2 size={14} />}
                                    variant="warning"
                                    title="Edit tier"
                                    onClick={() => openEditTier(t)}
                                  />
                                  <ActionIconButton
                                    icon={<FiTrash2 size={14} />}
                                    variant="danger"
                                    title="Hapus tier"
                                    onClick={() => handleDeleteTier(t)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="secondary"
                          size="md"
                          icon={<FiPlus />}
                          onClick={() => openAddTier(o.id)}
                        >
                          Tambah Tier
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>
      </div>

      {/* OUTLET MODAL */}
      <ModalWrapper
        show={outletModal.show}
        title={<div className="fw-bold">{outletModal.editId ? 'Edit Outlet' : 'Tambah Outlet'}</div>}
        onClose={() => setOutletModal({ show: false, editId: null })}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" onClick={() => setOutletModal({ show: false, editId: null })}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveOutlet}>
              Simpan
            </Button>
          </div>
        }
      >
        <FormField
          label="Nama Outlet"
          name="nama_outlet"
          value={outletForm.nama_outlet}
          onChange={(e) => setOutletForm((p) => ({ ...p, nama_outlet: e.target.value }))}
        />

        <FormField label="Status">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="outlet-active"
              checked={outletForm.is_active}
              onChange={(e) => setOutletForm((p) => ({ ...p, is_active: e.target.checked }))}
            />
            <label className="form-check-label" htmlFor="outlet-active">
              Aktif
            </label>
          </div>
        </FormField>
      </ModalWrapper>

      {/* TIER MODAL */}
      <ModalWrapper
        show={tierModal.show}
        title={<div className="fw-bold">{tierModal.editId ? 'Edit Tier' : 'Tambah Tier'}</div>}
        onClose={closeTierModal}
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" onClick={closeTierModal}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveTier}>
              Simpan
            </Button>
          </div>
        }
      >
        <FormField
          label="Nama Tier (kosongkan kalau outlet ini tidak punya tier)"
          name="tier_name"
          value={tierForm.tier_name}
          onChange={(e) => setTierForm((p) => ({ ...p, tier_name: e.target.value }))}
        />

        <FormField
          label="Harga Ladies (Rp)"
          name="harga_ladies"
          type="number"
          value={tierForm.harga_ladies}
          onChange={(e) => setTierForm((p) => ({ ...p, harga_ladies: e.target.value }))}
        />

        <FormField
          label="Untung (Rp)"
          name="untung"
          type="number"
          value={tierForm.untung}
          onChange={(e) => setTierForm((p) => ({ ...p, untung: e.target.value }))}
        />

        <FormField label="Status">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="tier-active"
              checked={tierForm.is_active}
              onChange={(e) => setTierForm((p) => ({ ...p, is_active: e.target.checked }))}
            />
            <label className="form-check-label" htmlFor="tier-active">
              Aktif
            </label>
          </div>
        </FormField>
      </ModalWrapper>
    </div>
  );
};

export default OutletListPage;
