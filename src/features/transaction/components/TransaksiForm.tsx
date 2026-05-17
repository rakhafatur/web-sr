import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../../lib/supabaseClient';
import FormInput from '../../../components/FormInput';
import {
  FiGift,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiPlus,
} from 'react-icons/fi';

type Props = {
  ladiesId: string;
  onSuccess?: () => void;
};

const TransaksiForm = ({
  ladiesId,
  onSuccess,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

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
      label: 'Pemasukan',
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

  return (
    <div
      style={{
        paddingBottom: isMobile
          ? 90
          : 0,
      }}
    >
      {/* MOBILE TYPE SELECT */}
      <div
        className={`row ${
          isMobile ? 'g-2' : 'g-3'
        } mb-3`}
      >
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
                    borderRadius:
                      isMobile
                        ? 12
                        : 20,

                    padding:
                      isMobile
                        ? '10px 8px'
                        : '16px 14px',

                    background:
                      active
                        ? item.bg
                        : '#fff',

                    border: active
                      ? `1.5px solid ${item.color}`
                      : '1px solid #eee',

                    transition:
                      'all 0.2s ease',

                    minHeight:
                      isMobile
                        ? 70
                        : 100,

                    boxShadow:
                      active
                        ? `0 4px 12px ${item.bg}`
                        : '0 1px 4px rgba(0,0,0,0.04)',
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
                        fontSize:
                          isMobile
                            ? 16
                            : 24,

                        marginBottom:
                          isMobile
                            ? 4
                            : 8,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div
                      style={{
                        fontWeight: 700,

                        fontSize:
                          isMobile
                            ? '0.75rem'
                            : '0.9rem',

                        lineHeight: 1.2,
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

      {/* FORM */}
      <div
        className={`row ${
          isMobile ? 'g-2' : 'g-3'
        }`}
      >
        {/* DATE */}
        <div className="col-12">
          <div
            className={
              isMobile
                ? ''
                : 'p-3 rounded-4'
            }
            style={{
              background:
                isMobile
                  ? 'transparent'
                  : '#fafafa',

              border: isMobile
                ? 'none'
                : '1px solid #eee',
            }}
          >
            <FormInput
              label="Tanggal"
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
                className={
                  isMobile
                    ? ''
                    : 'p-3 rounded-4'
                }
                style={{
                  background:
                    isMobile
                      ? 'transparent'
                      : '#fafafa',

                  border:
                    isMobile
                      ? 'none'
                      : '1px solid #eee',
                }}
              >
                <FormInput
                  label="Jumlah Voucher"
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

            {/* TOTAL */}
            <div className="col-12">
              <div
                style={{
                  borderRadius:
                    isMobile
                      ? 14
                      : 20,

                  padding:
                    isMobile
                      ? '12px 14px'
                      : '20px',

                  background:
                    'linear-gradient(135deg, #dcfce7, #f0fdf4)',

                  border:
                    '1px solid #bbf7d0',
                }}
              >
                <div
                  style={{
                    fontSize:
                      isMobile
                        ? '0.72rem'
                        : '0.85rem',

                    color: '#166534',

                    marginBottom: 4,
                  }}
                >
                  Total Voucher
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize:
                      isMobile
                        ? '1.15rem'
                        : '1.8rem',

                    color: '#15803d',

                    lineHeight: 1.2,
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
                      isMobile
                        ? '0.7rem'
                        : '0.82rem',

                    color: '#166534',

                    marginTop: 4,
                  }}
                >
                  {jumlahVoucherRaw ||
                    0}{' '}
                  × 150.000
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-12">
              <FormInput
                label="Keterangan"
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

            <div className="col-12">
              <FormInput
                label="Jumlah"
                name="jumlah"
                value={form.jumlah}
                onChange={
                  handleChange
                }
                type="text"
              />
            </div>
          </>
        )}
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

              boxShadow:
                '0 10px 24px rgba(34,197,94,0.25)',
            }}
            onClick={
              handleSubmit
            }
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
                  <FiPlus
                    size={18}
                  />
                  Tambah Transaksi
                </>
              )}
            </div>
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

            padding:
              '12px 16px',

            borderTop:
              '1px solid #eee',

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
            onClick={
              handleSubmit
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <FiPlus
                  size={16}
                  className="me-2"
                />
                Tambah Transaksi
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransaksiForm;