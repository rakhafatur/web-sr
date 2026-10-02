import { ReactNode } from 'react';
import { FiBook, FiPrinter, FiRotateCcw, FiUsers } from 'react-icons/fi';
import MobilePageBar from '../../../components/MobilePageBar';
import SearchableSelect, { type SearchableOption } from '../../../components/SearchableSelect';
import ListLoadingState from '../../../components/ListLoadingState';
import MonthPill from '../../ladies/components/MonthPill';
import { ringkasanBukuKuning, type SaldoRow } from '../utils/saldoBerjalan';
import '../../../styles/mobile-admin.css';

export type GayaBaris = {
  label: string;
  icon: ReactNode;
  color: string;
  soft: string;
  /** '+' pemasukan, '−' pengeluaran. */
  tanda: '+' | '−';
  nominal: number | string;
  /** Teks tambahan setelah tanggal (keterangan, jumlah pcs, dst.). */
  catatan?: string;
};

type Props = {
  title: string;
  /** "Ladies" / "Pengawas" — dipakai di judul bagian & pesan kosong. */
  entitas: string;
  options: SearchableOption[];
  selectedId: string;
  onSelect: (id: string) => void;

  bulan: number;
  tahun: number;
  onPeriodeChange: (bulan: number, tahun: number) => void;

  loading: boolean;
  rows: SaldoRow[];
  labelPemasukan: string;
  labelPengeluaran: string;
  gayaBaris: (row: SaldoRow) => GayaBaris;

  onTutupBuku: () => void;
  onCetak: () => void;
  /** Aksi tambahan di atas (mis. Generate Biaya Bulanan). */
  aksiTambahan?: ReactNode;
};

const pad = (n: number) => String(n).padStart(2, '0');

const rupiah = (n: number | string) => {
  const angka = typeof n === 'string' ? parseFloat(n) : n;
  return `Rp${(angka || 0).toLocaleString('id-ID')}`;
};

const tanggalSingkat = (t: string) =>
  new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

/**
 * Buku Kuning versi mobile (ladies & pengawas) — selaras Transaksi: bar atas,
 * pemilih entitas & periode berbentuk pil, hero saldo, tombol Tutup Buku &
 * Cetak, dan daftar transaksi dengan saldo berjalan per baris.
 * Data & aksi datang dari halaman; komponen ini hanya menampilkan.
 */
