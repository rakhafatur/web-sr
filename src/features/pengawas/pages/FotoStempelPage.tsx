import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { FiCamera, FiDownload, FiMapPin, FiRefreshCw, FiShare2 } from 'react-icons/fi';

import MobilePageBar from '../../../components/MobilePageBar';
import DesktopPageHeader from '../../../components/desktop/DesktopPageHeader';
import Skeleton from '../../../components/Skeleton';
import { BERANDA } from '../../../layout/peran';
import type { RootState } from '../../../app/store';
import { useLokasi, type StatusLokasi } from '../hooks/useLokasi';
import { formatWaktuStempel, gambarFotoBerstempel, keJpeg, teksLokasi, teksNama } from '../utils/stempelFoto';
import '../../../styles/mobile-admin.css';
import '../pengawas.css';

const MAKS_CATATAN = 80;

/** GPS yang lebih tua dari ini diambil ulang saat foto baru masuk. */
const GPS_BASI_MS = 60_000;

const muatGambar = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gambar tidak bisa dibaca'));
    img.src = src;
  });

const namaFile = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `SR-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.jpg`;
};

const PESAN_LOKASI: Record<Exclude<StatusLokasi, 'ok'>, string> = {
  mencari: 'Mencari lokasi…',
  ditolak: 'Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di pengaturan browser.',
  gagal: 'Lokasi belum didapat. Pastikan GPS menyala lalu coba lagi.',
  'tidak-didukung': 'Browser ini tidak mendukung lokasi.',
};

type Foto = { img: HTMLImageElement; waktu: Date };
type Hasil = { url: string; blob: Blob; nama: string };

/**
 * Foto berstempel (pengawas): kamera bawaan HP → waktu, lokasi,
 * "Nama - SR AGENT", dan catatan digambar di bawah foto → dibagikan (WA) atau diunduh.
 * Tidak ada yang disimpan ke server. Perhitungan teks & gambar di
 * utils/stempelFoto.ts.
 */
const FotoStempelPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const nama = useSelector((state: RootState) => state.user.currentUser?.nama) ?? '';
  const { status, koordinat, alamat, alamatMemuat, perbarui } = useLokasi();

  const inputRef = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<Foto | null>(null);
  const [catatan, setCatatan] = useState('');
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [memproses, setMemproses] = useState(false);

  const lokasi = teksLokasi(alamat, koordinat);
  const barisNama = teksNama(nama);

  // Gambar ulang stempel tiap kali isinya berubah (catatan diketik, lokasi
  // baru masuk). Ditunda sebentar supaya tidak menggambar tiap ketukan.
  useEffect(() => {
    if (!foto) return;
    let batal = false;
    setMemproses(true);
    const t = setTimeout(async () => {
      try {
        // Pastikan font Inter sudah termuat — canvas tidak menunggu sendiri.
        await document.fonts?.load('700 36px "Inter Variable"').catch(() => undefined);
        const canvas = gambarFotoBerstempel(foto.img, {
          waktu: formatWaktuStempel(foto.waktu),
          lokasi,
          nama: barisNama,
          catatan: catatan.trim(),
        });
        const blob = await keJpeg(canvas);
        if (batal) return;
        setHasil({ url: URL.createObjectURL(blob), blob, nama: namaFile(foto.waktu) });
      } catch {
        if (!batal) toast.error('Gagal membuat foto berstempel. Coba foto ulang.');
      } finally {
        if (!batal) setMemproses(false);
      }
    }, 250);
    return () => {
      batal = true;
      clearTimeout(t);
    };
  }, [foto, lokasi, barisNama, catatan]);

  // Lepas object URL lama begitu diganti hasil baru / halaman ditinggal.
  const urlHasil = hasil?.url;
  useEffect(() => {
    if (!urlHasil) return;
    return () => URL.revokeObjectURL(urlHasil);
  }, [urlHasil]);

  const ambilFoto = () => inputRef.current?.click();

  const onPilihFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // supaya memotret lagi tetap memicu onChange
    if (!file) return;

    const waktu = new Date();
    if (!koordinat || waktu.getTime() - koordinat.diambil > GPS_BASI_MS) perbarui();

    const url = URL.createObjectURL(file);
    try {
      const img = await muatGambar(url);
      setFoto({ img, waktu });
    } catch {
      toast.error('Foto tidak bisa dibaca. Coba ambil ulang.');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const bagikan = async () => {
    if (!hasil) return;
    const file = new File([hasil.blob], hasil.nama, { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch (err) {
        // Dibatalkan user = bukan kesalahan.
        if ((err as Error)?.name !== 'AbortError') toast.error('Gagal membagikan foto.');
      }
    } else {
      unduh();
      toast.info('Browser ini tidak bisa membagikan langsung — foto diunduh.');
    }
  };

  const unduh = () => {
    if (!hasil) return;
    const a = document.createElement('a');
    a.href = hasil.url;
    a.download = hasil.nama;
    a.click();
  };

  const siap = !!hasil && !memproses;

  const isi = (
    <div className="tm-stack fs-halaman">
      <section className="tm-card fs-lokasi" aria-label="Lokasi">
        <span className="fs-lokasi-ikon" aria-hidden>
          <FiMapPin />
        </span>
        <div className="fs-lokasi-teks" aria-live="polite">
          {status === 'ok' ? (
            alamatMemuat && !alamat ? (
              <>
                <Skeleton width="85%" height={14} />
                <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
              </>
            ) : (
              <>
                <span className="fs-lokasi-utama">{lokasi}</span>
                {koordinat && <span className="fs-lokasi-sub">Akurasi ±{Math.round(koordinat.akurasi)} m</span>}
              </>
            )
          ) : (
            <span className={status === 'mencari' ? 'fs-lokasi-sub' : 'fs-lokasi-galat'}>
              {PESAN_LOKASI[status]}
            </span>
          )}
        </div>
        {status !== 'tidak-didukung' && (
          <button type="button" className="ph-link" onClick={perbarui} disabled={status === 'mencari'}>
            <FiRefreshCw aria-hidden className={status === 'mencari' ? 'fs-putar' : undefined} />
            Perbarui
          </button>
        )}
      </section>

      <section className="tm-card">
        <label className="tm-label" htmlFor="fs-catatan">
          Catatan (opsional)
        </label>
        <input
          id="fs-catatan"
          className="tm-input tm-input--no-icon"
          value={catatan}
          maxLength={MAKS_CATATAN}
          placeholder="Mis. Cek outlet, briefing pagi"
          onChange={(e) => setCatatan(e.target.value)}
        />
        <div className="tm-help">
          Ikut tercetak di foto bersama waktu, lokasi, dan <strong>{barisNama}</strong>.
        </div>
      </section>

      {foto ? (
        <figure className="fs-pratinjau" aria-busy={memproses}>
          {hasil ? (
            <img src={hasil.url} alt="Pratinjau foto berstempel" />
          ) : (
            <Skeleton width="100%" height={360} borderRadius="var(--radius-xl)" />
          )}
        </figure>
      ) : (
        <button type="button" className="fs-kosong" onClick={ambilFoto}>
          <span className="fs-kosong-ikon" aria-hidden>
            <FiCamera />
          </span>
          <span className="fs-kosong-judul">Belum ada foto</span>
          <span className="fs-kosong-teks">Waktu, lokasi, dan nama otomatis ditempel di bawah foto.</span>
        </button>
      )}

      {foto ? (
        <>
          <div className="tm-actions">
            <button type="button" className="tm-btn tm-btn--primary" onClick={bagikan} disabled={!siap}>
              <FiShare2 aria-hidden /> Bagikan
            </button>
            <button type="button" className="tm-btn" onClick={unduh} disabled={!siap}>
              <FiDownload aria-hidden /> Unduh
            </button>
          </div>
          <button type="button" className="tm-btn" onClick={ambilFoto}>
            <FiCamera aria-hidden /> Foto ulang
          </button>
        </>
      ) : (
        <button type="button" className="tm-btn tm-btn--primary" onClick={ambilFoto}>
          <FiCamera aria-hidden /> Ambil Foto
        </button>
      )}

      {/* capture: langsung buka kamera belakang di HP (di desktop jadi pemilih file). */}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={onPilihFoto} />
    </div>
  );

  if (isMobile) {
    return (
      <div className="tm-page">
        <MobilePageBar title="Foto Stempel" backTo={BERANDA.pengawas} />
        {isi}
      </div>
    );
  }

  return (
    <div className="page-shell dk-page">
      <DesktopPageHeader
        title="Foto Stempel"
        description="Foto dengan waktu, lokasi, dan nama — untuk dibagikan ke WA"
      />
      <div className="fs-desktop">{isi}</div>
    </div>
  );
};

export default FotoStempelPage;
