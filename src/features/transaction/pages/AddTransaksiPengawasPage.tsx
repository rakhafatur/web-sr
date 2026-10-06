import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';

import TransaksiFormPengawas from '../components/TransaksiFormPengawas';
import RiwayatTransaksiPengawas from '../components/RiwayatTransaksiPengawas';
import SearchableSelect from '../../../components/SearchableSelect';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

import { FiUsers } from 'react-icons/fi';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  status: string;
};

const AddTransaksiPagePengawas = () => {
  const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
  // Pilihan pengawas dibawa antar halaman (URL + sesi) — lihat usePilihanTerakhir.
  const [selectedPengawasId, setSelectedPengawasId] = usePilihanTerakhir('pengawas');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tambah' | 'riwayat'>('tambah');

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const selectedPengawas = pengawasList.find(
    (p) => p.id === selectedPengawasId
  );

  useEffect(() => {
    const fetchPengawas = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('pengawas')
        .select('id, nama_lengkap, nama_panggilan, status')
        .eq('status', 'active');

      if (error) {
        console.error('Gagal mengambil data pengawas:', error.message);
      } else {
        setPengawasList(data || []);
      }

      setLoading(false);
    };

    fetchPengawas();
  }, []);

  // Pilihan yang diingat bisa sudah tidak ada di daftar (mis. pengawas
  // dinonaktifkan) — kosongkan supaya muncul "Pilih pengawas dulu", bukan
  // layar kosong.
  useEffect(() => {
    if (!loading && selectedPengawasId && !pengawasList.some((p) => p.id === selectedPengawasId)) {
      setSelectedPengawasId('');
    }
  }, [loading, selectedPengawasId, pengawasList, setSelectedPengawasId]);

  const opsiPengawas = pengawasList.map((p) => ({
    value: p.id,
    label: `${p.nama_lengkap}${p.nama_panggilan ? ` (${p.nama_panggilan})` : ''}`,
  }));

  // Mobile: tampilan baru selaras layar ladies (Header app dicabut di
  // MainLayout). Desktop: gaya dk- di bawah. Form & riwayat tetap
  // komponen yang sama.
  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Transaksi Pengawas" backTo="/" />

        <div className="tm-stack">
          <h2 className="tm-section-title">Pengawas</h2>
          <SearchableSelect
            value={selectedPengawasId}
            onChange={(v) => {
              setSelectedPengawasId(v);
              setActiveTab('tambah');
            }}
            options={opsiPengawas}
            placeholder="Pilih pengawas"
            searchPlaceholder="Cari nama pengawas..."
            height={52}
            borderRadius={999}
            fontSize="1rem"
          />

          {/* Pengecualian yang disengaja dari aturan "skeleton untuk daftar":
              ini status pilihan dropdown yang sedang dimuat, bukan isi halaman. */}
          {loading && (
            <div className="tm-loading" role="status" aria-label="Mengambil data pengawas">
              <div className="spinner-border spinner-border-sm" />
              <span>Mengambil data pengawas...</span>
            </div>
          )}

          {!selectedPengawasId && !loading && (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                <div className="tm-empty-title">Pilih pengawas dulu</div>
                <div className="tm-empty-text">
                  Form transaksi dan riwayat akan muncul setelah pengawas dipilih.
                </div>
              </div>
            </div>
          )}

          {selectedPengawas && (
            <>
              <div className="tm-segmented" role="tablist" aria-label="Tampilan">
                {[
                  { key: 'tambah' as const, label: 'Tambah' },
                  { key: 'riwayat' as const, label: 'Riwayat' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`tm-segment ${activeTab === tab.key ? 'is-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  {activeTab === 'tambah' ? (
                    <div className="tm-card">
                      <TransaksiFormPengawas pengawasId={selectedPengawasId} />
                    </div>
                  ) : (
                    <RiwayatTransaksiPengawas pengawasId={selectedPengawasId} />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop (gaya baru dk-): pemilih pengawas di atas, lalu dua kolom —
  // form tambah (kiri) & riwayat bulanan (kanan). Form & riwayat tetap
  // komponen yang sama dengan mobile (masing-masing punya cabang desktop).
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Transaksi pengawas"
        description="Catat gaji & kasbon pengawas, dan lihat riwayatnya per bulan"
      />

      <section className="dk-card dk-pickbar" aria-label="Pilih pengawas">
        <div className="dk-pickbar-field">
          <span className="dk-label">Pengawas</span>
          <SearchableSelect
            value={selectedPengawasId}
            onChange={setSelectedPengawasId}
            options={opsiPengawas}
            placeholder="Pilih pengawas"
            searchPlaceholder="Cari nama pengawas..."
            height={44}
            borderRadius={999}
            fontSize="15px"
          />
        </div>

        {/* Pengecualian yang disengaja dari aturan "skeleton untuk daftar":
            ini status pilihan dropdown yang sedang dimuat, bukan isi halaman. */}
        {loading ? (
          <div className="dk-pickbar-meta dk-muted" role="status" aria-label="Mengambil data pengawas">
            <div className="spinner-border spinner-border-sm" />
            <span>Mengambil data pengawas...</span>
          </div>
        ) : (
          selectedPengawas && (
            <div className="dk-pickbar-meta">
              <span className="dk-avatar" aria-hidden>
                {(selectedPengawas.nama_lengkap || '?').charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="dk-pickbar-name">{selectedPengawas.nama_lengkap}</div>
                {selectedPengawas.nama_panggilan && (
                  <div className="dk-person-sub">Panggilan: {selectedPengawas.nama_panggilan}</div>
                )}
              </div>
            </div>
          )
        )}
      </section>

      {!selectedPengawasId && !loading && (
        <section className="dk-card">
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiUsers /></span>
            <div className="dk-empty-title">Pilih pengawas dulu</div>
            <div className="dk-empty-text">Form transaksi dan riwayat akan muncul setelah pengawas dipilih.</div>
          </div>
        </section>
      )}

      {selectedPengawas && (
        <div className="dk-split-grid">
          <section className="dk-card" aria-label="Tambah transaksi">
            <div className="dk-card-head">
              <h2 className="dk-card-title">Tambah transaksi</h2>
              <div className="dk-card-sub">{selectedPengawas.nama_lengkap}</div>
            </div>
            <div className="dk-card-body">
              <TransaksiFormPengawas pengawasId={selectedPengawasId} />
            </div>
          </section>

          <section className="dk-card" aria-label="Riwayat transaksi">
            <div className="dk-card-head">
              <h2 className="dk-card-title">Riwayat transaksi</h2>
              <div className="dk-card-sub">Klik baris untuk mengubah · gaji & kasbon per bulan</div>
            </div>
            <RiwayatTransaksiPengawas pengawasId={selectedPengawasId} />
          </section>
        </div>
      )}
    </div>
  );
};

export default AddTransaksiPagePengawas;
