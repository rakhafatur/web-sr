import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import dayjs from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
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

type UserWithLadies = {
  id: string;
  username: string;
  nama: string | null;
  ladies_id: string;
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
              '#22c55e',
            MENS:
              '#ef4444',
            OFF: '#9ca3af',
            SAKIT:
              '#f59e0b',
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
        className="d-flex flex-column gap-3"
        style={{
          paddingBottom: 24,
        }}
      >
        {/* HERO */}
        <div
          style={{
            background:
              'linear-gradient(135deg,#22c55e,#16a34a)',
            borderRadius: 24,
            padding:
              '22px 20px',
            color: '#fff',
            position:
              'relative',
            overflow:
              'hidden',
            boxShadow:
              '0 10px 30px rgba(34,197,94,0.18)',
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
              '#fff',
            border:
              '1px solid #f1f5f9',
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
                '#fff',
              border:
                '1px solid #f1f5f9',
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
                      '#dcfce7',
                    color:
                      '#15803d',
                  }}
                >
                  <FiCheckCircle size={18} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        '#999',
                      fontWeight: 600,
                    }}
                  >
                    Hari Kerja
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    KERJA
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    '#16a34a',
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
                '#fff',
              border:
                '1px solid #f1f5f9',
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
                      '#fee2e2',
                    color:
                      '#dc2626',
                  }}
                >
                  <FiHeart size={18} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        '#999',
                      fontWeight: 600,
                    }}
                  >
                    Mens
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    MENS
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    '#dc2626',
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
                '#fff',
              border:
                '1px solid #f1f5f9',
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
                      '#f3f4f6',
                    color:
                      '#6b7280',
                  }}
                >
                  <FiMoon size={18} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        '#999',
                      fontWeight: 600,
                    }}
                  >
                    Libur
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    OFF
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    '#6b7280',
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
                '#fff',
              border:
                '1px solid #f1f5f9',
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
                      '#fef3c7',
                    color:
                      '#d97706',
                  }}
                >
                  <FiCoffee size={18} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        '#999',
                      fontWeight: 600,
                    }}
                  >
                    Sakit
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    SAKIT
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    '#d97706',
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
              color: '#777',
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