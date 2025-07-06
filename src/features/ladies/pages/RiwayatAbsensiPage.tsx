import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import dayjs from 'dayjs';
import { supabase } from '../../../lib/supabaseClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import 'react-calendar/dist/Calendar.css';
import './RiwayatAbsensiPage.css';

type AbsensiStatus = 'KERJA' | 'MENS' | 'OFF' | 'SAKIT';

type AbsensiData = {
  [tanggal: string]: AbsensiStatus;
};

// ✅ Tambahkan tipe khusus untuk user ladies
type UserWithLadies = {
  id: string;
  username: string;
  nama: string | null;
  ladies_id: string;
};

const RiwayatAbsensiPage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [absensi, setAbsensi] = useState<AbsensiData>({});

  const fetchAbsensi = async () => {
    if (!user?.ladies_id) return;

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
      return;
    }

    const mapped: AbsensiData = {};
    data?.forEach((item) => {
      mapped[dayjs(item.tanggal).format('YYYY-MM-DD')] = item.status;
    });
    setAbsensi(mapped);
  };

  useEffect(() => {
    fetchAbsensi();
  }, [currentDate]);

  const getTileClass = ({ date, view }: any) => {
    if (view !== 'month') return '';
    const key = dayjs(date).format('YYYY-MM-DD');
    const status = absensi[key];
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  };

  const getSummary = () => {
    const summary = { KERJA: 0, MENS: 0, OFF: 0, SAKIT: 0 };
    Object.entries(absensi).forEach(([_, status]) => {
      summary[status]++;
    });
    return summary;
  };

  const summary = getSummary();

  return (
    <div className="absensi-wrapper">
      <h2 className="absensi-title">Riwayat Absensi</h2>

      <Calendar
        value={currentDate}
        onActiveStartDateChange={({ activeStartDate }) =>
          setCurrentDate(activeStartDate || new Date())
        }
        tileClassName={getTileClass}
      />

      <div className="rekap-box">
        <p>Rekap Bulan {dayjs(currentDate).format('MMMM YYYY')}</p>
        <ul>
          <li><span className="dot green" /> Kerja: {summary.KERJA} hari</li>
          <li><span className="dot red" /> Mens: {summary.MENS} hari</li>
          <li><span className="dot gray" /> Off: {summary.OFF} hari</li>
          <li><span className="dot yellow" /> Sakit: {summary.SAKIT} hari</li>
        </ul>
      </div>
    </div>
  );
};

export default RiwayatAbsensiPage;