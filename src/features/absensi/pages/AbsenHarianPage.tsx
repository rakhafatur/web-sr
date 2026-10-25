import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';

import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import ListLoadingState from '../../../components/ListLoadingState';
import Skeleton from '../../../components/Skeleton';
import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import DesktopField from '../../../components/desktop/DesktopField';
import ModalWrapper from '../../../components/ModalWrapper';
import { STATUS_ABSENSI } from '../utils/rekapAbsensi';
import { ringkasAbsenHarian } from '../utils/ringkasHarian';
import { gayaStatus } from '../utils/gayaStatus';
import '../../ladies/components/MonthPill.css';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

import {
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiInbox,
  FiSearch,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';

/*
 * Absen Harian: satu tanggal, semua ladies aktif sekaligus — pelengkap
 * halaman Absensi (per ladies, sebulan) yang sengaja tidak diubah.
 *
 * Ketuk chip status = langsung tersimpan (optimistic). "Tandai sisanya Kerja"
 * mengisi semua ladies yang belum punya catatan di tanggal itu.
 */

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string | null;
  pin: string | null;
};

type Catatan = {
  ladies_id: string;
  status: string;
  keterangan: string | null;
};

type Filter = 'semua' | 'belum';

type IsiUbah = {
  lady: Lady;
  status: string;
  keterangan: string;
  /** Sudah ada catatan di tanggal ini (dialog Ubah, bukan Catat). */
  ada: boolean;
};

const hariIniStr = () => dayjs().format('YYYY-MM-DD');

