import { FiEdit2, FiX, FiCheckCircle } from 'react-icons/fi';

type Props = {
  readonly: boolean;
  editLabel: string;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

/** Aksi Edit/Cancel/Save di header halaman Detail entitas — dipakai seragam di semua (Agent/Pengawas/Ladies/User). */
const EntityDetailActions = ({ readonly, editLabel, saving, onEdit, onCancel, onSave }: Props) =>
  readonly ? (
    <button
      className="btn btn-light fw-bold d-flex align-items-center gap-2"
      style={{ borderRadius: 14, color: 'var(--color-green)' }}
      onClick={onEdit}
    >
      <FiEdit2 />
      {editLabel}
    </button>
  ) : (
    <div className="d-flex align-items-center gap-2">
      <button
        className="btn btn-light fw-semibold d-flex align-items-center gap-2"
        style={{ borderRadius: 14 }}
        onClick={onCancel}
      >
        <FiX />
        Batal
      </button>

      <button
        className="btn btn-success fw-bold d-flex align-items-center gap-2"
        style={{ borderRadius: 14 }}
        onClick={onSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <div className="spinner-border spinner-border-sm" role="status" />
            Menyimpan...
          </>
        ) : (
          <>
            <FiCheckCircle />
            Simpan
          </>
        )}
      </button>
    </div>
  );

export default EntityDetailActions;
