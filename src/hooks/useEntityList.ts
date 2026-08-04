import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import { confirmDialog } from '../components/ConfirmDialog';

/**
 * Data layer generik untuk halaman admin list bergaya "paginated + search + CRUD"
 * (dipakai Agent/Pengawas/Ladies — sebelumnya masing-masing menulis ulang query
 * Supabase yang sama persis). Bungkus query Supabase di satu tempat supaya
 * error handling & pola fetch konsisten, dan halaman cukup deklarasikan
 * tabel + kolom pencarian. Di-cache per (table, page, pageSize, keyword) lewat
 * React Query — balik ke halaman/pencarian yang sama langsung tampil dari cache.
 */
export function useEntityList<T extends { id: string }>(
  table: string,
  searchColumns: string[],
  pageSize: number
) {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['entity-list', table, page, pageSize, keyword],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .range(from, to);

      if (keyword.trim() && searchColumns.length > 0) {
        const orFilter = searchColumns
          .map((col) => `${col}.ilike.%${keyword}%`)
          .join(',');
        q = q.or(orFilter);
      }

      const { data, count, error } = await q;

      if (error) throw error;

      return { list: (data as T[]) || [], total: count || 0 };
    },
    meta: { errorLabel: 'data' },
  });

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['entity-list', table] });

  const remove = async (id: string, confirmMessage: string) => {
    if (!(await confirmDialog(confirmMessage))) return;

    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      toast.error('Gagal menghapus data. Coba lagi.');
    } else {
      invalidate();
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

    invalidate();
    return true;
  };

  return {
    list: query.data?.list ?? [],
    page,
    setPage,
    total,
    totalPages,
    keyword,
    setKeyword,
    loading: query.isLoading,
    refetch: () => query.refetch(),
    remove,
    save,
  };
}
