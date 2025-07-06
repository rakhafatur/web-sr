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
  nama_ladies?: string;
};

const VoucherListPage = () => {
  const user = useSelector((state: RootState) => state.user.currentUser) as UserWithLadies;
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [totalRp, setTotalRp] = useState(0);

  const bulanIni = dayjs().format('MM');
  const tahunIni = dayjs().format('YYYY');

  const tanggalAwal = `${tahunIni}-${bulanIni}-01`;
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
        const val = parseFloat(v.jumlah_voucher?.toString() || '0');
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

      {/* === 👇 DEBUG INFO TAMPAK DI HP === */}
      <div style={{ fontSize: '0.75rem', color: 'gray', margin: '1rem 0' }}>
        <p><strong>Debug Info:</strong></p>
        <p><strong>ladies_id:</strong> {user?.ladies_id}</p>
        <p><strong>tanggal:</strong> {tanggalAwal} → {tanggalAkhir}</p>
        <p><strong>data:</strong> {JSON.stringify(vouchers)}</p>
      </div>

      {vouchers.length > 0 ? (
        <section className="voucher-list">
          {vouchers.map((v) => (
            <article key={v.id} className="voucher-card">
              <div className="voucher-date">{dayjs(v.tanggal).format('DD MMM YYYY')}</div>
              <div className="voucher-detail">
                <span className="pcs">{v.jumlah_voucher} pcs</span>
                <span className="nominal">Rp {(v.jumlah_voucher * 150000).toLocaleString('id-ID')}</span>
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