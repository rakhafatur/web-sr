import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './VoucherListPage.css';
import logo from '../../../assets/logosr-green.png'; // ← tambahkan logo loading

type Voucher = {
  id: string;
  tanggal: string;
  jumlah_voucher: number;
  keterangan?: string;
};

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
  nama_ladies?: string;
};

const VoucherListPage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf('month'));
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [totalRp, setTotalRp] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
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
      fetchVoucher(user.ladies_id);
    }
  }, [user, selectedMonth]);

  const fetchVoucher = async (ladiesId: string) => {
    setLoading(true);
    const bulanAwal = selectedMonth.startOf('month');
    const bulanAkhir = selectedMonth.endOf('month');

    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
      .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'));

    if (error || !data) {
      setVouchers([]);
      setTotalPcs(0);
      setTotalRp(0);
      setLoading(false);
      return;
    }

    setVouchers(data);
    const pcs = data.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0);
    setTotalPcs(pcs);
    setTotalRp(pcs * 150000);
    setCurrentPage(1);
    setLoading(false);
  };

  const isNextDisabled = selectedMonth.isSame(dayjs().startOf('month'), 'month');
  const totalPages = Math.ceil(vouchers.length / itemsPerPage);
  const paginatedVouchers = vouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="voucher-page loading-state">
        <div className="loading-content">
          <img src={logo} alt="Memuat..." className="loading-logo" />
          <p>Memuat data voucher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voucher-page">
      <div className="voucher-monthbar">
        <button onClick={prevMonth} className="nav-btn" aria-label="Bulan sebelumnya">←</button>
        <input
          type="month"
          value={selectedMonth.format('YYYY-MM')}
          onChange={handleMonthChange}
          max={dayjs().format('YYYY-MM')}
          className="voucher-monthbar-input"
        />
        <button
          onClick={nextMonth}
          disabled={isNextDisabled}
          className="nav-btn"
          aria-label="Bulan berikutnya"
        >→</button>
      </div>

      <div className="voucher-impact">
        <h2>
          🎉 Kamu sudah kumpulkan <span>{totalPcs} voucher</span>
        </h2>
        <p>Total yang akan kamu terima: </p>
        <p><strong>Rp {totalRp.toLocaleString('id-ID')}</strong></p>
      </div>

      {vouchers.length === 0 ? (
        <p className="voucher-empty">Belum ada voucher di bulan ini. Semangat ya!</p>
      ) : (
        <>
          <ul className="voucher-list">
            {paginatedVouchers.map((v) => (
              <li key={v.id} className="voucher-item">
                <p>
                  <strong>{v.tanggal ? dayjs(v.tanggal).format('DD MMM YYYY') : '-'}</strong> — {v.jumlah_voucher ?? '??'} pcs
                </p>
                {v.keterangan && <p className="voucher-ket">{v.keterangan}</p>}
              </li>
            ))}
          </ul>

          <div className="voucher-pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="nav-btn">←</button>
            <span>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="nav-btn">→</button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoucherListPage;