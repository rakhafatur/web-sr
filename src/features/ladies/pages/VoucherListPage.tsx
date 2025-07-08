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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
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
      .select('id, tanggal, jumlah_voucher, keterangan')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', bulanIniAwal.format('YYYY-MM-DD'))
      .lte('tanggal', bulanIniAkhir.format('YYYY-MM-DD'));

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

  return (
    <div className="voucher-page">
      <h2 className="voucher-title">Voucher Bulan Ini</h2>
      <p className="voucher-total">
        {totalPcs} pcs = Rp {totalRp.toLocaleString('id-ID')}
      </p>

      {vouchers.length === 0 ? (
        <p className="voucher-empty">Belum ada voucher di bulan ini.</p>
      ) : (
        <ul className="voucher-list">
          {vouchers.map((v) => (
            <li key={v.id} className="voucher-item">
              <p>
                <strong>{dayjs(v.tanggal).format('DD MMM YYYY')}</strong> — {v.jumlah_voucher} pcs
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