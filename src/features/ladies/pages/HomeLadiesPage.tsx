import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './HomeLadiesPage.css';

import {
  FiCalendar,
  FiGift,
  FiTrendingDown,
  FiTarget,
  FiZap,
  FiHeart,
} from 'react-icons/fi';

import {
  motion,
} from 'framer-motion';

import bgImage from '../../../assets/bg-home.png';
import logo from '../../../assets/logosr-green.png';

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
  nama_ladies?: string;
};

const HomeLadiesPage = () => {
  const user =
    useSelector(
      (
        state: RootState
      ) =>
        state.user
          .currentUser
    ) as UserWithLadies;

  const [
    hariMasuk,
    setHariMasuk,
  ] = useState(0);

  const [
    voucherPcs,
    setVoucherPcs,
  ] = useState(0);

  const [
    pengeluaran,
    setPengeluaran,
  ] = useState(0);

  const [
    voucherNominal,
    setVoucherNominal,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const bulanIni =
    dayjs().format('MM');

  const tahunIni =
    dayjs().format(
      'YYYY'
    );

  useEffect(() => {
    if (
      !user?.ladies_id
    )
      return;

    fetchData(
      user.ladies_id
    );
  }, [user]);

  const fetchData =
    async (
      ladiesId: string
    ) => {
      const tanggalAwal = `${tahunIni}-${bulanIni}-01`;

      const tanggalAkhir =
        dayjs()
          .endOf(
            'month'
          )
          .format(
            'YYYY-MM-DD'
          );

      const {
        data: absensi,
      } = await supabase
        .from(
          'absensi'
        )
        .select('id')
        .eq(
          'ladies_id',
          ladiesId
        )
        .ilike(
          'status',
          'kerja'
        )
        .gte(
          'tanggal',
          tanggalAwal
        )
        .lte(
          'tanggal',
          tanggalAkhir
        );

      const {
        data: vouchers,
      } = await supabase
        .from(
          'vouchers'
        )
        .select(
          'jumlah_voucher'
        )
        .eq(
          'ladies_id',
          ladiesId
        )
        .gte(
          'tanggal',
          tanggalAwal
        )
        .lte(
          'tanggal',
          tanggalAkhir
        );

      const {
        data: kasbon,
      } = await supabase
        .from('kasbon')
        .select('jumlah')
        .eq(
          'ladies_id',
          ladiesId
        )
        .gte(
          'tanggal',
          tanggalAwal
        )
        .lte(
          'tanggal',
          tanggalAkhir
        );

      const totalVoucherPcs =
        vouchers?.reduce(
          (
            sum,
            v
          ) =>
            sum +
            (v.jumlah_voucher ||
              0),
          0
        ) || 0;

      const totalVoucherNominal =
        totalVoucherPcs *
        150000;

      const totalKasbon =
        kasbon?.reduce(
          (
            sum,
            k
          ) =>
            sum +
            k.jumlah,
          0
        ) || 0;

      setHariMasuk(
        absensi?.length ||
          0
      );

      setVoucherPcs(
        totalVoucherPcs
      );

      setVoucherNominal(
        totalVoucherNominal
      );

      setPengeluaran(
        totalKasbon
      );

      setLoading(false);
    };

  const persenHadir =
    Math.min(
      100,
      Math.round(
        (hariMasuk /
          18) *
          100
      )
    );

  const biayaTetap =
    500000 +
    185000 +
    250000;

  const batasWajar =
    Math.max(
      0,
      voucherNominal -
        biayaTetap
    );

  const isOver =
    batasWajar > 0 &&
    pengeluaran >
      batasWajar;

  const getInsight =
    () => {
      if (
        hariMasuk >= 18
      ) {
        return '🔥 Target kehadiran bulan ini sudah tercapai!';
      }

      if (
        voucherPcs >= 20
      ) {
        return '💸 Voucher bulan ini sudah sangat bagus, pertahankan ya!';
      }

      if (
        isOver
      ) {
        return '⚠️ Pengeluaran mulai melewati batas aman.';
      }

      if (
        hariMasuk >= 10
      ) {
        return '✨ Progress kerja bulan ini sudah bagus!';
      }

      return '💚 Tetap semangat dan jaga performa ya!';
    };

  if (loading) {
    return (
      <div className="home-wrapper loading-state">
        <div className="loading-content">
          <img
            src={logo}
            alt="Loading..."
            className="loading-logo"
          />

          <p>
            Memuat
            data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <img
        src={bgImage}
        alt="bg"
        className="home-background-image mobile-only"
      />

      <div className="content-container d-flex flex-column gap-3">
        {/* HERO */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="position-relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg,#22c55e,#16a34a)',
            borderRadius: 28,
            padding:
              '24px 22px',
            color: '#fff',
            boxShadow:
              '0 12px 30px rgba(34,197,94,0.18)',
          }}
        >
          {/* BG */}
          <div
            style={{
              position:
                'absolute',
              width: 180,
              height: 180,
              borderRadius:
                '50%',
              background:
                'rgba(255,255,255,0.08)',
              top: -70,
              right: -70,
            }}
          />

          <div
            style={{
              position:
                'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 13,
                opacity: 0.9,
                marginBottom: 6,
              }}
            >
              {
                dayjs().format(
                  'dddd, DD MMMM YYYY'
                )
              }
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              Halo{' '}
              {user?.nama_ladies}{' '}
              ✨
            </div>

            <div
              style={{
                fontSize: 14,
                opacity: 0.92,
                marginTop: 10,
                lineHeight: 1.6,
              }}
            >
              Semangat kerja
              hari ini ya 💚
            </div>
          </div>
        </motion.div>

        {/* PROGRESS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          style={{
            background:
              '#fff',
            border:
              '1px solid #f1f5f9',
            borderRadius: 24,
            padding: 18,
            boxShadow:
              '0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <div
                style={{
                  fontSize: 12,
                  color:
                    '#999',
                  fontWeight: 600,
                }}
              >
                Progress
                Bulan Ini
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color:
                    '#111827',
                }}
              >
                {dayjs().format(
                  'MMMM YYYY'
                )}
              </div>
            </div>

            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                background:
                  '#dcfce7',
                color:
                  '#16a34a',
              }}
            >
              <FiTarget size={20} />
            </div>
          </div>

          {/* HADIR */}
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Kehadiran
              </span>

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    '#16a34a',
                }}
              >
                {hariMasuk}/18
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: 10,
                borderRadius: 999,
                background:
                  '#f3f4f6',
                overflow:
                  'hidden',
              }}
            >
              <div
                style={{
                  width: `${persenHadir}%`,
                  height:
                    '100%',
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg,#22c55e,#16a34a)',
                }}
              />
            </div>
          </div>

          {/* STATS */}
          <div className="d-flex gap-2">
            <div
              style={{
                flex: 1,
                background:
                  '#f9fafb',
                borderRadius: 18,
                padding:
                  '14px 12px',
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{
                  color:
                    '#d97706',
                }}
              >
                <FiGift size={15} />

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Voucher
                </span>
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color:
                    '#111827',
                }}
              >
                {voucherPcs}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color:
                    '#999',
                }}
              >
                pcs
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background:
                  '#f9fafb',
                borderRadius: 18,
                padding:
                  '14px 12px',
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2"
                style={{
                  color:
                    '#dc2626',
                }}
              >
                <FiTrendingDown size={15} />

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Kasbon
                </span>
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color:
                    '#111827',
                }}
              >
                Rp
                {(
                  pengeluaran /
                  1000
                ).toFixed(0)}
                k
              </div>

              <div
                style={{
                  fontSize: 11,
                  color:
                    '#999',
                }}
              >
                bulan ini
              </div>
            </div>
          </div>
        </motion.div>

        {/* INSIGHT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          style={{
            background:
              isOver
                ? '#fef2f2'
                : '#f0fdf4',
            border: `1px solid ${
              isOver
                ? '#fecaca'
                : '#bbf7d0'
            }`,
            borderRadius: 22,
            padding:
              '18px 18px',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                background:
                  isOver
                    ? '#fee2e2'
                    : '#dcfce7',
                color:
                  isOver
                    ? '#dc2626'
                    : '#16a34a',
                flexShrink: 0,
              }}
            >
              <FiZap size={18} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    '#666',
                  marginBottom: 4,
                }}
              >
                Insight
                Bulan Ini
              </div>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontWeight: 600,
                  color:
                    '#111827',
                }}
              >
                {getInsight()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ESTIMASI */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          style={{
            background:
              '#fff',
            border:
              '1px solid #f1f5f9',
            borderRadius: 22,
            padding:
              '18px',
            boxShadow:
              '0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-2">
            <FiHeart
              size={18}
              color="#16a34a"
            />

            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Estimasi
              Pendapatan
            </div>
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color:
                '#16a34a',
              lineHeight: 1.2,
            }}
          >
            Rp
            {voucherNominal.toLocaleString(
              'id-ID'
            )}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#888',
              marginTop: 6,
            }}
          >
            Berdasarkan
            voucher bulan
            ini ✨
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeLadiesPage;