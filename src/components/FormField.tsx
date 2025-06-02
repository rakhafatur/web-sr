import { ReactNode } from 'react';

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  readonly: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'date' | 'textarea';
  children?: never;
};

type WrapperFieldProps = {
  label: string;
  children: ReactNode;
  name?: never;
  value?: never;
  readonly?: never;
  onChange?: never;
  type?: never;
};

type FormFieldProps = InputFieldProps | WrapperFieldProps;

const FormField = (props: FormFieldProps) => {
  const { label } = props;

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>
        {label}
      </label>

      {'children' in props ? (
        props.children
      ) : props.readonly ? (
        <div className="form-control-plaintext" style={{ color: 'var(--color-dark)' }}>
          {props.value || '-'}
        </div>
      ) : props.type === 'textarea' ? (
        <textarea
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          rows={3}
          className="form-input-sr"
        />
      ) : (
        <input
          type={props.type || 'text'}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          className="form-input-sr"
        />
      )}
    </div>
  );
};

export default FormField;
