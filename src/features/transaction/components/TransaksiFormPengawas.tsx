import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../../lib/supabaseClient';
import FormField from '../../../components/FormField';

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
      return alert('🛑 Harap isi tanggal dan jumlah.');
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
      alert('❌ Gagal menambahkan transaksi: ' + error.message);
    } else {
      alert('✅ Transaksi berhasil ditambahkan!');

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
      color: '#dc2626',
      bg: '#fee2e2',
    },
    {
      value: 'gaji_pengawas',
      label: 'Gaji',
      icon: <FiTrendingUp />,
      color: '#16a34a',
      bg: '#dcfce7',
    },
    {
      value: 'lainnya_pengawas',
      label: 'Lainnya',
      icon: <FiFileText />,
      color: '#2563eb',
      bg: '#dbeafe',
    },
  ];

  return (
    <div
      style={{
        paddingBottom: isMobile ? 90 : 0,
      }}
    >
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
                  background: active ? item.bg : '#fff',
                  border: active
                    ? `1.5px solid ${item.color}`
                    : '1px solid #eee',
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

      {/* DESKTOP BUTTON */}
      {!isMobile && (
        <div className="mt-4">
          <button
            className="btn w-100 border-0"
            style={{
              background:
                'linear-gradient(135deg, var(--color-green), #65d68d)',
              color: '#fff',
              borderRadius: 18,
              height: 56,
              fontWeight: 700,
              fontSize: '1rem',
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <FiPlus className="me-2" />
                Tambah Transaksi
              </>
            )}
          </button>
        </div>
      )}

      {/* MOBILE STICKY BUTTON */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            padding: '12px 16px',
            borderTop: '1px solid #eee',
            zIndex: 999,
          }}
        >
          <button
            className="btn w-100 border-0"
            style={{
              background:
                'linear-gradient(135deg, var(--color-green), #65d68d)',
              color: '#fff',
              borderRadius: 14,
              height: 48,
              fontWeight: 700,
              fontSize: '0.92rem',
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <FiPlus className="me-2" />
                Tambah Transaksi
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransaksiFormPengawas;