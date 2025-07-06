import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import './VoucherListPage.css';

type Voucher = {
  id: string;
  tanggal: string;
  jumlah_voucher: number;
  keterangan?: string;
};

const VoucherListPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [totalRp, setTotalRp] = useState(0);

  const bulanIni = dayjs().format('MM');
  const tahunIni = dayjs().format('YYYY');

  useEffect(() => {
    const ladiesId = '27d47f35-accb-4ee1-aee3-58f54c61f830'; // ✅ hardcode dari SQL kamu
    fetchVouchers(ladiesId);
  }, []);

  const fetchVouchers = async (ladiesId: string) => {
    const tanggalAwal = `${tahunIni}-${bulanIni}-01`;
    const tanggalAkhir = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('vouchers')
      .select('id, tanggal, jumlah_voucher, keterangan')
      .eq('ladies_id', ladiesId)
      .gte('tanggal', tanggalAwal)
      .lte('tanggal', tanggalAkhir)
      .order('tanggal', { ascending: false });

    console.log('DATA VOUCHER:', data); // 🔍 Log buat bukti tampil

    if (!error && data) {
      setVouchers(data);
      const pcs = data.reduce((sum, v) => {
        const raw = v['jumlah_voucher'] ?? 0;
        const val = parseFloat(raw?.toString() || '0');
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