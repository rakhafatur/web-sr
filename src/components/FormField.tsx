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
      <label className="form-label fw-semibold text-light">{label}</label>

      {'children' in props ? (
        props.children
      ) : props.readonly ? (
        <div className="form-control-plaintext text-light">{props.value || '-'}</div>
      ) : props.type === 'textarea' ? (
        <textarea
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          className="form-control bg-dark text-light border-secondary"
          rows={3}
        />
      ) : (
        <input
          type={props.type || 'text'}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          className="form-control bg-dark text-light border-secondary"
        />
      )}
    </div>
  );
};

export default FormField;