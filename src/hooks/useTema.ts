import { useSyncExternalStore } from 'react';
import { storeTema, type PilihanTema, type TemaAktif } from '../lib/tema';

/** Pilihan tema user & tema yang sedang aktif — ikut berubah saat tema
    sistem berganti (kalau pilihan = 'sistem'). Lihat src/lib/tema.ts. */
export function useTema(): {
  pilihan: PilihanTema;
  tema: TemaAktif;
  setPilihan: (p: PilihanTema) => void;
} {
  const pilihan = useSyncExternalStore(storeTema.subscribe, storeTema.getPilihan);
  const tema = useSyncExternalStore(storeTema.subscribe, storeTema.getTema);
  return { pilihan, tema, setPilihan: storeTema.setPilihan };
}
