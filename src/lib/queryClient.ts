import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { reportError } from './reportError';

/**
 * Satu instance QueryClient untuk seluruh app. `staleTime` 30 detik dipilih
 * supaya pindah halaman terasa instan (data lama langsung tampil dari cache)
 * tanpa data terasa terlalu basi untuk app yang datanya berubah cukup sering
 * (transaksi baru, dsb). `retry: 1` supaya toast error muncul cepat, bukan
 * nunggu retry berkali-kali dengan backoff.
 *
 * `queryCache.onError` global — satu tempat untuk toast error di semua query,
 * dipicu otomatis kapan pun sebuah query gagal. Pesannya bisa dikustom lewat
 * `meta: { errorLabel: '...' }` di masing-masing useQuery.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const label = (query.meta?.errorLabel as string | undefined) || 'data';
      toast.error(`Gagal memuat ${label}. Coba lagi.`);

      // Toast memberi tahu user, laporan memberi tahu kita. Query yang gagal
      // sering jadi petunjuk pertama saat ada masalah RLS atau kolom berubah.
      reportError(error, {
        sumber: 'query',
        detail: JSON.stringify(query.queryKey),
      });
    },
  }),
});
