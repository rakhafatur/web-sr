import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../../lib/supabaseClient';
import TransaksiForm from '../components/TransaksiForm';
import RiwayatTransaksi from '../components/RiwayatTransaksi';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
};

const AddTransaksiPage = () => {
  const [ladiesList, setLadiesList] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');
  const [refresh, setRefresh] = useState<number>(0);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const selectedLady = ladiesList.find((l) => l.id === selectedLadyId);

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase.from('ladies').select('*');
      setLadiesList(data || []);
    };
    fetchLadies();
  }, []);

  return (
    <div
      className="container py-4"
      style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}
    >
      <h2 className="fw-bold fs-4 mb-4" style={{ color: 'var(--color-dark)' }}>
        📄 Transaksi Ladies
      </h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
            Pilih Ladies
          </label>
          <select
            className="form-select"
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-dark)',
              borderColor: 'var(--color-green)',
            }}
            value={selectedLadyId}
            onChange={(e) => setSelectedLadyId(e.target.value)}
          >
            <option value="">-- Pilih --</option>
            {ladiesList.map((lady) => (
              <option key={lady.id} value={lady.id}>
                {lady.nama_ladies} - {lady.nama_outlet} ({lady.pin})
              </option>
            ))}
          </select>

          {!selectedLadyId && (
            <div
              className="alert alert-warning text-dark bg-warning-subtle border-warning mt-2"
              style={{ fontSize: '0.95rem' }}
            >
              ⚠️ Silakan pilih ladies terlebih dahulu.
            </div>
          )}
        </div>
      </div>

      {selectedLady && (
        <>
          {/* ✏️ FORM TAMBAH */}
          <div className={isMobile ? 'mobile-outline-green mb-5' : 'mb-5'}>
            <h5 className="mb-3" style={{ color: 'var(--color-dark)' }}>
              📌 Transaksi {selectedLady.nama_ladies} ({selectedLady.nama_outlet})
            </h5>
            <TransaksiForm
              ladiesId={selectedLadyId}
              onSuccess={() => setRefresh((r) => r + 1)}
            />
          </div>

          {/* 📜 RIWAYAT */}
          <div className={isMobile ? 'mobile-outline-green mt-4' : 'mt-4'}>
            <h5 className="mb-3" style={{ color: 'var(--color-dark)' }}>
              📋 Riwayat transaksi {selectedLady.nama_ladies} ({selectedLady.nama_outlet})
            </h5>
            <RiwayatTransaksi ladiesId={selectedLadyId} refresh={refresh} />
          </div>
        </>
      )}
    </div>
  );
};

export default AddTransaksiPage;