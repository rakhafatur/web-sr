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

type AbsensiStatus = 'KERJA' | 'MENS' | 'OFF' | 'SAKIT';

type AbsensiData = {
  [tanggal: string]: AbsensiStatus;
};

const STATUS_COLOR: Record<AbsensiStatus, string> = {
  KERJA: 'var(--color-income)',
  MENS: 'var(--color-expense)',
  OFF: 'var(--color-gray-500)',
  SAKIT: 'var(--color-voucher)',
};

const SUMMARY_ITEMS: {
  key: AbsensiStatus;
  label: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
}[] = [
  {
    key: 'KERJA',
    label: 'Hari Kerja',
    icon: <FiCheckCircle size={18} />,
    bg: 'var(--color-income-soft)',
    color: 'var(--color-income)',
  },
  {
    key: 'MENS',
    label: 'Mens',
    icon: <FiHeart size={18} />,
    bg: 'var(--color-expense-soft)',
    color: 'var(--color-expense)',
  },
  {
    key: 'OFF',
    label: 'Libur',
    icon: <FiMoon size={18} />,
    bg: 'var(--color-gray-200)',
    color: 'var(--color-gray-700)',
  },
  {
    key: 'SAKIT',
    label: 'Sakit',
    icon: <FiCoffee size={18} />,
    bg: 'var(--color-voucher-soft)',
    color: 'var(--color-voucher)',
  },
];

const RiwayatAbsensiPage = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [absensi, setAbsensi] = useState<AbsensiData>({});
  const [loading, setLoading] = useState(true);

  const fetchAbsensi = async () => {
    if (!user?.ladies_id) return;

    setLoading(true);

    const start = dayjs(currentDate).startOf('month').format('YYYY-MM-DD');
    const end = dayjs(currentDate).endOf('month').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('absensi')
      .select('tanggal, status')
      .eq('ladies_id', user.ladies_id)
      .gte('tanggal', start)
      .lte('tanggal', end);

    if (error) {
      console.error('Error fetching absensi:', error.message);
      setLoading(false);
      return;
    }

    const mapped: AbsensiData = {};

    data?.forEach((item) => {
      mapped[dayjs(item.tanggal).format('YYYY-MM-DD')] = item.status;
    });

    setAbsensi(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchAbsensi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    const key = dayjs(date).format('YYYY-MM-DD');
    const status = absensi[key];

    if (!status) return null;

    return (
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: STATUS_COLOR[status],
          margin: '3px auto 0',
        }}
      />
    );
  };

  const summary = SUMMARY_ITEMS.reduce(
    (acc, item) => ({ ...acc, [item.key]: 0 }),
    {} as Record<AbsensiStatus, number>
  );

  Object.values(absensi).forEach((status) => {
    summary[status]++;
  });

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
          background: 'linear-gradient(135deg, var(--color-green), var(--color-accent))',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-brand)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            top: -60,
            right: -60,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.15)',
              }}
            >
              <FiCalendar size={20} />
            </div>

            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
                Riwayat Absensi
              </div>

              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, lineHeight: 1.2 }}>
                {dayjs(currentDate).format('MMMM YYYY')}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.92, marginTop: 8 }}>
            Pantau riwayat kerja dan aktivitas bulanan kamu ✨
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Calendar
          value={currentDate}
          onActiveStartDateChange={({ activeStartDate }) =>
            setCurrentDate(activeStartDate || new Date())
          }
          tileContent={getTileContent}
        />
      </div>

      {/* SUMMARY */}
      <div className="d-flex flex-column gap-2">
        {SUMMARY_ITEMS.map((item) => (
          <div
            key={item.key}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-dark)' }}>
                  {item.label}
                </div>
              </div>

              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: item.color }}>
                {summary[item.key]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-xs)',
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
