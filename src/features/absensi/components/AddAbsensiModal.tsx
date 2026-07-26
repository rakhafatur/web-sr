import { useEffect, useState } from 'react';
import FormField from '../../../components/FormField';
import ModalWrapper from '../../../components/ModalWrapper';
import ModalHeading from '../../../components/ModalHeading';
import Button from '../../../components/Button';

import {
  FiCalendar,
  FiEdit2,
  FiSave,
} from 'react-icons/fi';

const HEADER_GRADIENT = 'linear-gradient(135deg,var(--color-green),var(--color-accent))';

type Absensi = {
  status: string;
  keterangan: string | null;
  tanggal: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: {
    status: string;
    keterangan?: string;
  }) => void | Promise<void>;
  absensi?: Absensi | null;
};

const AddAbsensiModal = ({
  show,
  onClose,
  onSubmit,
  absensi,
}: Props) => {
  const [form, setForm] = useState({
    status: 'KERJA',
    keterangan: '',
  });

  const [readonly, setReadonly] =
    useState<boolean>(false);

  useEffect(() => {
    if (!show) return;

    if (absensi) {
      setForm({
        status: absensi.status,
        keterangan:
          absensi.keterangan || '',
      });

      setReadonly(true);
    } else {
      setForm({
        status: 'KERJA',
        keterangan: '',
      });

      setReadonly(false);
    }
  }, [show, absensi]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.status) {
      alert('Status wajib diisi');
      return;
    }

    await onSubmit({
      status: form.status,
      keterangan:
        form.keterangan?.trim() ||
        undefined,
    });

    onClose();
  };

  const footer = (
    <div className="d-flex justify-content-end gap-2 flex-wrap">
      <Button variant="secondary" onClick={onClose}>
        Tutup
      </Button>
      {readonly ? (
        <Button variant="warning" icon={<FiEdit2 />} onClick={() => setReadonly(false)}>
          Edit Form
        </Button>
      ) : (
        <Button variant="primary" icon={<FiSave />} onClick={handleSubmit}>
          Simpan
        </Button>
      )}
    </div>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      headerGradient={HEADER_GRADIENT}
      title={
        <ModalHeading
          icon={<FiCalendar />}
          title={absensi ? 'Detail Absensi' : 'Tambah Absensi'}
          subtitle={absensi ? 'Lihat atau edit data absensi' : 'Isi data absensi harian'}
        />
      }
      footer={footer}
    >
      {/* STATUS */}
      <div className="mb-4">
        <label
          className="fw-semibold mb-3 d-block"
          style={{
            color:
              'var(--color-dark)',
          }}
        >
          Status Absensi
        </label>

        <div className="d-flex flex-wrap gap-2">
          {[
            'KERJA',
            'MENS',
            'OFF',
            'SAKIT',
          ].map((opt) => {
            const active =
              form.status === opt;

            return (
              <button
                key={opt}
                type="button"
                disabled={
                  readonly
                }
                onClick={() =>
                  setForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      status:
                        opt,
                    })
                  )
                }
                className="btn"
                style={{
                  borderRadius: 14,
                  padding:
                    '10px 18px',
                  fontWeight: 700,
                  border:
                    active
                      ? 'none'
                      : '1px solid var(--color-gray-200)',
                  background:
                    active
                      ? 'linear-gradient(135deg, var(--color-green), var(--color-accent))'
                      : 'var(--color-surface)',
                  color:
                    active
                      ? 'white'
                      : 'var(--color-gray-700)',
                  opacity:
                    readonly &&
                    !active
                      ? 0.65
                      : 1,
                  transition:
                    '0.2s',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* KETERANGAN */}
      <div>
        <FormField
          label="Keterangan"
          name="keterangan"
          value={form.keterangan}
          onChange={
            handleChange
          }
          readOnly={
            readonly
          }
          type="textarea"
        />
      </div>

      {/* READONLY NOTICE */}
      {readonly && (
        <div
          className="mt-4 p-3 rounded-4"
          style={{
            background:
              'var(--color-warning)',
            border:
              '1px solid var(--color-warning-hover)',
          }}
        >
          <div className="d-flex gap-3">
            <div
              style={{
                fontSize:
                  '1.3rem',
              }}
            >
              ✨
            </div>

            <div>
              <div className="fw-bold mb-1">
                Mode Detail
              </div>

              <div
                style={{
                  fontSize:
                    '0.9rem',
                  color:
                    'var(--color-gray-500)',
                }}
              >
                Klik tombol edit
                untuk mengubah
                data absensi.
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default AddAbsensiModal;
