import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useField } from './Field';

type TipeInput = 'text' | 'password' | 'number' | 'date' | 'month' | 'search' | 'tel';

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
const GALAT = 'border-danger-strong focus-visible:ring-danger-strong';

const Input = ({
  type = 'text',
  multiline = false,
  rows = 3,
  invalid,
  ...sisanya
}: Props) => {
  const field = useField();

  const tidakValid = field?.invalid ?? invalid ?? false;
  const kelas = `${DASAR} ${tidakValid ? GALAT : NORMAL}`;

  const umum = {
    ...sisanya,
    id: field?.id ?? sisanya.id,
    'aria-invalid': tidakValid || undefined,
    'aria-describedby': field?.describedBy ?? sisanya['aria-describedby'],
  };

  if (multiline) {
    // Textarea tidak boleh dikunci ke tinggi satu baris.
    return <textarea {...umum} rows={rows} className={`${kelas} h-auto py-2 min-h-24`} />;
  }

  return <input {...umum} type={type} className={kelas} />;
};

export default Input;
