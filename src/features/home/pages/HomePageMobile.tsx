import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import {
  FiBookOpen,
  FiCheckSquare,
  FiGift,
  FiMessageCircle,
  FiPlusCircle,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';

import { useAuth } from '../../../context/AuthContext';
import { HALAMAN_ADMIN, type Halaman, type IdAdmin } from '../../../layout/menu';
import { kunciMenu } from '../../../layout/saringMenu';
import { useMenuNonaktif } from '../../../hooks/useMenu';
import { sapaanWaktu } from '../../../utils/sapaanWaktu';
import AngkaNaik from '../../../components/beranda/AngkaNaik';
import CincinProgres from '../../../components/beranda/CincinProgres';
import BerandaSkeleton from '../../../components/beranda/BerandaSkeleton';
import {
  BatangHarian,
  BerandaAtas,
  BerandaShell,
  Chip,
  Kartu,
  KartuHero,
  KisiPetak,
  MenuCepat,
  Petak,
  Strip,
  type ItemMenu,
} from '../../../components/beranda/BerandaMobile';
import { useBerandaAdmin } from '../hooks/useBerandaAdmin';

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const TERSEMBUNYI = '••••••••';

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Home admin versi mobile: dashboard ringkas hari ini & bulan ini. Header app
 * dicabut di MainLayout; navigasi tetap lewat navbar bawah.
 *
 * Angkanya dari useBerandaAdmin — total voucher & untung memakai aturan yang
 * sama dengan Rekap Voucher, jadi cocok dengan laporan bulan berjalan.
 */
function HomePageMobile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const nonaktif = useMenuNonaktif();
  const [sembunyikan, setSembunyikan] = useState(false);

  const { hariIni, ringkasan, absen, jumlahLadies, jumlahMenunggu, loading, refetch } = useBerandaAdmin();

  if (loading) return <BerandaSkeleton />;

  // Menu yang dimatikan di Pengaturan tidak ditawarkan dari Home.
  const aktif = (id: IdAdmin) =>
    !!(HALAMAN_ADMIN[id] as Halaman).selaluAktif || !nonaktif.has(kunciMenu('admin', id));
  const buka = (id: IdAdmin) => () => navigate(HALAMAN_ADMIN[id].rute);
  const bukaKalauAktif = (id: IdAdmin) => (aktif(id) ? buka(id) : undefined);

  const sekarang = dayjs(hariIni);
  const labelBulan = sekarang.toDate().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const labelTanggal = sekarang.toDate().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const batang = ringkasan.harian.map((h) => ({
    label: HARI[dayjs(h.tanggal).day()],
    nilai: h.pcs,
    sorot: h.tanggal === hariIni,
  }));

  const belum = absen.belum.length;
  const persenAbsen = absen.total ? absen.sudah / absen.total : 0;
  const maksTop = Math.max(1, ...ringkasan.top.map((t) => t.pcs));

  const menu: ItemMenu[] = (
    [
      { id: 'transaksiLadies', label: 'Transaksi', ikon: <FiPlusCircle /> },
      { id: 'absenHarian', label: 'Absen', ikon: <FiCheckSquare /> },
      { id: 'rekapVoucher', label: 'Rekap', ikon: <FiTrendingUp /> },
      { id: 'bukuKuningLadies', label: 'Buku Kuning', ikon: <FiBookOpen /> },
    ] satisfies { id: IdAdmin; label: string; ikon: React.ReactNode }[]
  )
    .filter((m) => aktif(m.id))
    .map((m) => ({ label: m.label, ikon: m.ikon, onClick: buka(m.id) }));

  return (
    <BerandaShell onRefresh={refetch}>
      <BerandaAtas
        sapaan={sapaanWaktu(new Date().getHours())}
        nama={user?.nama || 'Admin'}
        kanan={<Chip>{labelTanggal}</Chip>}
      />

      <KartuHero
        label="Voucher bulan ini"
        ariaLabel={`Voucher ${labelBulan}`}
        sembunyi={{ aktif: sembunyikan, onToggle: () => setSembunyikan((v) => !v) }}
        sub={
          <>
            Untung <strong>{sembunyikan ? TERSEMBUNYI : rupiah(ringkasan.untungBulan)}</strong> · {labelBulan}
          </>
        }
        kaki={<BatangHarian data={batang} judul="7 hari terakhir" satuan="pcs" />}
      >
        <AngkaNaik nilai={ringkasan.pcsBulan} />
        <span className="bm-hero-satuan">pcs</span>
      </KartuHero>

      {jumlahMenunggu > 0 && aktif('userApproval') && (
        <Strip
          peringatan
          ikon={<FiUserCheck />}
          judul="Persetujuan user"
          sub={`${jumlahMenunggu} akun menunggu ditinjau`}
          onClick={buka('userApproval')}
        />
      )}

      <KisiPetak>
        <Petak
          lebar
          label="Absen hari ini"
          hiasan={
            <CincinProgres nilai={persenAbsen} ukuran={76} tebal={8}>
              {Math.round(persenAbsen * 100)}%
            </CincinProgres>
          }
          satuan={`dari ${absen.total} ladies`}
          sub={
            absen.total === 0
              ? 'Belum ada ladies aktif'
              : `${belum > 0 ? `${belum} belum diabsen` : 'Semua sudah diabsen'} · Kerja ${absen.rekap.KERJA} · Off ${absen.rekap.OFF} · Mens ${absen.rekap.MENS} · Sakit ${absen.rekap.SAKIT}`
          }
          onClick={bukaKalauAktif('absenHarian')}
        >
          <AngkaNaik nilai={absen.sudah} />
        </Petak>

        <Petak
          label="Hari ini"
          nada="aksen3"
          ikon={<FiGift />}
          satuan="pcs"
          sub={`Kemarin ${ringkasan.pcsKemarin.toLocaleString('id-ID')} pcs`}
        >
          <AngkaNaik nilai={ringkasan.pcsHariIni} />
        </Petak>

        <Petak
          label="Ladies aktif"
          nada="aksen2"
          ikon={<FiUsers />}
          satuan="orang"
          sub="Lihat daftar ladies"
          onClick={bukaKalauAktif('ladies')}
        >
          <AngkaNaik nilai={jumlahLadies} />
        </Petak>
      </KisiPetak>

      <Kartu
        judul="Voucher terbanyak"
        ariaLabel={`Ladies dengan voucher terbanyak ${labelBulan}`}
        aksi={aktif('performaLadies') ? { label: 'Performa', onClick: buka('performaLadies') } : undefined}
        chip={<Chip>{labelBulan}</Chip>}
      >
        {ringkasan.top.length === 0 ? (
          <div className="bm-kosong">Belum ada voucher tercatat bulan ini.</div>
        ) : (
          <ol className="bm-daftar">
            {ringkasan.top.map((t, i) => (
              <li key={t.ladiesId} className="bm-baris">
                <span className={`bm-lencana${i === 0 ? ' bm-lencana--juara' : ''}`} aria-hidden>
                  {i + 1}
                </span>
                <span className="bm-baris-utama">
                  <span className="bm-baris-judul">{t.nama}</span>
                  <span className="bm-garis" aria-hidden>
                    <motion.span
                      className="bm-garis-isi"
                      style={{ width: `${(t.pcs / maksTop) * 100}%` }}
                      variants={{
                        sembunyi: { scaleX: 0 },
                        tampil: { scaleX: 1, transition: { duration: 0.9, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] } },
                      }}
                    />
                  </span>
                </span>
                <span className="bm-baris-kanan">
                  {t.pcs.toLocaleString('id-ID')} <small>pcs</small>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Kartu>

      {menu.length > 0 && <MenuCepat items={menu} />}

      {aktif('smartChat') && (
        <Strip
          ikon={<FiMessageCircle />}
          judul="Tanya Chat SR"
          sub="Statistik & insight dalam satu pertanyaan"
          onClick={buka('smartChat')}
        />
      )}
    </BerandaShell>
  );
}

export default HomePageMobile;
