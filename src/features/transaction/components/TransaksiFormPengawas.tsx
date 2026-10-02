import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import { validasiWajib } from '../../../utils/validasiForm';

import {
  FiTrendingDown,
  FiTrendingUp,
  FiFileText,
  FiPlus,
  FiCalendar,
  FiEdit3,
} from 'react-icons/fi';
import '../../../styles/mobile-admin.css';

/** Tombol simpan versi mobile: pil solid tanpa gradien (selaras layar lain). */
const TOMBOL_PIL: React.CSSProperties = {
  height: 52,
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-primary)',
  boxShadow: 'none',
  fontWeight: 600,
};

type Props = {
  pengawasId: string;
};

const TIPE_LABELS: Record<string, string> = {
  gaji_pengawas: 'Gaji',
  kasbon_pengawas: 'Kasbon',
  lainnya_pengawas: 'Lainnya',
};

const TIPE_PRIORITY: Record<string, number> = {
  gaji_pengawas: 1,
  kasbon_pengawas: 2,
  lainnya_pengawas: 3,
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
  pengawas_id: string;
  jumlah: number;
  keterangan?: string;
};

const TransaksiFormPengawas = ({
  pengawasId,
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const queryClient = useQueryClient();
  const riwayatKey = ['riwayat-transaksi-pengawas', pengawasId];

  const [form, setForm] = useState({
    tanggal: '',
    jumlah: '',
    keterangan: '',
    tipe: 'kasbon_pengawas',
  });

  const [fieldSalah, setFieldSalah] = useState<string | null>(null);

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

    // Sorotan hilang begitu field-nya disentuh.
    setFieldSalah((prev) => (prev === name ? null : prev));

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

  const mutation = useMutation({
    mutationFn: async ({ table, payload }: { table: string; payload: TransaksiPayload }) => {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    },
    onMutate: async ({ payload }) => {
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

      return { previous };
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
        keterangan: '',
        tipe: 'kasbon_pengawas',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: riwayatKey });
    },
  });

  const handleSubmit = () => {
    const error = validasiWajib([
      { label: 'Tanggal', value: form.tanggal, name: 'tanggal' },
      { label: 'Jumlah', value: form.jumlah, name: 'jumlah' },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

    const table = form.tipe;

    const payload: TransaksiPayload = {
      tanggal: form.tanggal,
      pengawas_id: pengawasId,
      jumlah: parseFloat(unformatNumber(form.jumlah)),
    };

    if (form.keterangan) {
      payload.keterangan = form.keterangan;
    }

    mutation.mutate({ table, payload });
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

  const tombolSimpan = (style?: React.CSSProperties) => (
    <Button
      variant="primary"
      fullWidth
      onClick={handleSubmit}
      disabled={mutation.isPending}
      icon={mutation.isPending ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus />}
      style={style}
    >
      {mutation.isPending ? 'Menyimpan...' : 'Tambah Transaksi'}
    </Button>
  );

  // Mobile: tampilan baru (jumlah besar ala aplikasi bank). State, validasi,
  // dan penyimpanan sama persis dengan desktop di bawah.
  if (isMobile) {
    const wajib = (
      <>
        <span className="tm-req" aria-hidden="true">*</span>
        <span className="visually-hidden"> (wajib diisi)</span>
      </>
    );

    return (
      <div>
        <div
          className="tm-types"
          role="radiogroup"
          aria-label="Tipe transaksi"
          style={{ gridTemplateColumns: `repeat(${transactionTypes.length}, 1fr)` }}
        >
          {transactionTypes.map((item) => {
            const active = form.tipe === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={`tm-type ${active ? 'is-active' : ''}`}
                style={active ? { background: item.bg, borderColor: item.color, color: item.color } : undefined}
                onClick={() => setForm((prev) => ({ ...prev, tipe: item.value }))}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        <div className={`tm-amount ${fieldSalah === 'jumlah' ? 'is-invalid' : ''}`}>
          <label htmlFor="tm-jumlah" className="tm-amount-label">
            Jumlah{wajib}
          </label>
          <div className="tm-amount-row">
            <span className="tm-amount-prefix" aria-hidden>Rp</span>
            <input
              id="tm-jumlah"
              name="jumlah"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={form.jumlah}
              onChange={handleChange}
              className="tm-amount-input"
              aria-invalid={fieldSalah === 'jumlah' || undefined}
            />
          </div>
        </div>

        <div className="tm-field">
          <label htmlFor="tm-tanggal" className="tm-label">
            Tanggal{wajib}
          </label>
          <div className="tm-input-wrap">
            <FiCalendar className="tm-input-icon" aria-hidden />
            <input
              id="tm-tanggal"
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
              className={`tm-input ${fieldSalah === 'tanggal' ? 'is-invalid' : ''}`}
              aria-invalid={fieldSalah === 'tanggal' || undefined}
            />
          </div>
        </div>

        <div className="tm-field">
          <label htmlFor="tm-keterangan" className="tm-label">
            Keterangan (opsional)
          </label>
          <div className="tm-input-wrap">
            <FiEdit3 className="tm-input-icon" aria-hidden />
            <input
              id="tm-keterangan"
              name="keterangan"
              type="text"
              placeholder="Catatan singkat"
              value={form.keterangan}
              onChange={handleChange}
              className="tm-input"
            />
          </div>
        </div>

        <div className="tm-submit">{tombolSimpan(TOMBOL_PIL)}</div>
      </div>
    );
  }

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
            required
            invalid={fieldSalah === 'tanggal'}
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
            required
            invalid={fieldSalah === 'jumlah'}
            value={form.jumlah}
            onChange={handleChange}
            type="text"
          />
        </div>
      </div>

      {/* BUTTON */}
      <div className="mt-4">{tombolSimpan()}</div>
    </div>
  );
};

export default TransaksiFormPengawas;