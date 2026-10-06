import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import Pagination from '../../../components/Pagination';
import ListLoadingState from '../../../components/ListLoadingState';
import { useMediaQuery } from 'react-responsive';
import CardTableRiwayatTransaksi from './CardTableRiwayatTransaksi';
import EditTransaksiSheet, { type BarisEdit, type PerubahanTransaksi } from './EditTransaksiSheet';
import TransaksiFilterBar from './TransaksiFilterBar';
import MonthPill from '../../ladies/components/MonthPill';
import { useMonthNavigation } from '../../ladies/hooks/useMonthNavigation';
import dayjs from 'dayjs';
import '../../../styles/desktop-admin.css';

import {
  FiTrash2,
  FiSearch,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';

/** Pilihan filter tipe — dipakai bersama mobile & desktop. */
const FILTER_TIPE = [
  { value: '', label: 'Semua' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'pemasukan_lain', label: 'Pemasukan Lain' },
  { value: 'kasbon', label: 'Kasbon' },
  { value: 'dokter', label: 'Dokter' },
];

/** Tampilan tipe di tabel desktop: badge + tanda arah uang bagi ladies
    (sama dengan Buku Kuning: voucher & pemasukan menambah, kasbon & dokter
    mengurangi). Teks nominal tetap netral. */
const GAYA_TIPE: Record<string, { label: string; tanda: string; className: string }> = {
  voucher: { label: 'Voucher', tanda: '+', className: 'is-on' },
  pemasukan_lain: { label: 'Pemasukan lain', tanda: '+', className: 'is-warn' },
  kasbon: { label: 'Kasbon', tanda: '−', className: 'is-off' },
  dokter: { label: 'Dokter', tanda: '−', className: 'is-medical' },
};

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
  untung?: number | null;
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
          // untung dibutuhkan untuk mengubah pcs (lihat hitungUlangVoucher).
          .select('id, tanggal, jumlah, jumlah_voucher, untung, keterangan')
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

  // Filter + sort dilakukan di client dari data yang sudah ada — filterTipe,
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

  // Sheet ubah transaksi (mobile; di desktop tampil sebagai dialog).
  const [barisEdit, setBarisEdit] = useState<BarisEdit | null>(null);

  const simpanEdit = async (perubahan: PerubahanTransaksi) => {
    if (!barisEdit) return;

    // Baris optimistis (baru ditambah, id belum dari server) belum bisa diubah.
    if (barisEdit.id.startsWith('temp-')) {
      toast.info('Transaksi ini masih disimpan. Coba lagi sebentar.');
      return;
    }

    const table = getTableName(barisEdit.tipe);
    const { error } = await supabase.from(table).update(perubahan).eq('id', barisEdit.id);

    if (error) {
      toast.error('Gagal menyimpan perubahan: ' + error.message);
      return;
    }

    toast.success('Transaksi diperbarui.');
    setBarisEdit(null);

    // Sama seperti setelah menambah transaksi (TransaksiForm).
    queryClient.invalidateQueries({ queryKey: ['riwayat-transaksi', ladiesId] });
    queryClient.invalidateQueries({ queryKey: ['ledger', table, ladiesId] });
    queryClient.invalidateQueries({ queryKey: ['home-ladies', ladiesId] });
  };

  const handleDelete = async (
    row: Transaksi
  ) => {
    const confirmDelete =
      await confirmDialog(
        'Hapus transaksi ini?'
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

  const sheetEdit = barisEdit && (
    <EditTransaksiSheet
      key={barisEdit.id}
      row={barisEdit}
      onClose={() => setBarisEdit(null)}
      onSimpan={simpanEdit}
    />
  );

  // Desktop (gaya dk-): toolbar (bulan · filter tipe · cari) lalu tabel yang
  // bisa diurutkan. Klik baris = ubah lewat sheet yang sama dengan mobile
  // (ModalWrapper tampil sebagai dialog di desktop).
  if (!isMobile) {
    const labelBulan = selectedMonth.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const tanggalPendek = (t: string) =>
      new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

    const kepalaUrut = (key: keyof Transaksi, label: string, angka = false) => {
      const aktif = sortKey === key;
      return (
        <th
          scope="col"
          className={angka ? 'dk-col-num' : undefined}
          aria-sort={aktif ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
          <button type="button" className={`dk-th-sort ${aktif ? 'is-active' : ''}`} onClick={() => handleSort(key)}>
            {label}
            {aktif ? sortOrder === 'asc' ? <FiArrowUp aria-hidden /> : <FiArrowDown aria-hidden /> : null}
          </button>
        </th>
      );
    };

    return (
      <>
        {sheetEdit}

        <div className="dk-toolbar dk-toolbar--wrap">
          <div className="dk-month-nav dk-month-nav--pill">
            <button type="button" className="dk-icon-btn" aria-label="Bulan sebelumnya" onClick={handlePrevMonth}>
              <FiChevronLeft />
            </button>
            <span className="dk-month-label" aria-live="polite">{labelBulan}</span>
            <button
              type="button"
              className="dk-icon-btn"
              aria-label="Bulan berikutnya"
              onClick={handleNextMonth}
              disabled={isNextDisabled}
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="dk-chips" role="radiogroup" aria-label="Filter tipe">
            {FILTER_TIPE.map((o) => (
              <button
                key={o.value || 'semua'}
                type="button"
                role="radio"
                aria-checked={filterTipe === o.value}
                className={`dk-chip ${filterTipe === o.value ? 'is-active' : ''}`}
                onClick={() => {
                  setPage(1);
                  setFilterTipe(o.value);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="dk-search dk-search--grow">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Cari tanggal atau keterangan..."
              aria-label="Cari transaksi"
              value={searchText}
              onChange={(e) => {
                setPage(1);
                setSearchText(e.target.value);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <ListLoadingState label="Memuat riwayat transaksi" />
          </div>
        ) : data.length === 0 ? (
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden><FiInbox /></span>
            <div className="dk-empty-title">
              {searchText || filterTipe ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
            </div>
            <div className="dk-empty-text">
              {searchText || filterTipe
                ? 'Coba ubah filter atau kata kunci.'
                : `Tidak ada transaksi di ${labelBulan}.`}
            </div>
          </div>
        ) : (
          <table className="dk-table">
            <thead>
              <tr>
                {kepalaUrut('tanggal', 'Tanggal')}
                <th scope="col">Tipe</th>
                <th scope="col">Keterangan</th>
                {kepalaUrut('jumlah', 'Jumlah', true)}
                <th scope="col" className="dk-col-actions">
                  <span className="visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => {
                const gaya = GAYA_TIPE[row.tipe] ?? { label: row.tipeLabel, tanda: '', className: 'is-muted' };
                const buka = () => setBarisEdit(row);

                return (
                  <tr key={row.id} className="is-clickable" onClick={buka}>
                    <td className="dk-nowrap">
                      {/* Tombol supaya baris juga bisa dibuka lewat keyboard. */}
                      <button
                        type="button"
                        className="dk-person-name"
                        onClick={(e) => {
                          e.stopPropagation();
                          buka();
                        }}
                      >
                        {tanggalPendek(row.tanggal)}
                      </button>
                    </td>
                    <td>
                      <span className={`dk-status ${gaya.className}`}>{gaya.label}</span>
                    </td>
                    <td>
                      {row.tipe === 'voucher' ? (
                        <>
                          {row.keterangan || 'Voucher'}
                          <span className="dk-muted"> · {row.jumlah_voucher ?? 0} pcs</span>
                        </>
                      ) : (
                        row.keterangan || <span className="dk-muted">-</span>
                      )}
                    </td>
                    <td className="dk-col-num dk-num dk-strong">
                      {gaya.tanda}Rp{Number(row.jumlah).toLocaleString('id-ID')}
                    </td>
                    <td className="dk-col-actions">
                      <button
                        type="button"
                        className="dk-icon-btn dk-icon-btn--danger"
                        title="Hapus"
                        aria-label={`Hapus ${gaya.label.toLowerCase()} ${tanggalPendek(row.tanggal)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                      <FiChevronRight className="dk-row-chevron" aria-hidden />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="dk-footer">
          {totalPages > 1 && (
            <Pagination page={page - 1} totalPages={totalPages} onPageChange={(p) => setPage(p + 1)} />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="mt-3">
      {sheetEdit}

      <div className="mb-3">
        <MonthPill
          label={selectedMonth.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          value={selectedMonth.format('YYYY-MM')}
          max={dayjs().format('YYYY-MM')}
          onChange={handleMonthChangeAndResetPage}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          nextDisabled={isNextDisabled}
        />
      </div>

      <TransaksiFilterBar
        options={FILTER_TIPE}
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
        <ListLoadingState label="Memuat riwayat transaksi" />
      ) : (
        <CardTableRiwayatTransaksi
          data={data}
          page={page - 1}
          rowsPerPage={limit}
          onPageChange={(p) =>
            setPage(p + 1)
          }
          onDelete={handleDelete}
          onEdit={(row) => setBarisEdit(row)}
        />
      )}
    </div>
  );
};

export default RiwayatTransaksi;
