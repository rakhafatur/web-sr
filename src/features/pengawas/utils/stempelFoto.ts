/**
 * Foto berstempel pengawas: waktu, lokasi, "Nama - SR AGENT", dan catatan
 * digambar di pita bawah foto. Semuanya terjadi di browser — tidak ada yang
 * disimpan ke server; hasilnya diunduh atau dibagikan (WA) oleh pengawas.
 *
 * Fungsi format di atas murni dan diuji (stempelFoto.test.ts); fungsi canvas
 * di bawah hanya menyusun hasilnya ke gambar.
 *
 * Catatan keamanan: stempel ini dokumentasi, BUKAN bukti yang tidak bisa
 * dipalsukan — jam HP dan GPS bisa diakali.
 */

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const dua = (n: number) => String(n).padStart(2, '0');

/** Nama zona dari offset `Date#getTimezoneOffset()` (menit, tanda terbalik). */
const namaZona = (offsetMenit: number) => {
  if (offsetMenit === -420) return 'WIB';
  if (offsetMenit === -480) return 'WITA';
  if (offsetMenit === -540) return 'WIT';
  const total = -offsetMenit;
  const tanda = total < 0 ? '-' : '+';
  const jam = Math.floor(Math.abs(total) / 60);
  const menit = Math.abs(total) % 60;
  return `GMT${tanda}${jam}${menit ? `:${dua(menit)}` : ''}`;
};

/** "Rabu, 11 Nov 2026 · 14:05 WIB" — waktu lokal HP saat foto diambil. */
export const formatWaktuStempel = (d: Date, offsetMenit = d.getTimezoneOffset()) =>
  `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()} · ` +
  `${dua(d.getHours())}:${dua(d.getMinutes())} ${namaZona(offsetMenit)}`;

/** Bagian `address` dari respons reverse geocoding Nominatim (OpenStreetMap). */
export type AlamatOsm = Partial<
  Record<
    | 'road'
    | 'house_number'
    | 'neighbourhood'
    | 'suburb'
    | 'village'
    | 'quarter'
    | 'city_district'
    | 'city'
    | 'town'
    | 'municipality'
    | 'county'
    | 'state',
    string
  >
>;

/**
 * Alamat ringkas untuk stempel: "Jalan X No. 12, Kelurahan, Kota".
 * Null bila tidak ada bagian yang bisa dipakai.
 */
export const ringkasAlamat = (a: AlamatOsm | undefined): string | null => {
  if (!a) return null;
  const jalan = a.road ? (a.house_number ? `${a.road} No. ${a.house_number}` : a.road) : undefined;
  const area = a.suburb ?? a.village ?? a.quarter ?? a.neighbourhood ?? a.city_district;
  const kota = a.city ?? a.town ?? a.municipality ?? a.county ?? a.state;

  const bagian: string[] = [];
  for (const b of [jalan, area, kota, a.state]) {
    if (b && !bagian.includes(b)) bagian.push(b);
  }
  // Provinsi hanya dipakai bila bagian lain kurang.
  if (bagian.length > 2 && a.state && bagian[bagian.length - 1] === a.state) bagian.pop();
  return bagian.length ? bagian.join(', ') : null;
};

/**
 * Baris lokasi di stempel: nama tempat bila ada; koordinat hanya sebagai
 * cadangan saat nama tempat gagal diambil (supaya foto tidak tanpa lokasi).
 */
export const teksLokasi = (alamat: string | null, koordinat: { lat: number; lon: number } | null) => {
  if (alamat) return alamat;
  if (koordinat) return `${koordinat.lat.toFixed(5)}, ${koordinat.lon.toFixed(5)}`;
  return 'Lokasi tidak tersedia';
};

/** Baris nama di stempel: nama akun yang login + penanda agensi. */
export const teksNama = (nama: string) => {
  const n = nama.trim();
  return n ? `${n} - SR AGENT` : 'SR AGENT';
};

/** Ukuran keluaran: sisi terpanjang dibatasi, rasio tetap, tidak diperbesar. */
export const ukuranKeluaran = (w: number, h: number, maks: number) => {
  const skala = Math.min(1, maks / Math.max(w, h));
  return { w: Math.round(w * skala), h: Math.round(h * skala) };
};

/**
 * Bungkus teks per kata ke beberapa baris selebar `lebar`. Baris terakhir
 * yang tidak muat dipotong dengan elipsis. `ukur` = lebar teks (di canvas:
 * `ctx.measureText(s).width`).
 */
