import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./theme.css', import.meta.url)),
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

function namaToken(blok: string): string[] {
  return [...blok.matchAll(/--color-[a-z0-9-]+/g)].map((m) => m[0]);
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
