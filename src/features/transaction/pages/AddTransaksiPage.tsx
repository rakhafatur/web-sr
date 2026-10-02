import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiUsers,
  FiCreditCard,
  FiClock,
} from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';
import TransaksiForm from '../components/TransaksiForm';
import RiwayatTransaksi from '../components/RiwayatTransaksi';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import SearchableSelect from '../../../components/SearchableSelect';
import MobilePageBar from '../../../components/MobilePageBar';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';
import '../../../styles/mobile-admin.css';

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
  // ?tab=riwayat (mis. dari tombol "Lihat riwayat transaksi" di Buku Kuning).
  const [params] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'tambah' | 'riwayat'>(() =>
    params.get('tab') === 'riwayat' ? 'riwayat' : 'tambah'
  );

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
  // MainLayout). Desktop: tampilan lama di bawah. Form & riwayat tetap
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

  return (
    <div className="page-shell py-4 px-md-4 px-3">
      <FeaturePageHeader
        icon={<FiCreditCard />}
        title="Transaksi Ladies"
        description="Kelola transaksi harian"
      />

      {/* SELECT LADIES */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background: 'var(--color-surface-2)',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiUsers
              size={18}
              style={{ color: 'var(--color-green)' }}
            />

            <span
              className="fw-semibold"
              style={{ color: 'var(--color-dark)' }}
            >
              Pilih Ladies
            </span>
          </div>
        </div>

        <div className="p-4">
          <SearchableSelect
            value={selectedLadyId}
            onChange={(v) => {
              setSelectedLadyId(v);
              setActiveTab('tambah');
            }}
            options={opsiLadies}
            placeholder="-- Pilih Ladies --"
            searchPlaceholder="Cari nama ladies..."
            height={isMobile ? 50 : 58}
            borderRadius={isMobile ? 14 : 18}
            fontSize={isMobile ? '0.82rem' : '0.97rem'}
          />

          {/* EMPTY STATE */}
          {!selectedLadyId && !loading && (
            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: 'var(--color-warning)',
                border: '1px solid var(--color-warning-hover)',
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div style={{ fontSize: 24 }}>
                  ⚠️
                </div>

                <div>
                  <div className="fw-bold mb-1">
                    Ladies belum dipilih
                  </div>

                  <div
                    style={{
                      fontSize: '0.92rem',
                      color: 'var(--color-gray-500)',
                    }}
                  >
                    Pilih salah satu ladies untuk
                    menampilkan form transaksi dan
                    riwayat data.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pengecualian yang disengaja dari aturan "skeleton untuk daftar":
              ini status pilihan yang sedang dimuat untuk sebuah dropdown, bukan
              daftar isi halaman — skeleton baris justru menggambarkan tata letak
              yang tidak akan pernah muncul. */}
          {loading && (
            <div
              className="d-flex align-items-center gap-3 mt-3"
              style={{
                color: 'var(--color-gray-500)',
              }}
              role="status"
              aria-label="Mengambil data ladies"
            >
              <div className="spinner-border spinner-border-sm" />

              <span>Mengambil data ladies...</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {selectedLady && (() => {
        const formCard = (
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              overflow: 'hidden',
            }}
          >
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background:
                  'linear-gradient(to right, var(--color-green-lighter), var(--color-surface))',
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div
                    className="fw-bold"
                    style={{
                      color: 'var(--color-dark)',
                      fontSize: '1rem',
                    }}
                  >
                    Tambah Transaksi
                  </div>

                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-gray-500)',
                    }}
                  >
                    {selectedLady.nama_ladies}
                  </div>
                </div>

                <div
                  className="px-3 py-1 rounded-pill"
                  style={{
                    background: 'var(--color-income-soft)',
                    color: 'var(--color-income)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {selectedLady.nama_outlet}
                </div>
              </div>
            </div>

            <div className="p-3 p-md-4">
              <TransaksiForm
                ladiesId={selectedLadyId}
                outlet={selectedLady.nama_outlet}
              />
            </div>
          </div>
        );

        const riwayatCard = (
          <div
            className="card border-0 shadow-sm rounded-4"
            style={{
              overflow: 'hidden',
            }}
          >
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background:
                  'linear-gradient(to right, var(--color-surface), var(--color-green-lighter))',
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div
                    className="fw-bold d-flex align-items-center gap-2"
                    style={{
                      color: 'var(--color-dark)',
                    }}
                  >
                    <FiClock />
                    Riwayat Transaksi
                  </div>

                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-gray-500)',
                    }}
                  >
                    Histori transaksi terbaru {selectedLady.nama_ladies}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                isMobile ? 'p-2' : 'p-3'
              }
            >
              <RiwayatTransaksi
                ladiesId={selectedLadyId}
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

export default AddTransaksiPage;
