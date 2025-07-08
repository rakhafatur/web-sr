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
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [totalRp, setTotalRp] = useState(0);

  const bulanIniAwal = dayjs().startOf('month');
  const bulanIniAkhir = dayjs().endOf('month');

  useEffect(() => {
    if (user?.ladies_id) {
      fetchVoucher(user.ladies_id);
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchVoucher = async (ladiesId: string) => {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', bulanIniAwal.format('YYYY-MM-DD'))
      .lte('tanggal', bulanIniAkhir.format('YYYY-MM-DD'));

    console.log('voucher data supabase:', data, error);

    if (error || !data) {
      setVouchers([]);
      setTotalPcs(0);
      setTotalRp(0);
      return;
    }

    setVouchers(data);
    // Coba deteksi jumlah_voucher otomatis
    let pcs = 0;
    if (Array.isArray(data)) {
      pcs = data.reduce((sum, v) => sum + (v.jumlah_voucher || 0), 0);
    }
    setTotalPcs(pcs);
    setTotalRp(pcs * 150000);
  };

  return (
    <div className="voucher-page">
      <h2 className="voucher-title">Voucher Bulan Ini</h2>
      <p className="voucher-total">{totalPcs} pcs = Rp {totalRp.toLocaleString('id-ID')}</p>

      <div className="voucher-debug" style={{ background: '#eee', color: '#222', padding: 8, borderRadius: 8 }}>
        <p><strong>Debug Info:</strong></p>
        <p><code>ladies_id:</code> {user?.ladies_id}</p>
        <p><code>tanggal:</code> {bulanIniAwal.format('YYYY-MM-DD')} → {bulanIniAkhir.format('YYYY-MM-DD')}</p>
        <p><code>Raw vouchers:</code></p>
        <pre style={{ fontSize: 12, background: '#fff', color: '#000', borderRadius: 6, padding: 8, overflowX: 'auto' }}>
          {JSON.stringify(vouchers, null, 2)}
        </pre>
      </div>

      {vouchers.length === 0 ? (
        <p className="voucher-empty">Belum ada voucher di bulan ini.</p>
      ) : (
        <ul className="voucher-list">
          {vouchers.map((v: any) => (
            <li key={v.id} className="voucher-item">
              <p>
                <strong>{v.tanggal ? dayjs(v.tanggal).format('DD MMM YYYY') : '-'}</strong> — {v.jumlah_voucher ?? '??'} pcs
              </p>
              <div style={{ fontSize: 12 }}>
                <b>Raw:</b> {JSON.stringify(v)}
              </div>
              {v.keterangan && <p className="voucher-ket">{v.keterangan}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VoucherListPage;