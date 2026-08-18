import { ReactNode } from 'react';

type BaseFieldProps = {
  label: string;
  /** Tampilkan penanda wajib di label. Tanpa ini, user baru tahu field mana
      yang kurang setelah menekan Simpan dan gagal. */
  required?: boolean;
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

const FormField = (props: FormFieldProps) => {
  const { label, required } = props;

  let content: ReactNode;

  if ('children' in props) {
    content = props.children;
  } else {
    const { name, value, onChange, type = 'text', readOnly = false } = props;
    const commonProps = { name, value, onChange, readOnly, className: 'form-input-sr' };

    content =
      type === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input type={type} {...commonProps} style={type === 'date' ? dateInputStyle : undefined} />
      );
  }

  return (
    <div className="mb-3">
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
