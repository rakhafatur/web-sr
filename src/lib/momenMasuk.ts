/**
 * Momen masuk — dua lapisan yang sesaat menutupi seluruh layar:
 *  1. splash saat app dibuka (components/momen/SplashScreen), dan
 *  2. tirai setelah login berhasil (components/momen/TiraiMasuk).
 *
 * Store kecil ini memberi tahu isi halaman KAPAN layar benar-benar terlihat,
 * supaya animasi masuk (Home, login) baru main saat lapisannya terangkat —
 * bukan diam-diam selesai di belakangnya.
 *
 * Bukan Redux: Redux hanya untuk sesi user (lihat CLAUDE.md), dan ini murni
 * keadaan tampilan yang tidak perlu disimpan.
 */

export type FaseTirai = 'diam' | 'menutup' | 'tertutup' | 'membuka';

export type TitikAsal = { x: number; y: number };

export type KeadaanMasuk = {
  /** Splash pembuka masih menutupi layar. */
  splash: boolean;
  tirai: FaseTirai;
  /** Titik asal lingkaran tirai (px terhadap viewport); null = tengah bawah. */
  asal: TitikAsal | null;
  /** Nama yang disapa di tirai. */
  nama: string | null;
};

/** Isi halaman boleh mulai beranimasi: tidak ada lapisan yang masih menutup.
    Saat tirai `membuka`, isi sudah boleh muncul bersamaan dengan terangkatnya. */
export function layarTerbuka(k: Pick<KeadaanMasuk, 'splash' | 'tirai'>): boolean {
  return !k.splash && (k.tirai === 'diam' || k.tirai === 'membuka');
}

/** Paling singkat tirai diam menutup (menyapa) sebelum terangkat. */
export const TAHAN_TIRAI_MS = 750;
/** Paling lama tirai menunggu halaman tujuan siap — setelah itu tetap
    terangkat, supaya jaringan lambat tidak menahan user di balik tirai. */
export const BATAS_TUNGGU_ISI_MS = 3500;
/** Batas tunggu kalau komponen tirai tidak pernah melapor selesai menutup. */
const BATAS_TUTUP_MS = 1200;

let keadaan: KeadaanMasuk = { splash: true, tirai: 'diam', asal: null, nama: null };
const pendengar = new Set<() => void>();
let selesaiMenutup: (() => void) | null = null;

// Syarat tirai terangkat: jeda sapaan lewat DAN (isi siap ATAU batas tunggu habis).
let tahanLewat = false;
let isiSiap = false;
let batasHabis = false;
let pewaktu: ReturnType<typeof setTimeout>[] = [];

const cobaBuka = () => {
  const menutupi = keadaan.tirai === 'tertutup' || keadaan.tirai === 'menutup';
  if (menutupi && tahanLewat && (isiSiap || batasHabis)) ubah({ tirai: 'membuka' });
};

const ubah = (sebagian: Partial<KeadaanMasuk>) => {
  keadaan = { ...keadaan, ...sebagian };
  pendengar.forEach((fn) => fn());
};

export const storeMasuk = {
  subscribe(fn: () => void) {
    pendengar.add(fn);
    return () => pendengar.delete(fn);
  },
  get: () => keadaan,

  /** Splash mulai menghilang — isi di bawahnya boleh mulai muncul. */
  selesaiSplash() {
    if (keadaan.splash) ubah({ splash: false });
  },

  /** Tutup layar dengan tirai. Selesai (resolve) saat layar sudah tertutup
      penuh, jadi pemanggil bisa berpindah halaman tanpa terlihat. */
  tutupTirai(opsi: { asal?: TitikAsal | null; nama?: string | null } = {}): Promise<void> {
    return new Promise((resolve) => {
      const beres = () => {
        if (selesaiMenutup !== beres) return;
        selesaiMenutup = null;
        ubah({ tirai: 'tertutup' });
        resolve();
      };
      selesaiMenutup = beres;
      pewaktu.forEach(clearTimeout);
      pewaktu = [];
      tahanLewat = false;
      isiSiap = false;
      batasHabis = false;
      ubah({ tirai: 'menutup', asal: opsi.asal ?? null, nama: opsi.nama ?? null });
      // Cadangan: kalau animasinya tidak pernah melapor, jangan sampai login
      // tersangkut di balik tirai.
      setTimeout(beres, BATAS_TUTUP_MS);
    });
  },

  /** Dipanggil komponen tirai saat animasi menutup selesai. */
  laporTertutup() {
    selesaiMenutup?.();
  },

  /** Minta tirai diangkat: terangkat setelah jeda sapaan lewat dan halaman
      tujuan melapor siap (`laporIsiSiap`), atau saat batas tunggu habis. */
  bukaTirai(tunda = TAHAN_TIRAI_MS, batas = BATAS_TUNGGU_ISI_MS) {
    pewaktu.push(
      setTimeout(() => {
        tahanLewat = true;
        cobaBuka();
      }, tunda),
      setTimeout(() => {
        batasHabis = true;
        cobaBuka();
      }, batas)
    );
  },

  /** Dipanggil halaman tujuan saat isinya (bukan kerangka memuat) sudah
      tampil. Aman dipanggil kapan pun — tanpa tirai tidak berpengaruh. */
  laporIsiSiap() {
    isiSiap = true;
    cobaBuka();
  },

  /** Dipanggil komponen tirai saat animasi membuka selesai. */
  laporTerbuka() {
    if (keadaan.tirai === 'membuka') ubah({ tirai: 'diam', asal: null, nama: null });
  },
};
