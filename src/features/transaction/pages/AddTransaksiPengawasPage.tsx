import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../../lib/supabaseClient';
import TransaksiForm from '../components/TransaksiFormPengawas';
import RiwayatTransaksi from '../components/RiwayatTransaksiPengawas';

type Pengawas = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
};

const AddTransaksiPagePengawas = () => {
  const [pengawasList, setPengawasList] = useState<Pengawas[]>([]);
  const [selectedPengawasId, setSelectedPengawasId] = useState('');
  const [refresh, setRefresh] = useState<number>(0);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const selectedPengawas = pengawasList.find((p) => p.id === selectedPengawasId);

  useEffect(() => {
    const fetchPengawas = async () => {
      const { data } = await supabase.from('pengawas').select('*');
      setPengawasList(data || []);
    };
    fetchPengawas();
  }, []);

  return (
    <div
      className="container py-4"
      style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}
    >
      <h2 className="fw-bold fs-4 mb-4" style={{ color: 'var(--color-dark)' }}>
        📄 Transaksi Pengawas
      </h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
            Pilih Pengawas
          </label>
          <select
            className="form-select"
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-dark)',
              borderColor: 'var(--color-green)',
            }}
            value={selectedPengawasId}
            onChange={(e) => setSelectedPengawasId(e.target.value)}
          >
            <option value="">-- Pilih --</option>
            {pengawasList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_lengkap} {p.nama_panggilan ? `(${p.nama_panggilan})` : ''}
              </option>
            ))}
          </select>

          {!selectedPengawasId && (
            <div
              className="alert alert-warning text-dark bg-warning-subtle border-warning mt-2"
              style={{ fontSize: '0.95rem' }}
            >
              ⚠️ Silakan pilih pengawas terlebih dahulu.
            </div>
          )}
        </div>
      </div>

      {selectedPengawas && (
        <>
          {/* ✏️ FORM TAMBAH */}
          <div className={isMobile ? 'mobile-outline-green mb-5' : 'mb-5'}>
            {!isMobile && (
              <h5 className="mb-3" style={{ color: 'var(--color-dark)' }}>
                📌 Transaksi {selectedPengawas.nama_lengkap}
              </h5>
            )}
            <TransaksiForm
              pengawasId={selectedPengawasId}
              onSuccess={() => setRefresh((r) => r + 1)}
              allowedTypes={['kasbon', 'pemasukan_lain']}
            />
          </div>

          {/* 📜 RIWAYAT */}
          <div className={isMobile ? 'mobile-outline-green mt-4' : 'mt-4'}>
            {!isMobile && (
              <h5 className="mb-3" style={{ color: 'var(--color-dark)' }}>
                📋 Riwayat transaksi {selectedPengawas.nama_lengkap}
              </h5>
            )}
            <RiwayatTransaksi pengawasId={selectedPengawasId} refresh={refresh} />
          </div>
        </>
      )}
    </div>
  );
};

export default AddTransaksiPagePengawas;