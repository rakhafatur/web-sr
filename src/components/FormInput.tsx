import { ChangeEvent } from 'react';

type FormInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: 'text' | 'password' | 'date' | 'textarea' | 'number'; // tambahkan 'number'
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
    className: 'form-control bg-dark text-light border-secondary',
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold text-light">{label}</label>
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
};

export default FormInput;