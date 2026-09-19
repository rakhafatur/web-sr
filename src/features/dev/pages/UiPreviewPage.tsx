import { useState } from 'react';
import { FiInbox, FiPlus, FiSearch, FiUsers } from 'react-icons/fi';

import { useTheme } from '../../../context/ThemeContext';
import { petakanKategori, petakanStatus } from '../../../lib/statusMap';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Field from '../../../components/ui/Field';
import Input from '../../../components/ui/Input';
import Money from '../../../components/ui/Money';
import Overlay, { type PenyajianOverlay } from '../../../components/ui/Overlay';
import Pagination from '../../../components/ui/Pagination';
import SectionCard from '../../../components/ui/SectionCard';
import SegmentedControl from '../../../components/ui/SegmentedControl';
import StatCard from '../../../components/ui/StatCard';

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

  const [mode, setMode] = useState<'harian' | 'bulanan'>('harian');
  const [halaman, setHalaman] = useState(1);
  const [overlay, setOverlay] = useState<PenyajianOverlay | null>(null);

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

        <SectionCard title="StatCard" subtitle="Menggantikan tiga tampilan kartu angka">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Ladies" nilai="47" ikon={<FiUsers />} />
            <StatCard label="Aktif" nilai="41" catatan="87% dari total" />
            <StatCard label="Voucher" nilai="612" catatan="bulan ini" />
            <StatCard label="Nilai Voucher" nilai={<Money value={91800000} />} />
          </div>
        </SectionCard>

        <SectionCard title="Field & Input" subtitle="Satu gaya untuk semua tipe, termasuk date">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nama Ladies" required helper="Nama panggilan, bukan nama lengkap">
              <Input placeholder="mis. Sisi" />
            </Field>

            <Field label="Tanggal" required>
              <Input type="date" />
            </Field>

            <Field label="Nominal" error="Wajib diisi">
              <Input type="number" placeholder="0" />
            </Field>

            <Field label="Outlet">
              <Input value="Kemang" readOnly />
            </Field>

            <div className="md:col-span-2">
              <Field label="Catatan" helper="Boleh dikosongkan">
                <Input multiline placeholder="Keterangan tambahan…" />
              </Field>
            </div>
          </div>

          <p className="text-xs text-fg-faint mt-3">
            Tinggi keempat kontrol di atas harus sama persis. Di versi lama, input
            tanggal punya gayanya sendiri sehingga tidak pernah sejajar.
          </p>
        </SectionCard>

        <SectionCard title="SegmentedControl" subtitle="Coba navigasi dengan panah kiri/kanan">
          <div className="flex flex-col gap-3">
            <SegmentedControl
              label="Mode tampilan"
              nilai={mode}
              onUbah={setMode}
              opsi={[
                { nilai: 'harian', label: 'Harian' },
                { nilai: 'bulanan', label: 'Bulanan' },
              ]}
            />
            <p className="text-xs text-fg-faint">Terpilih: {mode}</p>
          </div>
        </SectionCard>

        <SectionCard title="Pagination">
          <Pagination
            halaman={halaman}
            totalHalaman={5}
            totalData={47}
            perHalaman={10}
            onUbah={setHalaman}
          />
        </SectionCard>

        <SectionCard title="Overlay" subtitle="Tekan Escape untuk menutup — versi lama tidak bisa">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setOverlay('modal')}>
              Modal
            </Button>
            <Button variant="secondary" onClick={() => setOverlay('drawer')}>
              Drawer
            </Button>
            <Button variant="secondary" onClick={() => setOverlay('sheet')}>
              Bottom sheet
            </Button>
          </div>

          <Overlay
            open={overlay !== null}
            onOpenChange={(terbuka) => !terbuka && setOverlay(null)}
            title="Hapus data ladies?"
            description="Tindakan ini tidak bisa dibatalkan."
            penyajian={overlay ?? 'modal'}
            footer={
              <>
                <Button variant="secondary" onClick={() => setOverlay(null)}>
                  Batal
                </Button>
                <Button variant="danger" onClick={() => setOverlay(null)}>
                  Ya, hapus
                </Button>
              </>
            }
          >
            <p className="text-sm text-fg-muted">
              Penyajian: <strong className="text-fg">{overlay}</strong>. Coba tekan Tab —
              fokus harus terkunci di dalam dialog, dan kembali ke tombol pemicunya
              setelah ditutup.
            </p>
          </Overlay>
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
