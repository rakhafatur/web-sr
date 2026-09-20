import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePreference,
  readPreference,
  resolveTheme,
} from './theme';

describe('isThemePreference', () => {
  it('menerima tiga nilai yang sah', () => {
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('system')).toBe(true);
  });

  it('menolak nilai lain', () => {
    expect(isThemePreference('midnight')).toBe(false);
    expect(isThemePreference('')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(isThemePreference(undefined)).toBe(false);
    expect(isThemePreference(1)).toBe(false);
  });
});

describe('readPreference', () => {
  it('mengembalikan preferensi tersimpan kalau sah', () => {
    expect(readPreference(() => 'dark')).toBe('dark');
    expect(readPreference(() => 'light')).toBe('light');
    expect(readPreference(() => 'system')).toBe('system');
  });

  it('jatuh ke "dark" kalau belum pernah disimpan — gelap adalah tema bawaan produk', () => {
    expect(readPreference(() => null)).toBe('dark');
  });

  it('jatuh ke "dark" kalau isinya rusak', () => {
    expect(readPreference(() => 'bukan-tema')).toBe('dark');
  });

  it('membaca dari kunci penyimpanan yang benar', () => {
    const getItem = vi.fn(() => 'dark');
    readPreference(getItem);
    expect(getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  });
});

describe('resolveTheme', () => {
  it('preferensi eksplisit mengalahkan preferensi sistem', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('"system" mengikuti preferensi sistem', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('selalu mengembalikan nilai konkret, tidak pernah "system"', () => {
    const hasil = [
      resolveTheme('system', true),
      resolveTheme('system', false),
      resolveTheme('light', true),
      resolveTheme('dark', false),
    ];
    expect(hasil).not.toContain('system');
  });
});

describe('applyTheme', () => {
  it('menulis data-theme dengan nilai konkret', () => {
    const root = { setAttribute: vi.fn() };
    applyTheme(root, 'dark');
    expect(root.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
});

describe('script pra-paint di index.html', () => {
  const indexHtml = readFileSync(
    fileURLToPath(new URL('../../index.html', import.meta.url)),
    'utf-8',
  );

  it('memakai kunci penyimpanan yang sama dengan theme.ts', () => {
    expect(indexHtml).toContain(`'${THEME_STORAGE_KEY}'`);
  });

  it('menulis data-theme sebelum modul aplikasi dimuat', () => {
    const posisiScriptTema = indexHtml.indexOf('data-theme');
    const posisiModulAplikasi = indexHtml.indexOf('src="/src/main.tsx"');

    expect(posisiScriptTema).toBeGreaterThan(-1);
    expect(posisiModulAplikasi).toBeGreaterThan(-1);
    expect(posisiScriptTema).toBeLessThan(posisiModulAplikasi);
  });

  it('menangani localStorage yang melempar (mode privat)', () => {
    expect(indexHtml).toMatch(/catch/);
  });
});
