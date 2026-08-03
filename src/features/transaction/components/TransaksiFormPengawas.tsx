import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';

import {
  FiTrendingDown,
  FiTrendingUp,
  FiFileText,
  FiPlus,
} from 'react-icons/fi';

type Props = {
  pengawasId: string;
  onSuccess?: () => void;
};

const TransaksiFormPengawas = ({
  pengawasId,
  onSuccess,
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tanggal: '',
    jumlah: '',
    keterangan: '',
    tipe: 'kasbon_pengawas',
  });

  const formatNumber = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const unformatNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'jumlah') {
      const raw = unformatNumber(value);
      setForm((prev) => ({
        ...prev,
        [name]: formatNumber(raw),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!form.tanggal || !form.jumlah) {
      toast.error('Harap isi tanggal dan jumlah.');
      return;
    }

    setLoading(true);

    const table = form.tipe;

    const payload: any = {
      tanggal: form.tanggal,
      pengawas_id: pengawasId,
      jumlah: parseFloat(unformatNumber(form.jumlah)),
    };

    if (form.keterangan) {
      payload.keterangan = form.keterangan;
    }

    const { error } = await supabase
      .from(table)
      .insert(payload);

    setLoading(false);

    if (error) {
      toast.error('Gagal menambahkan transaksi: ' + error.message);
    } else {
      toast.success('Transaksi berhasil ditambahkan!');

      setForm({
        tanggal: '',
        jumlah: '',
        keterangan: '',
        tipe: 'kasbon_pengawas',
      });

      onSuccess?.();
    }
  };

  const transactionTypes = [
    {
      value: 'kasbon_pengawas',
      label: 'Kasbon',
      icon: <FiTrendingDown />,
      color: 'var(--color-expense)',
      bg: 'var(--color-expense-soft)',
    },
    {
      value: 'gaji_pengawas',
      label: 'Gaji',
      icon: <FiTrendingUp />,
      color: 'var(--color-income)',
      bg: 'var(--color-income-soft)',
    },
    {
      value: 'lainnya_pengawas',
      label: 'Lainnya',
      icon: <FiFileText />,
      color: 'var(--color-medical)',
      bg: 'var(--color-medical-soft)',
    },
  ];

  return (
    <div>
      {/* TYPE SELECT (CARD STYLE LIKE LADIES) */}
      <div className={`row ${isMobile ? 'g-2' : 'g-3'} mb-3`}>
        {transactionTypes.map((item) => {
          const active = form.tipe === item.value;

          return (
            <div key={item.value} className="col-4">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    tipe: item.value,
                  }))
                }
                className="w-100 border-0"
                style={{
                  borderRadius: isMobile ? 12 : 20,
                  padding: isMobile ? '10px 8px' : '16px 14px',
                  background: active ? item.bg : 'var(--color-surface)',
                  border: active
                    ? `1.5px solid ${item.color}`
                    : '1px solid var(--color-gray-200)',
                  minHeight: isMobile ? 70 : 90,
                  boxShadow: active
                    ? `0 4px 12px ${item.bg}`
                    : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="d-flex flex-column align-items-center"
                  style={{ color: item.color }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? 16 : 22,
                      marginBottom: isMobile ? 4 : 8,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: isMobile ? '0.75rem' : '0.9rem',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* FORM */}
      <div className={`row ${isMobile ? 'g-2' : 'g-3'}`}>
        {/* TANGGAL */}
        <div className="col-12">
          <FormField
            label="Tanggal"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            type="date"
          />
        </div>

        {/* KETERANGAN */}
        <div className="col-12">
          <FormField
            label="Keterangan"
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            type="text"
          />
        </div>

        {/* JUMLAH */}
        <div className="col-12">
          <FormField
            label="Jumlah"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            type="text"
          />
        </div>
      </div>

      {/* BUTTON */}
      <div className="mt-4">
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          icon={loading ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus />}
        >
          {loading ? 'Menyimpan...' : 'Tambah Transaksi'}
        </Button>
      </div>
    </div>
  );
};

export default TransaksiFormPengawas;