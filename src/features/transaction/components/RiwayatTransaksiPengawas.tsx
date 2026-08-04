import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import DataTable from '../../../components/DataTable';
import ActionIconButton from '../../../components/ActionIconButton';
import Pagination from '../../../components/Pagination';
import EmptyState from '../../../components/EmptyState';
import { useMediaQuery } from 'react-responsive';
import CardTableRiwayatTransaksi from './CardTableRiwayatTransaksi';
import dayjs from 'dayjs';

import {
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';

type Props = {
  pengawasId: string;
  refresh?: number;
};

type Transaksi = {
  id: string;
  tanggal: string;
  tipe: string;
  tipeLabel: string;
  jumlah: number;
  keterangan: string;
  priority: number;
};

const RiwayatTransaksiPengawas = ({ pengawasId, refresh }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [rawData, setRawData] = useState<Transaksi[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filterTipe, setFilterTipe] = useState('');
  const [searchText, setSearchText] = useState('');

  const [sortKey, setSortKey] = useState<keyof Transaksi>('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const limit = isMobile ? 5 : 10;

  const getTableName = (tipe: string) => {
    switch (tipe) {
      case 'kasbon_pengawas':
        return 'kasbon_pengawas';
      case 'gaji_pengawas':
        return 'gaji_pengawas';
      default:
        return '';
    }
  };

  const fetchData = async () => {
    setLoading(true);

    const [kasbon, gaji] = await Promise.all([
      supabase.from('kasbon_pengawas').select('*').eq('pengawas_id', pengawasId),
      supabase.from('gaji_pengawas').select('*').eq('pengawas_id', pengawasId),
    ]);

    const combined = [
      ...(gaji.data || []).map((p) => ({
        ...p,
        tipe: 'gaji_pengawas',
        tipeLabel: 'Gaji',
        priority: 1,
      })),
      ...(kasbon.data || []).map((k) => ({
        ...k,
        tipe: 'kasbon_pengawas',
        tipeLabel: 'Kasbon',
        priority: 2,
      })),
    ];

    setRawData(combined);
    setLoading(false);
  };

  // Filter + sort dilakukan di client dari data yang sudah ada — filterTipe,
  // searchText, dan sortKey/sortOrder TIDAK perlu fetch ulang ke Supabase.
  const data = useMemo(() => {
    const search = searchText.toLowerCase();

    const filtered = rawData.filter((d) =>
      (filterTipe ? d.tipe === filterTipe : true) &&
      (
        d.tanggal.includes(search) ||
        (d.keterangan || '').toLowerCase().includes(search)
      )
    );

    return isMobile
      ? filtered.sort(
          (a, b) =>
            dayjs(b.tanggal).valueOf() -
            dayjs(a.tanggal).valueOf()
        )
      : filtered.sort((a, b) => {
          const aVal = a[sortKey];
          const bVal = b[sortKey];

          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }

          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc'
              ? aVal - bVal
              : bVal - aVal;
          }

          return 0;
        });
  }, [rawData, filterTipe, searchText, isMobile, sortKey, sortOrder]);

  const handleSort = (key: keyof Transaksi) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (row: any) => {
    if (!(await confirmDialog('❗ Yakin ingin menghapus transaksi ini?'))) return;

    const table = getTableName(row.tipe);
    const { error } = await supabase.from(table).delete().eq('id', row.id);

    if (error) toast.error('Gagal hapus data: ' + error.message);
    else fetchData();
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [pengawasId, refresh]);

  const paginatedData = isMobile
    ? data
    : data.slice((page - 1) * limit, page * limit);

  const totalPages = Math.ceil(data.length / limit);

  const renderBadge = (tipe: string) => {
    const styles: any = {
      gaji_pengawas: {
        bg: 'var(--color-income-soft)',
        color: 'var(--color-income)',
        label: 'Gaji',
      },
      kasbon_pengawas: {
        bg: 'var(--color-expense-soft)',
        color: 'var(--color-expense)',
        label: 'Kasbon',
      },
    };

    const style = styles[tipe];

    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          padding: '6px 12px',
          borderRadius: 999,
          fontSize: '0.78rem',
          fontWeight: 700,
        }}
      >
        {style.label}
      </span>
    );
  };

  return (
    <div className="mt-3">

      {/* FILTER + SEARCH */}
      {!isMobile && (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="p-3 d-flex justify-content-between flex-wrap gap-3">

            <div className="d-flex gap-2 flex-wrap">
              {[
                { value: '', label: 'Semua' },
                { value: 'gaji_pengawas', label: 'Gaji' },
                { value: 'kasbon_pengawas', label: 'Kasbon' },
              ].map((item) => (
                <button
                  key={item.value}
                  className="btn"
                  onClick={() => {
                    setPage(1);
                    setFilterTipe(item.value);
                  }}
                  style={{
                    borderRadius: 999,
                    padding: '8px 18px',
                    border: filterTipe === item.value ? 'none' : '1px solid var(--color-gray-200)',
                    background:
                      filterTipe === item.value ? 'var(--color-green)' : 'var(--color-surface)',
                    color: filterTipe === item.value ? '#fff' : 'var(--color-gray-700)',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 300 }}>
              <FiSearch
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gray-500)',
                }}
              />
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Cari transaksi..."
                value={searchText}
                onChange={(e) => {
                  setPage(1);
                  setSearchText(e.target.value);
                }}
                style={{
                  borderRadius: 999,
                  background: 'var(--color-surface-2)',
                  paddingLeft: 40,
                  height: 45,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      {isMobile ? (
        <CardTableRiwayatTransaksi
          data={data}
          page={page - 1}
          rowsPerPage={limit}
          onPageChange={(p) => setPage(p + 1)}
          onDelete={handleDelete}
        />
      ) : (
        <>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <DataTable
              columns={[
                { key: 'tanggal', label: 'Tanggal', sortable: true },
                {
                  key: 'tipeLabel',
                  label: 'Tipe',
                  render: (row) => renderBadge(row.tipe),
                },
                {
                  key: 'jumlah',
                  label: 'Jumlah',
                  render: (row) => (
                    <span
                      style={{
                        fontWeight: 700,
                        color: row.tipe === 'kasbon_pengawas' ? 'var(--color-expense)' : 'var(--color-income)',
                      }}
                    >
                      {row.tipe === 'kasbon_pengawas' ? '- ' : '+ '}
                      Rp{Number(row.jumlah).toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: 'keterangan',
                  label: 'Keterangan',
                  render: (row) => row.keterangan || '-',
                },
                {
                  key: 'aksi' as any,
                  label: 'Aksi',
                  render: (row) => (
                    <ActionIconButton
                      icon={<FiTrash2 />}
                      variant="danger"
                      title="Hapus"
                      onClick={() => handleDelete(row)}
                    />
                  ),
                },
              ]}
              data={paginatedData}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>

          {!loading && data.length === 0 && (
            <EmptyState
              title="Belum ada transaksi"
              description="Tambah transaksi pertama untuk pengawas ini"
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

export default RiwayatTransaksiPengawas;