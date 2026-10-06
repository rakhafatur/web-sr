import { Fragment, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiSearch,
} from 'react-icons/fi';

import { supabase } from '../../../lib/supabaseClient';
import { validasiWajib, validasiAngka } from '../../../utils/validasiForm';
import { useEntityList } from '../../../hooks/useEntityList';
import { confirmDialog } from '../../../components/ConfirmDialog';
import ListLoadingState from '../../../components/ListLoadingState';
import PullToRefresh from '../../../components/PullToRefresh';
import ModalWrapper from '../../../components/ModalWrapper';
import Pagination from '../../../components/Pagination';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopListCard from '../../../components/desktop/DesktopListCard';
import DesktopField from '../../../components/desktop/DesktopField';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

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
    total,
    totalPages,
    keyword,
    setKeyword,
    loading,
    remove,
    save,
    refetch,
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

  /** Cukup satu penanda untuk kedua modal: hanya satu yang bisa terbuka pada
      satu waktu, dan nama field-nya tidak bertabrakan. */
  const [fieldSalah, setFieldSalah] = useState<string | null>(null);

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
      { label: 'Nama outlet', value: outletForm.nama_outlet, name: 'nama_outlet' },
    ]);

    if (errorValidasi) {
      setFieldSalah(errorValidasi.nama);
      toast.error(errorValidasi.pesan);
      return;
    }

    setFieldSalah(null);

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
      `Hapus outlet "${o.nama_outlet}"? Tier harganya juga akan ikut terhapus.`
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
      { label: 'Harga ladies', value: tierForm.harga_ladies, name: 'harga_ladies' },
      { label: 'Untung', value: tierForm.untung, name: 'untung' },
    ]);

    if (errorValidasi) {
      setFieldSalah(errorValidasi.nama);
      toast.error(errorValidasi.pesan);
      return;
    }

    setFieldSalah(null);

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
    if (!(await confirmDialog(`Hapus tier "${t.tier_name || 'Flat'}"?`))) return;

    const { error } = await supabase.from('outlet_pricing').delete().eq('id', t.id);

    if (error) {
      toast.error('Gagal menghapus tier: ' + error.message);
      return;
    }

    invalidateTiers(t.outlet_id);
  };

  const wajib = (
    <>
      <span className="tm-req" aria-hidden="true">*</span>
      <span className="visually-hidden"> (wajib diisi)</span>
    </>
  );

  const tutupOutletModal = () => setOutletModal({ show: false, editId: null });

  /** Footer bottom sheet versi mobile: dua tombol pil sama lebar. */
  const footerMobile = (onBatal: () => void, onSimpan: () => void) => (
    <div className="tm-sheet-footer">
      <button type="button" className="tm-btn" onClick={onBatal}>Batal</button>
      <button type="button" className="tm-btn tm-btn--primary" onClick={onSimpan}>Simpan</button>
    </div>
  );

  /** Saklar Aktif (pengganti checkbox) untuk form mobile. */
  const saklarAktif = (id: string, checked: boolean, onToggle: () => void) => (
    <div className="tm-field">
      <div className="tm-switch-row">
        <span id={id}>Aktif</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={id}
          className="tm-switch"
          onClick={onToggle}
        />
      </div>
    </div>
  );

  /** Saklar Aktif untuk form desktop — baris berlabel + teks bantuan opsional. */
  const saklarAktifDesktop = (id: string, checked: boolean, onToggle: () => void, help?: string) => (
    <div className="dk-field--full">
      <div className="dk-switch-row">
        <div>
          <span id={id} className="dk-switch-label">Aktif</span>
          {help && <div className="dk-help" style={{ marginTop: 2 }}>{help}</div>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={id}
          className="dk-switch"
          onClick={onToggle}
        />
      </div>
    </div>
  );

  /** Footer dialog versi desktop: Batal / Simpan rata kanan. */
  const footerDesktop = (onBatal: () => void, onSimpan: () => void) => (
    <div className="dk-modal-foot">
      <button type="button" className="dk-btn" onClick={onBatal}>Batal</button>
      <button type="button" className="dk-btn dk-btn--primary" onClick={onSimpan}>Simpan</button>
    </div>
  );

  const judulModal = (teks: string) =>
    isMobile ? <div className="fw-bold">{teks}</div> : <div className="dk-card-title">{teks}</div>;

  const modals = (
    <>
      {/* OUTLET MODAL */}
      <ModalWrapper
        show={outletModal.show}
        title={judulModal(outletModal.editId ? 'Ubah outlet' : 'Tambah outlet')}
        onClose={tutupOutletModal}
        footer={
          isMobile
            ? footerMobile(tutupOutletModal, handleSaveOutlet)
            : footerDesktop(tutupOutletModal, handleSaveOutlet)
        }
      >
        {isMobile ? (
          <div className="tm-sheet-form">
            <div className="tm-field">
              <label htmlFor="outlet-nama" className="tm-label">Nama outlet{wajib}</label>
              <div className="tm-input-wrap">
                <FiMapPin className="tm-input-icon" aria-hidden />
                <input
                  id="outlet-nama"
                  type="text"
                  className={`tm-input ${fieldSalah === 'nama_outlet' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'nama_outlet' || undefined}
                  value={outletForm.nama_outlet}
                  onChange={(e) => {
                    setFieldSalah(null);
                    setOutletForm((p) => ({ ...p, nama_outlet: e.target.value }));
                  }}
                />
              </div>
            </div>
            {saklarAktif('outlet-aktif', outletForm.is_active, () =>
              setOutletForm((p) => ({ ...p, is_active: !p.is_active }))
            )}
          </div>
        ) : (
          <div className="dk-form-grid dk-form-grid--single">
            <DesktopField label="Nama outlet" htmlFor="dk-outlet-nama" required>
              <input
                id="dk-outlet-nama"
                type="text"
                autoComplete="off"
                className={`dk-input ${fieldSalah === 'nama_outlet' ? 'is-invalid' : ''}`}
                aria-invalid={fieldSalah === 'nama_outlet' || undefined}
                value={outletForm.nama_outlet}
                onChange={(e) => {
                  setFieldSalah(null);
                  setOutletForm((p) => ({ ...p, nama_outlet: e.target.value }));
                }}
              />
            </DesktopField>
            {saklarAktifDesktop(
              'dk-outlet-aktif',
              outletForm.is_active,
              () => setOutletForm((p) => ({ ...p, is_active: !p.is_active })),
              'Outlet nonaktif tidak muncul di pilihan outlet pada form Ladies.'
            )}
          </div>
        )}
      </ModalWrapper>

      {/* TIER MODAL */}
      <ModalWrapper
        show={tierModal.show}
        title={judulModal(tierModal.editId ? 'Ubah tier harga' : 'Tambah tier harga')}
        onClose={closeTierModal}
        footer={
          isMobile
            ? footerMobile(closeTierModal, handleSaveTier)
            : footerDesktop(closeTierModal, handleSaveTier)
        }
      >
        {isMobile ? (
          <div className="tm-sheet-form">
            <div className="tm-field">
              <label htmlFor="tier-nama" className="tm-label">Nama tier (opsional)</label>
              <input
                id="tier-nama"
                type="text"
                className="tm-input"
                style={{ paddingLeft: 'var(--space-4)' }}
                placeholder="Mis. Reguler, VIP"
                value={tierForm.tier_name}
                onChange={(e) => setTierForm((p) => ({ ...p, tier_name: e.target.value }))}
              />
              <div className="tm-help">Kosongkan kalau outlet ini hanya punya satu harga.</div>
            </div>

            <div className="tm-field">
              <label htmlFor="tier-harga" className="tm-label">Harga ladies{wajib}</label>
              <div className="tm-input-wrap">
                <span className="tm-prefix" aria-hidden>Rp</span>
                <input
                  id="tier-harga"
                  type="number"
                  inputMode="numeric"
                  className={`tm-input tm-input--prefix ${fieldSalah === 'harga_ladies' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'harga_ladies' || undefined}
                  value={tierForm.harga_ladies}
                  onChange={(e) => {
                    setFieldSalah((prev) => (prev === 'harga_ladies' ? null : prev));
                    setTierForm((p) => ({ ...p, harga_ladies: e.target.value }));
                  }}
                />
              </div>
            </div>

            <div className="tm-field">
              <label htmlFor="tier-untung" className="tm-label">Untung{wajib}</label>
              <div className="tm-input-wrap">
                <span className="tm-prefix" aria-hidden>Rp</span>
                <input
                  id="tier-untung"
                  type="number"
                  inputMode="numeric"
                  className={`tm-input tm-input--prefix ${fieldSalah === 'untung' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'untung' || undefined}
                  value={tierForm.untung}
                  onChange={(e) => {
                    setFieldSalah((prev) => (prev === 'untung' ? null : prev));
                    setTierForm((p) => ({ ...p, untung: e.target.value }));
                  }}
                />
              </div>
            </div>

            {saklarAktif('tier-aktif', tierForm.is_active, () =>
              setTierForm((p) => ({ ...p, is_active: !p.is_active }))
            )}
          </div>
        ) : (
          <div className="dk-form-grid">
            <DesktopField
              label="Nama tier (opsional)"
              htmlFor="dk-tier-nama"
              full
              help="Kosongkan kalau outlet ini hanya punya satu harga."
            >
              <input
                id="dk-tier-nama"
                type="text"
                autoComplete="off"
                className="dk-input"
                placeholder="Mis. Reguler, VIP"
                value={tierForm.tier_name}
                onChange={(e) => setTierForm((p) => ({ ...p, tier_name: e.target.value }))}
              />
            </DesktopField>

            <DesktopField label="Harga ladies" htmlFor="dk-tier-harga" required>
              <div className="dk-input-wrap">
                <span className="dk-prefix" aria-hidden>Rp</span>
                <input
                  id="dk-tier-harga"
                  type="number"
                  inputMode="numeric"
                  className={`dk-input dk-input--prefix ${fieldSalah === 'harga_ladies' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'harga_ladies' || undefined}
                  value={tierForm.harga_ladies}
                  onChange={(e) => {
                    setFieldSalah((prev) => (prev === 'harga_ladies' ? null : prev));
                    setTierForm((p) => ({ ...p, harga_ladies: e.target.value }));
                  }}
                />
              </div>
            </DesktopField>

            <DesktopField label="Untung" htmlFor="dk-tier-untung" required>
              <div className="dk-input-wrap">
                <span className="dk-prefix" aria-hidden>Rp</span>
                <input
                  id="dk-tier-untung"
                  type="number"
                  inputMode="numeric"
                  className={`dk-input dk-input--prefix ${fieldSalah === 'untung' ? 'is-invalid' : ''}`}
                  aria-invalid={fieldSalah === 'untung' || undefined}
                  value={tierForm.untung}
                  onChange={(e) => {
                    setFieldSalah((prev) => (prev === 'untung' ? null : prev));
                    setTierForm((p) => ({ ...p, untung: e.target.value }));
                  }}
                />
              </div>
            </DesktopField>

            {saklarAktifDesktop('dk-tier-aktif', tierForm.is_active, () =>
              setTierForm((p) => ({ ...p, is_active: !p.is_active }))
            )}
          </div>
        )}
      </ModalWrapper>
    </>
  );

  // Mobile: tampilan baru selaras halaman admin lain (Header app dicabut di
  // MainLayout). Desktop: gaya dk- di bawah. CRUD-nya sama.
  if (isMobile) {
    const tiers = tiersQuery.data ?? [];

    return (
      <PullToRefresh onRefresh={refetch}>
        <div className="tm-page">
          <MobilePageBar
            title="Outlet"
            backTo="/"
            action={{ icon: <FiPlus />, label: 'Tambah outlet', onClick: openAddOutlet }}
          />

          <div className="tm-stack">
            <div className="tm-search">
              <FiSearch aria-hidden />
              <input
                type="search"
                placeholder="Cari outlet..."
                aria-label="Cari outlet"
                value={keyword}
                onChange={(e) => {
                  setPage(1);
                  setKeyword(e.target.value);
                }}
              />
            </div>

            {loading ? (
              <ListLoadingState label="Memuat data outlet" />
            ) : outlets.length === 0 ? (
              <div className="tm-group">
                <div className="tm-empty">
                  <span className="tm-empty-icon" aria-hidden><FiMapPin /></span>
                  <div className="tm-empty-title">{keyword ? 'Outlet tidak ditemukan' : 'Belum ada outlet'}</div>
                  <div className="tm-empty-text">
                    {keyword ? 'Coba kata kunci lain.' : 'Ketuk tombol + di kanan atas untuk menambah outlet.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="tm-group">
                {outlets.map((o) => {
                  const isExpanded = expandedId === o.id;

                  return (
                    <div key={o.id} className="tm-item">
                      <button
                        type="button"
                        className="tm-row tm-row-btn"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedId(isExpanded ? null : o.id)}
                      >
                        <span
                          className="tm-row-icon"
                          style={{ background: 'var(--color-green-lighter)', color: 'var(--color-green)' }}
                          aria-hidden
                        >
                          <FiMapPin />
                        </span>
                        <div className="tm-row-main">
                          <div className="tm-row-title">{o.nama_outlet}</div>
                          <div className="tm-row-sub">
                            <span className={`tm-status ${o.is_active ? 'is-on' : 'is-off'}`}>
                              {o.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                        </div>
                        <FiChevronDown className={`tm-chevron ${isExpanded ? 'is-open' : ''}`} aria-hidden />
                      </button>

                      {isExpanded && (
                        <div className="tm-detail">
                          <div className="tm-detail-title">Tier harga</div>

                          {tiersQuery.isLoading ? (
                            <ListLoadingState label="Memuat tier harga" rows={2} />
                          ) : tiers.length === 0 ? (
                            <div className="tm-help" style={{ marginTop: 0 }}>
                              Belum ada tier harga — transaksi voucher untuk outlet ini akan diblokir
                              sampai tier ditambahkan.
                            </div>
                          ) : (
                            tiers.map((t) => (
                              <div key={t.id} className="tm-subitem">
                                <div className="tm-row-main">
                                  <div className="tm-row-title">
                                    {t.tier_name || 'Flat (tanpa tier)'}{' '}
                                    {!t.is_active && <span className="tm-status is-off">Nonaktif</span>}
                                  </div>
                                  <div className="tm-row-sub" style={{ whiteSpace: 'normal' }}>
                                    Ladies Rp{t.harga_ladies.toLocaleString('id-ID')} · Untung Rp
                                    {t.untung.toLocaleString('id-ID')}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="tm-icon-btn"
                                  onClick={() => openEditTier(t)}
                                  aria-label={`Ubah tier ${t.tier_name || 'Flat'}`}
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  type="button"
                                  className="tm-icon-btn tm-icon-btn--danger"
                                  onClick={() => handleDeleteTier(t)}
                                  aria-label={`Hapus tier ${t.tier_name || 'Flat'}`}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            ))
                          )}

                          <button type="button" className="tm-dashed-btn" onClick={() => openAddTier(o.id)}>
                            <FiPlus aria-hidden />
                            Tambah tier
                          </button>

                          <div className="tm-actions tm-actions--top">
                            <button type="button" className="tm-btn" onClick={() => openEditOutlet(o)}>
                              <FiEdit2 aria-hidden />
                              Ubah outlet
                            </button>
                            <button type="button" className="tm-btn tm-btn--danger" onClick={() => handleDeleteOutlet(o)}>
                              <FiTrash2 aria-hidden />
                              Hapus
                            </button>
                          </div>
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

        {modals}
      </PullToRefresh>
    );
  }

  // Desktop (gaya baru dk-, sama dengan Users): satu kartu dengan cari &
  // tabel outlet. Klik baris membuka tier harganya di bawah baris itu; ubah
  // & hapus outlet lewat ikon (outlet tidak punya halaman detail).
  const tiers = tiersQuery.data ?? [];

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Outlet"
        description="Kelola outlet & harga voucher per tier"
        actions={
          <button type="button" className="dk-btn dk-btn--primary" onClick={openAddOutlet}>
            <FiPlus aria-hidden />
            Tambah outlet
          </button>
        }
      />

      <DesktopListCard
        label="Daftar outlet"
        keyword={keyword}
        onKeywordChange={(v) => {
          setPage(1);
          setKeyword(v);
        }}
        searchPlaceholder="Cari outlet..."
        countText={`${total} outlet`}
        loading={loading}
        loadingLabel="Memuat data outlet"
        isEmpty={outlets.length === 0}
        empty={{
          icon: <FiMapPin />,
          title: keyword ? 'Outlet tidak ditemukan' : 'Belum ada outlet',
          text: keyword ? 'Coba kata kunci lain.' : 'Klik "Tambah outlet" untuk menambah outlet pertama.',
        }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      >
        <table className="dk-table">
          <thead>
            <tr>
              <th scope="col">Outlet</th>
              <th scope="col">Status</th>
              <th scope="col" className="dk-col-actions">
                <span className="visually-hidden">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {outlets.map((o) => {
              const isExpanded = expandedId === o.id;
              const toggle = () => setExpandedId(isExpanded ? null : o.id);

              return (
                <Fragment key={o.id}>
                  <tr className={`is-clickable ${isExpanded ? 'is-expanded' : ''}`} onClick={toggle}>
                    <td>
                      <div className="dk-person">
                        <span className="dk-avatar" aria-hidden><FiMapPin /></span>
                        {/* Tombol supaya tier juga bisa dibuka lewat keyboard. */}
                        <button
                          type="button"
                          className="dk-person-name"
                          aria-expanded={isExpanded}
                          aria-controls={`dk-tier-${o.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle();
                          }}
                        >
                          {o.nama_outlet}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`dk-status ${o.is_active ? 'is-on' : 'is-muted'}`}>
                        {o.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="dk-col-actions">
                      <button
                        type="button"
                        className="dk-icon-btn"
                        title="Ubah outlet"
                        aria-label={`Ubah ${o.nama_outlet}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditOutlet(o);
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="dk-icon-btn dk-icon-btn--danger"
                        title="Hapus outlet"
                        aria-label={`Hapus ${o.nama_outlet}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOutlet(o);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                      <FiChevronDown
                        className={`dk-row-chevron dk-row-chevron--down ${isExpanded ? 'is-open' : ''}`}
                        aria-hidden
                      />
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="dk-subrow" id={`dk-tier-${o.id}`}>
                      <td colSpan={3}>
                        <div className="dk-subpanel">
                          <div className="dk-subpanel-head">
                            <div>
                              <div className="dk-subpanel-title">Tier harga</div>
                              <div className="dk-help" style={{ marginTop: 2 }}>
                                Harga dibaca sekali saat transaksi voucher dibuat — mengubahnya tidak
                                mengubah transaksi lama.
                              </div>
                            </div>
                            <button type="button" className="dk-btn dk-btn--sm" onClick={() => openAddTier(o.id)}>
                              <FiPlus aria-hidden />
                              Tambah tier
                            </button>
                          </div>

                          {tiersQuery.isLoading ? (
                            <ListLoadingState label="Memuat tier harga" rows={2} />
                          ) : tiers.length === 0 ? (
                            <div className="dk-subpanel-empty">
                              Belum ada tier harga — transaksi voucher untuk outlet ini akan diblokir
                              sampai tier ditambahkan.
                            </div>
                          ) : (
                            <table className="dk-subtable">
                              <thead>
                                <tr>
                                  <th scope="col">Tier</th>
                                  <th scope="col" className="dk-col-num">Harga ladies</th>
                                  <th scope="col" className="dk-col-num">Untung</th>
                                  <th scope="col">Status</th>
                                  <th scope="col" className="dk-col-actions">
                                    <span className="visually-hidden">Aksi</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {tiers.map((t) => (
                                  <tr key={t.id}>
                                    <td>{t.tier_name || <span className="dk-muted">Flat (tanpa tier)</span>}</td>
                                    <td className="dk-col-num dk-num">Rp{t.harga_ladies.toLocaleString('id-ID')}</td>
                                    <td className="dk-col-num dk-num">Rp{t.untung.toLocaleString('id-ID')}</td>
                                    <td>
                                      <span className={`dk-status ${t.is_active ? 'is-on' : 'is-muted'}`}>
                                        {t.is_active ? 'Aktif' : 'Nonaktif'}
                                      </span>
                                    </td>
                                    <td className="dk-col-actions">
                                      <button
                                        type="button"
                                        className="dk-icon-btn"
                                        title="Ubah tier"
                                        aria-label={`Ubah tier ${t.tier_name || 'Flat'}`}
                                        onClick={() => openEditTier(t)}
                                      >
                                        <FiEdit2 />
                                      </button>
                                      <button
                                        type="button"
                                        className="dk-icon-btn dk-icon-btn--danger"
                                        title="Hapus tier"
                                        aria-label={`Hapus tier ${t.tier_name || 'Flat'}`}
                                        onClick={() => handleDeleteTier(t)}
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </DesktopListCard>

      {modals}
    </div>
  );
};

export default OutletListPage;
