import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  THEME_STORAGE_KEY,
  applyTheme,
  readPreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme';

type ThemeContextValue = {
  /** Pilihan pengguna, termasuk 'system'. */
  preference: ThemePreference;
  /** Tema yang benar-benar berlaku sekarang. Tidak pernah 'system'. */
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const KUERI_GELAP = '(prefers-color-scheme: dark)';

/** localStorage melempar di mode privat / saat cookie diblokir — di situ
    aplikasi tetap harus jalan, cukup tanpa mengingat pilihan. */
function bacaPenyimpanan(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Menjaga <html data-theme> tetap benar selama aplikasi berjalan.
 *
 * Nilai awalnya sudah ditulis oleh script pra-paint di index.html — provider
 * ini tidak menggantikannya, hanya meneruskannya. Keduanya memakai aturan
 * yang sama dari src/lib/theme.ts.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readPreference(bacaPenyimpanan),
  );

  const [sistemGelap, setSistemGelap] = useState(
    () => window.matchMedia(KUERI_GELAP).matches,
  );

  // Preferensi OS bisa berubah saat aplikasi sedang terbuka (mis. jadwal
  // gelap otomatis di HP) — tanpa ini, tampilan baru ikut setelah reload.
  useEffect(() => {
    const mq = window.matchMedia(KUERI_GELAP);
    const saatBerubah = (e: MediaQueryListEvent) => setSistemGelap(e.matches);

    mq.addEventListener('change', saatBerubah);
    return () => mq.removeEventListener('change', saatBerubah);
  }, []);

  const theme = resolveTheme(preference, sistemGelap);

  useEffect(() => {
    applyTheme(document.documentElement, theme);
  }, [theme]);

  const setPreference = useCallback((berikutnya: ThemePreference) => {
    setPreferenceState(berikutnya);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, berikutnya);
    } catch {
      // Tidak bisa diingat, tapi pilihan tetap berlaku sampai tab ditutup.
    }
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme harus dipakai di dalam <ThemeProvider>');
  return ctx;
}
