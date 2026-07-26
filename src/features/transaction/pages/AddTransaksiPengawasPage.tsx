import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../../lib/supabaseClient';

import TransaksiFormPengawas from '../components/TransaksiFormPengawas';
import RiwayatTransaksiPengawas from '../components/RiwayatTransaksiPengawas';

import { FiUsers, FiCreditCard, FiClock } from 'react-icons/fi';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  status: string;
};

const AddTransaksiPagePengawas = () => {
  const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
  const [selectedPengawasId, setSelectedPengawasId] = useState('');
  const [refresh, setRefresh] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
          color: 'white',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              backdropFilter: 'blur(8px)',
            }}
          >
            <FiCreditCard />
          </div>

          <div>
            <h2
              className="fw-semibold mb-0"
              style={{
                fontSize: isMobile ? '1rem' : '1.8rem',
                lineHeight: 1.2,
              }}
            >
              Transaksi Pengawas
            </h2>

            <div
              style={{
                opacity: 0.75,
                fontSize: isMobile ? '0.72rem' : '0.92rem',
                marginTop: 2,
              }}
            >
              Kelola transaksi pengawas harian
            </div>
          </div>
        </div>
      </div>

      {/* SELECT PENGAWAS */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{ overflow: 'hidden' }}
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
          <select
            className="form-select shadow-none"
            value={selectedPengawasId}
            onChange={(e) => setSelectedPengawasId(e.target.value)}
            style={{
              height: isMobile ? 50 : 58,
              borderRadius: isMobile ? 14 : 18,
              border: '2px solid var(--color-green-light)',
              fontWeight: 600,
              fontSize: isMobile ? '0.82rem' : '0.97rem',

              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-dark)',

              paddingLeft: isMobile ? 14 : 18,
              paddingRight: isMobile ? 40 : 48,

              appearance: 'none',
            }}
          >
            <option value="">-- Pilih Pengawas --</option>

            {pengawasList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_lengkap}
                {p.nama_panggilan ? ` (${p.nama_panggilan})` : ''}
              </option>
            ))}
          </select>

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
              className="d-flex align-items-center gap-2 mt-3"
              style={{ color: 'var(--color-gray-500)' }}
            >
              <div className="spinner-border spinner-border-sm" />
              <span>Memuat data pengawas...</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {selectedPengawas && (
        <div className="row g-4">
          {/* FORM */}
          <div className="col-12 col-xl-4">
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
                  onSuccess={() => setRefresh((r) => r + 1)}
                />
              </div>
            </div>
          </div>

          {/* RIWAYAT */}
          <div className="col-12 col-xl-8">
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
                  refresh={refresh}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTransaksiPagePengawas;