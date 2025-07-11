import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './KasbonListPage.css';

type Kasbon = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
};

const KasbonListPage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf('month'));
  const [kasbonList, setKasbonList] = useState<Kasbon[]>([]);
  const [totalJumlah, setTotalJumlah] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newDate = dayjs(`${value}-01`);
    if (!newDate.isValid()) {
      newDate = dayjs().startOf('month');
    }
    setSelectedMonth(newDate);
    setCurrentPage(1);
  };

  const prevMonth = () => {
    setSelectedMonth(selectedMonth.subtract(1, 'month'));
    setCurrentPage(1);
  };

  const nextMonth = () => {
    const next = selectedMonth.add(1, 'month');
    if (next.isAfter(dayjs(), 'month')) return;
    setSelectedMonth(next);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user?.ladies_id) {
      fetchKasbon(user.ladies_id);
    }
  }, [user, selectedMonth]);

  const fetchKasbon = async (ladiesId: string) => {
    const bulanAwal = selectedMonth.startOf('month');
    const bulanAkhir = selectedMonth.endOf('month');

    const { data, error } = await supabase
      .from('kasbon')
      .select('*')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
      .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'));

    if (error || !data) {
      setKasbonList([]);
      setTotalJumlah(0);
      return;
    }

    setKasbonList(data);
    const total = data.reduce((sum, item) => sum + (item.jumlah || 0), 0);
    setTotalJumlah(total);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(kasbonList.length / itemsPerPage);
  const paginatedKasbon = kasbonList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isNextDisabled = selectedMonth.isSame(dayjs().startOf('month'), 'month');

  return (
    <div className="kasbon-page">
      <div className="kasbon-monthbar">
        <button onClick={prevMonth} className="nav-btn" aria-label="Bulan sebelumnya">←</button>
        <input
          type="month"
          value={selectedMonth.format('YYYY-MM')}
          onChange={handleMonthChange}
          max={dayjs().format('YYYY-MM')}
          className="kasbon-monthbar-input"
        />
        <button
          onClick={nextMonth}
          disabled={isNextDisabled}
          className="nav-btn"
          aria-label="Bulan berikutnya"
        >→</button>
      </div>

      <p className="kasbon-total">Rp {totalJumlah.toLocaleString('id-ID')}</p>

      {kasbonList.length === 0 ? (
        <p className="kasbon-empty">Belum ada kasbon di bulan ini.</p>
      ) : (
        <>
          <ul className="kasbon-list">
            {paginatedKasbon.map((item) => (
              <li key={item.id} className="kasbon-item">
                <p>
                  <strong>{item.tanggal ? dayjs(item.tanggal).format('DD MMM YYYY') : '-'}</strong> — Rp {item.jumlah.toLocaleString('id-ID')}
                </p>
                {item.keterangan && <p className="kasbon-ket">{item.keterangan}</p>}
              </li>
            ))}
          </ul>

          <div className="kasbon-pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="nav-btn">←</button>
            <span>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="nav-btn">→</button>
          </div>
        </>
      )}
    </div>
  );
};

export default KasbonListPage;