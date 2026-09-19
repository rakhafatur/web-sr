import { FiInbox, FiPlus, FiSearch } from 'react-icons/fi';

import { useTheme } from '../../../context/ThemeContext';
import { petakanKategori, petakanStatus } from '../../../lib/statusMap';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Money from '../../../components/ui/Money';
import SectionCard from '../../../components/ui/SectionCard';

import type { ThemePreference } from '../../../lib/theme';

const PILIHAN_TEMA: { nilai: ThemePreference; label: string }[] = [
  { nilai: 'light', label: 'Terang' },
  { nilai: 'dark', label: 'Gelap' },
  { nilai: 'system', label: 'Ikut sistem' },
];

const STATUS_CONTOH = ['active', 'not active', 'resign', 'AKTIF', 'KERJA', 'SAKIT', 'entah'];
const KATEGORI_CONTOH = ['voucher', 'kasbon', 'dokter', 'pemasukan_lain', 'gaji_pengawas'];

/**
 * Panduan gaya hidup — bukan bagian aplikasi.
 *
 * Hanya terdaftar saat mode dev (lihat App.tsx), jadi tidak menambah
 * permukaan apa pun di produksi. Gunanya: melihat seluruh primitif di kedua
 * tema sekaligus, supaya token yang salah ketahuan sebelum dipakai puluhan
 * halaman.
 */
const UiPreviewPage = () => {
  const { preference, theme, setPreference } = useTheme();

  return (
    <div className="bg-canvas text-fg min-h-screen p-6 font-sans">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Panduan Gaya</h1>
            <p className="text-sm text-fg-muted mt-0.5">
              Primitif Fase 1a. Tema aktif: <strong className="text-fg">{theme}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            {PILIHAN_TEMA.map((opsi) => (
              <Button
                key={opsi.nilai}
                size="sm"
                variant={preference === opsi.nilai ? 'primary' : 'secondary'}
                onClick={() => setPreference(opsi.nilai)}
              >
                {opsi.label}
              </Button>
            ))}
          </div>
        </header>

        <SectionCard title="Button" subtitle="Empat varian, tiga ukuran, nol gradient">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary">Simpan</Button>
              <Button variant="secondary">Batal</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Hapus</Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" icon={<FiPlus />}>
                Kecil
              </Button>
              <Button size="md" variant="primary" icon={<FiPlus />}>
                Sedang
              </Button>
              <Button size="lg" variant="primary" icon={<FiPlus />}>
                Besar
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" loading>
                Menyimpan
              </Button>
              <Button variant="primary" disabled>
                Nonaktif
              </Button>
              <Button variant="secondary" icon={<FiSearch />}>
                Dengan ikon
              </Button>
            </div>

            <p className="text-xs text-fg-faint">
              Tekan Tab untuk memeriksa cincin fokus — sebelumnya proyek ini tidak punya
              satu pun aturan <code>:focus-visible</code>.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Badge" subtitle="Nilai mentah diterjemahkan oleh statusMap">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_CONTOH.map((mentah) => {
                const info = petakanStatus(mentah);
                return (
                  <Badge key={mentah} variant={info.varian}>
                    {info.label}
                  </Badge>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {KATEGORI_CONTOH.map((mentah) => {
                const info = petakanKategori(mentah);
                return (
                  <Badge key={mentah} variant={info.varian}>
                    {info.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Money" subtitle="Tabular, awalan Rp diredupkan">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-5">
              <Money value={2700000} />
              <Money value={450000} arah="masuk" tampilkanTanda />
              <Money value={200000} arah="keluar" tampilkanTanda />
              <Money value={0} />
            </div>

            <div>
              <Money value={2700000} ukuran="display" />
            </div>

            <div className="border border-line rounded-lg overflow-hidden">
              {[2700000, 450000, 91800000, 1650000].map((n) => (
                <div
                  key={n}
                  className="flex items-center justify-between px-3 py-2 border-b border-line-subtle last:border-b-0"
                >
                  <span className="text-sm text-fg-muted">Baris contoh</span>
                  <Money value={n} ukuran="sm" />
                </div>
              ))}
            </div>

            <p className="text-xs text-fg-faint">
              Digit di kolom kanan harus sejajar sempurna antar baris. Kalau tidak,
              <code> tabular-nums</code> tidak aktif.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="EmptyState" padding={false}>
          <EmptyState
            icon={<FiInbox />}
            title="Belum ada transaksi"
            description="Transaksi yang dicatat bulan ini akan muncul di sini."
            action={
              <Button variant="primary" size="sm" icon={<FiPlus />}>
                Tambah transaksi
              </Button>
            }
          />
        </SectionCard>

        <SectionCard>
          <p className="text-sm text-fg-muted">
            Kartu tanpa judul — tidak merender area header sama sekali.
          </p>
        </SectionCard>
      </div>
    </div>
  );
};

export default UiPreviewPage;
