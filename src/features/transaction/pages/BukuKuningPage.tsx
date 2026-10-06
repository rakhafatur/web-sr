import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import { useMediaQuery } from 'react-responsive';
import { FiRepeat } from 'react-icons/fi';
import GenerateBiayaBulananModal from '../components/GenerateBiayaBulananModal';
import { monthNames, pad, getLastDay } from '../utils/biayaBulanan';
import { hitungSaldoBerjalan, type SaldoRow } from '../utils/saldoBerjalan';
import { cetakBukuKuningPdf } from '../utils/bukuKuningPdf';
import BukuKuningMobile from '../components/BukuKuningMobile';
import BukuKuningDesktop from '../components/BukuKuningDesktop';
import { usePilihanTerakhir } from '../../../hooks/usePilihanTerakhir';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

type Row = SaldoRow;

type Absensi = {
  tanggal: string;
  status: string;
  keterangan: string | null;
};

const BukuKuningPage = () => {
  // Pilihan ladies dibawa antar halaman (URL + sesi) — lihat usePilihanTerakhir.
  const [selectedLadyId, setSelectedLadyId] = usePilihanTerakhir('ladies');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { data: ladiesList = [] } = useQuery({
    queryKey: ['bukukuning-ladies-aktif'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ladies')
        .select('id, nama_ladies, nama_outlet, pin, status')
        .eq('status', 'active');

      if (error) throw error;
      return (data ?? []) as Lady[];
    },
    meta: { errorLabel: 'data ladies' },
  });

  const { data: bukuData, isLoading: loadingBuku } = useQuery({
    queryKey: ['bukukuning-data', selectedLadyId, bulan, tahun, refreshKey],
    queryFn: async () => {
      const from = `${tahun}-${pad(bulan)}-01`;
      const to = `${tahun}-${pad(bulan)}-${pad(
        getLastDay(tahun, bulan)
      )}`;

      const prevMonth = bulan === 1 ? 12 : bulan - 1;
      const prevYear = bulan === 1 ? tahun - 1 : tahun;

      const { data: rekap } = await supabase
        .from('rekap_bulanan')
        .select('saldo_akhir')
        .eq('ladies_id', selectedLadyId)
        .eq('bulan', prevMonth)
        .eq('tahun', prevYear)
        .maybeSingle();

      const saldoAwal = rekap?.saldo_akhir ?? 0;

      const [vouchers, kasbon, pemasukan, dokter, absensi] = await Promise.all([
        supabase
          .from('vouchers')
          .select('tanggal, jumlah, jumlah_voucher, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('kasbon')
          .select('tanggal, jumlah, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('pemasukan_lain')
          .select('tanggal, jumlah, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('dokter')
          .select('tanggal, jumlah, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to),

        supabase
          .from('absensi')
          .select('tanggal, status, keterangan')
          .eq('ladies_id', selectedLadyId)
          .gte('tanggal', from)
          .lte('tanggal', to)
          .order('tanggal', { ascending: true })
      ]);



      const transaksi: Row[] = [];

      (vouchers?.data || []).forEach((v) => {
        transaksi.push({
          tanggal: v.tanggal,
          // "Voucher - Single" dst. untuk transaksi baru; transaksi lama kosong.
          keterangan: v.keterangan || 'Voucher',
          voucher: v.jumlah_voucher,
          pemasukan: Number(v.jumlah),
          pengeluaran: '',
          saldo: 0,
        });
      });

      (pemasukan?.data || []).forEach((p) => {
        transaksi.push({
          tanggal: p.tanggal,
          keterangan: p.keterangan || '',
          voucher: '',
          pemasukan: Number(p.jumlah),
          pengeluaran: '',
          saldo: 0,
        });
      });

      (kasbon?.data || []).forEach((k) => {
        transaksi.push({
          tanggal: k.tanggal,
          keterangan: k.keterangan || '',
          voucher: '',
          pemasukan: '',
          pengeluaran: Number(k.jumlah),
          saldo: 0,
        });
      });

      (dokter?.data || []).forEach((d) => {
        transaksi.push({
          tanggal: d.tanggal,
          keterangan: `Dokter - ${d.keterangan || ''}`,
          voucher: '',
          pemasukan: '',
          pengeluaran: Number(d.jumlah),
          saldo: 0,
        });
      });

      return {
        rows: hitungSaldoBerjalan(saldoAwal, transaksi),
        rekapAbsensi: (absensi?.data || []) as Absensi[],
      };
    },
    enabled: !!selectedLadyId,
    meta: { errorLabel: 'data buku kuning' },
  });

  const rows = bukuData?.rows ?? [];
  const rekapAbsensi = bukuData?.rekapAbsensi ?? [];

  const handleTutupBuku = async () => {
    if (rows.length === 0) {
      toast.error('Tidak ada data transaksi.');
      return;
    }

    const lady = ladiesList.find(
      (l) => l.id === selectedLadyId
    );

    const nama = lady
      ? lady.nama_ladies
      : 'Unknown';

    const confirm = await confirmDialog(
      `Tutup buku ${nama} untuk ${monthNames[bulan - 1]} ${tahun}?`
    );

    if (!confirm) return;

    const lastSaldo = rows[rows.length - 1].saldo;

    const { error } = await supabase
      .from('rekap_bulanan')
      .upsert(
        {
          ladies_id: selectedLadyId,
          bulan,
          tahun,
          saldo_akhir: lastSaldo,
        },
        {
          onConflict:
            'ladies_id,bulan,tahun',
        }
      );

    if (error)
      toast.error(
        'Gagal menyimpan saldo: ' +
        error.message
      );
    else
      toast.success(
        'Buku bulan ini ditutup dan saldo disimpan.'
      );
  };

  const handleExportPDF = () =>
    cetakBukuKuningPdf({
      rows,
      rekapAbsensi,
      ladiesList,
      selectedLadyId,
      bulan,
      tahun,
    });

  // Mobile: BukuKuningMobile (dipakai bersama Buku Kuning Pengawas) —
  // ringkasan saldo + Tutup Buku/Cetak; riwayat transaksi ada di halaman
  // Transaksi. Desktop: BukuKuningDesktop (juga dipakai bersama).
  if (isMobile) {
    return (
      <>
        <BukuKuningMobile
          title="Buku Kuning Ladies"
          entitas="Ladies"
          options={ladiesList.map((lady) => ({
            value: lady.id,
            label: `${lady.nama_ladies} • ${lady.nama_outlet} (${lady.pin})`,
          }))}
          selectedId={selectedLadyId}
          onSelect={setSelectedLadyId}
          bulan={bulan}
          tahun={tahun}
          onPeriodeChange={(b, t) => {
            setBulan(b);
            setTahun(t);
          }}
          loading={loadingBuku}
          rows={rows}
          labelPemasukan="Pemasukan"
          labelPengeluaran="Pengeluaran"
          onTutupBuku={handleTutupBuku}
          onCetak={handleExportPDF}
          aksiTambahan={
            <button type="button" className="tm-btn" onClick={() => setShowGenerateModal(true)}>
              <FiRepeat aria-hidden />
              Generate Biaya Bulanan
            </button>
          }
        />

        <GenerateBiayaBulananModal
          show={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerated={() => setRefreshKey((k) => k + 1)}
        />
      </>
    );
  }

  return (
    <>
      <BukuKuningDesktop
        title="Buku kuning ladies"
        description="Voucher, pemasukan lain, kasbon, dan dokter per bulan — dengan saldo berjalan"
        entitas="Ladies"
        options={ladiesList.map((lady) => ({
          value: lady.id,
          label: `${lady.nama_ladies} • ${lady.nama_outlet} (${lady.pin})`,
        }))}
        selectedId={selectedLadyId}
        onSelect={setSelectedLadyId}
        bulan={bulan}
        tahun={tahun}
        onPeriodeChange={(b, t) => {
          setBulan(b);
          setTahun(t);
        }}
        loading={loadingBuku}
        rows={rows}
        labelPemasukan="Pemasukan"
        labelPengeluaran="Pengeluaran"
        tampilkanVoucher
        onTutupBuku={handleTutupBuku}
        onCetak={handleExportPDF}
        aksiHeader={
          <button type="button" className="dk-btn" onClick={() => setShowGenerateModal(true)}>
            <FiRepeat aria-hidden />
            Generate biaya bulanan
          </button>
        }
      />

      <GenerateBiayaBulananModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
};

export default BukuKuningPage;
