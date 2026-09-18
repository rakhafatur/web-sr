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

  it('jatuh ke "system" kalau belum pernah disimpan', () => {
    expect(readPreference(() => null)).toBe('system');
  });

  it('jatuh ke "system" kalau isinya rusak', () => {
    expect(readPreference(() => 'bukan-tema')).toBe('system');
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
