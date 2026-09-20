# Fase 2b — Shell Desktop: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti kerangka desktop — sidebar accordion + header 68px — dengan sidebar berlabel grup yang selalu menunjukkan posisi pengguna, dan membubarkan header sehingga judul halaman pindah ke konten.

**Architecture:** `AppShell` menggantikan isi `MainLayout`. Di desktop ia merender sidebar baru dan **tidak** merender `Header` sama sekali; di mobile ia tetap merender `Header` dan `BottomNavbar` yang lama, apa adanya — penggantinya baru datang di Fase 2c. Seam itu yang membuat fase ini bisa dikerjakan tanpa menyentuh mobile. Daftar menu jadi data (`navItems.ts`), dan penentuan item aktif jadi fungsi murni yang diuji tanpa DOM, karena di situlah bug sidebar sekarang berada.

**Tech Stack:** React 19, React Router 7, Tailwind v4, Vitest 4 + happy-dom + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-09-18-ui-redesign-design.md`

## Global Constraints

- **Mobile tidak berubah sama sekali di fase ini.** `Header`, `BottomNavbarAdmin`, dan `BottomNavbarLadies` tidak disentuh.
- **Nol perubahan business logic dan autentikasi.** Rute, `ProtectedRoute`, `AuthContext`, `userSlice` tidak disentuh.
- **Semua rute yang ada sekarang harus tetap terjangkau dari sidebar baru.** Daftar lengkapnya ada di Task 1 dan wajib dicocokkan satu per satu.
- **Warna hanya lewat token.** Komponen shell baru memakai utility Tailwind dari `theme.css`; nol hex, nol inline style warna.
- **Nol gradient, nol shadow** di sidebar — struktur dari garis 1px.
- **`focus-visible` wajib** di setiap item nav dan tombol.
- **Baseline yang harus tetap hijau:**
  - `npx tsc -b` → exit 0
  - `npm test` → 194 test di 21 berkas
  - `npm run lint` → **0 error, 5 warning** (pre-existing). Error tetap 0.
- **Komentar dan pesan commit dalam Bahasa Indonesia.**

## Struktur berkas

| Berkas | Tanggung jawab |
|---|---|
| `src/layout/navItems.ts` | Daftar menu admin & ladies sebagai data, plus `cariRuteAktif` |
| `src/components/ui/ThemeToggle.tsx` | Pengalih tema, dua bentuk: penuh dan ringkas |
| `src/components/shell/Sidebar.tsx` | Sidebar desktop: brand, grup menu, rail mode, kaki akun |
| `src/layout/AppShell.tsx` | Kerangka: sidebar di desktop, Header+BottomNav lama di mobile |
| `src/layout/MainLayout.tsx` | Jadi pembungkus tipis yang menyuntikkan data user ke `AppShell` |

---

### Task 1: Daftar menu sebagai data + penentu item aktif

Bug sidebar sekarang ada di sini: grup accordion default tertutup dan tidak pernah disinkronkan ke `location.pathname`, jadi di halaman dalam sidebar tidak menunjukkan posisi pengguna sama sekali. Memindahkan penentuan item aktif ke fungsi murni membuatnya bisa diuji.

**Files:**
- Create: `src/layout/navItems.ts`
- Test: `src/layout/navItems.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `type ItemNav = { path: string; label: string; ikon: IconType; cocokJuga?: string[] }`
  - `type GrupNav = { label: string; items: ItemNav[] }`
  - `NAV_ADMIN: GrupNav[]`, `NAV_LADIES: GrupNav[]`
  - `cariRuteAktif(pathname: string, grup: GrupNav[]): string | null`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/layout/navItems.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { NAV_ADMIN, NAV_LADIES, cariRuteAktif } from './navItems';

