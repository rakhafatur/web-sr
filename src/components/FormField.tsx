import { ReactNode, useEffect, useRef } from 'react';

type BaseFieldProps = {
  label: string;
  /** Tampilkan penanda wajib di label. Tanpa ini, user baru tahu field mana
      yang kurang setelah menekan Simpan dan gagal. */
  required?: boolean;
  /** Field ini yang menggagalkan validasi. Selain diberi garis merah, layar
      digulirkan ke sini — pada form panjang, notifikasi di pojok atas tidak
      memberi tahu field-nya ada di sebelah mana. */
  invalid?: boolean;
};

type InputFieldProps = BaseFieldProps & {
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: 'text' | 'password' | 'date' | 'number' | 'textarea';
  readOnly?: boolean;
  children?: never;
};

type WrapperFieldProps = BaseFieldProps & {
  children: ReactNode;
  name?: never;
  value?: never;
  onChange?: never;
  type?: never;
  readOnly?: never;
};

type FormFieldProps = InputFieldProps | WrapperFieldProps;

const dateInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--color-green)',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-dark)',
  fontSize: '1rem',
  height: '40px',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'textfield',
  boxSizing: 'border-box',
};

/** Garis merah ditulis inline, bukan lewat kelas CSS, karena input bertipe
    `date` sudah punya `style` sendiri — dan inline style mengalahkan
    stylesheet, sehingga aturan kelas tidak akan terlihat di field itu. */
const invalidStyle: React.CSSProperties = {
  borderColor: 'var(--color-danger-solid)',
  // Pakai varian -rgb, bukan --color-expense-soft: di tema gelap token itu
  // bernilai hampir hitam, jadi halo-nya tidak akan terbaca sebagai peringatan.
  boxShadow: '0 0 0 3px rgba(var(--color-danger-solid-rgb), 0.28)',
};

const FormField = (props: FormFieldProps) => {
  const { label, required, invalid } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!invalid) return;

    // Hanya menggulir, tidak memanggil .focus(): di iOS pemindahan fokus di
    // luar gesture user membuat halaman ter-zoom tapi keyboard tidak muncul.
    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [invalid]);

  let content: ReactNode;

  if ('children' in props) {
    content = props.children;
  } else {
    const { name, value, onChange, type = 'text', readOnly = false } = props;

    const style = {
      ...(type === 'date' ? dateInputStyle : {}),
      ...(invalid ? invalidStyle : {}),
    };

    const commonProps = {
      name,
      value,
      onChange,
      readOnly,
      className: 'form-input-sr',
      'aria-invalid': invalid || undefined,
      style: Object.keys(style).length > 0 ? style : undefined,
    };

    content =
      type === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input type={type} {...commonProps} />
      );
  }

  return (
    <div className="mb-3" ref={wrapperRef}>
      <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
        {label}
        {required && (
          <>
            {/* Tanda bintang untuk yang melihat, kata "wajib diisi" untuk
                pembaca layar — bintang saja tidak terbaca sebagai kewajiban. */}
            <span aria-hidden="true" style={{ color: 'var(--color-expense)', marginLeft: 4 }}>
              *
            </span>
            <span className="visually-hidden"> (wajib diisi)</span>
          </>
        )}
      </label>
      {content}
    </div>
  );
};

export default FormField;
