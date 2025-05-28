import { useState, useEffect } from 'react';
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

  const selectedLady = ladiesList.find((l) => l.id === selectedLadyId);

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase.from('ladies').select('*');
      setLadiesList(data || []);
    };
    fetchLadies();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold fs-4 mb-4">📄 Transaksi Voucher & Kasbon</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label text-light">Pilih Ladies</label>
          <select
            className="form-select bg-dark text-light"
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
        </div>
      </div>

      {selectedLady && (
        <>
          {/* ✏️ FORM TAMBAH */}
          <div className="border p-3 mb-5" style={{ backgroundColor: '#1e1e2f' }}>
            <h5 className="text-light mb-3">📌 Transaksi untuk {selectedLady.nama_ladies} ({selectedLady.nama_outlet})</h5>
            <TransaksiForm
              ladiesId={selectedLadyId}
              onSuccess={() => setRefresh((r) => r + 1)}
            />
          </div>

          {/* 📜 RIWAYAT */}
          <div className="border p-3" style={{ backgroundColor: '#1e1e2f' }}>
            <h5 className="text-light mb-3">📋 Riwayat transaksi untuk {selectedLady.nama_ladies} ({selectedLady.nama_outlet})</h5>
            <RiwayatTransaksi ladiesId={selectedLadyId} refresh={refresh} />
          </div>
        </>
      )}
    </div>
  );
};

export default AddTransaksiPage;