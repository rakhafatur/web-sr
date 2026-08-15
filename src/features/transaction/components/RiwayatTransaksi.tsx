import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import EmptyState from '../../../components/EmptyState';
import { useMediaQuery } from 'react-responsive';
import CardTableRiwayatTransaksi from './CardTableRiwayatTransaksi';
import TransaksiFilterBar from './TransaksiFilterBar';
import MonthNavigator from '../../ladies/components/MonthNavigator';
import { useMonthNavigation } from '../../ladies/hooks/useMonthNavigation';
import dayjs from 'dayjs';

import {
  FiTrash2,
  FiLoader,
} from 'react-icons/fi';

type Props = {
  ladiesId: string;
};

type Transaksi = {
  id: string;
  tanggal: string;
  tipe: string;
  tipeLabel: string;
  jumlah: number;
  jumlah_voucher?: number;
  keterangan?: string;
  priority: number;
};

const RiwayatTransaksi = ({
  ladiesId,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [page, setPage] =
    useState(1);

  const [filterTipe, setFilterTipe] =
    useState('');

  const [searchText, setSearchText] =
    useState('');

  const [sortKey, setSortKey] =
    useState<keyof Transaksi>(
      'tanggal'
    );

  const [sortOrder, setSortOrder] =
    useState<'asc' | 'desc'>(
      'desc'
    );

  const {
    selectedMonth,
    handleMonthChange,
    prevMonth,
    nextMonth,
    isNextDisabled,
  } = useMonthNavigation();

  const handleMonthChangeAndResetPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMonthChange(e);
    setPage(1);
  };

  const handlePrevMonth = () => {
    prevMonth();
    setPage(1);
  };

  const handleNextMonth = () => {
    nextMonth();
    setPage(1);
  };

  const limit = isMobile ? 5 : 10;

  const getTableName = (
    tipe: string
  ) => {
    switch (tipe) {
      case 'voucher':
        return 'vouchers';

      case 'kasbon':
        return 'kasbon';

      case 'pemasukan_lain':
        return 'pemasukan_lain';

      case 'dokter':
        return 'dokter';

      default:
        return '';
    }
  };

  const queryClient = useQueryClient();
  const monthKey = selectedMonth.format('YYYY-MM');
  const queryKey = ['riwayat-transaksi', ladiesId, monthKey];

  const { data: rawData = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const bulanAwal = selectedMonth.startOf('month').format('YYYY-MM-DD');
      const bulanAkhir = selectedMonth.endOf('month').format('YYYY-MM-DD');

      const [
        voucher,
        kasbon,
        pemasukanLain,
        riwayatDokter,
      ] = await Promise.all([
        supabase
          .from('vouchers')
          .select('id, tanggal, jumlah, jumlah_voucher')
          .eq(
            'ladies_id',
            ladiesId
          )
          .gte('tanggal', bulanAwal)
          .lte('tanggal', bulanAkhir),

        supabase
          .from('kasbon')
          .select('id, tanggal, jumlah, keterangan')
          .eq(
            'ladies_id',
            ladiesId
          )
          .gte('tanggal', bulanAwal)
          .lte('tanggal', bulanAkhir),

        supabase
          .from('pemasukan_lain')
          .select('id, tanggal, jumlah, keterangan')
          .eq(
            'ladies_id',
            ladiesId
          )
          .gte('tanggal', bulanAwal)
          .lte('tanggal', bulanAkhir),

        supabase
          .from(
            'dokter'
          )
          .select('id, tanggal, jumlah, keterangan')
          .eq(
            'ladies_id',
            ladiesId
          )
          .gte('tanggal', bulanAwal)
          .lte('tanggal', bulanAkhir),
      ]);

      const combined: Transaksi[] = [
        ...(voucher.data || []).map(
          (v) => ({
            ...v,
            tipe: 'voucher',
            tipeLabel: 'Voucher',
            priority: 1,
          })
        ),

        ...(
          pemasukanLain.data || []
        ).map((p) => ({
          ...p,
          tipe: 'pemasukan_lain',
          tipeLabel:
            'Pemasukan Lain',
          priority: 2,
        })),

        ...(kasbon.data || []).map(
          (k) => ({
            ...k,
            tipe: 'kasbon',
            tipeLabel: 'Kasbon',
            priority: 3,
          })
        ),

        ...(
          riwayatDokter.data || []
        ).map((r) => ({
          ...r,
          tipe:
            'dokter',
          tipeLabel:
            'Dokter',
          priority: 4,
        })),
      ];

      return combined;
    },
    enabled: !!ladiesId,
    meta: { errorLabel: 'riwayat transaksi' },
  });

  // Filter + sort dilakukan di client dari data yang sudah ada â€” filterTipe,
  // searchText, dan sortKey/sortOrder TIDAK perlu fetch ulang ke Supabase.
  const data = useMemo(() => {
    const search =
      searchText.toLowerCase();

    const filtered =
      rawData.filter(
        (d) =>
          (filterTipe
            ? d.tipe ===
              filterTipe
            : true) &&
          (
            d.tanggal.includes(
              search
            ) ||
            (
              d.keterangan || ''
            )
              .toLowerCase()
              .includes(search)
          )
      );

    if (isMobile) {
      return filtered.sort(
        (a, b) =>
          dayjs(
            b.tanggal
          ).valueOf() -
          dayjs(
            a.tanggal
          ).valueOf()
      );
    }

    return filtered.sort(
      (a, b) => {
        const aVal =
          a[sortKey];

        const bVal =
          b[sortKey];

        if (
          typeof aVal ===
            'string' &&
          typeof bVal ===
            'string'
        ) {
          return sortOrder ===
            'asc'
            ? aVal.localeCompare(
                bVal
              )
            : bVal.localeCompare(
                aVal
              );
        }

        if (
          typeof aVal ===
            'number' &&
          typeof bVal ===
            'number'
        ) {
          return sortOrder ===
            'asc'
            ? aVal - bVal
            : bVal - aVal;
        }

        return 0;
      }
    );
  }, [
    rawData,
    filterTipe,
    searchText,
    isMobile,
    sortKey,
    sortOrder,
  ]);

  const handleSort = (
    key: keyof Transaksi
  ) => {
    if (sortKey === key) {
      setSortOrder((prev) =>
        prev === 'asc'
          ? 'desc'
          : 'asc'
      );
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (
    row: Transaksi
  ) => {
    const confirmDelete =
      await confirmDialog(
        'â— Yakin ingin menghapus transaksi ini?'
      );

    if (!confirmDelete) return;

    const table = getTableName(
      row.tipe
    );

    await queryClient.cancelQueries({ queryKey });

    const previous = queryClient.getQueryData<Transaksi[]>(queryKey);

    queryClient.setQueryData<Transaksi[]>(queryKey, (old) =>
      (old || []).filter((item) => item.id !== row.id)
    );

    const { error } =
      await supabase
        .from(table)
        .delete()
        .eq('id', row.id);

    if (error) {
      queryClient.setQueryData(queryKey, previous);
      toast.error(
        'Gagal hapus data: ' +
          error.message
      );
    } else {
      refetch();
    }
  };

  const paginatedData = isMobile
    ? data
    : data.slice(
        (page - 1) * limit,
        page * limit
      );

  const totalPages = Math.ceil(
    data.length / limit
  );

  const renderBadge = (
    tipe: string
  ) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      voucher: {
        bg: 'var(--color-income-soft)',
        color: 'var(--color-income)',
        label: 'Voucher',
      },

      pemasukan_lain: {
        bg: 'var(--color-voucher-soft)',
        color: 'var(--color-voucher)',
        label:
          'Pemasukan Lain',
      },

      kasbon: {
        bg: 'var(--color-expense-soft)',
        color: 'var(--color-expense)',
        label: 'Kasbon',
      },

      dokter: {
        bg: 'var(--color-medical-soft)',
        color: 'var(--color-medical)',
        label:
          'Dokter',
      },
    };

    const style =
      styles[tipe];

    return (
      <span
        style={{
          background:
            style.bg,

          color:
            style.color,

          padding:
            '6px 12px',

          borderRadius: 999,

          fontSize:
            '0.78rem',

          fontWeight: 700,
        }}
      >
        {style.label}
      </span>
    );
  };

  return (
    <div className="mt-3">
      <div className="mb-3" style={{ maxWidth: isMobile ? undefined : 320 }}>
        <MonthNavigator
          selectedMonth={selectedMonth}
          onChange={handleMonthChangeAndResetPage}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          nextDisabled={isNextDisabled}
        />
      </div>

      <TransaksiFilterBar
        options={[
          { value: '', label: 'Semua' },
          { value: 'voucher', label: 'Voucher' },
          { value: 'pemasukan_lain', label: 'Pemasukan Lain' },
          { value: 'kasbon', label: 'Kasbon' },
          { value: 'dokter', label: 'Dokter' },
        ]}
        value={filterTipe}
        onChange={(v) => {
          setPage(1);
          setFilterTipe(v);
        }}
        searchText={searchText}
        onSearchChange={(v) => {
          setPage(1);
          setSearchText(v);
        }}
      />

      {loading ? (
        <div
          className="d-flex justify-content-center p-4"
          role="status"
          aria-label="Loading"
        >
          <FiLoader size={20} className="spinner-icon" />
        </div>
      ) : isMobile ? (
        <CardTableRiwayatTransaksi
          data={data}
          page={page - 1}
          rowsPerPage={limit}
          onPageChange={(p) =>
            setPage(p + 1)
          }
          onDelete={handleDelete}
        />
      ) : (
        <>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'tanggal',
                  label:
                    'Tanggal',
                  sortable: true,
                },

                {
                  key:
                    'tipeLabel',

                  label: 'Tipe',

                  render: (
                    row
                  ) =>
                    renderBadge(
                      row.tipe
                    ),
                },

                {
                  key: 'jumlah',

                  label:
                    'Jumlah',

                  render: (
                    row
                  ) => (
                    <span
                      style={{
                        fontWeight: 700,

                        color:
                          row.tipe ===
                          'kasbon'
                            ? 'var(--color-expense)'
                            : row.tipe ===
                              'dokter'
                            ? 'var(--color-medical)'
                            : 'var(--color-income)',
                      }}
                    >
                      {row.tipe ===
                        'kasbon' ||
                      row.tipe ===
                        'dokter'
                        ? '- '
                        : '+ '}
                      Rp
                      {Number(
                        row.jumlah
                      ).toLocaleString()}
                    </span>
                  ),
                },

                {
                  key:
                    'keterangan',

                  label:
                    'Keterangan',

                  render: (
                    row
                  ) =>
                    row.tipe ===
                    'voucher' ? (
                      <span
                        style={{
                          color:
                            'var(--color-gray-500)',
                        }}
                      >
                        Voucher{' '}
                        {row.jumlah_voucher}{' '}
                        pcs
                      </span>
                    ) : (
                      row.keterangan ||
                      '-'
                    ),
                },

                {
                  key: 'id',

                  label: 'Aksi',

                  render: (
                    row
                  ) => (
                    <ActionIconButton
                      icon={<FiTrash2 />}
                      variant="danger"
                      title="Hapus"
                      onClick={() => handleDelete(row)}
                    />
                  ),
                },
              ]}
              data={
                paginatedData
              }
              sortKey={sortKey}
              sortOrder={
                sortOrder
              }
              onSort={
                handleSort
              }
            />
          </div>

          {!loading &&
            data.length ===
              0 && (
              <EmptyState
                title="Belum ada transaksi"
                description="Tambahkan transaksi pertama untuk ladies ini"
              />
            )}

          {data.length > 0 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </>
      )}
    </div>
  );
};

export default RiwayatTransaksi;
