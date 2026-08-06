import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
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

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

const AddTransaksiPage = () => {
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');
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
            options={ladiesList.map((lady) => ({
              value: lady.id,
              label: `${lady.nama_ladies} • ${lady.nama_outlet} (${lady.pin})`,
            }))}
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

          {/* LOADING */}
          {loading && (
            <div
              className="d-flex align-items-center gap-3 mt-3"
              style={{
                color: 'var(--color-gray-500)',
              }}
            >
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />

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

export default AddTransaksiPage;
