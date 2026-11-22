import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiUser, FiLock, FiLoader, FiAlertCircle } from 'react-icons/fi';
import {
  CATATAN_KOSONG,
  bacaCatatan,
  catatGagal,
  formatSisaKunci,
  simpanCatatan,
  statusLogin,
  type CatatanLogin,
} from '../utils/batasLogin';
import Button from '../../../components/Button';
import Aurora from '../../../components/momen/Aurora';
import TandaSR from '../../../components/momen/TandaSR';
import { AUTH_SUBMIT_STYLE } from '../authStyles';
import { BERANDA, peranDari } from '../../../layout/peran';
import { storeMasuk } from '../../../lib/momenMasuk';
import { useLayarTerbuka } from '../../../hooks/useMomenMasuk';
import { anakMuncul, wadahMuncul } from '../../../components/momen/gerak';
import '../../../styles/auth.css';

type LoginFormData = {
  username: string;
  password: string;
};

function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const { login } = useAuth(); // tidak ambil user dari context, ambil dari localStorage
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  // Mobile: layar penuh (pola referensi). Desktop: kartu + ilustrasi.
  const isMobile = useMediaQuery({ maxWidth: 768 });
  // Animasi masuk ditahan sampai splash selesai (lihat lib/momenMasuk).
  const terbuka = useLayarTerbuka();
  const tombolRef = useRef<HTMLDivElement>(null);

  // Batas 3x gagal → kunci 5 menit (lihat utils/batasLogin).
  const [catatan, setCatatan] = useState<CatatanLogin>(bacaCatatan);
  const [sekarang, setSekarang] = useState(() => Date.now());
  const status = statusLogin(catatan, sekarang);

  // Detak tiap detik hanya selama terkunci, untuk hitung mundur.
  useEffect(() => {
    if (!status.terkunci) return;
    const t = window.setInterval(() => setSekarang(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [status.terkunci]);

  const perbaruiCatatan = (baru: CatatanLogin) => {
    simpanCatatan(baru);
    setCatatan(baru);
    setSekarang(Date.now());
  };

  const onSubmit = async (data: LoginFormData) => {
    // Dibaca ulang dari storage: tab lain mungkin sudah menambah hitungan.
    const terbaru = bacaCatatan();
    if (statusLogin(terbaru, Date.now()).terkunci) {
      perbaruiCatatan(terbaru);
      return;
    }

    const result = await login(data.username, data.password);

    // Password benar (termasuk akun belum aktif) → hitungan gagal dihapus.
    if (result === 'success' || result === 'inactive') {
      perbaruiCatatan(CATATAN_KOSONG);
    }

    if (result === 'success') {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      const tujuan = BERANDA[peranDari(localUser)];

      if (!isMobile) {
        navigate(tujuan);
        return;
      }

      // Mobile: tirai melebar dari tombol Masuk, pindah halaman di baliknya,
      // lalu terangkat memperlihatkan Home.
      const kotak = tombolRef.current?.getBoundingClientRect();
      await storeMasuk.tutupTirai({
        asal: kotak ? { x: kotak.left + kotak.width / 2, y: kotak.top + kotak.height / 2 } : null,
        nama: localUser.nama ?? null,
      });
      navigate(tujuan);
      storeMasuk.bukaTirai();
    } else if (result === 'inactive') {
      toast.warning('Akunmu belum aktif. Menunggu persetujuan admin.');
    } else if (result === 'invalid') {
      // Pesannya tampil di halaman (pemberitahuan), bukan toast. Sengaja
      // tidak membedakan "username tidak ada" dan "password salah" — pesan
      // yang berbeda memberi tahu orang luar username mana yang valid.
      perbaruiCatatan(catatGagal(terbaru, Date.now()));
    } else {
      toast.error('Terjadi kesalahan saat login.');
    }
  };

  const pemberitahuan = status.terkunci ? (
    <div className="auth-alert" role="alert">
      <FiLock aria-hidden />
      <span>
        Terlalu banyak percobaan gagal. Coba lagi dalam{' '}
        {/* Angka berdetak tiap detik — disembunyikan dari pembaca layar
            supaya tidak dibacakan terus-menerus. */}
        <span className="auth-alert-waktu" aria-hidden>{formatSisaKunci(status.sisaMs)}</span>
        <span className="visually-hidden">beberapa menit</span>.
      </span>
    </div>
  ) : status.pernahGagal ? (
    <div className="auth-alert" role="alert">
      <FiAlertCircle aria-hidden />
      <span>
        Username atau password salah. Sisa{' '}
        <span className="auth-alert-waktu">{status.sisaPercobaan}</span> kali percobaan
        {status.sisaPercobaan === 1 ? ' sebelum login dikunci 5 menit.' : '.'}
      </span>
    </div>
  ) : null;

  const terkunci = status.terkunci;

  if (isMobile) {
    return (
      <div className="auth-m">
        <Aurora varian="penuh" />

        <motion.div
          className="auth-m-card"
          variants={wadahMuncul}
          initial="sembunyi"
          animate={terbuka ? 'tampil' : 'sembunyi'}
        >
          <motion.div className="auth-m-tanda" variants={anakMuncul}>
            <TandaSR ukuran={92} />
          </motion.div>
          <motion.h1 className="auth-m-title" variants={anakMuncul}>
            Selamat datang
          </motion.h1>
          <motion.p className="auth-m-subtitle" variants={anakMuncul}>
            Masuk ke akun SR Agency kamu
          </motion.p>

          <motion.form
            className="auth-m-form"
            variants={anakMuncul}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Label hanya untuk pembaca layar — tampilannya cukup placeholder
                seperti referensi, tapi kolom tanpa label tidak terbaca. */}
            <div className="auth-m-field">
              <label htmlFor="login-username" className="visually-hidden">Username</label>
              <FiUser className="auth-m-field-icon" aria-hidden />
              {/* Tanpa autoFocus: halaman ini dirender di bawah splash, dan
                  fokus programatik di HP bisa memunculkan keyboard di atasnya. */}
              <input
                id="login-username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="none"
                className={`auth-m-input ${errors.username ? 'is-invalid' : ''}`}
                {...register('username', { required: true })}
              />
              {errors.username && <div className="auth-m-field-error">Username wajib diisi</div>}
            </div>

            <div className="auth-m-field">
              <label htmlFor="login-password" className="visually-hidden">Password</label>
              <FiLock className="auth-m-field-icon" aria-hidden />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                className={`auth-m-input auth-m-input--trailing ${errors.password ? 'is-invalid' : ''}`}
                {...register('password', { required: true })}
              />
              <button
                type="button"
                className="auth-m-field-trailing"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {errors.password && <div className="auth-m-field-error">Password wajib diisi</div>}
            </div>

            {pemberitahuan}

            <div className="auth-m-submit-gap" ref={tombolRef}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting || terkunci}
                style={AUTH_SUBMIT_STYLE}
                icon={isSubmitting ? <FiLoader className="auth-m-putar" aria-hidden /> : undefined}
              >
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </Button>
            </div>
          </motion.form>

          <motion.span className="auth-m-footer" variants={anakMuncul}>
            Belum punya akun?{' '}
            <Link to="/signup" className="auth-link">Daftar</Link>
          </motion.span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Ilustrasi kiri (desktop only) */}
        <div className="auth-illustration d-none d-md-flex">
          <img src="/assets/bg-login.jpg" alt="SR Login Illustration" className="img-fluid" style={{ maxWidth: '90%' }} loading="lazy" />
        </div>

        {/* Form kanan */}
        <div className="auth-form-wrapper">
          <div className="auth-card">
            <div className="text-center mb-4">
              <h4 className="auth-title mb-1">
                Welcome to <span className="auth-brand">SR Agency</span>
              </h4>
              <p className="auth-subtitle mb-0">Silakan login untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-3">
                <label className="auth-field-label">Username</label>
                <div className="auth-input-group">
                  <FiUser className="auth-input-icon" />
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    {...register('username', { required: true })}
                    autoFocus
                  />
                </div>
                {errors.username && <div className="invalid-feedback d-block">Username wajib diisi</div>}
              </div>

              <div className="mb-4">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-group input-group">
                  <FiLock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">Password wajib diisi</div>}
              </div>

              {pemberitahuan && <div className="mb-3">{pemberitahuan}</div>}

              <Button type="submit" variant="primary" fullWidth disabled={isSubmitting || terkunci}>
                Masuk
              </Button>
            </form>

            <div className="text-center mt-4">
              <span className="auth-footer-text">
                Belum punya akun?{' '}
                <Link to="/signup" className="auth-link">Daftar</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