describe('cariRuteAktif', () => {
  it('mencocokkan rute persis', () => {
    expect(cariRuteAktif('/ladies', NAV_ADMIN)).toBe('/ladies');
    expect(cariRuteAktif('/absensi', NAV_ADMIN)).toBe('/absensi');
  });

  it('halaman tambah & detail menyalakan item induknya', () => {
    expect(cariRuteAktif('/ladies-create', NAV_ADMIN)).toBe('/ladies');
    expect(cariRuteAktif('/ladies-detail/abc-123', NAV_ADMIN)).toBe('/ladies');
    expect(cariRuteAktif('/pengawas-create', NAV_ADMIN)).toBe('/pengawas');
    expect(cariRuteAktif('/user-detail/9', NAV_ADMIN)).toBe('/users');
  });

  it('tidak mencocokkan hanya karena berawalan sama', () => {
    // Ini bug nyata di BottomNavbarAdmin sebelum diberi penjaga: '/smart-chat'
    // ikut menyala di halaman '/smart-chat-ladies'.
    expect(cariRuteAktif('/smart-chat-ladies', NAV_ADMIN)).not.toBe('/smart-chat');
  });

  it('beranda hanya menyala di rute persis', () => {
    expect(cariRuteAktif('/', NAV_ADMIN)).toBe('/');
    expect(cariRuteAktif('/ladies', NAV_ADMIN)).not.toBe('/');
  });

  it('mengembalikan null kalau tidak ada yang cocok', () => {
    expect(cariRuteAktif('/entah-apa', NAV_ADMIN)).toBeNull();
  });

  it('nav ladies memisahkan beranda ladies dari daftar ladies admin', () => {
    expect(cariRuteAktif('/ladies/home', NAV_LADIES)).toBe('/ladies/home');
    expect(cariRuteAktif('/ladies/voucher', NAV_LADIES)).toBe('/ladies/voucher');
  });
});

