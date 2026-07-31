import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import dayjs from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import type { UserWithLadies } from '../../../types/user';
import {
  FiCalendar,
  FiCheckCircle,
  FiMoon,
  FiCoffee,
  FiHeart,
} from 'react-icons/fi';

import 'react-calendar/dist/Calendar.css';
import './RiwayatAbsensiPage.css';

type AbsensiStatus =
  | 'KERJA'
  | 'MENS'
  | 'OFF'
  | 'SAKIT';

type AbsensiData = {
  [tanggal: string]:
    AbsensiStatus;
};

const RiwayatAbsensiPage =
  () => {
    const user =
      useSelector(
        (
          state: RootState
        ) =>
          state.user
            .currentUser
      ) as UserWithLadies;

    const [
      currentDate,
      setCurrentDate,
    ] = useState(
      new Date()
    );

    const [
      absensi,
      setAbsensi,
    ] = useState<AbsensiData>(
      {}
    );

    const [
      loading,
      setLoading,
    ] = useState(true);

    const fetchAbsensi =
      async () => {
        if (
          !user?.ladies_id
        )
          return;

        setLoading(true);

        const start =
          dayjs(
            currentDate
          )
            .startOf(
              'month'
            )
            .format(
              'YYYY-MM-DD'
            );

        const end =
          dayjs(
            currentDate
          )
            .endOf(
              'month'
            )
            .format(
              'YYYY-MM-DD'
            );

        const {
          data,
          error,
        } = await supabase
          .from(
            'absensi'
          )
          .select(
            'tanggal, status'
          )
          .eq(
            'ladies_id',
            user.ladies_id
          )
          .gte(
            'tanggal',
            start
          )
          .lte(
            'tanggal',
            end
          );

        if (error) {
          console.error(
            'Error fetching absensi:',
            error.message
          );

          setLoading(
            false
          );

          return;
        }

        const mapped: AbsensiData =
          {};

        data?.forEach(
          (item) => {
            mapped[
              dayjs(
                item.tanggal
              ).format(
                'YYYY-MM-DD'
              )
            ] =
              item.status;
          }
        );

        setAbsensi(
          mapped
        );

        setLoading(false);
      };

    useEffect(() => {
      fetchAbsensi();
    }, [currentDate]);

    const getTileContent =
      ({
        date,
        view,
      }: any) => {
        if (
          view !==
          'month'
        )
          return null;

        const key =
          dayjs(
            date
          ).format(
            'YYYY-MM-DD'
          );

        const status =
          absensi[key];

        if (!status)
          return null;

        const statusColor =
          {
            KERJA:
              'var(--color-income)',
            MENS:
              'var(--color-expense)',
            OFF: 'var(--color-gray-500)',
            SAKIT:
              'var(--color-voucher)',
          }[
            status
          ];

        return (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius:
                '50%',
              background:
                statusColor,
              margin:
                '3px auto 0',
            }}
          />
        );
      };

    const getSummary =
      () => {
        const summary = {
          KERJA: 0,
          MENS: 0,
          OFF: 0,
          SAKIT: 0,
        };

        Object.values(
          absensi
        ).forEach(
          (status) => {
            summary[
              status
            ]++;
          }
        );

        return summary;
      };

    const summary =
      getSummary();

    return (
      <div
        className="page-shell d-flex flex-column gap-3"
        style={{
          paddingBottom: 24,
          maxWidth: 560,
        }}
      >
        {/* HERO */}
        <div
          style={{
            background:
              'linear-gradient(135deg, var(--color-green), var(--color-accent))',
            borderRadius: 24,
            padding:
              '22px 20px',
            color: '#fff',
            position:
              'relative',
            overflow:
              'hidden',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          <div
            style={{
              position:
                'absolute',
              width: 160,
              height: 160,
              borderRadius:
                '50%',
              background:
                'rgba(255,255,255,0.08)',
              top: -60,
              right: -60,
            }}
          />

          <div
            style={{
              position:
                'relative',
              zIndex: 2,
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background:
                    'rgba(255,255,255,0.15)',
                }}
              >
                <FiCalendar size={20} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.9,
                  }}
                >
                  Riwayat
                  Absensi
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {dayjs(
                    currentDate
                  ).format(
                    'MMMM YYYY'
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.92,
                marginTop: 8,
              }}
            >
              Pantau riwayat
              kerja dan
              aktivitas bulanan
              kamu ✨
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div
          style={{
            background:
              'var(--color-surface)',
            border:
              '1px solid var(--color-gray-200)',
            borderRadius: 24,
            padding: 14,
            boxShadow:
              '0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          <Calendar
            value={
              currentDate
            }
            onActiveStartDateChange={({
              activeStartDate,
            }) =>
              setCurrentDate(
                activeStartDate ||
                  new Date()
              )
            }
            tileContent={
              getTileContent
            }
          />
        </div>

        {/* SUMMARY */}
        <div className="d-flex flex-column gap-2">
          {/* KERJA */}
          <div
            style={{
              background:
                'var(--color-surface)',
              border:
                '1px solid var(--color-gray-200)',
              borderRadius: 18,
              padding:
                '14px 16px',
              boxShadow:
                '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background:
                      'var(--color-income-soft)',
                    color:
                      'var(--color-income)',
                  }}
                >
                  <FiCheckCircle size={18} />
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-dark)',
                  }}
                >
                  Hari Kerja
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    'var(--color-income)',
                }}
              >
                {
                  summary.KERJA
                }
              </div>
            </div>
          </div>

          {/* MENS */}
          <div
            style={{
              background:
                'var(--color-surface)',
              border:
                '1px solid var(--color-gray-200)',
              borderRadius: 18,
              padding:
                '14px 16px',
              boxShadow:
                '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background:
                      'var(--color-expense-soft)',
                    color:
                      'var(--color-expense)',
                  }}
                >
                  <FiHeart size={18} />
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-dark)',
                  }}
                >
                  Mens
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    'var(--color-expense)',
                }}
              >
                {
                  summary.MENS
                }
              </div>
            </div>
          </div>

          {/* OFF */}
          <div
            style={{
              background:
                'var(--color-surface)',
              border:
                '1px solid var(--color-gray-200)',
              borderRadius: 18,
              padding:
                '14px 16px',
              boxShadow:
                '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background:
                      'var(--color-gray-200)',
                    color:
                      'var(--color-gray-700)',
                  }}
                >
                  <FiMoon size={18} />
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-dark)',
                  }}
                >
                  Libur
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    'var(--color-gray-700)',
                }}
              >
                {
                  summary.OFF
                }
              </div>
            </div>
          </div>

          {/* SAKIT */}
          <div
            style={{
              background:
                'var(--color-surface)',
              border:
                '1px solid var(--color-gray-200)',
              borderRadius: 18,
              padding:
                '14px 16px',
              boxShadow:
                '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background:
                      'var(--color-voucher-soft)',
                    color:
                      'var(--color-voucher)',
                  }}
                >
                  <FiCoffee size={18} />
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-dark)',
                  }}
                >
                  Sakit
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    'var(--color-voucher)',
                }}
              >
                {
                  summary.SAKIT
                }
              </div>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              textAlign:
                'center',
              fontSize: 12,
              color: 'var(--color-gray-500)',
              marginTop: 4,
            }}
          >
            Memuat data...
          </div>
        )}
      </div>
    );
  };

export default RiwayatAbsensiPage;