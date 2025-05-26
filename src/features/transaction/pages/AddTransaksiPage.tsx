import { useState, useEffect } from 'react';
import TransaksiForm from '../components/TransaksiForm';
import RiwayatTransaksi from '../components/RiwayatTransaksi';
import { supabase } from '../../../lib/supabaseClient';
import Select from 'react-select';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
};

const AddTransaksiPage = () => {
  const [ladies, setLadies] = useState<Lady[]>([]);
  const [selectedLady, setSelectedLady] = useState<Lady | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // 🔁 trigger refresh

  useEffect(() => {
    const fetchLadies = async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin');

      if (error) {
        console.error('❌ Gagal ambil ladies:', error);
      } else {
        setLadies(data || []);
      }
    };

    fetchLadies();
  }, []);

  const options = ladies.map((l) => ({
    value: l.id,
    label: `${l.nama_ladies} - ${l.nama_outlet} - ${l.pin}`,
  }));

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#212529',
      borderColor: '#6c757d',
      color: 'white',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#212529',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#343a40' : '#212529',
      color: 'white',
      cursor: 'pointer',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'white',
    }),
  };

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold fs-4 mb-3">📋 Transaksi Voucher & Kasbon</h2>

      <div className="mb-4">
        <label className="form-label text-light fw-semibold">Pilih Ladies</label>
        <Select
          options={options}
          onChange={(e) => {
            const selected = ladies.find((l) => l.id === e?.value);
            setSelectedLady(selected || null);
          }}
          className="text-dark"
          placeholder="Cari dan pilih ladies..."
          isSearchable
          styles={customStyles}
        />
      </div>

      {selectedLady && (
        <>
          <div className="mb-3">
            <h5 className="text-light fw-semibold">
              📌 Transaksi untuk {selectedLady.nama_ladies} ({selectedLady.nama_outlet})
            </h5>
          </div>

          <div className="card bg-dark text-light border-secondary mb-4">
            <div className="card-body">
              <TransaksiForm
                ladiesId={selectedLady.id}
                onSuccess={() => setRefreshKey((prev) => prev + 1)} // ✅ Trigger refresh
              />
            </div>
          </div>

          <div className="mb-3">
            <h5 className="text-light fw-semibold">
              Riwayat transaksi untuk {selectedLady.nama_ladies} ({selectedLady.nama_outlet})
            </h5>
          </div>

          <div className="card bg-dark text-light border-secondary">
            <div className="card-body">
              <RiwayatTransaksi
                ladiesId={selectedLady.id}
                refresh={refreshKey} // ✅ Trigger useEffect saat transaksi baru
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddTransaksiPage;