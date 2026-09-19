import { createContext, useContext, useId, type ReactNode } from 'react';

type NilaiField = {
  id: string;
  invalid: boolean;
  describedBy?: string;
};

const FieldContext = createContext<NilaiField | null>(null);

/** Dipakai kontrol di dalam <Field> untuk mengambil id & pengaitan aria.
    Mengembalikan null kalau kontrolnya dipakai berdiri sendiri. */
export function useField(): NilaiField | null {
  return useContext(FieldContext);
}

type Props = {
  label: string;
  required?: boolean;
  /** Petunjuk tetap. Disembunyikan saat ada `error` supaya tidak dua baris. */
  helper?: string;
  error?: string;
  children: ReactNode;
};

/**
 * Pembungkus kontrol form: label, penanda wajib, teks bantuan, dan pesan galat.
 *
 * Pengaitan id diberikan lewat context, bukan dengan meng-clone elemen anak —
 * dengan begitu `Field` bisa membungkus kontrol apa pun (termasuk
 * SearchableSelect nanti), bukan hanya <input> bawaan.
 */
const Field = ({ label, required, helper, error, children }: Props) => {
  const id = useId();
  const idPesan = `${id}-pesan`;
  const adaPesan = Boolean(error || helper);

  return (
    <FieldContext.Provider
      value={{ id, invalid: Boolean(error), describedBy: adaPesan ? idPesan : undefined }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {required && (
            <>
              {/* Bintang untuk yang melihat, kata "wajib diisi" untuk pembaca
                  layar — bintang saja tidak terbaca sebagai kewajiban. */}
              <span aria-hidden="true" className="text-danger-fg ml-0.5">
                *
              </span>
              <span className="sr-only"> (wajib diisi)</span>
            </>
          )}
        </label>

        {children}

        {error ? (
          <p id={idPesan} role="alert" className="text-xs text-danger-fg">
            {error}
          </p>
        ) : (
          helper && (
            <p id={idPesan} className="text-xs text-fg-faint">
              {helper}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
};

export default Field;