export const potongBaris = (
  teks: string,
  lebar: number,
  maksBaris: number,
  ukur: (s: string) => number
): string[] => {
  const kata = teks.trim().split(/\s+/).filter(Boolean);
  const baris: string[] = [];
  let i = 0;

  const potongElipsis = (s: string) => {
    let t = s;
    while (t.length > 0 && ukur(`${t}…`) > lebar) t = t.slice(0, -1);
    return `${t.trimEnd()}…`;
  };

  while (i < kata.length && baris.length < maksBaris) {
    const terakhir = baris.length === maksBaris - 1;
    let isi = '';
    while (i < kata.length) {
      const coba = isi ? `${isi} ${kata[i]}` : kata[i];
      if (ukur(coba) <= lebar) {
        isi = coba;
        i++;
      } else break;
    }

    if (terakhir && i < kata.length) {
      // Sisa teks tidak muat di baris terakhir.
      baris.push(potongElipsis([isi, ...kata.slice(i)].filter(Boolean).join(' ')));
      return baris;
    }
    if (!isi) {
      // Satu kata lebih lebar dari baris: pecah per karakter.
      let potong = kata[i];
      while (potong.length > 1 && ukur(potong) > lebar) potong = potong.slice(0, -1);
      kata[i] = kata[i].slice(potong.length);
      isi = potong;
    }
    baris.push(isi);
  }
  return baris;
};

// =========================================================
// CANVAS
// =========================================================

/** Sisi terpanjang foto keluaran — cukup tajam, ringan untuk WA (~0,5 MB). */
export const SISI_MAKS = 1920;

// Warna stempel ditulis langsung (bukan token tema): stempel bagian dari
// gambar, harus sama persis apa pun tema yang sedang dipakai di aplikasi.
const WARNA = {
  pita: 'rgba(0, 0, 0, 0.72)',
  teks: '#ffffff',
  teksRedup: 'rgba(255, 255, 255, 0.82)',
};

const FONT = '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export type InfoStempel = {
  waktu: string;
  lokasi: string;
  nama: string;
  catatan: string;
};

type Baris = { teks: string; font: string; warna: string; tinggi: number };

/** Gambar foto + pita stempel ke canvas baru seukuran keluaran. */
export const gambarFotoBerstempel = (foto: HTMLImageElement, info: InfoStempel): HTMLCanvasElement => {
  const { w, h } = ukuranKeluaran(foto.naturalWidth, foto.naturalHeight, SISI_MAKS);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(foto, 0, 0, w, h);

  // Satuan relatif ke sisi pendek, supaya stempel proporsional di foto
  // potret maupun lanskap.
  const s = Math.min(w, h) / 1080;
  const pad = Math.round(36 * s);
  const ukWaktu = Math.round(36 * s);
  const ukTeks = Math.round(29 * s);
  const jarak = 1.32;
  const lebarTeks = w - pad * 2;

  const fontWaktu = `700 ${ukWaktu}px ${FONT}`;
  const fontNama = `600 ${ukTeks}px ${FONT}`;
  const fontTeks = `400 ${ukTeks}px ${FONT}`;

  const bungkus = (teks: string, font: string, maks: number) => {
    ctx.font = font;
    return potongBaris(teks, lebarTeks, maks, (t) => ctx.measureText(t).width);
  };

  const baris: Baris[] = [
    ...bungkus(info.waktu, fontWaktu, 1).map((t) => ({ teks: t, font: fontWaktu, warna: WARNA.teks, tinggi: ukWaktu })),
    ...bungkus(info.lokasi, fontTeks, 2).map((t) => ({ teks: t, font: fontTeks, warna: WARNA.teksRedup, tinggi: ukTeks })),
    ...bungkus(info.nama, fontNama, 1).map((t) => ({ teks: t, font: fontNama, warna: WARNA.teks, tinggi: ukTeks })),
    ...bungkus(info.catatan, fontTeks, 2).map((t) => ({ teks: t, font: fontTeks, warna: WARNA.teksRedup, tinggi: ukTeks })),
  ];

  const tinggiTeks = baris.reduce((n, b) => n + b.tinggi * jarak, 0);
  const tinggiPita = tinggiTeks + pad * 2;
  const atasPita = h - tinggiPita;

  // Gradasi lembut di atas pita supaya tidak terlihat seperti kotak tempelan.
  const gradasi = ctx.createLinearGradient(0, atasPita - pad * 2, 0, atasPita);
  gradasi.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradasi.addColorStop(1, WARNA.pita);
  ctx.fillStyle = gradasi;
  ctx.fillRect(0, atasPita - pad * 2, w, pad * 2);
  ctx.fillStyle = WARNA.pita;
  ctx.fillRect(0, atasPita, w, tinggiPita);

  ctx.textBaseline = 'top';
  let y = atasPita + pad + (tinggiPita - pad * 2 - tinggiTeks) / 2;
  for (const b of baris) {
    ctx.font = b.font;
    ctx.fillStyle = b.warna;
    ctx.fillText(b.teks, pad, y + (b.tinggi * (jarak - 1)) / 2);
    y += b.tinggi * jarak;
  }

  return canvas;
};

/** Canvas → JPEG Blob. */
export const keJpeg = (canvas: HTMLCanvasElement, kualitas = 0.85) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal membuat gambar'))), 'image/jpeg', kualitas)
  );
