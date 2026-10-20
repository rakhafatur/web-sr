import DesktopField from '../../../components/desktop/DesktopField';
import { STATUS_PENGAWAS } from '../utils/statusPengawas';

export type PengawasFormValues = {
  nama_lengkap: string;
  nama_panggilan: string;
  nomor_ktp: string;
  tanggal_lahir: string;
  alamat: string;
  tanggal_bergabung: string;
  status: string;
};

type Props = {
  form: PengawasFormValues;
  fieldSalah: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onStatusChange: (status: string) => void;
};

/**
 * Field form pengawas untuk desktop (grid 2 kolom) — dipakai Tambah & Detail
 * (mode ubah). Status lewat chip, sama dengan form ladies.
 */
const PengawasFormDesktop = ({ form, fieldSalah, onChange, onStatusChange }: Props) => {
  const input = (name: keyof PengawasFormValues, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={`dk-pengawas-${name}`}
      name={name}
      type="text"
      autoComplete="off"
      className={`dk-input ${fieldSalah === name ? 'is-invalid' : ''}`}
      aria-invalid={fieldSalah === name || undefined}
      value={form[name]}
      onChange={onChange}
      {...extra}
    />
  );

  return (
    <div className="dk-form-grid">
      <DesktopField label="Nama lengkap" htmlFor="dk-pengawas-nama_lengkap" required>
        {input('nama_lengkap')}
      </DesktopField>

      <DesktopField label="Nama panggilan" htmlFor="dk-pengawas-nama_panggilan">
        {input('nama_panggilan')}
      </DesktopField>

      <DesktopField label="Nomor KTP" htmlFor="dk-pengawas-nomor_ktp">
        {input('nomor_ktp', { inputMode: 'numeric' })}
      </DesktopField>

      <DesktopField label="Tanggal lahir" htmlFor="dk-pengawas-tanggal_lahir">
        {input('tanggal_lahir', { type: 'date' })}
      </DesktopField>

      <DesktopField label="Tanggal bergabung" htmlFor="dk-pengawas-tanggal_bergabung">
        {input('tanggal_bergabung', { type: 'date' })}
      </DesktopField>

      <DesktopField label="Status" labelId="dk-pengawas-status-label">
        <div className="dk-chips" role="radiogroup" aria-labelledby="dk-pengawas-status-label">
          {STATUS_PENGAWAS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={form.status === s.value}
              className={`dk-chip ${form.status === s.value ? 'is-active' : ''}`}
              onClick={() => onStatusChange(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </DesktopField>

      <DesktopField label="Alamat" htmlFor="dk-pengawas-alamat" full>
        <textarea
          id="dk-pengawas-alamat"
          name="alamat"
          rows={3}
          className="dk-input"
          value={form.alamat}
          onChange={onChange}
        />
      </DesktopField>
    </div>
  );
};

export default PengawasFormDesktop;
