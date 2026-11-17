import { useSyncExternalStore } from 'react';
import { layarTerbuka, storeMasuk, type KeadaanMasuk } from '../lib/momenMasuk';

/** Keadaan splash & tirai — lihat src/lib/momenMasuk.ts. */
export function useMomenMasuk(): KeadaanMasuk {
  return useSyncExternalStore(storeMasuk.subscribe, storeMasuk.get);
}

/** true begitu tidak ada splash/tirai yang menutupi layar. Dipakai halaman
    untuk menunda animasi masuknya sampai benar-benar terlihat. */
export function useLayarTerbuka(): boolean {
  return layarTerbuka(useMomenMasuk());
}
