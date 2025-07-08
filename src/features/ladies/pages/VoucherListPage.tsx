import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './VoucherListPage.css';

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
};

const VoucherListPage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf('month'));
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [totalRp, setTotalRp] = useState(0);

  // Ganti bulan via input month
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // ex: "2025-07"
    let newDate = dayjs(`${value}-01`);
    if (!newDate.isValid()) {
      newDate = dayjs().startOf('month');
    }
    setSelectedMonth(newDate);
  };

  // Tombol navigasi bulan
  const prevMonth = () => setSelectedMonth(selectedMonth.subtract(1, 'month'));
  const nextMonth = () => {
    const next = selectedMonth.add(1, 'month');
    if (next.isAfter(dayjs(), 'month')) return;
    setSelectedMonth(next);
  };

  useEffect(() => {
    if (user?.ladies_id) {
      fetchVoucher(user.ladies_id);
    }
    // eslint-disable-next-line
  }, [user, selectedMonth]);

  const fetchVoucher = async (ladiesId: string) => {
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
      return;
    }

    setVouchers(data);
    const pcs = data.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0);
    setTotalPcs(pcs);
    setTotalRp(pcs * 150000);
  };

  // Judul bulan
  const bulanLabel = selectedMonth.format('MMMM YYYY');
  const isNextDisabled = selectedMonth.isSame(dayjs().startOf('month'), 'month');

  return (
    <div className="voucher-page">
      {/* Navigasi bulan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <button onClick={prevMonth}>&lt;</button>
        <input
          type="month"
          value={selectedMonth.format('YYYY-MM')}
          onChange={handleMonthChange}
          max={dayjs().format('YYYY-MM')}
          style={{ margin: '0 10px', fontWeight: 600, fontSize: '1rem', borderRadius: 8, border: '1px solid #ccc', padding: '2px 10px' }}
        />
        <button onClick={nextMonth} disabled={isNextDisabled} style={{ color: isNextDisabled ? '#ccc' : undefined }}>&gt;</button>
      </div>
      <div style={{ textAlign: 'center', fontWeight: 600, color: '#14532d', marginBottom: 12 }}>{bulanLabel}</div>
      <p className="voucher-total">{totalPcs} pcs = Rp {totalRp.toLocaleString('id-ID')}</p>
      {vouchers.length === 0 ? (
        <p className="voucher-empty">Belum ada voucher di bulan ini.</p>
      ) : (
        <ul className="voucher-list">
          {vouchers.map((v) => (
            <li key={v.id} className="voucher-item">
              <p>
                <strong>{v.tanggal ? dayjs(v.tanggal).format('DD MMM YYYY') : '-'}</strong> — {v.jumlah_voucher ?? '??'} pcs
              </p>
              {v.keterangan && <p className="voucher-ket">{v.keterangan}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VoucherListPage;