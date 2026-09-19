# Fase 1b — Primitif Interaktif: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melengkapi pustaka primitif dengan komponen yang punya perilaku — `Field`/`Input`, `SegmentedControl`, `Pagination`, `StatCard`, dan `Overlay` (modal / drawer / bottom sheet) — sehingga Fase 2 bisa langsung menyusun shell tanpa menulis komponen dasar lagi.

**Architecture:** `Field` menyediakan id, label, dan pengaitan `aria-*` lewat context, sehingga `Input` maupun kontrol kustom apa pun bisa memakainya tanpa cloning elemen. `Overlay` dibangun di atas Radix Dialog — focus trap, Escape, scroll lock, dan atribut `role="dialog"`/`aria-modal` didapat gratis, dan itu yang menutup temuan audit bahwa `ModalWrapper` sekarang tidak punya satupun. Satu primitif overlay melayani tiga penyajian (modal tengah, drawer kanan, bottom sheet) karena perilakunya identik; yang berbeda hanya posisi dan animasinya.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8, Vitest 4 + happy-dom + @testing-library/react, Tailwind v4, `@radix-ui/react-dialog` dan `@radix-ui/react-toggle-group` (baru), Bootstrap 5 (masih aktif, tidak disentuh).

**Spec:** `docs/superpowers/specs/2026-09-18-ui-redesign-design.md`

## Global Constraints

- **Nol perubahan pada halaman aplikasi yang sudah ada.** Tidak menyentuh `src/features/` kecuali `src/features/dev/pages/UiPreviewPage.tsx`.
- **Nol perubahan business logic dan autentikasi.**
- **Warna hanya lewat token semantik** dari `src/styles/theme.css`. Satu hex literal = pelanggaran.
- **Nol gradient. Shadow hanya untuk overlay** — di fase inilah shadow pertama kali boleh dipakai, dan hanya di `Overlay`.
- **Bobot huruf hanya 400/450/500/600. Tidak ada ukuran huruf di bawah 12px.**
- **Kontrol form minimal 16px di mobile** (`text-md`), kalau tidak Safari iOS men-zoom halaman saat input difokus. Ini aturan lama proyek di `CLAUDE.md` dan tetap berlaku.
- **Target sentuh minimal 44px di mobile** untuk semua kontrol.
- **Setiap komponen wajib punya `focus-visible` yang terlihat.**
- **Baseline yang harus tetap hijau:**
  - `npx tsc -b` → exit 0
  - `npm test` → 145 test di 15 berkas, semua lolos
  - `npm run lint` → **0 error, 4 warning** (pre-existing: `ConfirmDialog.tsx`, `StatusBadge.tsx`, `AuthContext.tsx`, `ThemeContext.tsx`). Error tetap 0.
- **Test komponen memakai `// @vitest-environment happy-dom`** di baris pertama berkas.
- **Komentar dan pesan commit dalam Bahasa Indonesia.**

## Struktur berkas

| Berkas | Tanggung jawab |
|---|---|
| `src/components/ui/Field.tsx` | Label + penanda wajib + helper + pesan galat; menyediakan `id` dan `aria-*` lewat context |
| `src/components/ui/Input.tsx` | Satu primitif kontrol untuk semua tipe, termasuk `date` dan `textarea` |
| `src/components/ui/SegmentedControl.tsx` | Pengalih pilihan tunggal dengan navigasi panah |
| `src/components/ui/Pagination.tsx` | Navigasi halaman yang menyebut rentang dan total |
| `src/components/ui/StatCard.tsx` | Kartu angka ringkas |
| `src/components/ui/Overlay.tsx` | Modal / drawer / bottom sheet di atas Radix Dialog |

---

### Task 1: `Field` dan `Input`

Ini yang menutup temuan audit paling konkret soal form: sekarang ada **tiga gaya input berbeda** di aplikasi — `.form-input-sr` (radius 12, border abu), `dateInputStyle` di `FormField.tsx` (radius 6, tinggi 40, border biru), dan input rentang tanggal di RekapVoucher/PerformaLadies (radius 16, tinggi 56, border 2px). Ketiganya diganti satu primitif.

**Files:**
- Create: `src/components/ui/Field.tsx`
- Create: `src/components/ui/Input.tsx`
- Test: `src/components/ui/Field.test.tsx`
- Test: `src/components/ui/Input.test.tsx`

**Interfaces:**
- Consumes: token dari Fase 0/1a
- Produces:
  - `Field` — props: `label: string`, `required?: boolean`, `helper?: string`, `error?: string`, `children: ReactNode`
  - `useField(): { id: string; invalid: boolean; describedBy?: string } | null` — dipakai kontrol di dalam `Field`; mengembalikan `null` kalau dipakai di luar
  - `Input` — props: `type?: 'text' | 'password' | 'number' | 'date' | 'month' | 'search' | 'tel'`, `multiline?: boolean`, `rows?: number`, `invalid?: boolean`, ditambah atribut `<input>` bawaan kecuali `className`/`style`/`size`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/ui/Field.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Field from './Field';
import Input from './Input';

