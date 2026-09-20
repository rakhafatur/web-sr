import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Penjaga kontras WCAG untuk token warna.
 *
 * Ini menutup kelas bug yang sudah dua kali lolos ke produksi: nilai warna
 * yang "kelihatan wajar" di satu tema tapi tidak terbaca di tema lain.
 * `--color-fg-faint` di tema terang sempat bernilai #98a2b3 yang hanya
 * mencapai 2,5:1 — gagal untuk teks apa pun — dan tidak ada yang menangkapnya
 * sampai kontrasnya benar-benar diukur.
 *
 * Nilai dibaca langsung dari theme.css, bukan disalin ke sini, supaya test
 * ini tidak bisa jadi usang tanpa ketahuan.
 */

const css = readFileSync(fileURLToPath(new URL('./theme.css', import.meta.url)), 'utf-8');

function ambilBlok(penanda: string): string {
  const mulai = css.indexOf(penanda);
  if (mulai === -1) throw new Error(`Blok "${penanda}" tidak ditemukan di theme.css`);
  const buka = css.indexOf('{', mulai);
  return css.slice(buka, css.indexOf('\n}', buka));
}

function token(blok: string, nama: string): string {
  const cocok = blok.match(new RegExp(`${nama}\\s*:\\s*(#[0-9a-fA-F]{6})`));
  if (!cocok) throw new Error(`Token ${nama} tidak ditemukan atau bukan hex 6 digit`);
  return cocok[1];
}

/** Luminansi relatif menurut WCAG 2.x. */
function luminansi(hex: string): number {
  const kanal = [1, 3, 5].map((i) => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * kanal[0] + 0.7152 * kanal[1] + 0.0722 * kanal[2];
}

function rasio(a: string, b: string): number {
  const [terang, gelap] = [luminansi(a), luminansi(b)].sort((x, y) => y - x);
  return (terang + 0.05) / (gelap + 0.05);
}

const terang = ambilBlok('@theme');
const gelap = ambilBlok("[data-theme='dark']");

/** Tema gelap menimpa sebagian token saja; sisanya diwarisi dari blok terang. */
function nilai(blok: string, nama: string): string {
  try {
    return token(blok, nama);
  } catch {
    return token(terang, nama);
  }
}

/** Pasangan yang membawa teks — ambang AA untuk teks normal. */
const PASANGAN_TEKS: [string, string, string][] = [
  ['teks utama di canvas', '--color-fg', '--color-canvas'],
  ['teks utama di kartu', '--color-fg', '--color-card'],
  ['teks sekunder di kartu', '--color-fg-muted', '--color-card'],
  ['teks redup di kartu', '--color-fg-faint', '--color-card'],
  ['label tombol utama', '--color-fg-on-brand', '--color-brand'],
  ['uang masuk di kartu', '--color-money-in', '--color-card'],
  ['uang keluar di kartu', '--color-money-out', '--color-card'],
  ['teks sukses di latarnya', '--color-success-fg', '--color-success-bg'],
  ['teks peringatan di latarnya', '--color-warning-fg', '--color-warning-bg'],
  ['teks bahaya di latarnya', '--color-danger-fg', '--color-danger-bg'],
];

describe.each([
  ['tema terang', terang],
  ['tema gelap', gelap],
])('kontras %s', (_nama, blok) => {
  it.each(PASANGAN_TEKS)('%s mencapai 4.5:1', (_label, depan, belakang) => {
    const r = rasio(nilai(blok, depan), nilai(blok, belakang));
    expect(Number(r.toFixed(2))).toBeGreaterThanOrEqual(4.5);
  });

  it('garis pembatas terlihat di atas canvas', () => {
    // Bukan teks, jadi ambangnya lebih longgar — yang penting tidak lenyap.
    const r = rasio(nilai(blok, '--color-line'), nilai(blok, '--color-canvas'));
    expect(r).toBeGreaterThan(1.3);
  });
});
