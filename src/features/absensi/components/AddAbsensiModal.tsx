import { useEffect, useState } from 'react';
import FormInput from '../../../components/FormInput';

import {
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
} from 'react-icons/fi';

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

  if (!show) return null;

  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      tabIndex={-1}
      style={{
        background:
          'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(8px)',
        minHeight: '100vh',
        zIndex: 1050,
        padding: 16,
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{
          width: '100%',
          maxWidth: 520,
        }}
      >
        <div
          className="modal-content border-0"
          style={{
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow:
              '0 25px 60px rgba(0,0,0,0.18)',
            background: '#ffffff',
          }}
        >
          {/* HEADER */}
          <div
            className="px-4 py-4"
            style={{
              background:
                'linear-gradient(135deg,var(--color-green),#7be0a9)',
              color: 'white',
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    background:
                      'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    fontSize: 22,
                    backdropFilter:
                      'blur(10px)',
                  }}
                >
                  <FiCalendar />
                </div>

                <div>
                  <div
                    className="fw-bold"
                    style={{
                      fontSize:
                        '1.15rem',
                    }}
                  >
                    {absensi
                      ? 'Detail Absensi'
                      : 'Tambah Absensi'}
                  </div>

                  <div
                    style={{
                      opacity: 0.8,
                      fontSize:
                        '0.88rem',
                      marginTop: 2,
                    }}
                  >
                    {absensi
                      ? 'Lihat atau edit data absensi'
                      : 'Isi data absensi harian'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn border-0 shadow-none"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background:
                    'rgba(255,255,255,0.18)',
                  color: 'white',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                }}
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="p-4">
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
                            : '1px solid #dfeee4',
                        background:
                          active
                            ? 'linear-gradient(135deg,#22c55e,#4ade80)'
                            : '#fff',
                        color:
                          active
                            ? 'white'
                            : '#444',
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
              <FormInput
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
                    '#fff8e7',
                  border:
                    '1px solid #ffe2a8',
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
                          '#666',
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
          </div>

          {/* FOOTER */}
          <div
            className="px-4 pb-4 pt-2 d-flex justify-content-end gap-2 flex-wrap"
          >
            <button
              className="btn"
              onClick={onClose}
              style={{
                height: 48,
                paddingInline: 20,
                borderRadius: 14,
                background: '#f1f5f9',
                color: '#334155',
                fontWeight: 600,
                border: 'none',
              }}
            >
              Tutup
            </button>

            {readonly ? (
              <button
                className="btn"
                onClick={() =>
                  setReadonly(false)
                }
                style={{
                  height: 48,
                  paddingInline: 22,
                  borderRadius: 14,
                  background:
                    'linear-gradient(135deg,#f59e0b,#fbbf24)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  boxShadow:
                    '0 10px 25px rgba(245,158,11,0.25)',
                }}
              >
                <FiEdit2 className="me-2" />
                Edit Form
              </button>
            ) : (
              <button
                className="btn"
                onClick={
                  handleSubmit
                }
                style={{
                  height: 48,
                  paddingInline: 22,
                  borderRadius: 14,
                  background:
                    'linear-gradient(135deg,#22c55e,#4ade80)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  boxShadow:
                    '0 10px 25px rgba(34,197,94,0.25)',
                }}
              >
                <FiSave className="me-2" />
                Simpan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAbsensiModal;