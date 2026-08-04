import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import { confirmDialog } from '../components/ConfirmDialog';

/**
 * Data layer generik untuk halaman admin list bergaya "paginated + search + CRUD"
 * (dipakai Agent/Pengawas/Ladies — sebelumnya masing-masing menulis ulang query
 * Supabase yang sama persis). Bungkus query Supabase di satu tempat supaya
 * error handling & pola fetch konsisten, dan halaman cukup deklarasikan
 * tabel + kolom pencarian.
 */
export function useEntityList<T extends { id: string }>(
  table: string,
  searchColumns: string[],
  pageSize: number
) {
  const [list, setList] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    setLoading(true);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(from, to);

    if (keyword.trim() && searchColumns.length > 0) {
      const orFilter = searchColumns
        .map((col) => `${col}.ilike.%${keyword}%`)
        .join(',');
      query = query.or(orFilter);
    }

    const { data, count, error } = await query;

    if (error) {
      toast.error('Gagal memuat data. Coba lagi.');
      setList([]);
      setTotal(0);
    } else {
      setList((data as T[]) || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, page, pageSize, keyword]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const remove = async (id: string, confirmMessage: string) => {
    if (!(await confirmDialog(confirmMessage))) return;

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      toast.error('Gagal menghapus data. Coba lagi.');
    } else {
      fetchList();
    }
  };

  const save = async (data: Record<string, unknown>, editId: string | null) => {
    const { error } = editId
      ? await supabase.from(table).update(data).eq('id', editId)
      : await supabase.from(table).insert([data]);

    if (error) {
      toast.error(editId ? 'Gagal memperbarui data.' : 'Gagal menambah data.');
      return false;
    }

    fetchList();
    return true;
  };

  return {
    list,
    page,
    setPage,
    total,
    totalPages,
    keyword,
    setKeyword,
    loading,
    refetch: fetchList,
    remove,
    save,
  };
}
