import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import ModalWrapper from '../../../components/ModalWrapper';
import ModalHeading from '../../../components/ModalHeading';
import Button from '../../../components/Button';
import ListLoadingState from '../../../components/ListLoadingState';
import { FiRepeat, FiCheckCircle, FiClock } from 'react-icons/fi';
import {
  monthNames,
  formatRupiah,
  pad,
  getLastDay,
  komponenBiaya,
  biayaBelumDibuat,
  kunciBiaya,
  type BiayaOutlet,
  type KomponenBiaya,
} from '../utils/biayaBulanan';
import { useBiayaBulananConfig } from '../hooks/useBiayaBulananConfig';

const HEADER_GRADIENT = 'linear-gradient(135deg,var(--color-green),var(--color-accent))';

type LadyPreview = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  /** Biaya bulan terpilih yang belum tersimpan untuk ladies ini. */
  belum: KomponenBiaya[];
};

const rincianNominal = (biaya: BiayaOutlet) =>
  komponenBiaya(biaya, '')
    .map((k) => `${k.nama} ${formatRupiah(k.jumlah)}`)
    .join(' · ');

type Props = {
  show: boolean;
  onClose: () => void;
  /** Dipanggil setelah generate berhasil menambahkan minimal 1 record, supaya halaman pemanggil bisa refresh ledger yang sedang tampil. */
  onGenerated?: () => void;
};

