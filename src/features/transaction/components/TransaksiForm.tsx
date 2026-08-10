import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import { useOutletPricing } from '../hooks/useOutletPricing';
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
};

const TIPE_LABELS: Record<string, string> = {
  voucher: 'Voucher',
  pemasukan_lain: 'Pemasukan Lain',
  kasbon: 'Kasbon',
  dokter: 'Dokter',
};

const TIPE_PRIORITY: Record<string, number> = {
  voucher: 1,
  pemasukan_lain: 2,
  kasbon: 3,
  dokter: 4,
};

type RiwayatRow = {
  id: string;
  tanggal: string;
  tipe: string;
  tipeLabel: string;
  jumlah: number;
  keterangan: string;
  priority: number;
};

type TransaksiPayload = {
  tanggal: string;
  ladies_id: string;
  jumlah: number;
  jumlah_voucher?: number;
  keterangan?: string;
  outlet?: string;
  untung?: number;
};

const TransaksiForm = ({
  ladiesId,
  outlet,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const queryClient = useQueryClient();
  const riwayatKey = ['riwayat-transaksi', ladiesId];

  const { data: tiers = [], isLoading: pricingLoading } =
    useOutletPricing(outlet);

  const [selectedTierName, setSelectedTierName] = useState<
    string | null
  >(null);

  const activeTier =
    tiers.find((t) => t.tier_name === selectedTierName) ??
    tiers[0];

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

  const mutation = useMutation({
    mutationFn: async ({ table, payload }: { table: string; payload: TransaksiPayload }) => {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    },
    onMutate: async ({ table, payload }) => {
      await queryClient.cancelQueries({ queryKey: riwayatKey });

      const previous = queryClient.getQueryData<RiwayatRow[]>(riwayatKey);

      const optimisticRow: RiwayatRow = {
        id: `temp-${Date.now()}`,
        tanggal: payload.tanggal,
        tipe: form.tipe,
        tipeLabel: TIPE_LABELS[form.tipe],
        jumlah: payload.jumlah,
        keterangan: payload.keterangan ?? '',
        priority: TIPE_PRIORITY[form.tipe],
      };

      queryClient.setQueryData<RiwayatRow[]>(riwayatKey, (old = []) => [
        optimisticRow,
        ...old,
      ]);

      return { previous, table };
    },
    onError: (error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(riwayatKey, context.previous);
      }

      toast.error(
        'Gagal menambahkan transaksi: ' +
          (error instanceof Error ? error.message : '')
      );
    },
    onSuccess: () => {
      toast.success('Transaksi berhasil ditambahkan!');

      setForm({
        tanggal: '',
        jumlah: '',
        jumlah_voucher: '',
        keterangan: '',
        tipe: 'voucher',
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: riwayatKey });
      queryClient.invalidateQueries({ queryKey: ['ledger', variables.table, ladiesId] });
      queryClient.invalidateQueries({ queryKey: ['home-ladies', ladiesId] });
    },
  });

  const handleSubmit = () => {
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

    const table =
      form.tipe === 'voucher'
        ? 'vouchers'
        : form.tipe;

    const payload: TransaksiPayload = {
      tanggal: form.tanggal,
      ladies_id: ladiesId,
      jumlah: 0,
    };

    if (form.tipe === 'voucher') {
      if (pricingLoading || !activeTier) {
        toast.error(
          'Harga outlet belum termuat atau belum dikonfigurasi. Hubungi admin.'
        );
        return;
      }

      const jumlahVoucher =
        parseFloat(
          unformatNumber(
            form.jumlah_voucher
          )
        );

      const jumlah =
        jumlahVoucher * activeTier.harga_ladies;

      payload.jumlah_voucher =
        jumlahVoucher;

      payload.jumlah = jumlah;

      payload.outlet = outlet;

      payload.untung =
        jumlahVoucher * activeTier.untung;
    } else {
      payload.jumlah = parseFloat(
        unformatNumber(form.jumlah)
      );

      payload.keterangan =
        form.keterangan;
    }

    mutation.mutate({ table, payload });
  };

  const jumlahVoucherRaw =
    parseInt(
      unformatNumber(
        form.jumlah_voucher || '0'
      )
    );

  const hargaVoucher =
    activeTier?.harga_ladies ?? 0;

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

            {tiers.length > 1 && (
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
                    Tipe
                  </label>

                  <select
                    className="form-select shadow-none"
                    value={activeTier?.tier_name ?? ''}
                    onChange={(e) =>
                      setSelectedTierName(
                        e.target.value
                      )
                    }
                    style={{
                      height: isMobile ? 46 : 52,
                      borderRadius: isMobile ? 12 : 16,
                      border: '1px solid var(--color-green-light)',
                    }}
                  >
                    {tiers.map((t) => (
                      <option
                        key={t.tier_name}
                        value={t.tier_name ?? ''}
                      >
                        {t.tier_name}
                      </option>
                    ))}
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
                    '1px solid rgba(var(--color-success-rgb), 0.35)',
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
          disabled={mutation.isPending}
          icon={mutation.isPending ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus size={isMobile ? 16 : 18} />}
        >
          {mutation.isPending ? 'Menyimpan...' : 'Tambah Transaksi'}
        </Button>
      </div>
    </div>
  );
};

export default TransaksiForm;