/** "2026-10-25" → "Minggu, 25 Oktober 2026". */
const tanggalPanjang = (t: string) =>
  new Date(`${t}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Label pil tanggal mobile: "Hari ini · Min, 25 Okt" atau "Sabtu, 24 Okt 2026". */
const tanggalPil = (t: string) => {
  const d = new Date(`${t}T00:00:00`);
  const hariIni = hariIniStr();
  const kemarin = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const pendek = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  if (t === hariIni) return `Hari ini · ${pendek}`;
  if (t === kemarin) return `Kemarin · ${pendek}`;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
};

const pesanError = (err: unknown) => (err instanceof Error ? err.message : 'coba lagi');

/** Ganti catatan ladies itu kalau sudah ada, tambahkan kalau belum. */
const pasangCatatan = (daftar: Catatan[], baru: Catatan) =>
  daftar.some((c) => c.ladies_id === baru.ladies_id)
    ? daftar.map((c) => (c.ladies_id === baru.ladies_id ? baru : c))
    : [...daftar, baru];

/** Input date transparan: di desktop klik teksnya tidak membuka kalender
    tanpa showPicker(). Browser lama tidak punya / menolaknya — biarkan
    perilaku bawaan. */
const bukaPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker();
  } catch {
    /* lihat komentar di atas */
  }
};

/** Empat chip status sejajar. Warna aktif mengikuti status (semantik). */
const ChipStatus = ({
  varian,
  value,
  disabled,
  onPilih,
  label,
  labelledBy,
}: {
  varian: 'tm' | 'dk';
  value: string | undefined;
  disabled?: boolean;
  onPilih: (status: string) => void;
  label?: string;
  labelledBy?: string;
}) => (
  <div className={`${varian}-ah-chips`} role="radiogroup" aria-label={label} aria-labelledby={labelledBy}>
    {STATUS_ABSENSI.map((st) => {
      const g = gayaStatus(st);
      const aktif = value === st;
      return (
        <button
          key={st}
          type="button"
          role="radio"
          aria-checked={aktif}
          disabled={disabled}
          className={`${varian}-ah-chip ${aktif ? 'is-active' : ''}`}
          style={aktif ? { background: g.soft, borderColor: g.color, color: g.color } : undefined}
          onClick={() => onPilih(st)}
        >
          <span className={`${varian}-ah-chip-icon`} aria-hidden>
            {g.icon}
          </span>
          {g.label}
        </button>
      );
    })}
  </div>
);

/** Avatar inisial berwarna status; garis putus-putus kalau belum diabsen. */
const AvatarStatus = ({ lady, catatan, kelas }: { lady: Lady; catatan?: Catatan; kelas: string }) => {
  const g = catatan ? gayaStatus(catatan.status) : null;
  return (
    <span
      className={`${kelas} ${g ? '' : 'is-belum'}`}
      style={g ? { background: g.soft, color: g.color } : undefined}
      aria-hidden
    >
      {(lady.nama_ladies || '?').charAt(0).toUpperCase()}
    </span>
  );
};

const AbsenHarianPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const queryClient = useQueryClient();

  const [tanggal, setTanggal] = useState(hariIniStr);
  const [cari, setCari] = useState('');
  const [filter, setFilter] = useState<Filter>('semua');
  // ladies_id yang sedang disimpan — chip barisnya dikunci supaya dua ketukan
  // cepat tidak sama-sama mengira catatan belum ada lalu menyisipkan dua baris.
  const [menyimpan, setMenyimpan] = useState<Set<string>>(() => new Set());
  const [menandai, setMenandai] = useState(false);
  const [ubah, setUbah] = useState<IsiUbah | null>(null);
  const [menyimpanUbah, setMenyimpanUbah] = useState(false);

  const hariIni = hariIniStr();
  const kunciCatatan = (tgl: string) => ['absensi-harian', tgl];

  // Kunci & kolom sama dengan halaman Absensi, jadi cache-nya terpakai bersama.
  const { data: ladies = [], isLoading: memuatLadies } = useQuery({
    queryKey: ['ladies-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin, status')
        .eq('status', 'active')
        .order('nama_ladies', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Lady[];
    },
    meta: { errorLabel: 'data ladies' },
  });

  const { data: catatan = [], isLoading: memuatCatatan } = useQuery({
    queryKey: kunciCatatan(tanggal),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absensi')
        .select('ladies_id, status, keterangan')
        .eq('tanggal', tanggal);

      if (error) throw error;
      return (data ?? []) as Catatan[];
    },
    meta: { errorLabel: 'absensi harian' },
  });

  const memuat = memuatLadies || memuatCatatan;

  const perLadies = useMemo(() => new Map(catatan.map((c) => [c.ladies_id, c])), [catatan]);
  const ringkasan = useMemo(() => ringkasAbsenHarian(ladies.map((l) => l.id), catatan), [ladies, catatan]);
  const jumlahBelum = ringkasan.belum.length;
  const persen = ringkasan.total ? Math.round((ringkasan.sudah / ringkasan.total) * 100) : 0;
  const selesai = ringkasan.total > 0 && jumlahBelum === 0;

  const q = cari.trim().toLowerCase();
  const terlihat = ladies.filter((l) => {
    if (filter === 'belum' && perLadies.has(l.id)) return false;
    if (!q) return true;
    return (
      l.nama_ladies.toLowerCase().includes(q) ||
      (l.nama_outlet ?? '').toLowerCase().includes(q) ||
      String(l.pin ?? '').includes(q)
    );
  });

  const kunciBaris = (id: string, kunci: boolean) =>
    setMenyimpan((prev) => {
      const baru = new Set(prev);
      if (kunci) baru.add(id);
      else baru.delete(id);
      return baru;
    });

  /** Simpan satu catatan. Keberadaannya dicek ke server, bukan ke cache:
      tanggal ini bisa saja baru dicatat dari halaman Absensi atau perangkat
      lain. `keterangan` yang tidak diisi = tidak diubah (kalau update). */
  const tulisCatatan = async (
    tgl: string,
    ladiesId: string,
    isi: { status: string; keterangan?: string | null }
  ) => {
    const { data: ada, error: errCek } = await supabase
      .from('absensi')
      .select('ladies_id')
      .eq('ladies_id', ladiesId)
      .eq('tanggal', tgl);

    if (errCek) throw errCek;

    const { error } =
      ada && ada.length > 0
        ? await supabase.from('absensi').update(isi).eq('ladies_id', ladiesId).eq('tanggal', tgl)
        : await supabase
            .from('absensi')
            .insert({ ladies_id: ladiesId, tanggal: tgl, status: isi.status, keterangan: isi.keterangan ?? null });

    if (error) throw error;
  };

  /** Ketuk chip di baris: tampil seketika, simpan di belakang. Kalau gagal,
      ambil ulang dari server (bukan kembalikan snapshot — snapshot bisa ikut
      membatalkan baris lain yang sedang disimpan). */
  const pilihStatus = async (lady: Lady, status: string) => {
    const lama = perLadies.get(lady.id);
    if (lama?.status === status || menyimpan.has(lady.id)) return;

    const tgl = tanggal;
    const kunci = kunciCatatan(tgl);

    await queryClient.cancelQueries({ queryKey: kunci });
    queryClient.setQueryData<Catatan[]>(kunci, (old) =>
      pasangCatatan(old ?? [], { ladies_id: lady.id, status, keterangan: lama?.keterangan ?? null })
    );

    kunciBaris(lady.id, true);
    try {
      await tulisCatatan(tgl, lady.id, { status });
    } catch (err) {
      toast.error(`Gagal menyimpan absensi ${lady.nama_ladies}: ${pesanError(err)}`);
      queryClient.invalidateQueries({ queryKey: kunci });
    } finally {
      kunciBaris(lady.id, false);
      queryClient.invalidateQueries({ queryKey: ['absensi-rekap', lady.id] });
    }
  };

  const tandaiSisanya = async () => {
    const ids = ringkasan.belum;
    if (ids.length === 0) return;

    const ok = await confirmDialog(
      `Tandai ${ids.length} ladies yang belum diabsen sebagai Kerja untuk ${tanggalPanjang(tanggal)}?`
    );
    if (!ok) return;

    const tgl = tanggal;
    setMenandai(true);
    try {
      // Saring ulang ke server supaya tidak menggandakan catatan yang baru
      // masuk dari tempat lain sejak daftar ini dimuat.
      const { data: ada, error: errCek } = await supabase
        .from('absensi')
        .select('ladies_id')
        .eq('tanggal', tgl)
        .in('ladies_id', ids);

      if (errCek) throw errCek;

      const sudahAda = new Set((ada ?? []).map((r) => r.ladies_id));
      const baru = ids.filter((id) => !sudahAda.has(id));

      if (baru.length > 0) {
        const { error } = await supabase
          .from('absensi')
          .insert(baru.map((id) => ({ ladies_id: id, tanggal: tgl, status: 'KERJA', keterangan: null })));

        if (error) throw error;
      }

      toast.success(`${baru.length} ladies ditandai Kerja`);
    } catch (err) {
      toast.error(`Gagal menandai absensi: ${pesanError(err)}`);
    } finally {
      setMenandai(false);
      queryClient.invalidateQueries({ queryKey: kunciCatatan(tgl) });
      queryClient.invalidateQueries({ queryKey: ['absensi-rekap'] });
    }
  };

  const bukaUbah = (lady: Lady) => {
    const c = perLadies.get(lady.id);
    setUbah({ lady, status: c?.status ?? 'KERJA', keterangan: c?.keterangan ?? '', ada: !!c });
  };

  const simpanUbah = async () => {
    if (!ubah) return;

    const tgl = tanggal;
    setMenyimpanUbah(true);
    try {
      await tulisCatatan(tgl, ubah.lady.id, {
        status: ubah.status,
        keterangan: ubah.keterangan.trim() || null,
      });
      setUbah(null);
    } catch (err) {
      toast.error(`Gagal menyimpan absensi: ${pesanError(err)}`);
    } finally {
      setMenyimpanUbah(false);
      queryClient.invalidateQueries({ queryKey: kunciCatatan(tgl) });
      queryClient.invalidateQueries({ queryKey: ['absensi-rekap', ubah.lady.id] });
    }
  };

  const hapus = async () => {
    if (!ubah) return;

    const { lady } = ubah;
    const tgl = tanggal;
    // Dialog ditutup dulu supaya konfirmasi tidak bertumpuk di atasnya.
    setUbah(null);
    if (!(await confirmDialog(`Hapus absensi ${lady.nama_ladies} tanggal ${tanggalPanjang(tgl)}?`))) return;

    const { error } = await supabase.from('absensi').delete().eq('ladies_id', lady.id).eq('tanggal', tgl);

    if (error) toast.error(`Gagal menghapus absensi: ${error.message}`);
    queryClient.invalidateQueries({ queryKey: kunciCatatan(tgl) });
    queryClient.invalidateQueries({ queryKey: ['absensi-rekap', lady.id] });
  };

  const geserHari = (n: number) => {
    const baru = dayjs(tanggal).add(n, 'day').format('YYYY-MM-DD');
    if (baru <= hariIni) setTanggal(baru);
  };

  const gantiTanggal = (nilai: string) => {
    // iOS bisa mengirim string kosong saat tombol "Hapus" di pemilih ditekan.
    if (!nilai) return;
    setTanggal(nilai > hariIni ? hariIni : nilai);
  };

  const opsiFilter: { key: Filter; label: string; jumlah: number }[] = [
    { key: 'semua', label: 'Semua', jumlah: ringkasan.total },
    { key: 'belum', label: 'Belum diabsen', jumlah: jumlahBelum },
  ];

  const labelTandai = menandai ? 'Menandai...' : `Tandai sisanya Kerja (${jumlahBelum})`;

  // Teks untuk pembaca layar setiap kali progres berubah.
  const pengumumanProgres = memuat
    ? ''
    : `${ringkasan.sudah} dari ${ringkasan.total} ladies sudah diabsen`;

  /** Isi saat daftar kosong — beda pesan untuk tiap penyebab. */
  const kosong = (() => {
    if (ladies.length === 0) {
      return { icon: <FiUsers />, judul: 'Belum ada ladies aktif', teks: 'Ladies berstatus aktif akan muncul di sini.' };
    }
    if (filter === 'belum' && !q) {
      return { icon: <FiCheckCircle />, judul: 'Semua sudah diabsen', teks: `Tidak ada ladies yang tersisa untuk ${tanggalPanjang(tanggal)}.` };
    }
    return { icon: <FiInbox />, judul: 'Tidak ditemukan', teks: `Tidak ada ladies yang cocok dengan "${cari.trim()}".` };
  })();

  const dialogJudul = ubah ? (ubah.ada ? 'Ubah absensi' : 'Catat absensi') : '';

  // =========================================================
  // MOBILE
  // =========================================================
  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Absen Harian" backTo="/" />

        <div className="tm-stack">
          <div className="mp">
            <button type="button" className="mp-btn" onClick={() => geserHari(-1)} aria-label="Hari sebelumnya">
              <FiChevronLeft />
            </button>
            <label className="mp-label">
              <span>{tanggalPil(tanggal)}</span>
              <input
                type="date"
                className="mp-input"
                value={tanggal}
                max={hariIni}
                onChange={(e) => gantiTanggal(e.target.value)}
                onClick={bukaPicker}
                aria-label="Pilih tanggal"
              />
            </label>
            <button
              type="button"
              className="mp-btn"
              onClick={() => geserHari(1)}
              disabled={tanggal >= hariIni}
              aria-label="Hari berikutnya"
            >
              <FiChevronRight />
            </button>
          </div>

          {/* PROGRES */}
          <section className="tm-card" aria-label="Progres absen">
            {memuat ? (
              <div role="status" aria-label="Memuat progres absen">
                <Skeleton width="40%" height={13} />
                <Skeleton width="55%" height={30} style={{ marginTop: 10 }} />
                <Skeleton height={8} borderRadius="var(--radius-full)" style={{ marginTop: 14 }} />
                <Skeleton width="80%" height={13} style={{ marginTop: 14 }} />
              </div>
            ) : (
              <>
                <div className="tm-ah-progress-head">
                  <div>
                    <span className="tm-label" style={{ marginBottom: 2 }}>Sudah diabsen</span>
                    <div className="tm-ah-count" aria-hidden>
                      <strong>{ringkasan.sudah}</strong>
                      <span>/ {ringkasan.total} ladies</span>
                    </div>
                  </div>
                  <span className={`tm-ah-percent ${selesai ? 'is-done' : ''}`} aria-hidden>
                    {persen}%
                  </span>
                </div>

                <div
                  className="tm-ah-bar"
                  role="progressbar"
                  aria-label="Progres absen"
                  aria-valuemin={0}
                  aria-valuemax={ringkasan.total}
                  aria-valuenow={ringkasan.sudah}
                  aria-valuetext={pengumumanProgres}
                >
                  <div
                    className={`tm-ah-bar-fill ${selesai ? 'is-done' : ''}`}
                    style={{ transform: `scaleX(${persen / 100})` }}
                  />
                </div>

                <div className="tm-ah-legend">
                  {STATUS_ABSENSI.map((st) => {
                    const g = gayaStatus(st);
                    return (
                      <span key={st}>
                        <span className="tm-dot" style={{ background: g.color }} aria-hidden />
                        {g.label} <strong>{ringkasan.rekap[st]}</strong>
                      </span>
                    );
                  })}
                  <span>
                    <span className="tm-dot tm-ah-dot-belum" aria-hidden />
                    Belum <strong>{jumlahBelum}</strong>
                  </span>
                </div>
              </>
            )}
          </section>

          <span className="visually-hidden" role="status" aria-atomic="true">
            {pengumumanProgres}
          </span>

          {!memuat &&
            (jumlahBelum > 0 ? (
              <button
                type="button"
                className="tm-btn tm-btn--primary"
                onClick={tandaiSisanya}
                disabled={menandai}
              >
                <FiCheckSquare aria-hidden />
                {labelTandai}
              </button>
            ) : (
              selesai && (
                <div className="tm-ah-done">
                  <FiCheckCircle aria-hidden />
                  Semua ladies sudah diabsen
                </div>
              )
            ))}

          <div className="tm-search">
            <FiSearch aria-hidden />
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nama, outlet, atau PIN"
              aria-label="Cari ladies"
            />
          </div>

          <div className="tm-segmented" role="group" aria-label="Saring daftar">
            {opsiFilter.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                className={`tm-segment ${filter === f.key ? 'is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} ({f.jumlah})
              </button>
            ))}
          </div>

          {memuat ? (
            <ListLoadingState label="Memuat daftar ladies" rows={6} />
          ) : terlihat.length === 0 ? (
            <div className="tm-group">
              <div className="tm-empty">
                <span className="tm-empty-icon" aria-hidden>{kosong.icon}</span>
                <div className="tm-empty-title">{kosong.judul}</div>
                <div className="tm-empty-text">{kosong.teks}</div>
              </div>
            </div>
          ) : (
            <div>
              <ul className="tm-group tm-ah-list">
                {terlihat.map((l) => {
                  const c = perLadies.get(l.id);
                  const sibuk = menyimpan.has(l.id);
                  return (
                    <li key={l.id} className="tm-ah-row" aria-busy={sibuk || undefined}>
                      <button
                        type="button"
                        className="tm-ah-who"
                        onClick={() => bukaUbah(l)}
                        aria-label={`${l.nama_ladies}, ${c ? gayaStatus(c.status).label : 'belum diabsen'} — ubah atau beri keterangan`}
                      >
                        <AvatarStatus lady={l} catatan={c} kelas="tm-ah-avatar" />
                        <span className="tm-row-main">
                          <span className="tm-row-title">{l.nama_ladies}</span>
                          <span className="tm-row-sub">
                            {!c && <span className="tm-ah-belum">Belum diabsen · </span>}
                            {l.nama_outlet || '-'}
                            {c?.keterangan ? ` · ${c.keterangan}` : ''}
                          </span>
                        </span>
                        <FiEdit3 className="tm-chevron" aria-hidden />
                      </button>

                      <ChipStatus
                        varian="tm"
                        value={c?.status}
                        disabled={sibuk || menandai}
                        onPilih={(st) => pilihStatus(l, st)}
                        label={`Status ${l.nama_ladies}`}
                      />
                    </li>
                  );
                })}
              </ul>
              <div className="tm-hint">Ketuk status untuk menyimpan · ketuk nama untuk keterangan atau hapus</div>
            </div>
          )}
        </div>

        <ModalWrapper
          show={!!ubah}
          title={
            <div>
              <div className="fw-bold">{dialogJudul}</div>
              {ubah && (
                <div className="tm-help" style={{ marginTop: 2 }}>
                  {ubah.lady.nama_ladies} · {tanggalPil(tanggal)}
                </div>
              )}
            </div>
          }
          onClose={() => setUbah(null)}
          footer={
            <div className="tm-sheet-footer">
              <button type="button" className="tm-btn" onClick={() => setUbah(null)} disabled={menyimpanUbah}>
                Batal
              </button>
              <button type="button" className="tm-btn tm-btn--primary" onClick={simpanUbah} disabled={menyimpanUbah}>
                {menyimpanUbah ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          }
        >
          {ubah && (
            <div className="tm-sheet-form">
              <div className="tm-field">
                <span className="tm-label" id="tm-ah-ubah-status">Status</span>
                <ChipStatus
                  varian="tm"
                  value={ubah.status}
                  onPilih={(st) => setUbah({ ...ubah, status: st })}
                  labelledBy="tm-ah-ubah-status"
                />
              </div>
              <div className="tm-field">
                <label htmlFor="tm-ah-ubah-ket" className="tm-label">Keterangan (opsional)</label>
                <div className="tm-input-wrap">
                  <span className="tm-input-icon tm-input-icon--top" aria-hidden><FiEdit3 /></span>
                  <textarea
                    id="tm-ah-ubah-ket"
                    rows={2}
                    className="tm-input tm-input--area"
                    placeholder="Tambahkan catatan..."
                    value={ubah.keterangan}
                    onChange={(e) => setUbah({ ...ubah, keterangan: e.target.value })}
                  />
                </div>
              </div>
              {ubah.ada && (
                <button
                  type="button"
                  className="tm-btn tm-btn--danger"
                  style={{ width: '100%', marginTop: 'var(--space-4)' }}
                  onClick={hapus}
                  disabled={menyimpanUbah}
                >
                  <FiTrash2 aria-hidden />
                  Hapus absensi
                </button>
              )}
            </div>
          )}
        </ModalWrapper>
      </div>
    );
  }

  // =========================================================
  // DESKTOP
  // =========================================================
  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Absen Harian"
        description="Catat kehadiran semua ladies untuk satu tanggal sekaligus"
        actions={
          <div className="dk-ah-datenav">
            {tanggal !== hariIni && (
              <button type="button" className="dk-btn dk-btn--sm" onClick={() => setTanggal(hariIni)}>
                Hari ini
              </button>
            )}
            <div className="dk-month-nav dk-month-nav--pill">
              <button type="button" className="dk-icon-btn" aria-label="Hari sebelumnya" onClick={() => geserHari(-1)}>
                <FiChevronLeft />
              </button>
              <label className="dk-ah-date">
                <FiCalendar aria-hidden />
                <span>{tanggalPanjang(tanggal)}</span>
                <input
                  type="date"
                  value={tanggal}
                  max={hariIni}
                  onChange={(e) => gantiTanggal(e.target.value)}
                  onClick={bukaPicker}
                  aria-label="Pilih tanggal"
                />
              </label>
              <button
                type="button"
                className="dk-icon-btn"
                aria-label="Hari berikutnya"
                onClick={() => geserHari(1)}
                disabled={tanggal >= hariIni}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        }
      />

      <span className="visually-hidden" role="status" aria-atomic="true">
        {pengumumanProgres}
      </span>

      {/* RINGKASAN */}
      <div className="dk-ah-summary">
        <section className="dk-card dk-ah-progress" aria-label="Progres absen">
          {memuat ? (
            <div role="status" aria-label="Memuat progres absen">
              <Skeleton width="35%" height={13} />
              <Skeleton width="50%" height={30} style={{ marginTop: 10 }} />
              <Skeleton height={8} borderRadius="var(--radius-full)" style={{ marginTop: 12 }} />
            </div>
          ) : (
            <>
              <span className="dk-stat-label">Sudah diabsen</span>
              <div className="dk-ah-count" aria-hidden>
                <span className="dk-ah-count-value">{ringkasan.sudah}</span>
                <span className="dk-ah-count-total">/ {ringkasan.total} ladies</span>
                <span className={`dk-ah-percent ${selesai ? 'is-done' : ''}`}>{persen}%</span>
              </div>
              <div
                className="dk-ah-bar"
                role="progressbar"
                aria-label="Progres absen"
                aria-valuemin={0}
                aria-valuemax={ringkasan.total}
                aria-valuenow={ringkasan.sudah}
                aria-valuetext={pengumumanProgres}
              >
                <div
                  className={`dk-ah-bar-fill ${selesai ? 'is-done' : ''}`}
                  style={{ transform: `scaleX(${persen / 100})` }}
                />
              </div>
              <span className="dk-card-sub">
                {selesai
                  ? 'Semua ladies sudah diabsen'
                  : `${jumlahBelum} ladies belum diabsen`}
              </span>
            </>
          )}
        </section>

        {STATUS_ABSENSI.map((st) => {
          const g = gayaStatus(st);
          return (
            <div key={st} className="dk-stat">
              <span className="dk-stat-label">
                <span className="dk-dot" style={{ background: g.color }} />
                {g.label}
              </span>
              <span className="dk-stat-value">
                {memuat ? '–' : ringkasan.rekap[st]} <span className="dk-stat-unit">orang</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* DAFTAR */}
      <section className="dk-card" aria-label={`Daftar absen ${tanggalPanjang(tanggal)}`}>
        <div className="dk-toolbar">
          <div className="dk-ah-tools">
            <div className="dk-search">
              <FiSearch aria-hidden />
              <input
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama, outlet, atau PIN"
                aria-label="Cari ladies"
              />
            </div>
            <div className="dk-segmented" role="group" aria-label="Saring daftar">
              {opsiFilter.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  className={`dk-segment ${filter === f.key ? 'is-active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  <span className="dk-ah-segment-count">{f.jumlah}</span>
                </button>
              ))}
            </div>
          </div>

          {!memuat &&
            (jumlahBelum > 0 ? (
              <button type="button" className="dk-btn dk-btn--primary" onClick={tandaiSisanya} disabled={menandai}>
                <FiCheckSquare aria-hidden />
                {labelTandai}
              </button>
            ) : (
              selesai && (
                <span className="dk-status is-on dk-ah-done">
                  <FiCheckCircle aria-hidden />
                  Semua sudah diabsen
                </span>
              )
            ))}
        </div>

        {memuat ? (
          <div className="dk-card-body" role="status" aria-label="Memuat daftar ladies">
            <div className="dk-stack" style={{ gap: 'var(--space-3)' }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="d-flex align-items-center gap-3">
                  <Skeleton width={36} height={36} borderRadius="var(--radius-full)" />
                  <div className="flex-grow-1 d-flex flex-column gap-2">
                    <Skeleton width="30%" height={13} />
                    <Skeleton width="20%" height={11} />
                  </div>
                  <Skeleton width={386} height={34} borderRadius="var(--radius-full)" />
                </div>
              ))}
            </div>
          </div>
        ) : terlihat.length === 0 ? (
          <div className="dk-empty">
            <span className="dk-empty-icon" aria-hidden>{kosong.icon}</span>
            <div className="dk-empty-title">{kosong.judul}</div>
            <div className="dk-empty-text">{kosong.teks}</div>
          </div>
        ) : (
          <div className="dk-ah-scroll">
            <table className="dk-table dk-ah-table">
              <thead>
                <tr>
                  <th scope="col">Ladies</th>
                  <th scope="col">Status</th>
                  <th scope="col">Keterangan</th>
                  <th scope="col" className="dk-col-actions">
                    <span className="visually-hidden">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {terlihat.map((l) => {
                  const c = perLadies.get(l.id);
                  const sibuk = menyimpan.has(l.id);
                  return (
                    <tr key={l.id} aria-busy={sibuk || undefined}>
                      <td>
                        <div className="dk-person">
                          <AvatarStatus lady={l} catatan={c} kelas="dk-avatar dk-ah-avatar" />
                          <div style={{ minWidth: 0 }}>
                            <div className="dk-person-label">{l.nama_ladies}</div>
                            <div className="dk-person-sub">
                              {[l.nama_outlet, l.pin && `PIN ${l.pin}`].filter(Boolean).join(' · ') || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="dk-ah-col-status">
                        <ChipStatus
                          varian="dk"
                          value={c?.status}
                          disabled={sibuk || menandai}
                          onPilih={(st) => pilihStatus(l, st)}
                          label={`Status ${l.nama_ladies}`}
                        />
                      </td>
                      <td>
                        {c?.keterangan ? (
                          <span className="dk-ah-ket" title={c.keterangan}>{c.keterangan}</span>
                        ) : c ? (
                          <span className="dk-muted">-</span>
                        ) : (
                          <span className="dk-ah-belum">Belum diabsen</span>
                        )}
                      </td>
                      <td className="dk-col-actions">
                        <button
                          type="button"
                          className="dk-icon-btn"
                          onClick={() => bukaUbah(l)}
                          aria-label={`Ubah absensi atau keterangan ${l.nama_ladies}`}
                          title="Keterangan / hapus"
                        >
                          <FiEdit3 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!memuat && ladies.length > 0 && (
          <div className="dk-footer">
            <span className="dk-count">
              Menampilkan {terlihat.length} dari {ladies.length} ladies aktif · klik status untuk langsung menyimpan
            </span>
          </div>
        )}
      </section>

      {/* DIALOG CATAT / UBAH */}
      <ModalWrapper
        show={!!ubah}
        title={
          <div>
            <div className="dk-card-title">{dialogJudul}</div>
            {ubah && (
              <div className="dk-card-sub">
                {tanggalPanjang(tanggal)} · {ubah.lady.nama_ladies}
              </div>
            )}
          </div>
        }
        onClose={() => setUbah(null)}
        footer={
          <div className="dk-modal-foot">
            {ubah?.ada && (
              <button
                type="button"
                className="dk-btn dk-btn--danger-ghost"
                style={{ marginRight: 'auto' }}
                disabled={menyimpanUbah}
                onClick={hapus}
              >
                <FiTrash2 aria-hidden />
                Hapus
              </button>
            )}
            <button type="button" className="dk-btn" onClick={() => setUbah(null)} disabled={menyimpanUbah}>
              Batal
            </button>
            <button type="button" className="dk-btn dk-btn--primary" onClick={simpanUbah} disabled={menyimpanUbah}>
              {menyimpanUbah ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        }
      >
        {ubah && (
          <div className="dk-stack">
            <DesktopField label="Status" labelId="dk-ah-ubah-status">
              <ChipStatus
                varian="dk"
                value={ubah.status}
                onPilih={(st) => setUbah({ ...ubah, status: st })}
                labelledBy="dk-ah-ubah-status"
              />
            </DesktopField>
            <DesktopField label="Keterangan (opsional)" htmlFor="dk-ah-ubah-ket">
              <textarea
                id="dk-ah-ubah-ket"
                rows={3}
                className="dk-input"
                placeholder="Tambahkan catatan..."
                value={ubah.keterangan}
                onChange={(e) => setUbah({ ...ubah, keterangan: e.target.value })}
              />
            </DesktopField>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

export default AbsenHarianPage;
