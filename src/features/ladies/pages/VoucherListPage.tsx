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
    const fetchData = async () => {
      // ✅ Ambil user dari Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser?.user?.id) return;

      const userId = authUser.user.id;

      // ✅ Ambil ladies_id dari tabel users
      const { data: userDetail, error: detailError } = await supabase
        .from('users')
        .select('ladies_id')
        .eq('id', userId)
        .single();

      const ladiesId = userDetail?.ladies_id;
      if (!ladiesId) return;

      // ✅ Lanjut ambil data voucher
      const tanggalAwal = `${tahunIni}-${bulanIni}-01`;
      const tanggalAkhir = dayjs().endOf('month').format('YYYY-MM-DD');

      const { data, error } = await supabase
        .from('vouchers')
        .select('id, tanggal, jumlah_voucher, keterangan')
        .eq('ladies_id', ladiesId)
        .gte('tanggal', tanggalAwal)
        .lte('tanggal', tanggalAkhir)
        .order('tanggal', { ascending: false });

      if (!error && data) {
        setVouchers(data);
        const pcs = data.reduce((sum, v) => sum + (parseFloat(v.jumlah_voucher?.toString() || '0')), 0);
        setTotalPcs(pcs);
        setTotalRp(pcs * 150000);
      }
    };

    fetchData();
  }, []);

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