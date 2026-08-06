import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../../lib/supabaseClient';

import TransaksiFormPengawas from '../components/TransaksiFormPengawas';
import RiwayatTransaksiPengawas from '../components/RiwayatTransaksiPengawas';
import FeaturePageHeader from '../../../components/FeaturePageHeader';
import SearchableSelect from '../../../components/SearchableSelect';

import { FiUsers, FiCreditCard, FiClock, FiLoader } from 'react-icons/fi';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  status: string;
};

const AddTransaksiPagePengawas = () => {
  const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
  const [selectedPengawasId, setSelectedPengawasId] = useState('');
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
            options={pengawasList.map((p) => ({
              value: p.id,
              label: `${p.nama_lengkap}${p.nama_panggilan ? ` (${p.nama_panggilan})` : ''}`,
            }))}
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
                <div style={{ fontSize: 24 }}>⚠️</div>

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
          {loading && (
            <div
              className="d-flex justify-content-center mt-3"
              role="status"
              aria-label="Memuat data pengawas"
            >
              <FiLoader size={20} className="spinner-icon" />
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

        if (!isMobile) {
          return (
            <div className="row g-4">
              <div className="col-12 col-xl-4">{formCard}</div>
              <div className="col-12 col-xl-8">{riwayatCard}</div>
            </div>
          );
        }

        return (
          <>
            {/* TAB SWITCHER */}
            <div className="d-flex gap-2 mb-3">
              {[
                { key: 'tambah' as const, label: 'Tambah Transaksi' },
                { key: 'riwayat' as const, label: 'Riwayat' },
              ].map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="flex-fill tap-scale"
                    style={{
                      border: 'none',
                      borderRadius: 999,
                      padding: '10px 12px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      background: active
                        ? 'var(--color-green)'
                        : 'var(--color-surface)',
                      color: active
                        ? '#fff'
                        : 'var(--color-gray-700)',
                      boxShadow: active
                        ? 'var(--shadow-brand)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'tambah' ? formCard : riwayatCard}
          </>
        );
      })()}
    </div>
  );
};

export default AddTransaksiPagePengawas;
