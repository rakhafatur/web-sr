import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';
import { useMediaQuery } from 'react-responsive';
import CardTableRiwayatTransaksi from './CardTableRiwayatTransaksi';
import dayjs from 'dayjs';

import {
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiLayers,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

type Props = {
  ladiesId: string;
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

const RiwayatTransaksi = ({
  ladiesId,
  refresh,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [data, setData] = useState<
    Transaksi[]
  >([]);

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

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

  const fetchData = async () => {
    setLoading(true);

    const [
      voucher,
      kasbon,
      pemasukanLain,
      riwayatDokter,
    ] = await Promise.all([
      supabase
        .from('vouchers')
        .select('*')
        .eq(
          'ladies_id',
          ladiesId
        ),

      supabase
        .from('kasbon')
        .select('*')
        .eq(
          'ladies_id',
          ladiesId
        ),

      supabase
        .from('pemasukan_lain')
        .select('*')
        .eq(
          'ladies_id',
          ladiesId
        ),

      supabase
        .from(
          'dokter'
        )
        .select('*')
        .eq(
          'ladies_id',
          ladiesId
        ),
    ]);

    const combined = [
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

    const search =
      searchText.toLowerCase();

    const filtered =
      combined.filter(
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

    let sorted: Transaksi[] = [];

    if (isMobile) {
      sorted = filtered.sort(
        (a, b) =>
          dayjs(
            b.tanggal
          ).valueOf() -
          dayjs(
            a.tanggal
          ).valueOf()
      );
    } else {
      sorted = filtered.sort(
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
    }

    setData(sorted);

    setLoading(false);
  };

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
    row: any
  ) => {
    const confirmDelete =
      window.confirm(
        '❗ Yakin ingin menghapus transaksi ini?'
      );

    if (!confirmDelete) return;

    const table = getTableName(
      row.tipe
    );

    const { error } =
      await supabase
        .from(table)
        .delete()
        .eq('id', row.id);

    if (error) {
      alert(
        '❌ Gagal hapus data: ' +
          error.message
      );
    } else {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line
  }, [
    ladiesId,
    refresh,
    filterTipe,
    searchText,
    sortKey,
    sortOrder,
    isMobile,
  ]);

  const paginatedData = isMobile
    ? data
    : data.slice(
        (page - 1) * limit,
        page * limit
      );

  const totalPages = Math.ceil(
    data.length / limit
  );

  const summary = useMemo(() => {
    const pemasukan = data
      .filter(
        (d) =>
          d.tipe ===
            'voucher' ||
          d.tipe ===
            'pemasukan_lain'
      )
      .reduce(
        (acc, curr) =>
          acc +
          Number(curr.jumlah),
        0
      );

    const pengeluaran = data
      .filter(
        (d) =>
          d.tipe === 'kasbon' ||
          d.tipe ===
            'dokter'
      )
      .reduce(
        (acc, curr) =>
          acc +
          Number(curr.jumlah),
        0
      );

    return {
      pemasukan,
      pengeluaran,

      saldo:
        pemasukan -
        pengeluaran,

      transaksi: data.length,
    };
  }, [data]);

  const renderBadge = (
    tipe: string
  ) => {
    const styles: any = {
      voucher: {
        bg: '#dcfce7',
        color: '#15803d',
        label: 'Voucher',
      },

      pemasukan_lain: {
        bg: '#fef3c7',
        color: '#b45309',
        label:
          'Pemasukan Lain',
      },

      kasbon: {
        bg: '#fee2e2',
        color: '#b91c1c',
        label: 'Kasbon',
      },

      dokter: {
        bg: '#dbeafe',
        color: '#2563eb',
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
      {!isMobile && (
        <div className="row g-3 mb-4">
          {[
            {
              title:
                'Total Pemasukan',

              value:
                summary.pemasukan,

              color:
                '#16a34a',

              icon: (
                <FiTrendingUp />
              ),
            },

            {
              title:
                'Total Pengeluaran',

              value:
                summary.pengeluaran,

              color:
                '#dc2626',

              icon: (
                <FiTrendingDown />
              ),
            },

            {
              title: 'Saldo',

              value:
                summary.saldo,

              color:
                summary.saldo >=
                0
                  ? '#2563eb'
                  : '#dc2626',

              icon: (
                <FiLayers />
              ),
            },

            {
              title:
                'Total Transaksi',

              value:
                summary.transaksi,

              color: '#111',

              icon: (
                <FiLayers />
              ),
            },
          ].map((item) => (
            <div
              key={item.title}
              className="col-md-3"
            >
              <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      style={{
                        color:
                          '#666',
                        fontSize:
                          '0.85rem',
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        color:
                          item.color,
                        fontSize:
                          '1.3rem',
                      }}
                    >
                      {item.title ===
                      'Total Transaksi'
                        ? item.value
                        : `Rp${Number(
                            item.value
                          ).toLocaleString()}`}
                    </div>
                  </div>

                  <div
                    style={{
                      color:
                        item.color,
                      fontSize: 22,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isMobile && (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              {[
                {
                  value: '',
                  label: 'Semua',
                },

                {
                  value:
                    'voucher',
                  label:
                    'Voucher',
                },

                {
                  value:
                    'pemasukan_lain',

                  label:
                    'Pemasukan Lain',
                },

                {
                  value:
                    'kasbon',
                  label:
                    'Kasbon',
                },

                {
                  value:
                    'Dokter',
                  label:
                    'Dokter',
                },
              ].map((item) => (
                <button
                  key={item.value}
                  className="btn"
                  onClick={() => {
                    setPage(1);

                    setFilterTipe(
                      item.value
                    );
                  }}
                  style={{
                    borderRadius: 999,

                    padding:
                      '8px 18px',

                    border:
                      filterTipe ===
                      item.value
                        ? 'none'
                        : '1px solid #ddd',

                    background:
                      filterTipe ===
                      item.value
                        ? 'var(--color-green)'
                        : '#fff',

                    color:
                      filterTipe ===
                      item.value
                        ? '#fff'
                        : '#444',

                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              style={{
                position:
                  'relative',

                width: 300,
              }}
            >
              <FiSearch
                style={{
                  position:
                    'absolute',

                  left: 14,

                  top: '50%',

                  transform:
                    'translateY(-50%)',

                  color: '#888',
                }}
              />

              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Cari transaksi..."
                value={searchText}
                onChange={(e) => {
                  setPage(1);

                  setSearchText(
                    e.target.value
                  );
                }}
                style={{
                  borderRadius: 999,

                  background:
                    '#f5f5f5',

                  paddingLeft: 40,

                  height: 45,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
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
                            ? '#dc2626'
                            : row.tipe ===
                              'dokter'
                            ? '#2563eb'
                            : '#16a34a',
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
                            '#666',
                        }}
                      >
                        Voucher{' '}
                        {row.jumlah /
                          150000}{' '}
                        x
                        150.000
                      </span>
                    ) : (
                      row.keterangan ||
                      '-'
                    ),
                },

                {
                  key:
                    'aksi' as any,

                  label: 'Aksi',

                  render: (
                    row
                  ) => (
                    <button
                      className="btn btn-danger btn-sm rounded-circle"
                      onClick={() =>
                        handleDelete(
                          row
                        )
                      }
                      style={{
                        width: 36,
                        height: 36,
                      }}
                    >
                      <FiTrash2 />
                    </button>
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
              <div
                className="text-center py-5"
                style={{
                  color:
                    '#666',
                }}
              >
                <div
                  style={{
                    fontSize: 60,
                  }}
                >
                  📭
                </div>

                <h5 className="fw-bold mt-3">
                  Belum ada
                  transaksi
                </h5>

                <div>
                  Tambahkan
                  transaksi
                  pertama untuk
                  ladies ini
                </div>
              </div>
            )}

          {data.length >
            0 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className="btn btn-light border rounded-pill px-4"
                onClick={() =>
                  setPage(
                    page - 1
                  )
                }
                disabled={
                  page <= 1
                }
              >
                <FiChevronLeft />
              </button>

              <div
                className="fw-semibold"
                style={{
                  color:
                    '#555',
                }}
              >
                Halaman {page}{' '}
                dari{' '}
                {
                  totalPages
                }
              </div>

              <button
                className="btn btn-light border rounded-pill px-4"
                onClick={() =>
                  setPage(
                    page + 1
                  )
                }
                disabled={
                  page >=
                  totalPages
                }
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RiwayatTransaksi;