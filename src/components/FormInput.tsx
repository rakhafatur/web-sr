import { ChangeEvent } from 'react';

type FormInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: 'text' | 'password' | 'date' | 'textarea' | 'number';
  readOnly?: boolean;
};

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: FormInputProps) => {
  const commonProps = {
    name,
    value,
    onChange,
    readOnly,
    className: 'form-input-sr',
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : type === 'date' ? (
        <input
          type="date"
          {...commonProps}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid var(--color-green)',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-dark)',
            appearance: 'none', // ⬅️ penting untuk iOS/Safari agar layout normal
            WebkitAppearance: 'none',
          }}
        />
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
};

export default FormInput;