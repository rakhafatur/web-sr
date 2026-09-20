import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./theme.css', import.meta.url)),
  'utf-8',
);

const cssLama = readFileSync(
  fileURLToPath(new URL('./variable.css', import.meta.url)),
  'utf-8',
);

/** Ambil isi satu blok `{ ... }` yang diawali penanda tertentu. */
function ambilBlok(penanda: string): string {
  const mulai = css.indexOf(penanda);
  if (mulai === -1) throw new Error(`Blok "${penanda}" tidak ditemukan di theme.css`);
  const buka = css.indexOf('{', mulai);
  const tutup = css.indexOf('\n}', buka);
  return css.slice(buka, tutup);
}

/** Hanya DEKLARASI (diikuti titik dua), bukan penyebutan di komentar —
    komentar di theme.css menyebut nama token lama untuk menjelaskan kenapa
    nama barunya berbeda, dan itu bukan token yang benar-benar dideklarasikan. */
function namaToken(blok: string): string[] {
  return [...blok.matchAll(/(--color-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
}

/** Token yang sengaja sama di kedua tema karena selalu di atas warna brand. */
const SENGAJA_SAMA = ['--color-fg-on-brand'];

describe('token tema', () => {
  const terang = namaToken(ambilBlok('@theme'));
  const gelap = namaToken(ambilBlok("[data-theme='dark']"));

  it('tema terang mendefinisikan token warna', () => {
    expect(terang.length).toBeGreaterThan(20);
  });

  it('setiap token terang punya nilai gelap', () => {
    const kurang = terang.filter(
      (t) => !gelap.includes(t) && !SENGAJA_SAMA.includes(t),
    );
    expect(kurang, `token tanpa nilai gelap: ${kurang.join(', ')}`).toEqual([]);
  });

  it('tema gelap tidak memperkenalkan token yang tidak ada di terang', () => {
    const asing = gelap.filter((t) => !terang.includes(t));
    expect(asing, `token hanya ada di gelap: ${asing.join(', ')}`).toEqual([]);
  });

  it('tema gelap mengumumkan color-scheme supaya kontrol native ikut gelap', () => {
    expect(ambilBlok("[data-theme='dark']")).toContain('color-scheme: dark');
  });
});

describe('tidak bertabrakan dengan token lama', () => {
  /**
   * variable.css (tema lama) dan theme.css (tema baru) sama-sama mendeklarasikan
   * variabel di :root, dan theme.css diimpor belakangan sehingga selalu menang.
   *
   * Nama yang sama di kedua berkas berarti halaman lama diam-diam memakai nilai
   * dari tema baru. Ini pernah benar-benar terjadi: `--color-surface` lama
   * (#17181a, gelap) tertimpa nilai baru (#fcfcfd, terang), sehingga kartu di
   * halaman yang belum dimigrasi berubah jadi putih di atas latar hampir hitam —
   * dan hanya terlihat di perangkat ber-OS terang, sehingga lolos pengecekan.
   *
   * Selama masa transisi, kedua berkas HARUS memakai nama yang berbeda.
   *
   * Memeriksa SEMUA custom property, bukan hanya `--color-*`: versi pertama
   * test ini hanya melihat warna, dan karena itu melewatkan tabrakan kedua
   * pada `--radius-md/lg/xl` yang diam-diam mengecilkan sudut di seluruh
   * halaman lama.
   */
  function namaToken(sumber: string): string[] {
    return [...sumber.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map((m) => m[1]);
  }

  it('tidak ada satu pun nama token yang dipakai kedua berkas', () => {
    const baru = new Set(namaToken(ambilBlok('@theme')));
    const bentrok = [...new Set(namaToken(cssLama))].filter((nama) => baru.has(nama));

    expect(
      bentrok,
      `nama token dipakai variable.css DAN theme.css: ${bentrok.join(', ')}`,
    ).toEqual([]);
  });
});

describe('skala radius', () => {
  const blok = ambilBlok('@theme');

  it('mendefinisikan tepat lima nilai radius sesuai spec', () => {
    expect(blok).toContain('--radius-sm: 6px');
    expect(blok).toContain('--radius-md: 8px');
    expect(blok).toContain('--radius-lg: 12px');
    expect(blok).toContain('--radius-xl: 16px');
  });
});

describe('skala tipografi', () => {
  const blok = ambilBlok('@theme');

  it('tidak ada ukuran huruf di bawah 12px', () => {
    const ukuran = [...blok.matchAll(/--text-[a-z0-9]+:\s*(\d+)px/g)].map((m) =>
      Number(m[1]),
    );
    expect(ukuran.length).toBeGreaterThan(5);
    const terlaluKecil = ukuran.filter((u) => u < 12);
    expect(terlaluKecil, `ukuran < 12px: ${terlaluKecil.join(', ')}`).toEqual([]);
  });

  it('memakai skala spec, bukan bawaan Tailwind', () => {
    // Bawaan Tailwind: sm 14, base 16. Spec kita lebih padat.
    expect(blok).toContain('--text-sm: 13px');
    expect(blok).toContain('--text-base: 14px');
    // 16px khusus input di mobile (anti auto-zoom iOS).
    expect(blok).toContain('--text-md: 16px');
  });

  it('setiap ukuran huruf punya tinggi baris', () => {
    const ukuran = [...blok.matchAll(/--text-([a-z0-9]+):\s*\d+px/g)].map((m) => m[1]);
    const kurang = ukuran.filter(
      (nama) => !blok.includes(`--text-${nama}--line-height:`),
    );
    expect(kurang, `tanpa line-height: ${kurang.join(', ')}`).toEqual([]);
  });
});

describe('token lama peka tema', () => {
  /**
   * Halaman yang belum dimigrasi masih memakai token di variable.css. Supaya
   * ikut berganti saat tema berganti, setiap token yang nilainya HARFIAH
   * (bukan alias `var(...)`) wajib punya pasangan di blok gelap. Token yang
   * berupa alias tidak perlu — ia mengikuti token baru yang sudah dwi-tema.
   */
  function ambilBlokDari(sumber: string, penanda: string): string {
    const mulai = sumber.indexOf(penanda);
    if (mulai === -1) throw new Error(`Blok "${penanda}" tidak ditemukan di variable.css`);
    const buka = sumber.indexOf('{', mulai);
    const tutup = sumber.indexOf('\n}', buka);
    return sumber.slice(buka, tutup);
  }

  function deklarasi(blok: string): { nama: string; nilai: string }[] {
    return [...blok.matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => ({
      nama: m[1],
      nilai: m[2].trim(),
    }));
  }

  /** Sengaja sama di kedua tema: putih literal di atas gradient, dan tinta
      di atas warna emas yang memang selalu terang. */
  const SENGAJA_SAMA_LAMA = ['--color-white', '--color-ink-on-warning'];

  const terang = deklarasi(ambilBlokDari(cssLama, ':root {'));
  const gelap = deklarasi(ambilBlokDari(cssLama, "[data-theme='dark']"));
  const namaGelap = new Set(gelap.map((d) => d.nama));

  it('blok gelap ada dan berisi token', () => {
    expect(gelap.length).toBeGreaterThan(20);
  });

  it('setiap token berwarna harfiah punya pasangan gelap', () => {
    const kurang = terang
      .filter((d) => !d.nilai.startsWith('var('))
      .filter((d) => !SENGAJA_SAMA_LAMA.includes(d.nama))
      .filter((d) => !namaGelap.has(d.nama))
      .map((d) => d.nama);

    expect(kurang, `token tanpa nilai gelap: ${kurang.join(', ')}`).toEqual([]);
  });

  it('blok gelap tidak memperkenalkan token yang tidak ada di terang', () => {
    const namaTerang = new Set(terang.map((d) => d.nama));
    const asing = gelap.map((d) => d.nama).filter((n) => !namaTerang.has(n));
    expect(asing, `token hanya ada di gelap: ${asing.join(', ')}`).toEqual([]);
  });

  it('skala abu terbalik arah — gray-900 jadi teks gelap di tema terang', () => {
    const g900 = terang.find((d) => d.nama === '--color-gray-900')?.nilai;
    const g50 = terang.find((d) => d.nama === '--color-gray-50')?.nilai;
    expect(g900).toBe('#101828');
    expect(g50).toBe('#fcfcfd');
  });
});