describe('kelengkapan menu', () => {
  const semuaPath = (grup: typeof NAV_ADMIN) =>
    grup.flatMap((g) => g.items.map((i) => i.path));

  it('seluruh rute admin terjangkau dari sidebar', () => {
    const wajib = [
      '/',
      '/ladies',
      '/pengawas',
      '/absensi',
      '/add-transaksi',
      '/add-transaksi-pengawas',
      '/buku-kuning',
      '/buku-kuning-pengawas',
      '/rekap-voucher',
      '/performa-ladies',
      '/users',
      '/user-approval',
      '/agent',
      '/outlet',
      '/smart-chat',
    ];
    const ada = semuaPath(NAV_ADMIN);
    const hilang = wajib.filter((p) => !ada.includes(p));
    expect(hilang, `rute tidak ada di sidebar: ${hilang.join(', ')}`).toEqual([]);
  });

  it('seluruh rute ladies terjangkau dari sidebar', () => {
    const wajib = [
      '/ladies/home',
      '/ladies/absensi',
      '/ladies/voucher',
      '/ladies/kasbon',
      '/ladies/dokter',
      '/ladies/pemasukan_lain',
      '/ladies/peraturan',
      '/ladies/profile',
      '/smart-chat-ladies',
    ];
    const ada = semuaPath(NAV_LADIES);
    const hilang = wajib.filter((p) => !ada.includes(p));
    expect(hilang, `rute tidak ada di sidebar: ${hilang.join(', ')}`).toEqual([]);
  });

  it('tidak ada path kembar', () => {
    for (const nav of [NAV_ADMIN, NAV_LADIES]) {
      const path = semuaPath(nav);
      expect(new Set(path).size).toBe(path.length);
    }
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/layout/navItems.test.ts`
Expected: FAIL — `Cannot find module './navItems'`.

- [ ] **Step 3: Tulis implementasi**

Buat `src/layout/navItems.ts`:

```ts
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGift,
  FiHeart,
  FiHome,
  FiMapPin,
  FiMessageSquare,
  FiPlusCircle,
  FiUser,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';

export type ItemNav = {
  path: string;
  label: string;
  ikon: IconType;
  /** Rute lain yang ikut menyalakan item ini — halaman Tambah & Detail
      memakai akhiran (`/ladies-create`), bukan sub-path, jadi harus
      disebut satu per satu. */
  cocokJuga?: string[];
};

export type GrupNav = {
  label: string;
  items: ItemNav[];
};

/* Grup berlabel, BUKAN accordion. Semua item selalu terlihat — accordion
   yang sekarang dipakai default tertutup dan tidak pernah disinkronkan ke
   URL, sehingga di halaman dalam sidebar tidak menunjukkan posisi pengguna. */
export const NAV_ADMIN: GrupNav[] = [
  {
    label: 'Beranda',
    items: [{ path: '/', label: 'Home', ikon: FiHome }],
  },
  {
    label: 'Operasional',
    items: [
      {
        path: '/ladies',
        label: 'Ladies',
        ikon: FiUser,
        cocokJuga: ['/ladies-create', '/ladies-detail'],
      },
      {
        path: '/pengawas',
        label: 'Pengawas',
        ikon: FiUserCheck,
        cocokJuga: ['/pengawas-create', '/pengawas-detail'],
      },
      { path: '/absensi', label: 'Absensi', ikon: FiCalendar },
    ],
  },
  {
    label: 'Transaksi',
    items: [
      { path: '/add-transaksi', label: 'Transaksi Ladies', ikon: FiPlusCircle },
      {
        path: '/add-transaksi-pengawas',
        label: 'Transaksi Pengawas',
        ikon: FiPlusCircle,
      },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { path: '/buku-kuning', label: 'Buku Kuning', ikon: FiBookOpen },
      {
        path: '/buku-kuning-pengawas',
        label: 'Buku Kuning Pengawas',
        ikon: FiBookOpen,
      },
      { path: '/rekap-voucher', label: 'Rekap Voucher', ikon: FiDollarSign },
      { path: '/performa-ladies', label: 'Performa Ladies', ikon: FiBarChart2 },
    ],
  },
  {
    label: 'Master Data',
    items: [
      {
        path: '/users',
        label: 'Users',
        ikon: FiUsers,
        cocokJuga: ['/user-create', '/user-detail'],
      },
      { path: '/user-approval', label: 'Approval User', ikon: FiCheckSquare },
      {
        path: '/agent',
        label: 'Agent',
        ikon: FiBriefcase,
        cocokJuga: ['/agent-create', '/agent-detail'],
      },
      { path: '/outlet', label: 'Outlet', ikon: FiMapPin },
    ],
  },
  {
    label: 'Lain',
    items: [{ path: '/smart-chat', label: 'Smart Chat', ikon: FiMessageSquare }],
  },
];

export const NAV_LADIES: GrupNav[] = [
  {
    label: 'Beranda',
    items: [
      { path: '/ladies/home', label: 'Home', ikon: FiHome },
      { path: '/ladies/absensi', label: 'Absensi', ikon: FiCalendar },
    ],
  },
  {
    label: 'Catatan',
    items: [
      { path: '/ladies/voucher', label: 'Voucher', ikon: FiGift },
      { path: '/ladies/kasbon', label: 'Kasbon', ikon: FiCreditCard },
      { path: '/ladies/dokter', label: 'Dokter', ikon: FiHeart },
      {
        path: '/ladies/pemasukan_lain',
        label: 'Pemasukan Lain',
        ikon: FiDollarSign,
      },
    ],
  },
  {
    label: 'Lain',
    items: [
      { path: '/ladies/peraturan', label: 'Peraturan', ikon: FiFileText },
      { path: '/smart-chat-ladies', label: 'Smart Chat', ikon: FiMessageSquare },
      { path: '/ladies/profile', label: 'Profil', ikon: FiUser },
    ],
  },
];

/** Cocok kalau sama persis atau merupakan induk langsung — bukan sekadar
    berawalan sama. Tanpa syarat itu `/smart-chat` ikut menyala di
    `/smart-chat-ladies`. */
function cocok(pathname: string, rute: string): boolean {
  return pathname === rute || pathname.startsWith(`${rute}/`);
}

/**
 * Path item nav yang harus disorot untuk URL tertentu, atau null.
 *
 * Kecocokan terpanjang menang: tanpa itu `/ladies` akan menelan
 * `/ladies/voucher` di nav ladies.
 */
export function cariRuteAktif(pathname: string, grup: GrupNav[]): string | null {
  let terbaik: string | null = null;

  for (const g of grup) {
    for (const item of g.items) {
      const kandidat = [item.path, ...(item.cocokJuga ?? [])];
      for (const rute of kandidat) {
        if (!cocok(pathname, rute)) continue;
        if (terbaik === null || rute.length > terbaik.length) terbaik = item.path;
      }
    }
  }

  return terbaik;
}
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/layout/navItems.test.ts`
Expected: PASS — 9 test lolos.

Perhatikan kenapa rute `'/'` tidak menelan semuanya: `cocok` memeriksa `pathname.startsWith(rute + '/')`, sehingga untuk `'/'` syaratnya jadi berawalan `'//'` — tidak pernah benar. Jangan sederhanakan jadi `startsWith(rute)`, itu akan membuat beranda menyala di setiap halaman.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 203 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/layout/navItems.ts src/layout/navItems.test.ts
git commit -m "feat(shell): daftar menu jadi data + penentu item aktif

Menyiapkan sidebar berlabel grup. Penentuan item aktif dipisah jadi
fungsi murni karena di situlah bug sidebar sekarang: grup accordion
default tertutup dan tidak pernah disinkronkan ke URL, sehingga di
halaman dalam sidebar tidak menunjukkan posisi pengguna sama sekali.

Test menjaga seluruh rute yang ada tetap terjangkau dari menu.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: `ThemeToggle`

Sampai sekarang tema hanya bisa diganti lewat console atau halaman `/ui`. Ini memindahkannya ke aplikasi.

**Files:**
- Create: `src/components/ui/ThemeToggle.tsx`
- Test: `src/components/ui/ThemeToggle.test.tsx`

**Interfaces:**
- Consumes: `useTheme` dari `src/context/ThemeContext.tsx`, `SegmentedControl`, `Button`
- Produces: `ThemeToggle` — props: `ringkas?: boolean` (bawaan `false`)

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/ui/ThemeToggle.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

function pasang(props: { ringkas?: boolean } = {}) {
  render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('menawarkan tiga pilihan dalam bentuk penuh', () => {
    pasang();
    expect(screen.getByLabelText('Tema tampilan')).toBeTruthy();
    expect(screen.getByText('Terang')).toBeTruthy();
    expect(screen.getByText('Gelap')).toBeTruthy();
    expect(screen.getByText('Sistem')).toBeTruthy();
  });

  it('mengubah tema saat pilihan diklik', () => {
    pasang();
    screen.getByText('Gelap').click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('bentuk ringkas hanya satu tombol', () => {
    pasang({ ringkas: true });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('bentuk ringkas menjelaskan aksinya ke pembaca layar', () => {
    pasang({ ringkas: true });
    const tombol = screen.getByRole('button');
    expect(tombol.getAttribute('aria-label')).toMatch(/tema/i);
  });

  it('bentuk ringkas membalik tema saat diklik', () => {
    pasang({ ringkas: true });
    const sebelum = document.documentElement.getAttribute('data-theme');
    screen.getByRole('button').click();
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(sebelum);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/ThemeToggle.test.tsx`
Expected: FAIL — `Cannot find module './ThemeToggle'`.

- [ ] **Step 3: Tulis implementasi**

Buat `src/components/ui/ThemeToggle.tsx`:

```tsx
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import type { ThemePreference } from '../../lib/theme';
import Button from './Button';
import SegmentedControl from './SegmentedControl';

const OPSI: { nilai: ThemePreference; label: string }[] = [
  { nilai: 'light', label: 'Terang' },
  { nilai: 'dark', label: 'Gelap' },
  { nilai: 'system', label: 'Sistem' },
];

type Props = {
  /** Bentuk satu tombol untuk ruang sempit, mis. sidebar mode rail.
      Sengaja hanya membalik terang/gelap: pilihan "ikut sistem" butuh tiga
      keadaan dan tidak bisa dijelaskan lewat satu tombol. */
  ringkas?: boolean;
};

const ThemeToggle = ({ ringkas = false }: Props) => {
  const { preference, theme, setPreference } = useTheme();

  if (ringkas) {
    const berikutnya = theme === 'dark' ? 'light' : 'dark';
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Ganti ke tema ${berikutnya === 'dark' ? 'gelap' : 'terang'}`}
        onClick={() => setPreference(berikutnya)}
      >
        {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
      </Button>
    );
  }

  return (
    <SegmentedControl
      label="Tema tampilan"
      fullWidth
      opsi={OPSI}
      nilai={preference}
      onUbah={setPreference}
    />
  );
};

export default ThemeToggle;
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/ThemeToggle.test.tsx`
Expected: PASS — 5 test lolos.

Test ini menyentuh `document.documentElement` sungguhan lewat `ThemeProvider`, jadi urutan test bisa saling memengaruhi. Kalau ada yang goyah, tambahkan pembersihan di berkas test — jangan melemahkan assertion-nya.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 208 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ThemeToggle.tsx src/components/ui/ThemeToggle.test.tsx
git commit -m "feat(ui): ThemeToggle

Sampai sekarang tema hanya bisa diganti lewat console atau halaman /ui.
Bentuk ringkasnya sengaja hanya membalik terang/gelap: pilihan 'ikut
sistem' butuh tiga keadaan dan tidak bisa dijelaskan lewat satu tombol.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Sidebar baru

**Files:**
- Create: `src/components/shell/Sidebar.tsx`
- Test: `src/components/shell/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `GrupNav` & `cariRuteAktif` (Task 1), `ThemeToggle` (Task 2), `Button`
- Produces: `Sidebar` — props: `grup: GrupNav[]`, `collapsed: boolean`, `onToggleCollapse: () => void`, `namaUser: string`, `peran: string`, `onLogout: () => void`

  Data user disuntikkan lewat props, bukan diambil dari Redux di dalam komponen — itu yang membuatnya bisa diuji hanya dengan `MemoryRouter`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/shell/Sidebar.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import { NAV_ADMIN } from '../../layout/navItems';
import Sidebar from './Sidebar';

function pasang(pathname: string, props: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const onLogout = vi.fn();
  const onToggleCollapse = vi.fn();
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <ThemeProvider>
        <Sidebar
          grup={NAV_ADMIN}
          collapsed={false}
          onToggleCollapse={onToggleCollapse}
          namaUser="Rakha"
          peran="Admin"
          onLogout={onLogout}
          {...props}
        />
      </ThemeProvider>
    </MemoryRouter>,
  );
  return { onLogout, onToggleCollapse };
}

describe('Sidebar', () => {
  it('menampilkan seluruh item menu tanpa perlu dibuka dulu', () => {
    pasang('/');
    // Accordion lama menyembunyikan ini sampai grupnya diklik.
    expect(screen.getByRole('link', { name: /Buku Kuning$/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Outlet/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Rekap Voucher/ })).toBeTruthy();
  });

  it('menampilkan label grup', () => {
    pasang('/');
    expect(screen.getByText('Keuangan')).toBeTruthy();
    expect(screen.getByText('Master Data')).toBeTruthy();
  });

  it('menandai item aktif lewat aria-current', () => {
    pasang('/rekap-voucher');
    const aktif = screen.getByRole('link', { name: /Rekap Voucher/ });
    expect(aktif.getAttribute('aria-current')).toBe('page');
  });

  it('halaman detail tetap menyalakan item induknya', () => {
    pasang('/ladies-detail/abc');
    // Nama persis, bukan regex: menu juga punya "Transaksi Ladies" dan
    // "Performa Ladies", jadi /Ladies/ akan cocok dengan tiga tautan.
    expect(screen.getByRole('link', { name: 'Ladies' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('hanya satu item yang aktif', () => {
    pasang('/buku-kuning-pengawas');
    const aktif = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page');
    expect(aktif).toHaveLength(1);
  });

  it('menampilkan nama dan peran pengguna', () => {
    pasang('/');
    expect(screen.getByText('Rakha')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
  });

  it('tombol keluar memanggil onLogout', () => {
    const { onLogout } = pasang('/');
    screen.getByRole('button', { name: 'Keluar' }).click();
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('tombol ciutkan memanggil onToggleCollapse', () => {
    const { onToggleCollapse } = pasang('/');
    screen.getByRole('button', { name: /Ciutkan/ }).click();
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('mode rail menyembunyikan teks tapi item tetap bisa dijangkau', () => {
    pasang('/', { collapsed: true });
    // Label grup hilang, tapi tautannya tetap ada dan tetap bernama.
    expect(screen.queryByText('Master Data')).toBeNull();
    expect(screen.getByRole('link', { name: /Outlet/ })).toBeTruthy();
  });

  it('tidak memakai gradient maupun shadow', () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <Sidebar
            grup={NAV_ADMIN}
            collapsed={false}
            onToggleCollapse={() => {}}
            namaUser="Rakha"
            peran="Admin"
            onLogout={() => {}}
          />
        </ThemeProvider>
      </MemoryRouter>,
    );
    expect(container.innerHTML).not.toContain('gradient');
    expect(container.innerHTML).not.toContain('shadow-');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/shell/Sidebar.test.tsx`
Expected: FAIL — `Cannot find module './Sidebar'`.

- [ ] **Step 3: Tulis implementasi**

Buat `src/components/shell/Sidebar.tsx`:

```tsx
import { Link, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

import { cariRuteAktif, type GrupNav } from '../../layout/navItems';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

type Props = {
  grup: GrupNav[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  namaUser: string;
  peran: string;
  onLogout: () => void;
};

/**
 * Sidebar desktop.
 *
 * Grup berlabel dengan semua item selalu terlihat, menggantikan accordion
 * yang default tertutup dan tidak pernah disinkronkan ke URL — akibatnya di
 * halaman dalam, sidebar lama tidak menunjukkan posisi pengguna sama sekali.
 *
 * Data user disuntikkan lewat props, bukan dibaca dari Redux di sini, supaya
 * komponennya bisa diuji tanpa store.
 */
const Sidebar = ({
  grup,
  collapsed,
  onToggleCollapse,
  namaUser,
  peran,
  onLogout,
}: Props) => {
  const { pathname } = useLocation();
  const aktif = cariRuteAktif(pathname, grup);

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 flex flex-col',
        'bg-card border-r border-line',
        'transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-14 px-3 shrink-0 border-b border-line">
        <div className="flex items-center justify-center size-8 shrink-0 rounded-md bg-brand text-fg-on-brand text-xs font-semibold">
          SR
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg truncate">SR Agency</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {grup.map((g) => (
          <div key={g.label} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wider text-fg-faint">
                {g.label}
              </p>
            )}

            <ul className="flex flex-col gap-0.5">
              {g.items.map((item) => {
                const Ikon = item.ikon;
                const ini = aktif === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      aria-current={ini ? 'page' : undefined}
                      className={[
                        'flex items-center gap-2.5 rounded-md h-9 px-2',
                        'text-sm transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-brand focus-visible:ring-offset-1',
                        'focus-visible:ring-offset-card',
                        ini
                          ? 'bg-brand-subtle text-brand-fg font-medium'
                          : 'text-fg-muted hover:bg-hover hover:text-fg',
                        collapsed ? 'justify-center px-0' : '',
                      ].join(' ')}
                    >
                      <Ikon className="size-4 shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kaki: akun + tema + ciutkan. Header 68px dibubarkan, dan isinya
          pindah ke sini. */}
      <div className="shrink-0 border-t border-line p-2 flex flex-col gap-2">
        {!collapsed && (
          <>
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="flex items-center justify-center size-8 shrink-0 rounded-full bg-brand-subtle text-brand-fg text-xs font-semibold">
                {namaUser.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-fg truncate">{namaUser}</div>
                <div className="text-xs text-fg-faint truncate">{peran}</div>
              </div>
            </div>

            <ThemeToggle />
          </>
        )}

        <div className={collapsed ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
          {collapsed && <ThemeToggle ringkas />}

          <Button
            variant="ghost"
            size="sm"
            fullWidth={!collapsed}
            aria-label="Keluar"
            onClick={onLogout}
            icon={<FiLogOut aria-hidden="true" />}
          >
            {!collapsed && 'Keluar'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={collapsed ? 'Lebarkan menu' : 'Ciutkan menu'}
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <FiChevronRight aria-hidden="true" />
            ) : (
              <FiChevronLeft aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
```

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/shell/Sidebar.test.tsx`
Expected: PASS — 10 test lolos.

Kalau `tombol keluar memanggil onLogout` gagal karena namanya tidak ketemu: dalam mode penuh tombolnya punya `aria-label="Keluar"` **dan** teks "Keluar", dan aria-label yang menang. Jangan hapus aria-label-nya — mode rail membutuhkannya.

- [ ] **Step 5: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 218 test lolos.

- [ ] **Step 6: Commit**

```bash
git add src/components/shell/Sidebar.tsx src/components/shell/Sidebar.test.tsx
git commit -m "feat(shell): sidebar berlabel grup

Semua item selalu terlihat, menggantikan accordion yang default tertutup
dan tidak pernah disinkronkan ke URL. Item aktif ditandai aria-current,
dan halaman Tambah/Detail ikut menyalakan item induknya.

Isi header 68px yang akan dibubarkan — akun, tema, keluar — pindah ke
kaki sidebar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: `AppShell` dan pembubaran header desktop

**Files:**
- Create: `src/layout/AppShell.tsx`
- Modify: `src/layout/MainLayout.tsx`

**Interfaces:**
- Consumes: `Sidebar` (Task 3), `NAV_ADMIN`/`NAV_LADIES` (Task 1), `Header` & `BottomNavbar*` yang lama
- Produces: `AppShell` — props: `isLadies: boolean`, `namaUser: string`, `peran: string`, `onLogout: () => void`, `children: ReactNode`

- [ ] **Step 1: Tulis `AppShell`**

Buat `src/layout/AppShell.tsx`:

```tsx
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import Sidebar from '../components/shell/Sidebar';
import Header from '../components/Header/Header';
import BottomNavbarAdmin from '../components/Bottombar/BottomNavbarAdmin';
import BottomNavbarLadies from '../components/Bottombar/BottomNavbarLadies';
import { NAV_ADMIN, NAV_LADIES } from './navItems';

const KUNCI_RAIL = 'sr-sidebar-rail';

type Props = {
  isLadies: boolean;
  namaUser: string;
  peran: string;
  onLogout: () => void;
  children: ReactNode;
};

/**
 * Kerangka aplikasi.
 *
 * Desktop memakai sidebar baru dan TIDAK merender Header sama sekali — judul
 * halaman pindah ke konten, dan isi header pindah ke kaki sidebar.
 *
 * Mobile masih memakai Header + BottomNavbar yang lama, apa adanya.
 * Penggantinya datang di Fase 2c; memisahkannya begini yang membuat fase ini
 * bisa dikerjakan tanpa menyentuh mobile sama sekali.
 */
const AppShell = ({ isLadies, namaUser, peran, onLogout, children }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { pathname } = useLocation();

  const [rail, setRail] = useState(() => {
    try {
      return localStorage.getItem(KUNCI_RAIL) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_RAIL, rail ? '1' : '0');
    } catch {
      // Mode privat — pilihan tetap berlaku sampai tab ditutup.
    }
  }, [rail]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Halaman beranda mengatur padding-nya sendiri (hero menyentuh tepi).
  const beranda = pathname === '/' || pathname === '/ladies/home';

  if (isMobile) {
    return (
      <div className="min-h-screen bg-canvas text-fg">
        <Header />
        <main
          className={beranda ? '' : 'p-4'}
          style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        >
          {children}
        </main>
        {isLadies ? <BottomNavbarLadies /> : <BottomNavbarAdmin />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <Sidebar
        grup={isLadies ? NAV_LADIES : NAV_ADMIN}
        collapsed={rail}
        onToggleCollapse={() => setRail((v) => !v)}
        namaUser={namaUser}
        peran={peran}
        onLogout={onLogout}
      />

      {/* Tanpa min-height 100vh di sini: versi lama memasangnya di bawah
          header sticky 68px, sehingga halaman selalu lebih tinggi dari
          viewport dan scrollbar vertikal muncul terus. */}
      <main
        className={[
          'transition-[padding] duration-200',
          rail ? 'pl-14' : 'pl-60',
          beranda ? '' : 'px-6 py-6 xl:px-8',
        ].join(' ')}
      >
        <div className="page-shell">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
```

> Catatan: `pl-14`/`pl-60` harus sama persis dengan lebar sidebar `w-14`/`w-60` di Task 3. Kalau salah satunya diubah, ubah keduanya.

- [ ] **Step 2: Jadikan `MainLayout` pembungkus tipis**

Ganti **seluruh isi** `src/layout/MainLayout.tsx` dengan:

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '../app/store';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import AppShell from './AppShell';

/**
 * Menyuntikkan identitas pengguna ke AppShell.
 *
 * Pengambilan nama tampilan mengikuti perilaku Header lama persis: ladies
 * memakai `nama_ladies`, pengawas memakai `nama_panggilan`, selebihnya
 * memakai `nama` di baris user.
 */
function MainLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isLadies = !!currentUser?.ladies_id;

  const [namaUser, setNamaUser] = useState('User');
  const [peran, setPeran] = useState('User');

  useEffect(() => {
    let batal = false;

    const ambil = async () => {
      if (!user) return;

      const { data: grup } = await supabase
        .from('user_group')
        .select('group_name')
        .eq('id', user.user_group_id)
        .single();

      if (batal || !grup) return;

      const role = grup.group_name.toLowerCase();
      setPeran(grup.group_name);

      if (role === 'ladies') {
        const { data } = await supabase
          .from('ladies')
          .select('nama_ladies')
          .eq('id', user.ladies_id)
          .single();
        if (!batal) setNamaUser(data?.nama_ladies || user.nama || 'User');
      } else if (role === 'pengawas') {
        const { data } = await supabase
          .from('pengawas')
          .select('nama_panggilan')
          .eq('id', user.pengawas_id)
          .single();
        if (!batal) setNamaUser(data?.nama_panggilan || user.nama || 'User');
      } else {
        if (!batal) setNamaUser(user.nama || 'User');
      }
    };

    ambil();
    return () => {
      batal = true;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      isLadies={isLadies}
      namaUser={namaUser}
      peran={peran}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}

export default MainLayout;
```

- [ ] **Step 3: Verifikasi di browser — desktop**

Run: `npm run dev`, lebarkan jendela ke ukuran desktop.

- [ ] Header 68px **hilang**; halaman mulai dari atas
- [ ] Sidebar menampilkan semua item tanpa perlu diklik dulu
- [ ] Buka `/buku-kuning` → item "Buku Kuning" tersorot
- [ ] Buka `/ladies-detail/<id>` → item "Ladies" tetap tersorot
- [ ] Klik tombol ciutkan → sidebar jadi rail 56px, ikon tetap terjangkau
- [ ] Muat ulang halaman → sidebar tetap dalam mode rail
- [ ] Pengalih tema di kaki sidebar berfungsi
- [ ] Tombol Keluar mengembalikan ke `/login`
- [ ] **Tidak ada scrollbar vertikal** di halaman yang isinya pendek

- [ ] **Step 4: Verifikasi di browser — ladies desktop**

Masuk sebagai ladies, lebarkan ke desktop.

- [ ] Sidebar ladies muncul dengan menu Voucher/Kasbon/Dokter/Pemasukan Lain
- [ ] Teks *"Sidebar khusus ladies belum tersedia"* sudah **tidak ada lagi**

- [ ] **Step 5: Verifikasi di browser — mobile**

Kecilkan jendela ke lebar HP.

- [ ] Header lama dan bottom navbar lama masih muncul **persis seperti sebelumnya**
- [ ] Sidebar baru **tidak** muncul

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 218 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/layout/AppShell.tsx src/layout/MainLayout.tsx
git commit -m "feat(shell): AppShell dan pembubaran header desktop

Desktop memakai sidebar baru tanpa Header sama sekali; isinya pindah ke
kaki sidebar. Mobile masih memakai Header + BottomNavbar lama apa adanya,
penggantinya di Fase 2c.

Sekalian memperbaiki scrollbar permanen: versi lama memasang
min-height 100vh pada <main> yang berada di bawah header sticky 68px,
sehingga halaman selalu lebih tinggi dari viewport.

Teks 'Sidebar khusus ladies belum tersedia' yang selama ini ikut
terkirim ke produksi akhirnya hilang.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Sapuan & penutup fase

**Files:** tidak ada perubahan yang direncanakan — task ini verifikasi.

- [ ] **Step 1: Pastikan komponen lama belum dicabut**

`Sidebar` lama (`src/components/Sidebar/`) sudah tidak dipakai, tapi **jangan dihapus di fase ini** — pencabutan menunggu shell mobile selesai dan terbukti di produksi. Konfirmasi ia masih ada di repo:

```powershell
Test-Path src/components/Sidebar/Sidebar.tsx
```

Expected: `True`.

- [ ] **Step 2: Sapuan seluruh halaman di desktop**

Untuk tiap halaman, pastikan sidebar menyorot item yang benar dan konten tidak tertimpa sidebar:

- [ ] `/`, `/ladies`, `/pengawas`, `/absensi`
- [ ] `/add-transaksi`, `/add-transaksi-pengawas`
- [ ] `/buku-kuning`, `/buku-kuning-pengawas`, `/rekap-voucher`, `/performa-ladies`
- [ ] `/users`, `/user-approval`, `/agent`, `/outlet`, `/smart-chat`
- [ ] Ladies: `/ladies/home`, `/ladies/voucher`, `/ladies/absensi`, `/ladies/profile`

- [ ] **Step 3: Checklist paritas fungsional**

Fase ini mengganti kerangka, jadi seluruh daftar §2.1 spec diperiksa ulang — dengan perhatian khusus pada yang tadinya diakses lewat header:

- [ ] **Logout** — dulu di dropdown header, sekarang di kaki sidebar
- [ ] **Lonceng notifikasi ladies** — dulu di header desktop. Di mobile masih ada. **Di desktop ladies ia sekarang hilang** — catat sebagai utang dan pasang di Fase 2c bersama app bar, atau tambahkan ke kaki sidebar kalau menurut pemilik proyek mendesak.
- [ ] CRUD keenam entitas, termasuk halaman Tambah & Detail
- [ ] Add Transaksi ×2, Buku Kuning ×2 termasuk ekspor PDF & Generate Biaya Bulanan
- [ ] Absensi, Rekap Voucher, Performa Ladies
- [ ] Smart Chat admin & ladies
- [ ] Ladies: Home, 4 buku, Riwayat Absensi, Peraturan, Profil
- [ ] PullToRefresh, OfflineBanner, toast, PWA

- [ ] **Step 4: Gate lengkap**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 218 test lolos.

- [ ] **Step 5: Deploy & verifikasi produksi**

Push, tunggu Vercel, lalu konfirmasi di produksi: sidebar baru muncul di desktop, mobile tidak berubah, dan login/logout normal.

---

## Utang yang dicatat di fase ini

1. **Lonceng notifikasi hilang dari desktop ladies** karena Header tidak lagi dirender di desktop. Di mobile masih ada. Harus dipasang kembali di Fase 2c.
2. **Komponen lama belum dicabut**: `src/components/Sidebar/` dan `src/components/Header/` masih ada tapi hanya dipakai mobile (Header) atau tidak dipakai sama sekali (Sidebar). Pencabutan di Fase 2c.
3. **⌘K command palette ditunda** dari rencana Fase 2 semula. Ia bagian paling tidak esensial dari shell dan bisa menyusul setelah halaman-halaman selesai dimigrasi.

## Setelah fase ini

Fase 2c: app bar mobile per-halaman menggantikan header branding, `BottomNav`
berbasis konfigurasi menggantikan dua komponen terpisah, halaman Menu
menggantikan bottom sheet berisi 15 rute, dan lonceng notifikasi dipasang
kembali.
