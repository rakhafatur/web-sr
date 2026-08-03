import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import {
  FiGift,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiPlus,
} from 'react-icons/fi';

type Props = {
  ladiesId: string;
  outlet: string;
  onSuccess?: () => void;
};

const TransaksiForm = ({
  ladiesId,
  outlet,
  onSuccess,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [loading, setLoading] =
    useState(false);

  const [travelType, setTravelType] = useState<
    'Single' | 'Double'
  >('Single');

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
      toast.error(
        'Harap isi tanggal dan jumlah.'
      );
      return;
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

      const hargaVoucher =
        outlet === 'Travel'
          ? travelType === 'Single'
            ? 105000
            : 95000
          : 150000;

      const jumlah =
        jumlahVoucher * hargaVoucher;

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
      toast.error(
        'Gagal menambahkan transaksi: ' +
        error.message
      );
    } else {
      toast.success(
        'Transaksi berhasil ditambahkan!'
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

  const hargaVoucher =
    outlet === 'Travel'
      ? travelType === 'Single'
        ? 105000
        : 95000
      : 150000;

  const totalJumlah = isNaN(
    jumlahVoucherRaw
  )
    ? 0
    : jumlahVoucherRaw * hargaVoucher;

  const transactionTypes = [
    {
      value: 'voucher',
      label: 'Voucher',
      icon: <FiGift />,
      color: 'var(--color-income)',
      bg: 'var(--color-income-soft)',
    },

    {
      value: 'pemasukan_lain',
      label: 'Pemasukan',
      icon: <FiTrendingUp />,
      color: 'var(--color-voucher)',
      bg: 'var(--color-voucher-soft)',
    },

    {
      value: 'kasbon',
      label: 'Kasbon',
      icon: <FiTrendingDown />,
      color: 'var(--color-expense)',
      bg: 'var(--color-expense-soft)',
    },

    {
      value: 'dokter',
      label: 'Dokter',
      icon: <FiFileText />,
      color: 'var(--color-medical)',
      bg: 'var(--color-medical-soft)',
    },
  ];

  return (
    <div>
      {/* MOBILE TYPE SELECT */}
      <div
        className={`row ${isMobile ? 'g-2' : 'g-3'
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
                        : 'var(--color-surface)',

                    border: active
                      ? `1.5px solid ${item.color}`
                      : '1px solid var(--color-gray-200)',

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
        className={`row ${isMobile ? 'g-2' : 'g-3'
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
                  : 'var(--color-surface-2)',

              border: isMobile
                ? 'none'
                : '1px solid var(--color-gray-200)',
            }}
          >
            <FormField
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
                      : 'var(--color-surface-2)',

                  border:
                    isMobile
                      ? 'none'
                      : '1px solid var(--color-gray-200)',
                }}
              >
                <FormField
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

            {outlet === 'Travel' && (
              <div className="col-12">
                <div
                  className={
                    isMobile
                      ? ''
                      : 'p-3 rounded-4'
                  }
                  style={{
                    background: isMobile
                      ? 'transparent'
                      : 'var(--color-surface-2)',
                    border: isMobile
                      ? 'none'
                      : '1px solid var(--color-gray-200)',
                  }}
                >
                  <label
                    className="form-label"
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Tipe Travel
                  </label>

                  <select
                    className="form-select shadow-none"
                    value={travelType}
                    onChange={(e) =>
                      setTravelType(
                        e.target.value as 'Single' | 'Double'
                      )
                    }
                    style={{
                      height: isMobile ? 46 : 52,
                      borderRadius: isMobile ? 12 : 16,
                      border: '1px solid var(--color-green-light)',
                    }}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                  </select>
                </div>
              </div>
            )}

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
                    'linear-gradient(135deg, var(--color-income-soft), var(--color-surface-2))',

                  border:
                    '1px solid #1f4a34',
                }}
              >
                <div
                  style={{
                    fontSize:
                      isMobile
                        ? '0.72rem'
                        : '0.85rem',

                    color: 'var(--color-income)',

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

                    color: 'var(--color-income)',

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

                    color: 'var(--color-income)',

                    marginTop: 4,
                  }}
                >
                  {jumlahVoucherRaw || 0} × {formatNumber(hargaVoucher.toString())}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-12">
              <FormField
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
              <FormField
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

      {/* BUTTON */}
      <div className="mt-4">
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          icon={loading ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus size={isMobile ? 16 : 18} />}
        >
          {loading ? 'Menyimpan...' : 'Tambah Transaksi'}
        </Button>
      </div>
    </div>
  );
};

export default TransaksiForm;