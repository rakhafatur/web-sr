import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './VoucherListPage.css';

type Voucher = {
  id: string;
  tanggal: string;
  jumlah_voucher?: number | null;
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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [totalRp, setTotalRp] = useState(0);

  const tanggalAwal = dayjs().startOf('month').format('YYYY-MM-DD');
  const tanggalAkhir = dayjs().endOf('month').format('YYYY-MM-DD');

  useEffect(() => {
    if (!user?.ladies_id) return;
    fetchVouchers(user.ladies_id);
  }, [user]);

  const fetchVouchers = async (ladiesId: string) => {
    const { data, error } = await supabase
      .from('vouchers')
      .select('id, tanggal, jumlah_voucher, keterangan')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir)
      .order('tanggal', { ascending: false });

    if (!error && data) {
      setVouchers(data);
      const pcs = data.reduce((sum, v) => {
        const val = parseFloat((v.jumlah_voucher ?? 0).toString());
        return sum + val;
      }, 0);
      setTotalPcs(pcs);
      setTotalRp(pcs * 150000);
    }
  };

  return (
    <main className="voucher-page">
      <h2 className="voucher-title">Voucher Bulan Ini</h2>
      <p className="voucher-summary">
        <strong>{totalPcs} pcs</strong> = <strong>Rp {totalRp.toLocaleString('id-ID')}</strong>
      </p>

      {vouchers.length > 0 ? (
        <section className="voucher-list">
          {vouchers.map((v) => (
            <article key={v.id} className="voucher-card">
              <div className="voucher-date">{dayjs(v.tanggal).format('DD MMM YYYY')}</div>
              <div className="voucher-detail">
                <span className="pcs">{v.jumlah_voucher} pcs</span>
                <span className="nominal">Rp {(Number(v.jumlah_voucher || 0) * 150000).toLocaleString('id-ID')}</span>
              </div>
              {v.keterangan && <div className="voucher-note">{v.keterangan}</div>}
            </article>
          ))}
        </section>
      ) : (
        <p className="voucher-empty">Belum ada voucher di bulan ini.</p>
      )}
    </main>
  );
};

export default VoucherListPage;