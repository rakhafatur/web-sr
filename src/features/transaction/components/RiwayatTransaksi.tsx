import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DataTable from '../../../components/DataTable';

import { useMediaQuery } from 'react-responsive';
import dayjs from 'dayjs';

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

const RiwayatTransaksi = ({ ladiesId, refresh }: Props) => {
  const [data, setData] = useState<Transaksi[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ jumlah: '', keterangan: '' });
  const [filterTipe, setFilterTipe] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState<keyof Transaksi>('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getTableName = (tipe: string) => {
    switch (tipe) {
      case 'voucher': return 'vouchers';
      case 'kasbon': return 'kasbon';
      case 'pemasukan_lain': return 'pemasukan_lain';
      default: return '';
    }
  };

  const fetchData = async () => {
    const [voucher, kasbon, pemasukanLain] = await Promise.all([
      supabase.from('vouchers').select('*').eq('ladies_id', ladiesId),
      supabase.from('kasbon').select('*').eq('ladies_id', ladiesId),
      supabase.from('pemasukan_lain').select('*').eq('ladies_id', ladiesId),
    ]);

    const combined = [
      ...(voucher.data || []).map((v) => ({ ...v, tipe: 'voucher', tipeLabel: 'Pemasukan (Voucher)', priority: 1 })),
      ...(pemasukanLain.data || []).map((p) => ({ ...p, tipe: 'pemasukan_lain', tipeLabel: 'Pemasukan Lain', priority: 2 })),
      ...(kasbon.data || []).map((k) => ({ ...k, tipe: 'kasbon', tipeLabel: 'Pengeluaran (Kasbon)', priority: 3 })),
    ];

    const search = searchText.toLowerCase();
    const filtered = combined.filter((d) =>
      (filterTipe ? d.tipe === filterTipe : true) &&
      (d.tanggal.includes(search) || (d.keterangan || '').toLowerCase().includes(search))
    );

    const sorted = filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    const offset = (page - 1) * limit;
    const paginated = sorted.slice(offset, offset + limit);
    setData(paginated);
    setTotal(filtered.length);
  };

  const handleSort = (key: keyof Transaksi) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (row: any) => {
    const confirmDelete = window.confirm('❗ Yakin ingin menghapus transaksi ini?');
    if (!confirmDelete) return;

    const table = getTableName(row.tipe);
    const { error } = await supabase.from(table).delete().eq('id', row.id);
    if (error) alert('❌ Gagal hapus data: ' + error.message);
    else fetchData();
  };

  const handleEdit = (row: any) => {
    setEditId(row.id);
    setEditForm({ jumlah: row.jumlah.toString(), keterangan: row.keterangan || '' });
  };

  const handleSave = async (row: any) => {
    const table = getTableName(row.tipe);
    if (!table) return alert('❌ Nama tabel tidak valid.');

    const cleanNumber = (val: string) => parseFloat(val.replace(/\./g, '').replace(/[^0-9]/g, ''));
    const jumlahValue = cleanNumber(editForm.jumlah);

    const { error } = await supabase.from(table).update({
      jumlah: jumlahValue,
      keterangan: editForm.keterangan,
    }).eq('id', row.id);

    if (error) alert('❌ Gagal update: ' + error.message);
    else {
      setEditId(null);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, [ladiesId, page, refresh, filterTipe, searchText, sortKey, sortOrder]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-3">
      <div className="mb-3 d-flex justify-content-between align-items-center gap-2">
        <div className="d-flex gap-2 align-items-center">
          <label className="text-light fw-semibold mb-0">Tipe:</label>
          <select
            className="form-select bg-dark text-light border-secondary"
            value={filterTipe}
            onChange={(e) => { setPage(1); setFilterTipe(e.target.value); }}
            style={{ width: '180px' }}
          >
            <option value="">Semua</option>
            <option value="voucher">Voucher</option>
            <option value="pemasukan_lain">Pemasukan Lain</option>
            <option value="kasbon">Kasbon</option>
          </select>
        </div>
        <input
          type="text"
          className="form-control bg-dark text-light border-secondary"
          placeholder="Cari tanggal / keterangan..."
          style={{ maxWidth: '300px' }}
          value={searchText}
          onChange={(e) => { setPage(1); setSearchText(e.target.value); }}
        />
      </div>

      <DataTable
        columns={[
          { key: 'tanggal', label: 'Tanggal', sortable: true },
          { key: 'tipeLabel', label: 'Tipe' },
          {
            key: 'jumlah',
            label: 'Jumlah',
            render: (row) =>
              editId === row.id ? (
                <input
                  className="form-control"
                  type="text"
                  value={editForm.jumlah}
                  onChange={(e) => setEditForm({ ...editForm, jumlah: e.target.value })}
                />
              ) : (
                `Rp${Number(row.jumlah).toLocaleString()}`
              ),
          },
          {
            key: 'keterangan',
            label: 'Keterangan',
            render: (row) =>
              row.tipe === 'voucher' ? (
                `Voucher ${row.jumlah / 150000} x 150.000`
              ) : editId === row.id ? (
                <input
                  className="form-control"
                  type="text"
                  value={editForm.keterangan}
                  onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })}
                />
              ) : (
                row.keterangan || '-'
              ),
          },
          {
            key: 'aksi' as any,
            label: 'Aksi',
            render: (row) => (
              <>
                {editId === row.id ? (
                  <button className="btn btn-sm btn-success me-2" onClick={() => handleSave(row)}>
                    💾 Simpan
                  </button>
                ) : (
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(row)}>
                    ✏️ Edit
                  </button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row)}>
                  🗑️ Hapus
                </button>
              </>
            ),
          },
        ]}
        data={data}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-secondary" onClick={() => setPage(page - 1)} disabled={page <= 1}>
          ← Prev
        </button>
        <span>Halaman {page} dari {totalPages}</span>
        <button className="btn btn-secondary" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
          Next →
        </button>
      </div>
    </div>
  );
};

export default RiwayatTransaksi;