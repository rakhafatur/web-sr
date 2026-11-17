import { useEffect, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import Aurora from '../momen/Aurora';
import PullToRefresh from '../PullToRefresh';
import { anakMuncul, wadahMuncul } from '../momen/gerak';
import { useLayarTerbuka } from '../../hooks/useMomenMasuk';
import { storeMasuk } from '../../lib/momenMasuk';
import './beranda.css';

/**
 * Kerangka Home mobile untuk ketiga peran (admin, ladies, pengawas):
 * latar aurora, sapaan besar, hero bergradien, petak kaca, daftar, dan menu
 * cepat. Halaman hanya menyusun potongan-potongan ini dan mengisi datanya.
 *
 * Tiap blok muncul berurutan saat layar terbuka (lihat lib/momenMasuk).
 * Gayanya di beranda.css (kelas bm-).
 */

// ---------- Kerangka ----------

type ShellProps = {
  onRefresh: () => Promise<unknown>;
  children: ReactNode;
};

export const BerandaShell = ({ onRefresh, children }: ShellProps) => {
  const terbuka = useLayarTerbuka();

  // Shell ini baru dirender setelah data halaman termuat (sebelumnya
  // BerandaSkeleton), jadi saat terpasang isi sudah siap — tirai login yang
  // sedang menunggu boleh terangkat.
  useEffect(() => {
    storeMasuk.laporIsiSiap();
  }, []);

  return (
    <PullToRefresh
      onRefresh={async () => {
        await onRefresh();
      }}
    >
      <div className="bm">
        <Aurora varian="atas" />
        <motion.div
          className="bm-isi"
          variants={wadahMuncul}
          initial="sembunyi"
          animate={terbuka ? 'tampil' : 'sembunyi'}
        >
          {children}
        </motion.div>
      </div>
    </PullToRefresh>
  );
};

/** Satu blok yang ikut urutan muncul. `as` memilih elemennya. */
export const Blok = ({
  as = 'div',
  className,
  label,
  children,
}: {
  as?: 'div' | 'section';
  className?: string;
  /** aria-label untuk blok <section>. */
  label?: string;
  children: ReactNode;
}) => {
  const Elemen = as === 'section' ? motion.section : motion.div;
  return (
    <Elemen className={className} variants={anakMuncul} aria-label={label}>
      {children}
    </Elemen>
  );
};

// ---------- Sapaan ----------

type AtasProps = {
  sapaan: string;
  nama: string;
  /** Ketuk avatar (mis. buka profil). Tanpa ini avatar hanya hiasan. */
  onAvatar?: () => void;
  labelAvatar?: string;
  /** Isi pojok kanan atas: lonceng, tanggal, dsb. */
  kanan?: ReactNode;
};

export const BerandaAtas = ({ sapaan, nama, onAvatar, labelAvatar, kanan }: AtasProps) => {
  const inisial = (nama || '?').charAt(0).toUpperCase();

  return (
    <Blok className="bm-atas">
      <div className="bm-topbar">
        {onAvatar ? (
          <button type="button" className="bm-avatar" onClick={onAvatar} aria-label={labelAvatar}>
            <span className="bm-avatar-isi">{inisial}</span>
          </button>
        ) : (
          <span className="bm-avatar" aria-hidden>
            <span className="bm-avatar-isi">{inisial}</span>
          </span>
        )}
        {kanan}
      </div>
      <div className="bm-sapa">{sapaan},</div>
      <h1 className="bm-nama">{nama}</h1>
    </Blok>
  );
};

/** Pil kaca kecil (tanggal, bulan). */
export const Chip = ({ children }: { children: ReactNode }) => <span className="bm-chip">{children}</span>;

// ---------- Hero ----------

type HeroProps = {
  label: string;
  /** Tombol mata: sembunyikan/tampilkan nominal. */
  sembunyi?: { aktif: boolean; onToggle: () => void };
  /** Angka utama (biasanya <AngkaNaik/> + satuan). */
  children: ReactNode;
  sub?: ReactNode;
  /** Bagian bawah hero: baris ringkas atau grafik. */
  kaki?: ReactNode;
  ariaLabel: string;
};

export const KartuHero = ({ label, sembunyi, children, sub, kaki, ariaLabel }: HeroProps) => (
  <Blok as="section" className="bm-hero" label={ariaLabel}>
    <span className="bm-hero-cahaya" aria-hidden />
    <span className="bm-hero-kilau" aria-hidden />

    <div className="bm-hero-atas">
      <span className="bm-hero-label">{label}</span>
      {sembunyi && (
        <button
          type="button"
          className="bm-hero-mata"
          onClick={sembunyi.onToggle}
          aria-label={sembunyi.aktif ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
          aria-pressed={sembunyi.aktif}
        >
          {sembunyi.aktif ? <FiEyeOff /> : <FiEye />}
        </button>
      )}
    </div>

    <div className="bm-hero-angka">{children}</div>
    {sub && <div className="bm-hero-sub">{sub}</div>}
    {kaki && <div className="bm-hero-kaki">{kaki}</div>}
  </Blok>
);

/** Baris "label … nilai" di kaki hero. */
export const BarisHero = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="bm-hero-baris">
    <span>{label}</span>
    <span className="bm-hero-baris-nilai">{children}</span>
  </div>
);

// ---------- Grafik batang mini (di dalam hero) ----------

export type Batang = { label: string; nilai: number; sorot?: boolean };

const kolomBatang: Variants = {
  sembunyi: {},
  tampil: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
};

const isiBatang: Variants = {
  sembunyi: { scaleY: 0 },
  tampil: { scaleY: 1, transition: { type: 'spring', stiffness: 170, damping: 18 } },
};

export const BatangHarian = ({ data, judul, satuan }: { data: Batang[]; judul: string; satuan: string }) => {
  const maks = Math.max(1, ...data.map((d) => d.nilai));
  const ringkas = data.map((d) => `${d.label} ${d.nilai}`).join(', ');

  return (
    <div className="bm-grafik">
      <div className="bm-grafik-judul">{judul}</div>
      <motion.div
        className="bm-batang"
        variants={kolomBatang}
        role="img"
        aria-label={`${judul} (${satuan}): ${ringkas}`}
      >
        {data.map((d) => (
          <div key={d.label} className={`bm-batang-kolom${d.sorot ? ' is-sorot' : ''}`} aria-hidden>
            <span className="bm-batang-nilai">{d.nilai}</span>
            <span className="bm-batang-rel">
              <motion.span
                className="bm-batang-isi"
                variants={isiBatang}
                // Batang bernilai 0 tetap tampak sebagai garis tipis.
                style={{ height: `${Math.max(4, (d.nilai / maks) * 100)}%` }}
              />
            </span>
            <span className="bm-batang-label">{d.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ---------- Petak statistik ----------

type PetakProps = {
  label: string;
  /** Ikon di pojok — diabaikan kalau `hiasan` diisi. */
  ikon?: ReactNode;
  /** Pengganti ikon, mis. <CincinProgres/>. */
  hiasan?: ReactNode;
  /** Angka utama. */
  children: ReactNode;
  satuan?: ReactNode;
  sub?: ReactNode;
  /** Warna aksen ikon. */
  nada?: 'biru' | 'ungu' | 'merah' | 'hijau';
  onClick?: () => void;
  /** Petak selebar dua kolom. */
  lebar?: boolean;
};

export const Petak = ({ label, ikon, hiasan, children, satuan, sub, nada = 'biru', onClick, lebar }: PetakProps) => {
  const kelas = `bm-petak bm-petak--${nada}${lebar ? ' bm-petak--lebar' : ''}${hiasan ? ' bm-petak--hiasan' : ''}`;
  const isi = (
    <>
      <span className="bm-petak-utama">
        <span className="bm-petak-label">{label}</span>
        <span className="bm-petak-angka">
          {children}
          {satuan && <span className="bm-petak-satuan">{satuan}</span>}
        </span>
        {sub && <span className="bm-petak-sub">{sub}</span>}
      </span>
      {hiasan ?? (ikon && <span className="bm-petak-ikon" aria-hidden>{ikon}</span>)}
    </>
  );

  return onClick ? (
    // whileTap, bukan :active dari global.css: gaya transform inline dari
    // animasi masuk mengalahkan aturan stylesheet.
    <motion.button
      type="button"
      className={`${kelas} is-tombol`}
      variants={anakMuncul}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {isi}
    </motion.button>
  ) : (
    <motion.div className={kelas} variants={anakMuncul}>
      {isi}
    </motion.div>
  );
};

/** Kisi dua kolom untuk <Petak/>. Petak di dalamnya muncul berurutan. */
export const KisiPetak = ({ children }: { children: ReactNode }) => (
  <motion.div className="bm-kisi" variants={wadahMuncul}>
    {children}
  </motion.div>
);

// ---------- Kartu bagian ----------

type KartuProps = {
  judul: string;
  /** Tautan kecil di kanan judul. */
  aksi?: { label: string; onClick: () => void };
  /** Pil di kanan judul (kalau tidak ada `aksi`). */
  chip?: ReactNode;
  ariaLabel?: string;
  children: ReactNode;
};

export const Kartu = ({ judul, aksi, chip, ariaLabel, children }: KartuProps) => (
  <Blok as="section" className="bm-kartu" label={ariaLabel ?? judul}>
    <div className="bm-kartu-kepala">
      <h2 className="bm-kartu-judul">{judul}</h2>
      {aksi ? (
        <button type="button" className="bm-tautan" onClick={aksi.onClick}>
          {aksi.label} <FiArrowRight aria-hidden />
        </button>
      ) : (
        chip
      )}
    </div>
    {children}
  </Blok>
);

// ---------- Menu cepat ----------

export type ItemMenu = { label: string; ikon: ReactNode; onClick: () => void };

export const MenuCepat = ({ items }: { items: ItemMenu[] }) => (
  <Blok as="section" className="bm-menu" label="Menu cepat">
    {items.map((item, i) => (
      <button key={item.label} type="button" className="bm-menu-item" onClick={item.onClick}>
        <span className={`bm-menu-ikon bm-menu-ikon--${i % 4}`} aria-hidden>
          {item.ikon}
        </span>
        <span className="bm-menu-label">{item.label}</span>
      </button>
    ))}
  </Blok>
);

// ---------- Strip ajakan ----------

type StripProps = {
  ikon: ReactNode;
  judul: string;
  sub: string;
  onClick: () => void;
  /** Nada peringatan (kuning) untuk hal yang menunggu tindakan. */
  peringatan?: boolean;
};

export const Strip = ({ ikon, judul, sub, onClick, peringatan }: StripProps) => (
  <motion.button
    type="button"
    className={`bm-strip${peringatan ? ' bm-strip--peringatan' : ''}`}
    variants={anakMuncul}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
  >
    <span className="bm-strip-ikon" aria-hidden>{ikon}</span>
    <span className="bm-strip-teks">
      <span className="bm-strip-judul">{judul}</span>
      <span className="bm-strip-sub">{sub}</span>
    </span>
    <span className="bm-strip-panah" aria-hidden>
      <FiArrowRight />
    </span>
  </motion.button>
);
