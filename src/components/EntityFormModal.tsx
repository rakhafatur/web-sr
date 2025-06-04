import { useEffect, useState, ReactNode, ChangeEvent } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import ModalWrapper from './ModalWrapper';
import FormInput from './FormInput';

export type Field = {
  name: string;
  label: string | ((readonly: boolean) => ReactNode);
  type?: 'text' | 'password' | 'date' | 'textarea' | 'number';
  render?: (
    props: {
      value: string;
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
      readonly: boolean;
    }
  ) => ReactNode;
};

export type EntityFormModalProps<T extends Record<string, any>> = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  data?: T | null;
  titleAdd: ReactNode;
  titleDetail: ReactNode;
  fields: Field[];
};

const EntityFormModal = <T extends Record<string, any>>({
  show,
  onClose,
  onSubmit,
  data,
  titleAdd,
  titleDetail,
  fields,
}: EntityFormModalProps<T>) => {
  const [form, setForm] = useState<Record<string, any>>({});
  const [readonly, setReadonly] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (data) {
      setForm(data);
      setReadonly(true);
    } else {
      const empty: Record<string, any> = {};
      fields.forEach((f) => {
        empty[f.name] = '';
      });
      setForm(empty);
      setReadonly(false);
    }
  }, [show, data, fields]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form as T);
    onClose();
  };

  const renderField = (field: Field) => {
    const label =
      typeof field.label === 'function' ? field.label(readonly) : field.label;

    if (field.render) {
      return (
        <div className="mb-3" key={field.name}>
          <label
            className="form-label fw-semibold"
            style={{ color: 'var(--color-dark)' }}
          >
            {label}
          </label>
          {field.render({ value: form[field.name] || '', onChange: handleChange, readonly })}
        </div>
      );
    }

    return (
      <FormInput
        key={field.name}
        label={label as string}
        name={field.name}
        value={form[field.name] || ''}
        onChange={handleChange}
        readOnly={readonly}
        type={field.type}
      />
    );
  };

  const footer = (
    <>
      {readonly ? (
        <button
          className="btn btn-success fw-bold d-flex align-items-center gap-2"
          onClick={() => setReadonly(false)}
        >
          <FiEdit2 /> Edit Form
        </button>
      ) : (
        <button className="btn btn-success fw-bold" onClick={handleSubmit}>
          Simpan
        </button>
      )}
      <button className="btn btn-secondary fw-bold" onClick={onClose}>
        Tutup
      </button>
    </>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      title={data ? titleDetail : titleAdd}
      footer={footer}
    >
      {fields.map(renderField)}
    </ModalWrapper>
  );
};

export default EntityFormModal;
