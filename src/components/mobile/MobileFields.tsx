import { ReactNode } from 'react';
import SearchableSelect from '../SearchableSelect';
import '../../styles/mobile-admin.css';

const TandaWajib = () => (
  <>
    <span className="tm-req" aria-hidden="true">*</span>
    <span className="visually-hidden"> (wajib diisi)</span>
  </>
);

const formatTanggal = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

type TextProps = {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  icon?: ReactNode;
  type?: 'text' | 'date' | 'textarea';
  required?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
  help?: string;
};

/** Kolom teks / tanggal / teks panjang versi mobile. Di mode lihat, tanggal
    ditampilkan dd/mm/yyyy. */
export const MobileTextField = ({
  id,
  label,
  name,
  value,
  onChange,
  icon,
  type = 'text',
  required,
  readOnly,
  invalid,
  inputMode,
  placeholder,
  help,
}: TextProps) => {
  const kelas = `tm-input ${type === 'textarea' ? 'tm-input--area' : ''} ${icon ? '' : 'tm-input--no-icon'} ${invalid ? 'is-invalid' : ''}`;

  return (
    <div className="tm-field">
      <label htmlFor={id} className="tm-label">
        {label}
        {required && !readOnly && <TandaWajib />}
      </label>
      <div className="tm-input-wrap">
        {icon && <span className={`tm-input-icon ${type === 'textarea' ? 'tm-input-icon--top' : ''}`} aria-hidden>{icon}</span>}
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            rows={3}
            className={kelas}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={readOnly ? undefined : placeholder}
            aria-invalid={invalid || undefined}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type === 'date' && !readOnly ? 'date' : 'text'}
            className={kelas}
            value={type === 'date' && readOnly ? formatTanggal(value) : value}
            onChange={onChange}
            readOnly={readOnly}
            inputMode={inputMode}
            autoComplete="off"
            placeholder={readOnly ? (value ? undefined : '-') : placeholder}
            aria-invalid={invalid || undefined}
          />
        )}
      </div>
      {help && !readOnly && <div className="tm-help">{help}</div>}
    </div>
  );
};

type SelectProps = {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  readOnly?: boolean;
  placeholder: string;
};

/** Pilih satu dari daftar (bisa dicari) versi mobile. Di mode lihat tampil
    sebagai teks. */
export const MobileSelectField = ({ id, label, value, options, onChange, icon, readOnly, placeholder }: SelectProps) => {
  const terpilih = options.find((o) => o.value === value)?.label;

  return (
    <div className="tm-field">
      <span className="tm-label" id={`${id}-label`}>{label}</span>
      {readOnly ? (
        <div className="tm-input-wrap">
          {icon && <span className="tm-input-icon" aria-hidden>{icon}</span>}
          <input
            id={id}
            type="text"
            readOnly
            className={`tm-input ${icon ? '' : 'tm-input--no-icon'}`}
            value={terpilih ?? ''}
            placeholder="-"
            aria-labelledby={`${id}-label`}
          />
        </div>
      ) : (
        <SearchableSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={`Cari ${label.toLowerCase()}...`}
          height={52}
          borderRadius={16}
          fontSize="1rem"
        />
      )}
    </div>
  );
};

type ChoiceProps = {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  readOnly?: boolean;
};

/** Pilihan sedikit (mis. status) sebagai chip versi mobile. */
export const MobileChoiceField = ({ id, label, value, options, onChange, readOnly }: ChoiceProps) => (
  <div className="tm-field">
    <span className="tm-label" id={`${id}-label`}>{label}</span>
    <div className="tm-chips" role="radiogroup" aria-labelledby={`${id}-label`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={readOnly && value !== o.value}
          className={`tm-chip ${value === o.value ? 'is-active' : ''}`}
          onClick={() => !readOnly && onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);
