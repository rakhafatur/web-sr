import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  FiUsers,
  FiChevronDown,
  FiCreditCard,
  FiClock,
} from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';
import TransaksiForm from '../components/TransaksiForm';
import RiwayatTransaksi from '../components/RiwayatTransaksi';

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
  const [refresh, setRefresh] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
    <div
      className="container-fluid py-4 px-md-4 px-3"
      style={{
        background:
          'linear-gradient(to bottom, #f7fff9 0%, #ffffff 100%)',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, var(--color-green), #7be0a9)',
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
            <h2 className="fw-bold mb-1">
              Transaksi Ladies
            </h2>

            <div
              style={{
                opacity: 0.9,
                fontSize: '0.95rem',
              }}
            >
              Kelola transaksi voucher & kasbon dengan
              tampilan lebih modern
            </div>
          </div>
        </div>
      </div>

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
            background: '#fafafa',
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
          <div
            style={{
              position: 'relative',
            }}
          >
            <select
              className="form-select shadow-none"
              value={selectedLadyId}
              onChange={(e) =>
                setSelectedLadyId(e.target.value)
              }
              style={{
                height: 58,
                borderRadius: 18,
                border: '2px solid #d8f3df',
                paddingLeft: 18,
                paddingRight: 48,
                fontWeight: 600,
                fontSize: '0.97rem',
                backgroundColor: '#fff',
                color: 'var(--color-dark)',
                appearance: 'none',
              }}
            >
              <option value="">
                -- Pilih Ladies --
              </option>

              {ladiesList.map((lady) => (
                <option
                  key={lady.id}
                  value={lady.id}
                >
                  {lady.nama_ladies} •{' '}
                  {lady.nama_outlet} ({lady.pin})
                </option>
              ))}
            </select>

            <FiChevronDown
              size={20}
              style={{
                position: 'absolute',
                top: '50%',
                right: 18,
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#666',
              }}
            />
          </div>

          {/* EMPTY STATE */}
          {!selectedLadyId && !loading && (
            <div
              className="mt-4 p-4 rounded-4"
              style={{
                background: '#fff8e7',
                border: '1px solid #ffe2a8',
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
                      color: '#666',
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
                color: '#666',
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
      {selectedLady && (
        <div className="row g-4">
          {/* FORM */}
          <div className="col-12 col-xl-4">
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
                    'linear-gradient(to right, #effff4, #ffffff)',
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
                        color: '#666',
                      }}
                    >
                      {selectedLady.nama_ladies}
                    </div>
                  </div>

                  <div
                    className="px-3 py-1 rounded-pill"
                    style={{
                      background: '#dff7e7',
                      color: '#159947',
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
                  onSuccess={() =>
                    setRefresh((r) => r + 1)
                  }
                />
              </div>
            </div>
          </div>

          {/* RIWAYAT */}
          <div className="col-12 col-xl-8">
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
                    'linear-gradient(to right, #ffffff, #f5fff8)',
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
                        color: '#666',
                      }}
                    >
                      Histori transaksi terbaru
                    </div>
                  </div>

                  <div
                    className="px-3 py-2 rounded-pill"
                    style={{
                      background: '#f4f4f4',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#444',
                    }}
                  >
                    PIN: {selectedLady.pin}
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

export default AddTransaksiPage;