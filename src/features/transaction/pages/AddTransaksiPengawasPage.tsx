import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';

import TransaksiFormPengawas from '../components/TransaksiFormPengawas';
import RiwayatTransaksiPengawas from '../components/RiwayatTransaksiPengawas';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import SearchableSelect from '../../../components/SearchableSelect';
import MobilePageBar from '../../../components/MobilePageBar';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';
import '../../../styles/mobile-admin.css';

import { FiUsers, FiCreditCard, FiClock, FiAlertCircle } from 'react-icons/fi';

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
  // MainLayout). Desktop: tampilan lama di bawah. Form & riwayat tetap
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

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <FeaturePageHeader
        icon={<FiCreditCard />}
        title="Transaksi Pengawas"
        description="Kelola transaksi pengawas harian"
      />

      {/* SELECT PENGAWAS */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <div
          className="px-4 py-3 border-bottom"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiUsers size={18} style={{ color: 'var(--color-green)' }} />
            <span
              className="fw-semibold"
              style={{ color: 'var(--color-dark)' }}
            >
              Pilih Pengawas
            </span>
          </div>
        </div>

        <div className="p-4">
          <SearchableSelect
            value={selectedPengawasId}
            onChange={(v) => {
              setSelectedPengawasId(v);
              setActiveTab('tambah');
            }}
            options={opsiPengawas}
            placeholder="-- Pilih Pengawas --"
            searchPlaceholder="Cari nama pengawas..."
            height={isMobile ? 50 : 58}
            borderRadius={isMobile ? 14 : 18}
            fontSize={isMobile ? '0.82rem' : '0.97rem'}
          />

          {/* EMPTY STATE */}
          {!selectedPengawasId && !loading && (
            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: 'var(--color-warning)',
                border: '1px solid var(--color-warning-hover)',
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <FiAlertCircle
                  aria-hidden
                  style={{ fontSize: 22, flexShrink: 0, color: 'var(--color-voucher)', marginTop: 2 }}
                />

                <div>
                  <div className="fw-bold mb-1">
                    Pengawas belum dipilih
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-500)' }}>
                    Pilih pengawas untuk menampilkan form transaksi dan riwayat.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {/* Pengecualian yang disengaja dari aturan "skeleton untuk daftar":
              ini status pilihan yang sedang dimuat untuk sebuah dropdown, bukan
              daftar isi halaman — skeleton baris justru menggambarkan tata letak
              yang tidak akan pernah muncul. Dibuat sama dengan versi ladies. */}
          {loading && (
            <div
              className="d-flex align-items-center gap-3 mt-3"
              style={{ color: 'var(--color-gray-500)' }}
              role="status"
              aria-label="Mengambil data pengawas"
            >
              <div className="spinner-border spinner-border-sm" />

              <span>Mengambil data pengawas...</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {selectedPengawas && (() => {
        const formCard = (
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background:
                  'linear-gradient(to right, var(--color-green-lighter), var(--color-surface))',
              }}
            >
              <div>
                <div
                  className="fw-bold"
                  style={{ color: 'var(--color-dark)' }}
                >
                  Tambah Transaksi
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>
                  {selectedPengawas.nama_lengkap}
                </div>
              </div>
            </div>

            <div className="p-3 p-md-4">
              <TransaksiFormPengawas
                pengawasId={selectedPengawasId}
              />
            </div>
          </div>
        );

        const riwayatCard = (
          <div className="card border-0 shadow-sm rounded-4">
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background:
                  'linear-gradient(to right, var(--color-surface), var(--color-green-lighter))',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FiClock />
                <div>
                  <div
                    className="fw-bold"
                    style={{ color: 'var(--color-dark)' }}
                  >
                    Riwayat Transaksi
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>
                    Histori transaksi {selectedPengawas.nama_lengkap}
                  </div>
                </div>
              </div>
            </div>

            <div className={isMobile ? 'p-2' : 'p-3'}>
              <RiwayatTransaksiPengawas
                pengawasId={selectedPengawasId}
              />
            </div>
          </div>
        );

        return (
          <div className="row g-4">
            <div className="col-12 col-xl-4">{formCard}</div>
            <div className="col-12 col-xl-8">{riwayatCard}</div>
          </div>
        );
      })()}
    </div>
  );
};

export default AddTransaksiPagePengawas;
