import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCalendar, FiEdit3 } from 'react-icons/fi';
import ModalWrapper from '../../../components/ModalWrapper';
import { hitungUlangVoucher } from '../utils/editVoucher';
import '../../../styles/mobile-admin.css';

export type BarisEdit = {
  id: string;
  tipe: string;
  tipeLabel: string;
  tanggal: string;
  jumlah: number;
  jumlah_voucher?: number;
  untung?: number | null;
  keterangan?: string;
};

/** Kolom yang diperbarui. Voucher: tanggal, jumlah_voucher, jumlah,
    (untung bila tersimpan). Lainnya: tanggal, jumlah, keterangan. */
export type PerubahanTransaksi = {
  tanggal: string;
  jumlah: number;
  jumlah_voucher?: number;
  untung?: number;
  keterangan?: string;
};

type Props = {
  row: BarisEdit;
  onClose: () => void;
  onSimpan: (perubahan: PerubahanTransaksi) => Promise<void>;
};

const angkaSaja = (v: string) => v.replace(/[^\d]/g, '');
const titik = (v: string) => v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

/**
 * Bottom sheet ubah transaksi (mobile, ladies & pengawas).
 * - Voucher: pcs & tanggal. Nominal & untung dihitung ulang dari harga per
 *   pcs transaksi itu sendiri (hitungUlangVoucher), bukan harga outlet kini.
 * - Lainnya: jumlah, tanggal, keterangan.
 * Pasang dengan `key={row.id}` supaya isian di-reset tiap baris berbeda.
 */
const EditTransaksiSheet = ({ row, onClose, onSimpan }: Props) => {
  const isVoucher = row.tipe === 'voucher';

  const [tanggal, setTanggal] = useState(row.tanggal);
  const [jumlah, setJumlah] = useState(String(Math.round(row.jumlah)));
  const [pcs, setPcs] = useState(String(row.jumlah_voucher ?? ''));
  const [keterangan, setKeterangan] = useState(row.keterangan ?? '');
  const [menyimpan, setMenyimpan] = useState(false);

  const pcsLama = row.jumlah_voucher ?? 0;
  const hasilVoucher = isVoucher
    ? hitungUlangVoucher(
        { jumlah: row.jumlah, jumlah_voucher: pcsLama, untung: row.untung ?? null },
        Number(pcs || 0)
      )
    : null;
  // Pcs lama 0 → harga per pcs tak diketahui; pcs tidak bisa diubah.
  const pcsTerkunci = isVoucher && !hitungUlangVoucher(
    { jumlah: row.jumlah, jumlah_voucher: pcsLama, untung: row.untung ?? null },
    pcsLama
  );

  const simpan = async () => {
    if (!tanggal) {
      toast.error('Tanggal wajib diisi.');
      return;
    }

    let perubahan: PerubahanTransaksi;

    if (isVoucher) {
      const pcsBaru = Number(pcs || 0);
      if (pcsBaru <= 0) {
        toast.error('Jumlah voucher harus lebih dari 0.');
        return;
      }
      if (!hasilVoucher) {
        perubahan = { tanggal, jumlah: row.jumlah };
      } else {
        perubahan = {
          tanggal,
          jumlah_voucher: pcsBaru,
          jumlah: hasilVoucher.jumlah,
          ...(hasilVoucher.untung !== null ? { untung: hasilVoucher.untung } : {}),
        };
      }
    } else {
      const jumlahBaru = Number(jumlah || 0);
      if (jumlahBaru <= 0) {
        toast.error('Jumlah harus lebih dari 0.');
        return;
      }
      perubahan = { tanggal, jumlah: jumlahBaru, keterangan };
    }

    setMenyimpan(true);
    try {
      await onSimpan(perubahan);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <ModalWrapper
      show
      title={<div className="fw-bold">Ubah {row.tipeLabel.toLowerCase()}</div>}
      onClose={onClose}
      footer={
        <div className="tm-sheet-footer">
          <button type="button" className="tm-btn" onClick={onClose} disabled={menyimpan}>
            Batal
          </button>
          <button type="button" className="tm-btn tm-btn--primary" onClick={simpan} disabled={menyimpan}>
            {menyimpan ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      }
    >
      <div className="tm-sheet-form">
        {isVoucher ? (
          <>
            <div className="tm-amount" style={{ marginTop: 0 }}>
              <label htmlFor="edit-pcs" className="tm-amount-label">Jumlah voucher</label>
              <div className="tm-amount-row">
                <input
                  id="edit-pcs"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className="tm-amount-input"
                  value={pcs}
                  disabled={pcsTerkunci}
                  onChange={(e) => setPcs(angkaSaja(e.target.value))}
                />
                <span className="tm-amount-suffix" aria-hidden>pcs</span>
              </div>
            </div>

            {pcsTerkunci ? (
              <div className="tm-help">
                Harga per pcs transaksi ini tidak diketahui, jadi jumlah pcs tidak bisa
                diubah. Hapus lalu input ulang kalau pcs-nya salah.
              </div>
            ) : (
              hasilVoucher && (
                <div className="tm-total" aria-live="polite">
                  <div>
                    <div className="tm-total-label">Nominal baru</div>
                    <div className="tm-total-detail">
                      {hasilVoucher.untung !== null
                        ? `Untung ${rupiah(hasilVoucher.untung)} · harga per pcs tetap dari transaksi ini`
                        : 'Harga per pcs tetap dari transaksi ini'}
                    </div>
                  </div>
                  <div className="tm-total-value">{rupiah(hasilVoucher.jumlah)}</div>
                </div>
              )
            )}
          </>
        ) : (
          <div className="tm-amount" style={{ marginTop: 0 }}>
            <label htmlFor="edit-jumlah" className="tm-amount-label">Jumlah</label>
            <div className="tm-amount-row">
              <span className="tm-amount-prefix" aria-hidden>Rp</span>
              <input
                id="edit-jumlah"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="tm-amount-input"
                value={titik(jumlah)}
                onChange={(e) => setJumlah(angkaSaja(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="tm-field">
          <label htmlFor="edit-tanggal" className="tm-label">Tanggal</label>
          <div className="tm-input-wrap">
            <FiCalendar className="tm-input-icon" aria-hidden />
            <input
              id="edit-tanggal"
              type="date"
              className="tm-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
        </div>

        {!isVoucher && (
          <div className="tm-field">
            <label htmlFor="edit-keterangan" className="tm-label">Keterangan (opsional)</label>
            <div className="tm-input-wrap">
              <FiEdit3 className="tm-input-icon" aria-hidden />
              <input
                id="edit-keterangan"
                type="text"
                className="tm-input"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default EditTransaksiSheet;
