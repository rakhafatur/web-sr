import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import FormInput from '../../../components/FormInput';
import {
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiGift,
  FiPlusCircle,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';

type Props = {
  ladiesId: string;
  onSuccess?: () => void;
};

const TransaksiForm = ({
  ladiesId,
  onSuccess,
}: Props) => {
  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    tanggal: '',
    jumlah: '',
    jumlah_voucher: '',
    keterangan: '',
    tipe: 'voucher',
  });

  const formatNumber = (
    value: string
  ) => {
    const number = value.replace(
      /[^\d]/g,
      ''
    );

    return number.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      '.'
    );
  };

  const unformatNumber = (
    value: string
  ) => {
    return value.replace(/\./g, '');
  };

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      name === 'jumlah' ||
      name === 'jumlah_voucher'
    ) {
      const raw =
        unformatNumber(value);

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
    if (
      !form.tanggal ||
      (!form.jumlah &&
        !form.jumlah_voucher)
    ) {
      return alert(
        '🛑 Harap isi tanggal dan jumlah.'
      );
    }

    setLoading(true);

    const table =
      form.tipe === 'voucher'
        ? 'vouchers'
        : form.tipe;

    const payload: any = {
      tanggal: form.tanggal,
      ladies_id: ladiesId,
    };

    if (form.tipe === 'voucher') {
      const jumlahVoucher =
        parseFloat(
          unformatNumber(
            form.jumlah_voucher
          )
        );

      const jumlah =
        jumlahVoucher * 150000;

      payload.jumlah_voucher =
        jumlahVoucher;

      payload.jumlah = jumlah;
    } else {
      payload.jumlah = parseFloat(
        unformatNumber(form.jumlah)
      );

      payload.keterangan =
        form.keterangan;
    }

    const { error } =
      await supabase
        .from(table)
        .insert(payload);

    setLoading(false);

    if (error) {
      alert(
        '❌ Gagal menambahkan transaksi: ' +
          error.message
      );
    } else {
      alert(
        '✅ Transaksi berhasil ditambahkan!'
      );

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

  const jumlahVoucherRaw =
    parseInt(
      unformatNumber(
        form.jumlah_voucher || '0'
      )
    );

  const totalJumlah = isNaN(
    jumlahVoucherRaw
  )
    ? 0
    : jumlahVoucherRaw * 150000;

  const transactionTypes = [
    {
      value: 'voucher',
      label: 'Voucher',
      icon: <FiGift />,
      color: '#16a34a',
      bg: '#dcfce7',
    },

    {
      value: 'pemasukan_lain',
      label: 'Pemasukan Lain',
      icon: <FiTrendingUp />,
      color: '#ca8a04',
      bg: '#fef9c3',
    },

    {
      value: 'kasbon',
      label: 'Kasbon',
      icon: <FiTrendingDown />,
      color: '#dc2626',
      bg: '#fee2e2',
    },

    {
      value: 'dokter',
      label: 'Dokter',
      icon: <FiFileText />,
      color: '#2563eb',
      bg: '#dbeafe',
    },
  ];

  const selectedType =
    transactionTypes.find(
      (t) => t.value === form.tipe
    );

  return (
    <div>
      {/* TYPE SELECT */}
      <div className="mb-4">
        <label
          className="fw-semibold mb-3 d-block"
          style={{
            color:
              'var(--color-dark)',
          }}
        >
          Jenis Transaksi
        </label>

        <div className="row g-3">
          {transactionTypes.map(
            (item) => {
              const active =
                form.tipe ===
                item.value;

              return (
                <div
                  key={item.value}
                  className="col-6"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        tipe:
                          item.value,
                      })
                    }
                    className="w-100 border-0"
                    style={{
                      borderRadius: 20,
                      padding:
                        '16px 14px',
                      background:
                        active
                          ? item.bg
                          : '#fff',
                      border: active
                        ? `2px solid ${item.color}`
                        : '2px solid #eee',
                      transition:
                        'all 0.2s ease',
                      boxShadow:
                        active
                          ? `0 8px 20px ${item.bg}`
                          : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      className="d-flex flex-column align-items-center justify-content-center"
                      style={{
                        color:
                          item.color,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          marginBottom: 8,
                        }}
                      >
                        {item.icon}
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize:
                            '0.9rem',
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  </button>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* HEADER INFO */}
      <div
        className="mb-4 p-3 rounded-4"
        style={{
          background:
            selectedType?.bg,
          border: `1px solid ${selectedType?.color}20`,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background:
                selectedType?.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
              fontSize: 22,
            }}
          >
            {selectedType?.icon}
          </div>

          <div>
            <div
              className="fw-bold"
              style={{
                color:
                  selectedType?.color,
              }}
            >
              {
                selectedType?.label
              }
            </div>

            <div
              style={{
                fontSize: '0.85rem',
                color: '#666',
              }}
            >
              Isi detail transaksi
              dengan lengkap
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="row g-3">
        {/* DATE */}
        <div className="col-12">
          <div
            className="p-3 rounded-4"
            style={{
              background: '#fafafa',
              border:
                '1px solid #eee',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <FiCalendar
                color="#666"
              />

              <label
                className="fw-semibold mb-0"
                style={{
                  color:
                    'var(--color-dark)',
                }}
              >
                Tanggal
              </label>
            </div>

            <FormInput
              label=""
              name="tanggal"
              value={form.tanggal}
              onChange={
                handleChange
              }
              type="date"
            />
          </div>
        </div>

        {/* VOUCHER */}
        {form.tipe ===
        'voucher' ? (
          <>
            <div className="col-12">
              <div
                className="p-3 rounded-4"
                style={{
                  background:
                    '#fafafa',
                  border:
                    '1px solid #eee',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FiGift
                    color="#16a34a"
                  />

                  <label
                    className="fw-semibold mb-0"
                  >
                    Jumlah Voucher
                  </label>
                </div>

                <FormInput
                  label=""
                  name="jumlah_voucher"
                  value={
                    form.jumlah_voucher
                  }
                  onChange={
                    handleChange
                  }
                  type="text"
                />
              </div>
            </div>

            <div className="col-12">
              <div
                className="p-4 rounded-4"
                style={{
                  background:
                    'linear-gradient(135deg, #dcfce7, #f0fdf4)',
                  border:
                    '1px solid #bbf7d0',
                }}
              >
                <div
                  style={{
                    fontSize:
                      '0.85rem',
                    color: '#166534',
                    marginBottom: 6,
                  }}
                >
                  Total Pemasukan
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize:
                      '1.8rem',
                    color: '#15803d',
                  }}
                >
                  Rp
                  {formatNumber(
                    totalJumlah.toString()
                  )}
                </div>

                <div
                  style={{
                    fontSize:
                      '0.82rem',
                    color: '#166534',
                    marginTop: 6,
                  }}
                >
                  {jumlahVoucherRaw ||
                    0}{' '}
                  voucher × Rp150.000
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* KETERANGAN */}
            <div className="col-12">
              <div
                className="p-3 rounded-4"
                style={{
                  background:
                    '#fafafa',
                  border:
                    '1px solid #eee',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FiFileText
                    color="#666"
                  />

                  <label className="fw-semibold mb-0">
                    Keterangan
                  </label>
                </div>

                <FormInput
                  label=""
                  name="keterangan"
                  value={
                    form.keterangan
                  }
                  onChange={
                    handleChange
                  }
                  type="text"
                />
              </div>
            </div>

            {/* JUMLAH */}
            <div className="col-12">
              <div
                className="p-3 rounded-4"
                style={{
                  background:
                    '#fafafa',
                  border:
                    '1px solid #eee',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FiDollarSign
                    color="#666"
                  />

                  <label className="fw-semibold mb-0">
                    Jumlah
                  </label>
                </div>

                <FormInput
                  label=""
                  name="jumlah"
                  value={form.jumlah}
                  onChange={
                    handleChange
                  }
                  type="text"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* BUTTON */}
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
            boxShadow:
              '0 10px 24px rgba(34,197,94,0.25)',
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          <div className="d-flex align-items-center justify-content-center gap-2">
            {loading ? (
              <>
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <FiPlusCircle
                  size={18}
                />
                Tambah Transaksi
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default TransaksiForm;