const GenerateBiayaBulananModal = ({ show, onClose, onGenerated }: Props) => {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [ladies, setLadies] = useState<LadyPreview[]>([]);
  const [generating, setGenerating] = useState(false);

  const { outlets: outletBiaya } = useBiayaBulananConfig();

  const namaOutletBiaya = outletBiaya.map((o) => o.nama_outlet);

  // Array-nya dibuat ulang tiap render, jadi tidak bisa langsung jadi
  // dependency useEffect. Versi string-nya stabil selama isinya sama, dan ikut
  // berubah kalau nominalnya berubah karena preview menyimpan nominal.
  const kunciOutletBiaya = JSON.stringify(outletBiaya);

  /** Nominal berlaku per outlet, jadi dicari saat menyusun preview. */
  const biayaUntuk = (namaOutlet: string) =>
    outletBiaya.find((o) => o.nama_outlet === namaOutlet);

  useEffect(() => {
    if (!show || namaOutletBiaya.length === 0) return;

    // Preview menyimpan keterangan berisi nama bulan, jadi hasil dari bulan
    // yang sudah diganti user tidak boleh menimpa preview bulan yang baru.
    let dibatalkan = false;

    const fetchPreview = async () => {
      setLoadingPreview(true);

      const { data: eligibleLadies, error: ladiesError } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet')
        .eq('status', 'active')
        .in('nama_outlet', namaOutletBiaya)
        .order('nama_outlet')
        .order('nama_ladies');

      if (dibatalkan) return;

      if (ladiesError || !eligibleLadies) {
        toast.error('Gagal mengambil data ladies: ' + (ladiesError?.message || ''));
        setLadies([]);
        setLoadingPreview(false);
        return;
      }

      const periode = `${monthNames[bulan - 1]} ${tahun}`;
      const from = `${tahun}-${pad(bulan)}-01`;
      const to = `${tahun}-${pad(bulan)}-${pad(getLastDay(tahun, bulan))}`;
      const ladiesIds = eligibleLadies.map((l) => l.id);

      const [existingKasbon, existingDokter] = await Promise.all([
        supabase
          .from('kasbon')
          .select('ladies_id, keterangan')
          .eq('keterangan', `Admin ${periode}`)
          .in('ladies_id', ladiesIds)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('dokter')
          .select('ladies_id, keterangan')
          .in('keterangan', [`Spekulo ${periode}`, `Gigi ${periode}`])
          .in('ladies_id', ladiesIds)
          .gte('tanggal', from)
          .lte('tanggal', to),
      ]);

      if (dibatalkan) return;

      // Kalau riwayat gagal dibaca, semua biaya akan terlihat belum ada dan
      // generate akan membuat catatan dobel. Lebih baik berhenti di sini.
      if (existingKasbon.error || existingDokter.error) {
        toast.error(
          'Gagal memeriksa biaya yang sudah ada: ' +
            (existingKasbon.error?.message || existingDokter.error?.message)
        );
        setLadies([]);
        setLoadingPreview(false);
        return;
      }

      const sudahAda = new Set(
        [...(existingKasbon.data || []), ...(existingDokter.data || [])].map((r) =>
          kunciBiaya(r.ladies_id, r.keterangan)
        )
      );

      setLadies(
        eligibleLadies.map((l) => ({
          id: l.id,
          nama_ladies: l.nama_ladies,
          nama_outlet: l.nama_outlet,
          belum: biayaBelumDibuat(biayaUntuk(l.nama_outlet), periode, l.id, sudahAda),
        }))
      );

      setLoadingPreview(false);
    };

    fetchPreview();

    return () => {
      dibatalkan = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, bulan, tahun, kunciOutletBiaya]);

  const pendingCount = ladies.filter((l) => l.belum.length > 0).length;

  const handleGenerate = async () => {
    const monthLabel = monthNames[bulan - 1];
    const tanggalInput = `${tahun}-${pad(bulan)}-01`;

    setGenerating(true);

    // Nominal diambil per outlet ladies-nya, bukan satu angka untuk semua.
    const payloadUntuk = (tabel: KomponenBiaya['tabel']) =>
      ladies.flatMap((l) =>
        l.belum
          .filter((b) => b.tabel === tabel)
          .map((b) => ({
            ladies_id: l.id,
            tanggal: tanggalInput,
            jumlah: b.jumlah,
            keterangan: b.keterangan,
          }))
      );

    const kasbonPayload = payloadUntuk('kasbon');
    const dokterPayload = payloadUntuk('dokter');

    // Jangan pernah menyimpan transaksi bernominal nol karena konfigurasi
    // outlet belum diisi — lebih baik gagal terlihat daripada diam-diam
    // membuat catatan uang yang salah.
    const nominalKosong = [...kasbonPayload, ...dokterPayload].some(
      (p) => !p.jumlah
    );

    if (nominalKosong) {
      setGenerating(false);
      toast.error(
        'Ada outlet yang nominal biaya bulanannya belum diatur. Lengkapi dulu sebelum generate.'
      );
      return;
    }

    const [kasbonResult, dokterResult] = await Promise.all([
      kasbonPayload.length > 0
        ? supabase.from('kasbon').insert(kasbonPayload)
        : Promise.resolve({ error: null }),

      dokterPayload.length > 0
        ? supabase.from('dokter').insert(dokterPayload)
        : Promise.resolve({ error: null }),
    ]);

    setGenerating(false);

    if (kasbonResult.error || dokterResult.error) {
      toast.error(
        'Gagal generate biaya bulanan: ' +
          (kasbonResult.error?.message || dokterResult.error?.message)
      );
      return;
    }

    toast.success(
      <div>
        Generate biaya bulanan {monthLabel} {tahun} selesai.
        <br />
        Kasbon Admin: {kasbonPayload.length} ditambahkan
        <br />
        Dokter: {dokterPayload.length} ditambahkan
      </div>
    );

    if (kasbonPayload.length > 0 || dokterPayload.length > 0) {
      onGenerated?.();
    }

    onClose();
  };

  const footer = (
    <div className="d-flex justify-content-end gap-2 flex-wrap">
      <Button variant="secondary" onClick={onClose}>
        Batal
      </Button>
      <Button
        variant="primary"
        icon={generating ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiRepeat />}
        onClick={handleGenerate}
        disabled={generating || loadingPreview || pendingCount === 0}
      >
        {generating ? 'Memproses...' : `Generate (${pendingCount})`}
      </Button>
    </div>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      headerGradient={HEADER_GRADIENT}
      title={
        <ModalHeading
          icon={<FiRepeat />}
          title="Generate Biaya Bulanan"
          subtitle="Nominal mengikuti pengaturan tiap outlet"
        />
      }
      footer={footer}
    >
      {/* BULAN / TAHUN — independen dari filter ledger di halaman utama */}
      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label" style={{ color: 'var(--color-dark)' }}>
            Bulan
          </label>
          <select
            className="form-select"
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6">
          <label className="form-label" style={{ color: 'var(--color-dark)' }}>
            Tahun
          </label>
          <input
            type="number"
            className="form-control"
            min={2020}
            max={2030}
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
          />
        </div>
      </div>

      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-500)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div>Berlaku untuk semua ladies aktif:</div>
        {outletBiaya.map((o) => (
          <div key={o.nama_outlet}>
            <strong>{o.nama_outlet}</strong>: {rincianNominal(o)}
          </div>
        ))}
      </div>

      {/* PREVIEW LIST */}
      {loadingPreview ? (
        <ListLoadingState label="Memuat daftar ladies" rows={3} />
      ) : ladies.length === 0 ? (
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
          Tidak ada ladies aktif di outlet {namaOutletBiaya.join('/')}.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2" style={{ maxHeight: 280, overflowY: 'auto' }}>
          {ladies.map((l) => {
            const done = l.belum.length === 0;

            return (
              <div
                key={l.id}
                className="d-flex align-items-center justify-content-between"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-gray-200)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-dark)' }}>
                    {l.nama_ladies}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                    {l.nama_outlet}
                  </div>
                </div>

                {done ? (
                  <span
                    className="d-flex align-items-center gap-1"
                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-income)', fontWeight: 600 }}
                  >
                    <FiCheckCircle size={14} /> Sudah ada
                  </span>
                ) : (
                  <span
                    className="d-flex align-items-center gap-1"
                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-voucher)', fontWeight: 600 }}
                  >
                    <FiClock size={14} /> Akan dibuat: {l.belum.map((b) => b.nama).join(', ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ModalWrapper>
  );
};

export default GenerateBiayaBulananModal;
