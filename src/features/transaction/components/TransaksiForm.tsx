import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import FormInput from '../../../components/FormInput';

type Props = {
  ladiesId: string;
  onSuccess?: () => void;
};

const TransaksiForm = ({ ladiesId, onSuccess }: Props) => {
  const [form, setForm] = useState({
    tanggal: '',
    jumlah: '',
    jumlah_voucher: '',
    keterangan: '',
    tipe: 'voucher',
  });

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

    if (name === 'jumlah' || name === 'jumlah_voucher') {
      const raw = unformatNumber(value);
      setForm((prev) => ({ ...prev, [name]: formatNumber(raw) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.tanggal || (!form.jumlah && !form.jumlah_voucher)) {
      return alert('🛑 Harap isi tanggal dan jumlah.');
    }

    const table = form.tipe === 'voucher' ? 'vouchers' : form.tipe;

    const payload: any = {
      tanggal: form.tanggal,
      ladies_id: ladiesId,
    };

    if (form.tipe === 'voucher') {
      const jumlahVoucher = parseFloat(unformatNumber(form.jumlah_voucher));
      const jumlah = jumlahVoucher * 150000;

      payload.jumlah_voucher = jumlahVoucher;
      payload.jumlah = jumlah;
    } else {
      payload.jumlah = parseFloat(unformatNumber(form.jumlah));
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
        jumlah_voucher: '',
        keterangan: '',
        tipe: 'voucher',
      });
      onSuccess?.();
    }
  };

  const jumlahVoucherRaw = parseInt(unformatNumber(form.jumlah_voucher || '0'));
  const totalJumlah = isNaN(jumlahVoucherRaw) ? 0 : jumlahVoucherRaw * 150000;

  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          <label className="form-label fw-semibold text-light">Tipe Transaksi</label>
          <select
            name="tipe"
            value={form.tipe}
            onChange={handleChange}
            className="form-select bg-dark text-light border-secondary mb-3"
          >
            <option value="voucher">Pemasukan (Voucher)</option>
            <option value="pemasukan_lain">Pemasukan Lain</option>
            <option value="kasbon">Pengeluaran (Kasbon)</option>
          </select>
        </div>
        <div className="col-md-6">
          <FormInput
            label="Tanggal"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            type="date"
          />
        </div>
      </div>

      {form.tipe === 'voucher' ? (
        <div className="row">
          <div className="col-md-6">
            <FormInput
              label="Jumlah Voucher"
              name="jumlah_voucher"
              value={form.jumlah_voucher}
              onChange={handleChange}
              type="number"
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Jumlah (Rp)"
              name="jumlah"
              value={formatNumber(totalJumlah.toString())}
              onChange={() => {}}
              type="text"
              readOnly
            />
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-6">
            <FormInput
              label="Keterangan"
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              type="text"
            />
          </div>
          <div className="col-md-6">
            <FormInput
              label="Jumlah"
              name="jumlah"
              value={form.jumlah}
              onChange={handleChange}
              type="text"
            />
          </div>
        </div>
      )}

      <div className="text-end">
        <button className="btn btn-success mt-2 px-4" onClick={handleSubmit}>
          Tambah
        </button>
      </div>
    </div>
  );
};

export default TransaksiForm;
