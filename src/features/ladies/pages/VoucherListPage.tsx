import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
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
  const [loading, setLoading] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Untuk picker bulan manual (mobile friendly)
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // format: "YYYY-MM"
    console.log('PICKER CHANGE', value);
    setShowMonthPicker(false);
    setSelectedMonth(dayjs(value + '-01'));
  };

  useEffect(() => {
    if (user?.ladies_id) {
      fetchVoucher(user.ladies_id);
    }
    // eslint-disable-next-line
  }, [user, selectedMonth]);

  const fetchVoucher = async (ladiesId: string) => {
    setLoading(true);
    const bulanAwal = selectedMonth.startOf('month');
    const bulanAkhir = selectedMonth.endOf('month');
    console.log('FETCH VOUCHER', {
      ladiesId,
      selectedMonth: selectedMonth.format('YYYY-MM'),
      bulanAwal: bulanAwal.format('YYYY-MM-DD'),
      bulanAkhir: bulanAkhir.format('YYYY-MM-DD')
    });

    const { data, error } = await supabase
      .from('vouchers')
      .select('id, tanggal, jumlah_voucher, keterangan')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', bulanAwal.format('YYYY-MM-DD'))
      .lte('tanggal', bulanAkhir.format('YYYY-MM-DD'));

    console.log('SUPABASE RESULT', { data, error });

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
    setLoading(false);
  };

  const prevMonth = () => setSelectedMonth(selectedMonth.subtract(1, 'month'));
  const nextMonth = () => setSelectedMonth(selectedMonth.add(1, 'month'));
  const bulanLabel = selectedMonth.format('MMMM YYYY');
  const isNextDisabled = selectedMonth.isSame(dayjs().startOf('month'), 'month');

  return (
    <div className="voucher-page">
      <div className="voucher-navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <button
          onClick={prevMonth}
          aria-label="Bulan sebelumnya"
          className="voucher-nav-btn"
        >
          <FiChevronLeft />
        </button>
        <div
          onClick={() => setShowMonthPicker(true)}
          className="voucher-month-label"
        >
          <FiCalendar style={{ marginBottom: -2 }} /> {bulanLabel}
        </div>
        <button
          onClick={nextMonth}
          aria-label="Bulan berikutnya"
          className="voucher-nav-btn"
          style={{ color: isNextDisabled ? '#d1d5db' : '#14532d', cursor: isNextDisabled ? 'not-allowed' : 'pointer' }}
          disabled={isNextDisabled}
        >
          <FiChevronRight />
        </button>
      </div>
      {showMonthPicker && (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <input
            type="month"
            value={selectedMonth.format('YYYY-MM')}
            onChange={handleMonthChange}
            className="voucher-month-picker"
            min="2023-01"
            max={dayjs().format('YYYY-MM')}
            autoFocus
          />
          <button
            onClick={() => setShowMonthPicker(false)}
            className="voucher-cancel-btn"
          >Batal</button>
        </div>
      )}

      {/* DEBUG INFO */}
      <div
        style={{
          fontSize: 13,
          background: '#f4f4f4',
          padding: 8,
          borderRadius: 8,
          margin: '8px 0 12px 0',
          color: '#222',
          wordBreak: 'break-all'
        }}
      >
        <b>DEBUG:</b>
        <div>ladies_id: <code>{user?.ladies_id}</code></div>
        <div>selectedMonth: <code>{selectedMonth.format('YYYY-MM')}</code></div>
        <div>Range: <code>{selectedMonth.startOf('month').format('YYYY-MM-DD')} s/d {selectedMonth.endOf('month').format('YYYY-MM-DD')}</code></div>
        <div>Raw vouchers: <pre style={{fontSize:11,margin:0}}>{JSON.stringify(vouchers, null, 2)}</pre></div>
      </div>

      <p className="voucher-total" style={{ marginTop: 0 }}>
        {loading ? '...' : `${totalPcs} pcs = Rp ${totalRp.toLocaleString('id-ID')}`}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>Memuat data...</div>
      ) : vouchers.length === 0 ? (
        <p className="voucher-empty">Belum ada voucher di bulan ini.</p>
      ) : (
        <ul className="voucher-list">
          {vouchers.map((v) => (
            <li key={v.id} className="voucher-item">
              <p>
                <strong>{dayjs(v.tanggal).format('DD MMM YYYY')}</strong> — {v.jumlah_voucher} pcs
              </p>
              <div style={{fontSize:11,color:'#888'}}>Raw: {JSON.stringify(v)}</div>
              {v.keterangan && <p className="voucher-ket">{v.keterangan}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VoucherListPage;