describe('Field', () => {
  it('mengaitkan label ke kontrol di dalamnya', () => {
    render(
      <Field label="Nama Ladies">
        <Input />
      </Field>,
    );
    // getByLabelText hanya berhasil kalau htmlFor dan id benar-benar cocok.
    expect(screen.getByLabelText('Nama Ladies')).toBeTruthy();
  });

  it('menandai field wajib untuk yang melihat dan yang memakai pembaca layar', () => {
    render(
      <Field label="PIN" required>
        <Input />
      </Field>,
    );
    expect(screen.getByText('*')).toBeTruthy();
    expect(screen.getByText('(wajib diisi)')).toBeTruthy();
  });

  it('menampilkan teks bantuan dan mengaitkannya lewat aria-describedby', () => {
    render(
      <Field label="Nominal" helper="Tanpa titik atau koma">
        <Input />
      </Field>,
    );
    const kontrol = screen.getByLabelText('Nominal');
    const bantuan = screen.getByText('Tanpa titik atau koma');
    expect(kontrol.getAttribute('aria-describedby')).toBe(bantuan.id);
  });

  it('pesan galat menggantikan teks bantuan', () => {
    render(
      <Field label="Nominal" helper="Tanpa titik" error="Wajib diisi">
        <Input />
      </Field>,
    );
    expect(screen.getByText('Wajib diisi')).toBeTruthy();
    expect(screen.queryByText('Tanpa titik')).toBeNull();
  });

  it('galat menyalakan aria-invalid pada kontrolnya', () => {
    render(
      <Field label="Nominal" error="Wajib diisi">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText('Nominal').getAttribute('aria-invalid')).toBe('true');
  });

  it('galat diumumkan sebagai peringatan langsung', () => {
    render(
      <Field label="Nominal" error="Wajib diisi">
        <Input />
      </Field>,
    );
    expect(screen.getByRole('alert').textContent).toBe('Wajib diisi');
  });
});
```

Buat `src/components/ui/Input.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Input from './Input';

describe('Input', () => {
  it('bertipe text secara bawaan', () => {
    render(<Input aria-label="Cari" />);
    expect((screen.getByLabelText('Cari') as HTMLInputElement).type).toBe('text');
  });

  it('meneruskan onChange', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Cari" onChange={onChange} />);
    const el = screen.getByLabelText('Cari') as HTMLInputElement;
    el.value = 'sisi';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalled();
  });

  it('input tanggal memakai gaya yang sama dengan input teks', () => {
    const { rerender, container } = render(<Input aria-label="A" type="text" />);
    const kelasTeks = container.querySelector('input')?.className;
    rerender(<Input aria-label="A" type="date" />);
    expect(container.querySelector('input')?.className).toBe(kelasTeks);
  });

  it('berukuran 16px di mobile supaya Safari iOS tidak men-zoom halaman', () => {
    render(<Input aria-label="Cari" />);
    expect(screen.getByLabelText('Cari').className).toContain('text-md');
  });

  it('setinggi 44px di mobile — target sentuh minimum', () => {
    render(<Input aria-label="Cari" />);
    expect(screen.getByLabelText('Cari').className).toContain('h-11');
  });

  it('punya cincin fokus yang terlihat', () => {
    render(<Input aria-label="Cari" />);
    expect(screen.getByLabelText('Cari').className).toContain('focus-visible:ring-2');
  });

  it('state invalid memakai warna danger, bukan biru brand', () => {
    render(<Input aria-label="Cari" invalid />);
    const kelas = screen.getByLabelText('Cari').className;
    expect(kelas).toContain('border-danger-solid');
    expect(kelas).not.toContain('border-line-strong');
  });

  it('multiline merender textarea, bukan input', () => {
    const { container } = render(<Input aria-label="Catatan" multiline />);
    expect(container.querySelector('textarea')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/Field.test.tsx src/components/ui/Input.test.tsx`
Expected: FAIL — `Cannot find module './Field'`.

- [ ] **Step 3: Tulis `Field`**

Buat `src/components/ui/Field.tsx`:

```tsx
import { createContext, useContext, useId, type ReactNode } from 'react';

type NilaiField = {
  id: string;
  invalid: boolean;
  describedBy?: string;
};

const FieldContext = createContext<NilaiField | null>(null);

/** Dipakai kontrol di dalam <Field> untuk mengambil id & pengaitan aria.
    Mengembalikan null kalau kontrolnya dipakai berdiri sendiri. */
export function useField(): NilaiField | null {
  return useContext(FieldContext);
}

type Props = {
  label: string;
  required?: boolean;
  /** Petunjuk tetap. Disembunyikan saat ada `error` supaya tidak dua baris. */
  helper?: string;
  error?: string;
  children: ReactNode;
};

/**
 * Pembungkus kontrol form: label, penanda wajib, teks bantuan, dan pesan galat.
 *
 * Pengaitan id diberikan lewat context, bukan dengan meng-clone elemen anak —
 * dengan begitu `Field` bisa membungkus kontrol apa pun (termasuk
 * SearchableSelect nanti), bukan hanya <input> bawaan.
 */
const Field = ({ label, required, helper, error, children }: Props) => {
  const id = useId();
  const idPesan = `${id}-pesan`;
  const adaPesan = Boolean(error || helper);

  return (
    <FieldContext.Provider
      value={{ id, invalid: Boolean(error), describedBy: adaPesan ? idPesan : undefined }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {required && (
            <>
              {/* Bintang untuk yang melihat, kata "wajib diisi" untuk pembaca
                  layar — bintang saja tidak terbaca sebagai kewajiban. */}
              <span aria-hidden="true" className="text-danger-fg ml-0.5">
                *
              </span>
              <span className="sr-only"> (wajib diisi)</span>
            </>
          )}
        </label>

        {children}

        {error ? (
          <p id={idPesan} role="alert" className="text-xs text-danger-fg">
            {error}
          </p>
        ) : (
          helper && (
            <p id={idPesan} className="text-xs text-fg-faint">
              {helper}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
};

export default Field;
```

- [ ] **Step 4: Tulis `Input`**

Buat `src/components/ui/Input.tsx`:

```tsx
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useField } from './Field';

type TipeInput =
  | 'text'
  | 'password'
  | 'number'
  | 'date'
  | 'month'
  | 'search'
  | 'tel';

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'style' | 'size' | 'type'
> & {
  type?: TipeInput;
  multiline?: boolean;
  rows?: number;
  /** Dipakai kalau kontrol berdiri di luar <Field>. Di dalam <Field>, nilai
      dari context yang menang. */
  invalid?: boolean;
};

/*
  Satu gaya untuk SEMUA tipe, termasuk `date`. Sekarang ada tiga gaya berbeda
  di aplikasi: .form-input-sr (radius 12, border abu), dateInputStyle di
  FormField (radius 6, tinggi 40, border biru), dan input rentang tanggal di
  RekapVoucher (radius 16, tinggi 56, border 2px). Akibatnya tinggi kontrol
  tidak pernah sejajar dalam satu baris.

  h-11/text-md di mobile bukan pilihan estetika: di bawah 16px Safari iOS
  men-zoom halaman setiap kali input difokus, dan 44px adalah target sentuh
  minimum.
*/
const DASAR = [
  'w-full rounded-md bg-canvas text-fg',
  'border placeholder:text-fg-faint',
  'h-11 px-3 text-md',
  'md:h-9 md:px-2.5 md:text-base',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
  'focus-visible:ring-offset-canvas',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'read-only:bg-subtle read-only:text-fg-muted',
].join(' ');

const NORMAL = 'border-line-strong focus-visible:ring-brand focus-visible:border-brand';
const GALAT = 'border-danger-solid focus-visible:ring-danger-solid';

const Input = ({ type = 'text', multiline = false, rows = 3, invalid, ...sisanya }: Props) => {
  const field = useField();

  const tidakValid = field?.invalid ?? invalid ?? false;
  const kelas = `${DASAR} ${tidakValid ? GALAT : NORMAL}`;

  const umum = {
    ...sisanya,
    id: field?.id ?? sisanya.id,
    'aria-invalid': tidakValid || undefined,
    'aria-describedby': field?.describedBy ?? sisanya['aria-describedby'],
    className: kelas,
  };

  if (multiline) {
    // Textarea tidak boleh dikunci ke tinggi satu baris.
    return <textarea {...umum} rows={rows} className={`${kelas} h-auto py-2 min-h-24`} />;
  }

  return <input {...umum} type={type} />;
};

export default Input;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/Field.test.tsx src/components/ui/Input.test.tsx`
Expected: PASS — 14 test lolos (6 Field + 8 Input).

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint **0 error / 5 warning** · 159 test lolos.

Warning kelima muncul di `Field.tsx` karena berkas itu mengekspor komponen (`Field`) sekaligus hook (`useField`) — pola yang sama persis dengan `AuthContext.tsx` dan `ThemeContext.tsx` yang sudah ada. Bukan regresi.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Field.tsx src/components/ui/Field.test.tsx src/components/ui/Input.tsx src/components/ui/Input.test.tsx
git commit -m "feat(ui): primitif Field & Input

Satu gaya untuk semua tipe kontrol termasuk date, menggantikan tiga gaya
berbeda yang sekarang dipakai bersamaan: .form-input-sr, dateInputStyle
di FormField, dan input rentang tanggal di RekapVoucher. Itu penyebab
tinggi kontrol tidak pernah sejajar dalam satu baris.

Pengaitan label-kontrol lewat context, bukan cloning elemen — supaya
Field bisa membungkus kontrol kustom, bukan cuma <input> bawaan.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: `SegmentedControl`

Sekarang ada tiga implementasi kontrol yang sama: `.segmented-chip` di `global.css`, pill inline di `AddTransaksiPage`, dan pill inline di `PerformaLadiesPage`. Radix ToggleGroup dipakai supaya navigasi panah dan roving focus tidak ditulis ulang dengan tangan.

**Files:**
- Modify: `package.json`
- Create: `src/components/ui/SegmentedControl.tsx`
- Test: `src/components/ui/SegmentedControl.test.tsx`

**Interfaces:**
- Consumes: token dari Fase 0/1a
- Produces:
  - `type OpsiSegment<T extends string> = { nilai: T; label: string }`
  - `SegmentedControl<T extends string>` — props: `label: string` (untuk pembaca layar), `opsi: OpsiSegment<T>[]`, `nilai: T`, `onUbah: (nilai: T) => void`, `fullWidth?: boolean`

- [ ] **Step 1: Pasang Radix ToggleGroup**

```bash
npm install @radix-ui/react-toggle-group
```

- [ ] **Step 2: Tulis test yang gagal**

Buat `src/components/ui/SegmentedControl.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SegmentedControl from './SegmentedControl';

const OPSI = [
  { nilai: 'harian', label: 'Harian' },
  { nilai: 'bulanan', label: 'Bulanan' },
] as const;

describe('SegmentedControl', () => {
  it('menampilkan semua opsi', () => {
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(screen.getByText('Harian')).toBeTruthy();
    expect(screen.getByText('Bulanan')).toBeTruthy();
  });

  it('menandai opsi terpilih lewat data-state — itu yang dibaca CSS-nya', () => {
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(screen.getByText('Harian').getAttribute('data-state')).toBe('on');
    expect(screen.getByText('Bulanan').getAttribute('data-state')).toBe('off');
  });

  it('keadaan terpilih juga terbaca pembaca layar', () => {
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    const aktif = screen.getByText('Harian');
    // Radix memakai aria-pressed (tombol toggle) atau aria-checked (radio),
    // tergantung versinya. Yang penting keadaannya diumumkan, bukan caranya.
    const diumumkan =
      aktif.getAttribute('aria-pressed') ?? aktif.getAttribute('aria-checked');
    expect(diumumkan).toBe('true');
  });

  it('memanggil onUbah dengan nilai opsi yang diklik', () => {
    const onUbah = vi.fn();
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={onUbah} />,
    );
    screen.getByText('Bulanan').click();
    expect(onUbah).toHaveBeenCalledWith('bulanan');
  });

  it('mengklik opsi yang sudah aktif tidak mengosongkan pilihan', () => {
    const onUbah = vi.fn();
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={onUbah} />,
    );
    screen.getByText('Harian').click();
    expect(onUbah).not.toHaveBeenCalled();
  });

  it('punya label untuk pembaca layar', () => {
    render(
      <SegmentedControl label="Mode tampilan" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(screen.getByLabelText('Mode tampilan')).toBeTruthy();
  });

  it('tidak memakai gradient — versi lama memakainya untuk chip aktif', () => {
    const { container } = render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(container.innerHTML).not.toContain('gradient');
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/SegmentedControl.test.tsx`
Expected: FAIL — `Cannot find module './SegmentedControl'`.

- [ ] **Step 4: Tulis implementasi**

Buat `src/components/ui/SegmentedControl.tsx`:

```tsx
import * as ToggleGroup from '@radix-ui/react-toggle-group';

export type OpsiSegment<T extends string> = {
  nilai: T;
  label: string;
};

type Props<T extends string> = {
  /** Tidak tampil di layar; dipakai pembaca layar untuk menyebut gunanya. */
  label: string;
  opsi: OpsiSegment<T>[];
  nilai: T;
  onUbah: (nilai: T) => void;
  fullWidth?: boolean;
};

/**
 * Pengalih pilihan tunggal.
 *
 * Menggantikan tiga implementasi terpisah yang sekarang ada: `.segmented-chip`
 * di global.css, pill inline di AddTransaksiPage, dan pill inline di
 * PerformaLadiesPage — ketiganya terlihat berbeda padahal gunanya sama.
 *
 * Radix ToggleGroup dipakai demi roving focus dan navigasi panah kiri/kanan;
 * itu bagian yang paling sering salah kalau ditulis tangan.
 */
function SegmentedControl<T extends string>({
  label,
  opsi,
  nilai,
  onUbah,
  fullWidth = false,
}: Props<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={nilai}
      aria-label={label}
      onValueChange={(berikutnya) => {
        // Radix mengirim string kosong saat opsi aktif diklik ulang. Ini
        // pilihan tunggal wajib, jadi klik itu diabaikan.
        if (berikutnya) onUbah(berikutnya as T);
      }}
      className={[
        'inline-flex items-center gap-0.5 p-0.5',
        'rounded-md border border-line bg-subtle',
        fullWidth ? 'w-full' : '',
      ].join(' ')}
    >
      {opsi.map((item) => (
        <ToggleGroup.Item
          key={item.nilai}
          value={item.nilai}
          className={[
            'inline-flex items-center justify-center whitespace-nowrap',
            'h-9 px-3 text-sm font-medium rounded-sm md:h-8',
            fullWidth ? 'flex-1' : '',
            'text-fg-muted hover:text-fg',
            // Penanda aktif: permukaan terangkat + teks penuh. Tanpa gradient.
            'data-[state=on]:bg-surface data-[state=on]:text-fg',
            'data-[state=on]:border data-[state=on]:border-line',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            'focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
          ].join(' ')}
        >
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export default SegmentedControl;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/SegmentedControl.test.tsx`
Expected: PASS — 7 test lolos.

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 166 test lolos.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/ui/SegmentedControl.tsx src/components/ui/SegmentedControl.test.tsx
git commit -m "feat(ui): primitif SegmentedControl

Menyatukan tiga implementasi terpisah: .segmented-chip di global.css,
pill inline di AddTransaksiPage, dan pill inline di PerformaLadiesPage.

Radix ToggleGroup dipakai demi roving focus dan navigasi panah — bagian
yang paling sering salah kalau ditulis tangan.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `Pagination` dan `StatCard`

`Pagination` versi lama hanya menampilkan `1/5` — pengguna tidak pernah tahu ada berapa data seluruhnya. `StatCard` menyatukan tiga tampilan kartu angka yang sekarang berbeda-beda (AbsensiSummaryCards, LedgerSummaryCard, dan dua kartu inline di halaman laporan).

Keduanya digabung jadi satu task karena sama-sama presentasi murni tanpa dependensi baru, dan keduanya kecil.

**Files:**
- Create: `src/components/ui/Pagination.tsx`
- Create: `src/components/ui/StatCard.tsx`
- Test: `src/components/ui/Pagination.test.tsx`
- Test: `src/components/ui/StatCard.test.tsx`

**Interfaces:**
- Consumes: `Button` dari `src/components/ui/Button.tsx` (Fase 1a)
- Produces:
  - `Pagination` — props: `halaman: number` (berbasis 1), `totalHalaman: number`, `totalData?: number`, `perHalaman?: number`, `onUbah: (halaman: number) => void`
  - `StatCard` — props: `label: string`, `nilai: ReactNode`, `catatan?: ReactNode`, `ikon?: ReactNode`

> Catatan: komponen lama `src/components/Pagination.tsx` **tetap ada dan tidak disentuh** — halaman yang belum dimigrasi masih memakainya. Yang baru hidup di `src/components/ui/`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/ui/Pagination.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('menyebut rentang dan total, bukan sekadar "1/5"', () => {
    render(<Pagination halaman={1} totalHalaman={5} totalData={47} perHalaman={10} onUbah={() => {}} />);
    expect(screen.getByText(/1–10 dari 47/)).toBeTruthy();
  });

  it('rentang halaman terakhir berhenti di jumlah data sebenarnya', () => {
    render(<Pagination halaman={5} totalHalaman={5} totalData={47} perHalaman={10} onUbah={() => {}} />);
    expect(screen.getByText(/41–47 dari 47/)).toBeTruthy();
  });

  it('jatuh ke "Halaman x dari y" kalau total data tidak diketahui', () => {
    render(<Pagination halaman={2} totalHalaman={5} onUbah={() => {}} />);
    expect(screen.getByText(/Halaman 2 dari 5/)).toBeTruthy();
  });

  it('tombol sebelumnya mati di halaman pertama', () => {
    render(<Pagination halaman={1} totalHalaman={5} onUbah={() => {}} />);
    expect((screen.getByRole('button', { name: 'Halaman sebelumnya' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('tombol berikutnya mati di halaman terakhir', () => {
    render(<Pagination halaman={5} totalHalaman={5} onUbah={() => {}} />);
    expect((screen.getByRole('button', { name: 'Halaman berikutnya' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('meneruskan nomor halaman berikutnya', () => {
    const onUbah = vi.fn();
    render(<Pagination halaman={2} totalHalaman={5} onUbah={onUbah} />);
    screen.getByRole('button', { name: 'Halaman berikutnya' }).click();
    expect(onUbah).toHaveBeenCalledWith(3);
  });

  it('meneruskan nomor halaman sebelumnya', () => {
    const onUbah = vi.fn();
    render(<Pagination halaman={2} totalHalaman={5} onUbah={onUbah} />);
    screen.getByRole('button', { name: 'Halaman sebelumnya' }).click();
    expect(onUbah).toHaveBeenCalledWith(1);
  });
});
```

Buat `src/components/ui/StatCard.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('menampilkan label dan nilai', () => {
    render(<StatCard label="Total Ladies" nilai="47" />);
    expect(screen.getByText('Total Ladies')).toBeTruthy();
    expect(screen.getByText('47')).toBeTruthy();
  });

  it('menampilkan catatan kalau ada', () => {
    render(<StatCard label="Aktif" nilai="41" catatan="87% dari total" />);
    expect(screen.getByText('87% dari total')).toBeTruthy();
  });

  it('memakai border, bukan shadow maupun gradient', () => {
    const { container } = render(<StatCard label="Total" nilai="47" />);
    const kelas = container.firstElementChild?.className ?? '';
    expect(kelas).toContain('border');
    expect(kelas).not.toContain('shadow');
    expect(container.innerHTML).not.toContain('gradient');
  });

  it('label memakai ukuran terkecil yang diizinkan, bukan di bawah 12px', () => {
    render(<StatCard label="Total" nilai="47" />);
    expect(screen.getByText('Total').className).toContain('text-xs');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/Pagination.test.tsx src/components/ui/StatCard.test.tsx`
Expected: FAIL — `Cannot find module './Pagination'` dan `Cannot find module './StatCard'`.

- [ ] **Step 3: Tulis `Pagination`**

Buat `src/components/ui/Pagination.tsx`:

```tsx
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from './Button';

type Props = {
  /** Berbasis 1, bukan 0 — sesuai yang ditampilkan ke pengguna. */
  halaman: number;
  totalHalaman: number;
  /** Kalau diketahui, keterangannya jadi "1–10 dari 47" alih-alih "Halaman 1 dari 5". */
  totalData?: number;
  perHalaman?: number;
  onUbah: (halaman: number) => void;
};

/**
 * Navigasi halaman.
 *
 * Versi lama hanya menampilkan "1/5", sehingga pengguna tidak pernah tahu ada
 * berapa data seluruhnya — padahal itu yang paling sering ingin diketahui saat
 * menelusuri daftar.
 */
const Pagination = ({ halaman, totalHalaman, totalData, perHalaman, onUbah }: Props) => {
  const bisaMundur = halaman > 1;
  const bisaMaju = halaman < totalHalaman;

  let keterangan: string;
  if (totalData !== undefined && perHalaman !== undefined) {
    const mulai = (halaman - 1) * perHalaman + 1;
    const selesai = Math.min(halaman * perHalaman, totalData);
    keterangan = `${mulai}–${selesai} dari ${totalData}`;
  } else {
    keterangan = `Halaman ${halaman} dari ${totalHalaman}`;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="tabular text-xs text-fg-muted">{keterangan}</p>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          aria-label="Halaman sebelumnya"
          disabled={!bisaMundur}
          onClick={() => bisaMundur && onUbah(halaman - 1)}
          icon={<FiChevronLeft aria-hidden="true" />}
        >
          <span className="sr-only md:not-sr-only">Sebelumnya</span>
        </Button>

        <Button
          size="sm"
          variant="secondary"
          aria-label="Halaman berikutnya"
          disabled={!bisaMaju}
          onClick={() => bisaMaju && onUbah(halaman + 1)}
        >
          <span className="sr-only md:not-sr-only">Berikutnya</span>
          <FiChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
```

- [ ] **Step 4: Tulis `StatCard`**

Buat `src/components/ui/StatCard.tsx`:

```tsx
import type { ReactNode } from 'react';

type Props = {
  label: string;
  /** Boleh <Money>, boleh teks biasa. */
  nilai: ReactNode;
  catatan?: ReactNode;
  ikon?: ReactNode;
};

/**
 * Kartu angka ringkas.
 *
 * Menyatukan tiga tampilan berbeda yang sekarang dipakai untuk hal yang sama:
 * AbsensiSummaryCards (latar lembut, tanpa ikon), LedgerSummaryCard (gradient
 * penuh, teks putih), dan dua kartu inline di RekapVoucher & PerformaLadies.
 */
const StatCard = ({ label, nilai, catatan, ikon }: Props) => (
  <div className="bg-surface border border-line rounded-lg p-3.5">
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-faint">{label}</p>
      {ikon && (
        <span className="text-fg-faint shrink-0 [&>svg]:size-4" aria-hidden="true">
          {ikon}
        </span>
      )}
    </div>

    <div className="tabular mt-1.5 text-2xl font-semibold tracking-tight text-fg">
      {nilai}
    </div>

    {catatan && <p className="mt-0.5 text-xs text-fg-muted">{catatan}</p>}
  </div>
);

export default StatCard;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/Pagination.test.tsx src/components/ui/StatCard.test.tsx`
Expected: PASS — 11 test lolos (7 Pagination + 4 StatCard).

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 177 test lolos.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Pagination.tsx src/components/ui/Pagination.test.tsx src/components/ui/StatCard.tsx src/components/ui/StatCard.test.tsx
git commit -m "feat(ui): primitif Pagination & StatCard

Pagination sekarang menyebut '1-10 dari 47', bukan cuma '1/5' — pengguna
sebelumnya tidak pernah tahu ada berapa data seluruhnya.

StatCard menyatukan tiga tampilan kartu angka yang berbeda-beda:
AbsensiSummaryCards, LedgerSummaryCard yang gradient penuh, dan dua
kartu inline di halaman laporan.

Komponen lama di src/components/Pagination.tsx sengaja dibiarkan —
halaman yang belum dimigrasi masih memakainya.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: `Overlay` — modal, drawer, bottom sheet

Ini task terpenting di fase ini untuk aksesibilitas. `ModalWrapper` yang sekarang **tidak punya** `role="dialog"`, `aria-modal`, focus trap, maupun penutupan lewat Escape — artinya modal tidak bisa ditutup dengan keyboard dan fokus bisa lolos ke belakang modal. Radix Dialog memberi semuanya.

**Files:**
- Modify: `package.json`
- Create: `src/components/ui/Overlay.tsx`
- Test: `src/components/ui/Overlay.test.tsx`

**Interfaces:**
- Consumes: token dari Fase 0/1a
- Produces:
  - `type PenyajianOverlay = 'modal' | 'drawer' | 'sheet'`
  - `Overlay` — props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `title: string`, `description?: string`, `penyajian?: PenyajianOverlay` (bawaan `'modal'`), `footer?: ReactNode`, `children: ReactNode`

- [ ] **Step 1: Pasang Radix Dialog**

```bash
npm install @radix-ui/react-dialog
```

- [ ] **Step 2: Tulis test yang gagal**

Buat `src/components/ui/Overlay.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Overlay from './Overlay';

function buka(props: Partial<React.ComponentProps<typeof Overlay>> = {}) {
  const onOpenChange = vi.fn();
  render(
    <Overlay open onOpenChange={onOpenChange} title="Konfirmasi" {...props}>
      <p>Isi dialog</p>
    </Overlay>,
  );
  return { onOpenChange };
}

describe('Overlay', () => {
  it('tidak merender apa pun saat tertutup', () => {
    render(
      <Overlay open={false} onOpenChange={() => {}} title="Konfirmasi">
        <p>Isi dialog</p>
      </Overlay>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('merender sebagai dialog — ModalWrapper lama tidak punya role ini', () => {
    buka();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('menandai dirinya modal supaya pembaca layar mengunci konteks', () => {
    buka();
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  });

  it('judulnya menamai dialog', () => {
    buka();
    expect(screen.getByRole('dialog', { name: 'Konfirmasi' })).toBeTruthy();
  });

  it('bisa ditutup dengan Escape — ModalWrapper lama tidak bisa', () => {
    const { onOpenChange } = buka();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('punya tombol tutup yang bisa dijangkau pembaca layar', () => {
    buka();
    expect(screen.getByRole('button', { name: 'Tutup' })).toBeTruthy();
  });

  it('menampilkan isinya', () => {
    buka();
    expect(screen.getByText('Isi dialog')).toBeTruthy();
  });

  it('menampilkan footer kalau diberikan', () => {
    buka({ footer: <button>Simpan</button> });
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeTruthy();
  });

  it('deskripsi ikut menerangkan dialog', () => {
    buka({ description: 'Tindakan ini tidak bisa dibatalkan.' });
    const dialog = screen.getByRole('dialog');
    const deskripsi = screen.getByText('Tindakan ini tidak bisa dibatalkan.');
    expect(dialog.getAttribute('aria-describedby')).toBe(deskripsi.id);
  });

  it('penyajian sheet menempel di bawah layar', () => {
    buka({ penyajian: 'sheet' });
    expect(screen.getByRole('dialog').className).toContain('bottom-0');
  });

  it('penyajian drawer menempel di kanan layar', () => {
    buka({ penyajian: 'drawer' });
    expect(screen.getByRole('dialog').className).toContain('right-0');
  });

  it('overlay boleh memakai shadow — satu-satunya tempat yang diizinkan spec', () => {
    buka();
    expect(screen.getByRole('dialog').className).toContain('shadow');
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `npx vitest run src/components/ui/Overlay.test.tsx`
Expected: FAIL — `Cannot find module './Overlay'`.

- [ ] **Step 4: Tulis implementasi**

Buat `src/components/ui/Overlay.tsx`:

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { FiX } from 'react-icons/fi';
import type { ReactNode } from 'react';

export type PenyajianOverlay = 'modal' | 'drawer' | 'sheet';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Wajib — dialog tanpa nama tidak bisa dikenali pembaca layar. */
  title: string;
  description?: string;
  penyajian?: PenyajianOverlay;
  footer?: ReactNode;
  children: ReactNode;
};

/*
  Tiga penyajian, satu perilaku. Yang berbeda hanya posisi dan bentuk sudutnya:
  - modal  : tengah layar, untuk konfirmasi & form pendek
  - drawer : menempel kanan, untuk detail/ubah di desktop tanpa kehilangan daftar
  - sheet  : menempel bawah, bentuk yang wajar di mobile
*/
const POSISI: Record<PenyajianOverlay, string> = {
  modal:
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] rounded-xl border',
  drawer: 'right-0 top-0 bottom-0 w-full max-w-lg border-l',
  sheet: 'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-xl border-t',
};

/**
 * Modal / drawer / bottom sheet.
 *
 * Dibangun di atas Radix Dialog karena semua bagian yang sulit sudah benar di
 * sana: focus trap, pengembalian fokus saat ditutup, Escape, penguncian scroll
 * latar, dan atribut role/aria-modal. `ModalWrapper` yang sekarang dipakai
 * aplikasi tidak punya satupun dari itu — modalnya tidak bisa ditutup dengan
 * keyboard dan fokus bisa lolos ke belakangnya.
 *
 * Ini satu-satunya komponen di pustaka yang boleh memakai shadow, karena ini
 * satu-satunya yang benar-benar melayang di atas halaman.
 */
const Overlay = ({
  open,
  onOpenChange,
  title,
  description,
  penyajian = 'modal',
  footer,
  children,
}: Props) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />

      <Dialog.Content
        className={[
          'fixed z-50 flex flex-col',
          'bg-surface border-line text-fg shadow-2xl',
          'focus-visible:outline-none',
          POSISI[penyajian],
        ].join(' ')}
      >
        <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-line shrink-0">
          <div className="min-w-0">
            <Dialog.Title className="text-base font-semibold text-fg">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="text-xs text-fg-muted mt-0.5">
                {description}
              </Dialog.Description>
            ) : (
              // Radix memperingatkan kalau Description tidak ada. Disembunyikan
              // dari pohon aksesibilitas supaya tidak menambah kebisingan.
              <Dialog.Description className="sr-only">{title}</Dialog.Description>
            )}
          </div>

          <Dialog.Close
            aria-label="Tutup"
            className={[
              'inline-flex items-center justify-center shrink-0',
              'size-9 rounded-md text-fg-muted hover:bg-hover hover:text-fg',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              'focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
            ].join(' ')}
          >
            <FiX aria-hidden="true" />
          </Dialog.Close>
        </header>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 px-4 py-3 border-t border-line shrink-0">
            {footer}
          </footer>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default Overlay;
```

- [ ] **Step 5: Jalankan test, pastikan lolos**

Run: `npx vitest run src/components/ui/Overlay.test.tsx`
Expected: PASS — 12 test lolos.

Kalau test `aria-describedby` gagal karena Radix menghasilkan id sendiri, periksa bahwa `Dialog.Description` benar-benar dirender — jangan menambal dengan menyetel id manual, karena pengaitannya memang tugas Radix.

- [ ] **Step 6: Pastikan baseline belum bergeser**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 189 test lolos.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/ui/Overlay.tsx src/components/ui/Overlay.test.tsx
git commit -m "feat(ui): primitif Overlay — modal, drawer, bottom sheet

Satu perilaku, tiga posisi. Dibangun di atas Radix Dialog supaya focus
trap, pengembalian fokus, Escape, penguncian scroll latar, dan
role/aria-modal tidak ditulis tangan.

Ini menutup temuan audit: ModalWrapper yang sekarang dipakai aplikasi
tidak punya satupun dari itu, sehingga modalnya tidak bisa ditutup
dengan keyboard dan fokus bisa lolos ke belakangnya.

Satu-satunya komponen pustaka yang boleh memakai shadow, karena satu-
satunya yang benar-benar melayang di atas halaman.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Tambahkan primitif baru ke halaman `/ui` dan tutup fase

**Files:**
- Modify: `src/features/dev/pages/UiPreviewPage.tsx`

**Interfaces:**
- Consumes: `Field`, `Input` (Task 1), `SegmentedControl` (Task 2), `Pagination`, `StatCard` (Task 3), `Overlay` (Task 4)
- Produces: tidak ada

- [ ] **Step 1: Tambahkan impor dan state**

Di `src/features/dev/pages/UiPreviewPage.tsx`, ubah baris impor React paling atas dan tambahkan impor primitif baru:

```tsx
import { useState } from 'react';
import { FiInbox, FiPlus, FiSearch, FiUsers } from 'react-icons/fi';

import { useTheme } from '../../../context/ThemeContext';
import { petakanKategori, petakanStatus } from '../../../lib/statusMap';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Field from '../../../components/ui/Field';
import Input from '../../../components/ui/Input';
import Money from '../../../components/ui/Money';
import Overlay, { type PenyajianOverlay } from '../../../components/ui/Overlay';
import Pagination from '../../../components/ui/Pagination';
import SectionCard from '../../../components/ui/SectionCard';
import SegmentedControl from '../../../components/ui/SegmentedControl';
import StatCard from '../../../components/ui/StatCard';

import type { ThemePreference } from '../../../lib/theme';
```

Lalu di dalam komponen, tepat setelah baris `const { preference, theme, setPreference } = useTheme();`, tambahkan:

```tsx
  const [mode, setMode] = useState<'harian' | 'bulanan'>('harian');
  const [halaman, setHalaman] = useState(1);
  const [overlay, setOverlay] = useState<PenyajianOverlay | null>(null);
```

- [ ] **Step 2: Tambahkan bagian baru ke halaman**

Tepat **sebelum** blok `<SectionCard title="EmptyState" padding={false}>` yang sudah ada, sisipkan:

```tsx
        <SectionCard title="StatCard" subtitle="Menggantikan tiga tampilan kartu angka">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Ladies" nilai="47" ikon={<FiUsers />} />
            <StatCard label="Aktif" nilai="41" catatan="87% dari total" />
            <StatCard label="Voucher" nilai="612" catatan="bulan ini" />
            <StatCard label="Nilai Voucher" nilai={<Money value={91800000} />} />
          </div>
        </SectionCard>

        <SectionCard title="Field & Input" subtitle="Satu gaya untuk semua tipe, termasuk date">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nama Ladies" required helper="Nama panggilan, bukan nama lengkap">
              <Input placeholder="mis. Sisi" />
            </Field>

            <Field label="Tanggal" required>
              <Input type="date" />
            </Field>

            <Field label="Nominal" error="Wajib diisi">
              <Input type="number" placeholder="0" />
            </Field>

            <Field label="Outlet">
              <Input value="Kemang" readOnly />
            </Field>

            <div className="md:col-span-2">
              <Field label="Catatan" helper="Boleh dikosongkan">
                <Input multiline placeholder="Keterangan tambahan…" />
              </Field>
            </div>
          </div>

          <p className="text-xs text-fg-faint mt-3">
            Tinggi keempat kontrol di atas harus sama persis. Di versi lama, input
            tanggal punya gayanya sendiri sehingga tidak pernah sejajar.
          </p>
        </SectionCard>

        <SectionCard title="SegmentedControl" subtitle="Coba navigasi dengan panah kiri/kanan">
          <div className="flex flex-col gap-3">
            <SegmentedControl
              label="Mode tampilan"
              nilai={mode}
              onUbah={setMode}
              opsi={[
                { nilai: 'harian', label: 'Harian' },
                { nilai: 'bulanan', label: 'Bulanan' },
              ]}
            />
            <p className="text-xs text-fg-faint">Terpilih: {mode}</p>
          </div>
        </SectionCard>

        <SectionCard title="Pagination">
          <Pagination
            halaman={halaman}
            totalHalaman={5}
            totalData={47}
            perHalaman={10}
            onUbah={setHalaman}
          />
        </SectionCard>

        <SectionCard title="Overlay" subtitle="Tekan Escape untuk menutup — versi lama tidak bisa">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setOverlay('modal')}>
              Modal
            </Button>
            <Button variant="secondary" onClick={() => setOverlay('drawer')}>
              Drawer
            </Button>
            <Button variant="secondary" onClick={() => setOverlay('sheet')}>
              Bottom sheet
            </Button>
          </div>

          <Overlay
            open={overlay !== null}
            onOpenChange={(terbuka) => !terbuka && setOverlay(null)}
            title="Hapus data ladies?"
            description="Tindakan ini tidak bisa dibatalkan."
            penyajian={overlay ?? 'modal'}
            footer={
              <>
                <Button variant="secondary" onClick={() => setOverlay(null)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={() => setOverlay(null)}>
                  Ya, hapus
                </Button>
              </>
            }
          >
            <p className="text-sm text-fg-muted">
              Penyajian: <strong className="text-fg">{overlay}</strong>. Coba tekan Tab —
              fokus harus terkunci di dalam dialog, dan kembali ke tombol pemicunya
              setelah ditutup.
            </p>
          </Overlay>
        </SectionCard>
```

- [ ] **Step 3: Periksa di browser**

Run: `npm run dev`, buka `http://localhost:5173/ui`.

Periksa di **kedua tema**:

1. **Field & Input** — tinggi keempat kontrol (teks, tanggal, angka, readonly) sama persis. Field "Nominal" bergaris merah dengan pesan di bawahnya.
2. **Klik label** "Nama Ladies" — fokus harus pindah ke inputnya. Itu bukti `htmlFor`/`id` tersambung.
3. **SegmentedControl** — klik satu opsi, lalu tekan panah kiri/kanan. Pilihan harus berpindah.
4. **Overlay** — buka ketiganya. Tekan **Escape**: harus tertutup. Tekan **Tab** berulang saat terbuka: fokus tidak boleh keluar dari dialog. Setelah ditutup, fokus harus kembali ke tombol pemicunya.
5. **Kecilkan jendela ke lebar HP** — kontrol form jadi lebih tinggi (44px) dan hurufnya 16px; bottom sheet menempel di bawah.

- [ ] **Step 4: Pastikan halaman pratinjau tetap tidak ikut ke produksi**

Run: `npm run build`

```powershell
Get-ChildItem dist/assets/*Ui*.js -ErrorAction SilentlyContinue
Select-String -Path "dist/assets/*.js" -Pattern "Panduan Gaya" -SimpleMatch -List
```

Expected: keduanya tidak mengembalikan apa pun.

- [ ] **Step 5: Jalankan gate lengkap**

Run: `npx tsc -b && npm run lint && npm test`
Expected: exit 0 · lint 0 error / 5 warning · 189 test lolos.

- [ ] **Step 6: Checklist paritas fungsional**

Fase ini tidak menyentuh halaman aplikasi mana pun. Yang diperiksa hanya bahwa tidak ada yang bocor:

- [ ] `/`, `/ladies`, `/add-transaksi`, `/buku-kuning`, `/absensi` tampil persis seperti sebelumnya
- [ ] Modal lama (mis. konfirmasi hapus di `/ladies`) masih berfungsi seperti biasa — `ModalWrapper` tidak disentuh
- [ ] Login dan logout normal
- [ ] Tidak ada galat baru di console browser

- [ ] **Step 7: Commit**

```bash
git add src/features/dev/pages/UiPreviewPage.tsx
git commit -m "feat(ui): tampilkan primitif Fase 1b di halaman pratinjau

Field/Input, SegmentedControl, Pagination, StatCard, dan ketiga penyajian
Overlay sekarang bisa diperiksa langsung di kedua tema.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Setelah fase ini

Pustaka primitif lengkap. Fase 2 memasang semuanya ke aplikasi sungguhan:
`AppShell`, sidebar baru berlabel grup (menggantikan accordion yang tidak
pernah menunjukkan posisi pengguna), app bar mobile, `BottomNav`, `MenuPage`,
`CommandPalette`, penerapan font Inter ke `body`, dan manifest PWA jadi terang.
**Di situlah perubahan tampilan pertama kali terlihat pengguna.**
