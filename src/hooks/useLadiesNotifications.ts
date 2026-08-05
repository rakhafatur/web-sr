import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabaseClient';

export type NotifTipe = 'voucher' | 'kasbon' | 'dokter' | 'pemasukan_lain';

export type NotifItem = {
  id: string;
  tipe: NotifTipe;
  message: string;
  createdAt: string;
};

const STORAGE_PREFIX = 'notif_last_seen_';
const LIMIT_PER_TABLE = 10;

/**
 * Feed aktivitas voucher/kasbon/dokter/pemasukan lain milik satu ladies —
 * tidak ada tabel notifikasi terpisah, langsung derive dari `created_at`
 * baris transaksi yang sudah ada. "Belum dibaca" ditentukan dari timestamp
 * "terakhir dilihat" yang disimpan di localStorage per ladies (bukan
 * `tanggal` transaksi — itu tanggal bisnis yang bisa di-backdate admin,
 * bukan kapan baris itu benar-benar masuk sistem).
 */
export function useLadiesNotifications(ladiesId: string | undefined) {
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  useEffect(() => {
    if (!ladiesId) return;

    const stored = localStorage.getItem(STORAGE_PREFIX + ladiesId);

    if (stored) {
      setLastSeenAt(stored);
    } else {
      // Pertama kali fitur ini dilihat ladies ini — anggap semua histori lama
      // sudah "terbaca", supaya tidak langsung banjir badge notifikasi lama.
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_PREFIX + ladiesId, now);
      setLastSeenAt(now);
    }
  }, [ladiesId]);

  const query = useQuery({
    queryKey: ['ladies-notifications', ladiesId],
    queryFn: async () => {
      const [voucher, kasbon, dokter, pemasukan] = await Promise.all([
        supabase
          .from('vouchers')
          .select('id, jumlah_voucher, created_at')
          .eq('ladies_id', ladiesId as string)
          .order('created_at', { ascending: false })
          .limit(LIMIT_PER_TABLE),

        supabase
          .from('kasbon')
          .select('id, jumlah, created_at')
          .eq('ladies_id', ladiesId as string)
          .order('created_at', { ascending: false })
          .limit(LIMIT_PER_TABLE),

        supabase
          .from('dokter')
          .select('id, jumlah, created_at')
          .eq('ladies_id', ladiesId as string)
          .order('created_at', { ascending: false })
          .limit(LIMIT_PER_TABLE),

        supabase
          .from('pemasukan_lain')
          .select('id, jumlah, created_at')
          .eq('ladies_id', ladiesId as string)
          .order('created_at', { ascending: false })
          .limit(LIMIT_PER_TABLE),
      ]);

      const combined: NotifItem[] = [
        ...(voucher.data || []).map((v) => ({
          id: `voucher-${v.id}`,
          tipe: 'voucher' as const,
          message: `Voucher ${v.jumlah_voucher} pcs dicatat`,
          createdAt: v.created_at,
        })),
        ...(kasbon.data || []).map((k) => ({
          id: `kasbon-${k.id}`,
          tipe: 'kasbon' as const,
          message: `Kasbon Rp${k.jumlah.toLocaleString('id-ID')} dicatat`,
          createdAt: k.created_at,
        })),
        ...(dokter.data || []).map((d) => ({
          id: `dokter-${d.id}`,
          tipe: 'dokter' as const,
          message: `Biaya dokter Rp${d.jumlah.toLocaleString('id-ID')} dicatat`,
          createdAt: d.created_at,
        })),
        ...(pemasukan.data || []).map((p) => ({
          id: `pemasukan-${p.id}`,
          tipe: 'pemasukan_lain' as const,
          message: `Pemasukan lain Rp${p.jumlah.toLocaleString('id-ID')} dicatat`,
          createdAt: p.created_at,
        })),
      ];

      return combined
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 20);
    },
    enabled: !!ladiesId,
    refetchInterval: 2 * 60 * 1000,
    meta: { errorLabel: 'notifikasi' },
  });

  const items = query.data ?? [];

  const unreadCount = lastSeenAt
    ? items.filter((item) => dayjs(item.createdAt).isAfter(lastSeenAt)).length
    : 0;

  const markAllSeen = useCallback(() => {
    if (!ladiesId) return;
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_PREFIX + ladiesId, now);
    setLastSeenAt(now);
  }, [ladiesId]);

  return { items, unreadCount, lastSeenAt, markAllSeen };
}
