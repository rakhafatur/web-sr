import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';
import TransaksiForm from '../components/TransaksiForm';
import RiwayatTransaksi from '../components/RiwayatTransaksi';
import SearchableSelect from '../../../components/SearchableSelect';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

const AddTransaksiPage = () => {
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  // Pilihan ladies dibawa antar halaman (URL + sesi) — lihat usePilihanTerakhir.
  const [selectedLadyId, setSelectedLadyId] = usePilihanTerakhir('ladies');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tambah' | 'riwayat'>('tambah');

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const selectedLady = ladiesList.find(
    (l) => l.id === selectedLadyId
  );

  useEffect(() => {
    const fetchLadies = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin, status')
        .eq('status', 'active')
        .order('nama_ladies', { ascending: true });

      if (error) {
        console.error('Gagal mengambil data ladies:', error.message);
      } else {
        setLadiesList(data || []);
      }

      setLoading(false);
    };

    fetchLadies();
  }, []);

  // Pilihan yang diingat bisa sudah tidak ada di daftar (mis. ladies
  // dinonaktifkan) — kosongkan supaya muncul "Pilih ladies dulu", bukan
  // layar kosong.
  useEffect(() => {
    if (!loading && selectedLadyId && !ladiesList.some((l) => l.id === selectedLadyId)) {
      setSelectedLadyId('');
    }
  }, [loading, selectedLadyId, ladiesList, setSelectedLadyId]);

  const opsiLadies = ladiesList.map((lady) => ({
    value: lady.id,
    label: `${lady.nama_ladies} • ${lady.nama_outlet} (${lady.pin})`,
  }));

  // Mobile: tampilan baru selaras Transaksi Pengawas (Header app dicabut di
  // MainLayout). Desktop: gaya dk- di bawah. Form & riwayat tetap
  // komponen yang sama.
  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Transaksi Ladies" backTo="/" />

        <div className="tm-stack">
          <h2 className="tm-section-title">Ladies</h2>
          <SearchableSelect
            value={selectedLadyId}
            onChange={(v) => {
              setSelectedLadyId(v);
              setActiveTab('tambah');
            }}
            options={opsiLadies}
            placeholder="Pilih ladies"
            searchPlaceholder="Cari nama ladies..."
            height={52}
            borderRadius={999}
            fontSize="1rem"
          />

          {/* Pengecualian yang disengaja dari aturan "skeleton untuk daftar":
              ini status pilihan dropdown yang sedang dimuat, bukan isi halaman. */}
          {loading && (
            <div className="tm-loading" role="status" aria-label="Mengambil data ladies">
              <div className="spinner-border spinner-border-sm" />
              <span>Mengambil data ladies...</span>
            </div>
          )}

          {!selectedLadyId && !loading && (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
                <div className="tm-empty-title">Pilih ladies dulu</div>
                <div className="tm-empty-text">
                  Form transaksi dan riwayat akan muncul setelah ladies dipilih.
                </div>
              </div>
            </div>
          )}

          {selectedLady && (
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
                      {/* Harga voucher mengikuti outlet — ditampilkan supaya
                          admin tahu tarif mana yang akan dipakai. */}
                      <div className="tm-card-head">
                        <span className="tm-card-title">{selectedLady.nama_ladies}</span>
                        <span className="tm-pill">{selectedLady.nama_outlet}</span>
                      </div>
                      <TransaksiForm ladiesId={selectedLadyId} outlet={selectedLady.nama_outlet} />
                    </div>
                  ) : (
                    <RiwayatTransaksi ladiesId={selectedLadyId} />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop (gaya baru dk-): pemilih ladies di atas, lalu dua kolom —
  // form tambah (kiri) & riwayat bulanan (kanan). Form & riwayat tetap
  // komponen yang sama dengan mobile (masing-masing punya cabang desktop).
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Transaksi ladies"
        description="Catat voucher, pemasukan lain, kasbon, dan dokter — lihat riwayatnya per bulan"
      />

      <section className="dk-card dk-pickbar" aria-label="Pilih ladies">
        <div className="dk-pickbar-field">
          <span className="dk-label">Ladies</span>
          <SearchableSelect
            value={selectedLadyId}
            onChange={setSelectedLadyId}
            options={opsiLadies}
            placeholder="Pilih ladies"
            searchPlaceholder="Cari nama ladies..."
            height={44}
            borderRadius={999}
            fontSize="15px"
          />
        </div>

        {/* Pengecualian yang disengaja dari aturan "skeleton untuk daftar":
            ini status pilihan dropdown yang sedang dimuat, bukan isi halaman. */}
        {loading ? (
          <div className="dk-pickbar-meta dk-muted" role="status" aria-label="Mengambil data ladies">
            <div className="spinner-border spinner-border-sm" />
            <span>Mengambil data ladies...</span>
          </div>
        ) : (
          selectedLady && (
            <div className="dk-pickbar-meta">
              <span className="dk-avatar" aria-hidden>
                {(selectedLady.nama_ladies || '?').charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="dk-pickbar-name">{selectedLady.nama_ladies}</div>
                <div className="dk-person-sub">
                  {[selectedLady.nama_outlet, selectedLady.pin && `PIN ${selectedLady.pin}`].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>
          )
        )}
      </section>

      {!selectedLadyId && !loading && (
        <section className="dk-card">
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiUsers /></span>
            <div className="dk-empty-title">Pilih ladies dulu</div>
            <div className="dk-empty-text">Form transaksi dan riwayat akan muncul setelah ladies dipilih.</div>
          </div>
        </section>
      )}

      {selectedLady && (
        <div className="dk-split-grid">
          <section className="dk-card" aria-label="Tambah transaksi">
            {/* Harga voucher mengikuti outlet — ditampilkan supaya admin tahu
                tarif mana yang akan dipakai. */}
            <div className="dk-card-head dk-card-head--row">
              <div>
                <h2 className="dk-card-title">Tambah transaksi</h2>
                <div className="dk-card-sub">{selectedLady.nama_ladies}</div>
              </div>
              <span className="dk-pill" title="Harga voucher mengikuti outlet ini">
                {selectedLady.nama_outlet}
              </span>
            </div>
            <div className="dk-card-body">
              <TransaksiForm ladiesId={selectedLadyId} outlet={selectedLady.nama_outlet} />
            </div>
          </section>

          <section className="dk-card" aria-label="Riwayat transaksi">
            <div className="dk-card-head">
              <h2 className="dk-card-title">Riwayat transaksi</h2>
              <div className="dk-card-sub">Klik baris untuk mengubah · semua transaksi per bulan</div>
            </div>
            <RiwayatTransaksi ladiesId={selectedLadyId} />
          </section>
        </div>
      )}
    </div>
  );
};

export default AddTransaksiPage;
