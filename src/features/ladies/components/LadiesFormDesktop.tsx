import DesktopField from '../../../components/desktop/DesktopField';
import SearchableSelect from '../../../components/SearchableSelect';

type Option = { value: string; label: string };

export type LadiesFormValues = {
  nama_lengkap: string;
  nama_ladies: string;
  outlet_id: string | null;
  pin: string;
  nomor_ktp: string;
  tanggal_bergabung: string;
  alamat: string;
  status: string;
  agent_id: string | null;
};

type Props = {
  form: LadiesFormValues;
  fieldSalah: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  outletOptions: Option[];
  agentOptions: Option[];
  statusOptions: Option[];
  onOutletChange: (outletId: string) => void;
  onAgentChange: (agentId: string) => void;
  onStatusChange: (status: string) => void;
};

/**
 * Field form ladies untuk desktop (grid 2 kolom) — dipakai Tambah & Detail
 * (mode ubah). Outlet & agent lewat pemilih bercari, status lewat chip.
 */
const LadiesFormDesktop = ({
  form,
  fieldSalah,
  onChange,
  outletOptions,
  agentOptions,
  statusOptions,
  onOutletChange,
  onAgentChange,
  onStatusChange,
}: Props) => {
  const input = (name: keyof LadiesFormValues, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={`dk-ladies-${name}`}
      name={name}
      type="text"
      autoComplete="off"
      className={`dk-input ${fieldSalah === name ? 'is-invalid' : ''}`}
      aria-invalid={fieldSalah === name || undefined}
      value={(form[name] as string) ?? ''}
      onChange={onChange}
      {...extra}
    />
  );

  return (
    <div className="dk-form-grid">
      <DesktopField label="Nama ladies" htmlFor="dk-ladies-nama_ladies" required>
        {input('nama_ladies')}
      </DesktopField>

      <DesktopField label="Nama lengkap" htmlFor="dk-ladies-nama_lengkap" required>
        {input('nama_lengkap')}
      </DesktopField>

      <DesktopField label="PIN" htmlFor="dk-ladies-pin">
        {input('pin', { inputMode: 'numeric' })}
      </DesktopField>

      <DesktopField label="Nomor KTP" htmlFor="dk-ladies-nomor_ktp">
        {input('nomor_ktp', { inputMode: 'numeric' })}
      </DesktopField>

      <DesktopField label="Outlet" labelId="dk-ladies-outlet-label">
        <SearchableSelect
          value={form.outlet_id || ''}
          onChange={onOutletChange}
          options={outletOptions}
          placeholder="Pilih outlet"
          searchPlaceholder="Cari outlet..."
          height={44}
          borderRadius={12}
          fontSize="15px"
        />
      </DesktopField>

      <DesktopField label="Agent" labelId="dk-ladies-agent-label">
        <SearchableSelect
          value={form.agent_id || ''}
          onChange={onAgentChange}
          options={agentOptions}
          placeholder="Pilih agent"
          searchPlaceholder="Cari agent..."
          height={44}
          borderRadius={12}
          fontSize="15px"
        />
      </DesktopField>

      <DesktopField label="Tanggal bergabung" htmlFor="dk-ladies-tanggal_bergabung">
        {input('tanggal_bergabung', { type: 'date' })}
      </DesktopField>

      <DesktopField label="Status" labelId="dk-ladies-status-label">
        <div className="dk-chips" role="radiogroup" aria-labelledby="dk-ladies-status-label">
          {statusOptions.map((s) => (
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

      <DesktopField label="Alamat" htmlFor="dk-ladies-alamat" full>
        <textarea
          id="dk-ladies-alamat"
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

export default LadiesFormDesktop;