const BukuKuningMobile = ({
  title,
  entitas,
  options,
  selectedId,
  onSelect,
  bulan,
  tahun,
  onPeriodeChange,
  loading,
  rows,
  labelPemasukan,
  labelPengeluaran,
  gayaBaris,
  onTutupBuku,
  onCetak,
  aksiTambahan,
}: Props) => {
  const ringkasan = ringkasanBukuKuning(rows);
  const labelPeriode = new Date(tahun, bulan - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
  const sekarang = new Date();
  const diBulanIni = tahun === sekarang.getFullYear() && bulan === sekarang.getMonth() + 1;

  const geserBulan = (arah: -1 | 1) => {
    const d = new Date(tahun, bulan - 1 + arah, 1);
    onPeriodeChange(d.getMonth() + 1, d.getFullYear());
  };

  return (
    <div className="tm-page">
      <MobilePageBar title={title} backTo="/" />

      <div className="tm-stack">
        {aksiTambahan}

        <h2 className="tm-section-title">{entitas}</h2>
        <SearchableSelect
          value={selectedId}
          onChange={onSelect}
          options={options}
          placeholder={`Pilih ${entitas.toLowerCase()}`}
          searchPlaceholder={`Cari nama ${entitas.toLowerCase()}...`}
          height={52}
          borderRadius={999}
          fontSize="1rem"
        />

        <h2 className="tm-section-title">Periode</h2>
        <MonthPill
          label={labelPeriode}
          value={`${tahun}-${pad(bulan)}`}
          max={`${sekarang.getFullYear()}-${pad(sekarang.getMonth() + 1)}`}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m] = e.target.value.split('-').map(Number);
            onPeriodeChange(m, y);
          }}
          onPrev={() => geserBulan(-1)}
          onNext={() => geserBulan(1)}
          nextDisabled={diBulanIni}
        />

        {!selectedId ? (
          <div className="tm-group">
            <div className="tm-empty">
              <span className="tm-empty-icon" aria-hidden><FiUsers /></span>
              <div className="tm-empty-title">Pilih {entitas.toLowerCase()} dulu</div>
              <div className="tm-empty-text">
                Saldo dan daftar transaksi akan muncul setelah {entitas.toLowerCase()} dipilih.
              </div>
            </div>
          </div>
        ) : loading ? (
          <ListLoadingState label="Memuat buku kuning" rows={4} />
        ) : (
          <>
            <section className="tm-hero" aria-label="Ringkasan saldo">
              <div className="tm-hero-label">Saldo akhir</div>
              <div className="tm-hero-value">{rupiah(ringkasan.saldoAkhir)}</div>
              <div className="tm-hero-sub">
                Saldo awal {rupiah(ringkasan.saldoAwal)} · {labelPeriode}
              </div>
              <div className="tm-hero-split">
                <div>
                  <div className="tm-hero-split-label">{labelPemasukan}</div>
                  <div className="tm-hero-split-value">+ {rupiah(ringkasan.totalPemasukan)}</div>
                </div>
                <div>
                  <div className="tm-hero-split-label">{labelPengeluaran}</div>
                  <div className="tm-hero-split-value">− {rupiah(ringkasan.totalPengeluaran)}</div>
                </div>
              </div>
            </section>

            <div className="tm-actions">
              <button type="button" className="tm-btn tm-btn--primary" onClick={onTutupBuku}>
                <FiBook aria-hidden />
                Tutup Buku
              </button>
              <button type="button" className="tm-btn" onClick={onCetak}>
                <FiPrinter aria-hidden />
                Cetak PDF
              </button>
            </div>

            <h2 className="tm-section-title">Transaksi ({ringkasan.jumlahTransaksi})</h2>
            <div className="tm-group tm-list">
              {/* Baris pembuka: saldo bawaan bulan lalu */}
              <div>
                <div className="tm-row tm-row--opening">
                  <span
                    className="tm-row-icon"
                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-gray-700)' }}
                    aria-hidden
                  >
                    <FiRotateCcw />
                  </span>
                  <div className="tm-row-main">
                    <div className="tm-row-title">Saldo bulan lalu</div>
                    <div className="tm-row-sub">Sisa kasbon dari tutup buku sebelumnya</div>
                  </div>
                  <div className="tm-row-value">
                    <div className="tm-row-amount">{rupiah(ringkasan.saldoAwal)}</div>
                  </div>
                </div>
              </div>

              {rows.slice(1).map((r, i) => {
                const g = gayaBaris(r);
                return (
                  <div key={`${r.tanggal}-${i}`}>
                    <div className="tm-row">
                      <span className="tm-row-icon" style={{ background: g.soft, color: g.color }} aria-hidden>
                        {g.icon}
                      </span>
                      <div className="tm-row-main">
                        <div className="tm-row-title">{g.label}</div>
                        <div className="tm-row-sub">
                          {tanggalSingkat(r.tanggal)}
                          {g.catatan ? ` · ${g.catatan}` : ''}
                        </div>
                      </div>
                      <div className="tm-row-value">
                        <div className="tm-row-amount" style={{ color: g.color }}>
                          {g.tanda} {rupiah(g.nominal)}
                        </div>
                        <div className="tm-row-saldo">Saldo {rupiah(r.saldo)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {ringkasan.jumlahTransaksi === 0 && (
                <div className="tm-empty" style={{ paddingTop: 'var(--space-5)' }}>
                  <div className="tm-empty-title">Belum ada transaksi</div>
                  <div className="tm-empty-text">Tidak ada transaksi di periode ini.</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BukuKuningMobile;
