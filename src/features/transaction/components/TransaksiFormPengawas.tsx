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
} from 'react-icons/fi';

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
      { label: 'Tanggal', value: form.tanggal },
      { label: 'Jumlah', value: form.jumlah },
    ]);

    if (error) {
      toast.error(error);
      return;
    }

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
          disabled={mutation.isPending}
          icon={mutation.isPending ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus />}
        >
          {mutation.isPending ? 'Menyimpan...' : 'Tambah Transaksi'}
        </Button>
      </div>
    </div>
  );
};

export default TransaksiFormPengawas;