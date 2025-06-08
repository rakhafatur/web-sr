import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import FormInput from '../../../components/FormInput';

type Props = {
  pengawasId: string;
  onSuccess?: () => void;
  allowedTypes?: string[]; // ✅ Tambahkan prop allowedTypes
};

const TransaksiFormPengawas = ({ pengawasId, onSuccess, allowedTypes = ['kasbon', 'pemasukan_lain'] }: Props) => {
  const [form, setForm] = useState({
    tanggal: '',
    jumlah: '',
    keterangan: '',
    tipe: allowedTypes[0] || 'kasbon', // ✅ Default tipe pertama dari allowedTypes
  });

  useEffect(() => {
    // Jika allowedTypes berubah, pastikan form.tipe tetap valid
    if (!allowedTypes.includes(form.tipe)) {
      setForm((prev) => ({ ...prev, tipe: allowedTypes[0] || 'kasbon' }));
    }
  }, [allowedTypes]);

  const formatNumber = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const unformatNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'jumlah') {
      const raw = unformatNumber(value);
      setForm((prev) => ({ ...prev, [name]: formatNumber(raw) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.tanggal || !form.jumlah) {
      return alert('🛑 Harap isi tanggal dan jumlah.');
    }

    const table = form.tipe;
    const payload: any = {
      tanggal: form.tanggal,
      pengawas_id: pengawasId,
      jumlah: parseFloat(unformatNumber(form.jumlah)),
    };

    if (form.keterangan) {
      payload.keterangan = form.keterangan;
    }

    const { error } = await supabase.from(table).insert(payload);

    if (error) {
      alert('❌ Gagal menambahkan transaksi: ' + error.message);
    } else {
      alert('✅ Transaksi berhasil ditambahkan!');
      setForm({
        tanggal: '',
        jumlah: '',
        keterangan: '',
        tipe: allowedTypes[0] || 'kasbon',
      });
      onSuccess?.();
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-12 col-md-6">
          <label
            className="form-label fw-semibold"
            style={{ color: 'var(--color-dark)' }}
          >
            Tipe Transaksi
          </label>
          <select
            name="tipe"
            value={form.tipe}
            onChange={handleChange}
            className="form-select"
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-dark)',
              borderColor: 'var(--color-green)',
              marginBottom: '1rem',
            }}
          >
            {allowedTypes.includes('pemasukan_lain') && (
              <option value="pemasukan_lain">Pemasukan Lain</option>
            )}
            {allowedTypes.includes('kasbon') && (
              <option value="kasbon">Pengeluaran (Kasbon)</option>
            )}
            {allowedTypes.includes('voucher') && (
              <option value="voucher">Pemasukan (Voucher)</option>
            )}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <FormInput
            label="Tanggal"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            type="date"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <FormInput
            label="Keterangan"
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            type="text"
          />
        </div>
        <div className="col-12 col-md-6">
          <FormInput
            label="Jumlah"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            type="text"
          />
        </div>
      </div>

      <div className="text-start">
        <button
          className="btn btn-success mt-2 px-4"
          style={{ backgroundColor: 'var(--color-green)', borderColor: 'var(--color-green)' }}
          onClick={handleSubmit}
        >
          Tambah
        </button>
      </div>
    </div>
  );
};

export default TransaksiFormPengawas;