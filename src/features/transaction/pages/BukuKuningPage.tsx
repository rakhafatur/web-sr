import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import { confirmDialog } from '../../../components/ConfirmDialog';
import DataTable from '../../../components/DataTable';
import { useMediaQuery } from 'react-responsive';
import { FiBook, FiPrinter, FiRepeat } from 'react-icons/fi';
import ListPageHeader from '../../../components/ListPageHeader';
import HeaderActionButton from '../../../components/HeaderActionButton';
import EmptyState from '../../../components/EmptyState';
import ListLoadingState from '../../../components/ListLoadingState';
import GenerateBiayaBulananModal from '../components/GenerateBiayaBulananModal';
import { monthNames, formatRupiah, pad, getLastDay } from '../utils/biayaBulanan';
import { hitungSaldoBerjalan, type SaldoRow } from '../utils/saldoBerjalan';
import { cetakBukuKuningPdf } from '../utils/bukuKuningPdf';

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
  const [selectedLadyId, setSelectedLadyId] = useState('');
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
          .select('tanggal, jumlah, jumlah_voucher')
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
          keterangan: 'Voucher',
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
      `❗ Yakin tutup buku - ${nama} - ${monthNames[bulan - 1]
      } - ${tahun}?`
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

  return (
    <div className="page-shell py-4">
      <ListPageHeader
        icon={<FiBook />}
        title="Buku Kuning Ladies"
        description="Kelola transaksi bulanan ladies (voucher, kasbon, dokter, pemasukan lain)"
        actions={
          <HeaderActionButton
            icon={<FiRepeat />}
            onClick={() => setShowGenerateModal(true)}
            fullWidth={isMobile}
          >
            Generate Biaya Bulanan
          </HeaderActionButton>
        }
      />

      <div className="row mb-3">
        <div className="col-12 col-md-4 mb-2">
          <label className="form-label text-dark">
            Pilih Ladies
          </label>

          <select
            className="form-select"
            value={selectedLadyId}
            onChange={(e) =>
              setSelectedLadyId(
                e.target.value
              )
            }
          >
            <option value="">
              -- Pilih --
            </option>

            {ladiesList.map((lady) => (
              <option
                key={lady.id}
                value={lady.id}
              >
                {lady.nama_ladies} -{' '}
                {lady.nama_outlet} (
                {lady.pin})
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">
            Bulan
          </label>

          <select
            className="form-select"
            value={bulan}
            onChange={(e) =>
              setBulan(
                Number(
                  e.target.value
                )
              )
            }
          >
            {monthNames.map(
              (name, index) => (
                <option
                  key={index + 1}
                  value={index + 1}
                >
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="col-6 col-md-4 mb-2">
          <label className="form-label text-dark">
            Tahun
          </label>

          <input
            type="number"
            className="form-control"
            min={2020}
            max={2030}
            value={tahun}
            onChange={(e) =>
              setTahun(
                Number(
                  e.target.value
                )
              )
            }
          />
        </div>
      </div>

      {selectedLadyId &&
        rows.length > 0 && (
          <div
            className={
              isMobile
                ? 'd-flex gap-3 mb-4'
                : 'd-flex gap-2 mb-3 justify-content-start flex-wrap'
            }
            style={
              isMobile
                ? undefined
                : { alignItems: 'center' }
            }
          >
            <button
              className={
                isMobile
                  ? 'btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 flex-fill'
                  : 'btn btn-sm btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2'
              }
              onClick={handleTutupBuku}
              style={
                isMobile
                  ? {
                      height: 52,
                      borderRadius: 14,
                      fontSize: '0.95rem',
                    }
                  : {
                      height: 36,
                      padding: '0.4rem 0.75rem',
                    }
              }
            >
              <FiBook size={isMobile ? 18 : 16} />
              Tutup Buku
            </button>

            <button
              className={
                isMobile
                  ? 'btn btn-outline-primary fw-semibold d-flex align-items-center justify-content-center gap-2 flex-fill'
                  : 'btn btn-sm btn-outline-primary fw-semibold d-flex align-items-center justify-content-center gap-2'
              }
              onClick={handleExportPDF}
              style={
                isMobile
                  ? {
                      height: 52,
                      borderRadius: 14,
                      fontSize: '0.95rem',
                    }
                  : {
                      height: 36,
                      padding: '0.4rem 0.75rem',
                    }
              }
            >
              <FiPrinter size={isMobile ? 18 : 16} />
              Cetak
            </button>
          </div>
        )}

      {!selectedLadyId && (
        <div className="alert alert-warning text-dark bg-warning-subtle border-warning">
          ⚠️ Silakan pilih ladies
          terlebih dahulu.
        </div>
      )}

      {selectedLadyId && (
        <>
          {loadingBuku ? (
            <ListLoadingState label="Memuat buku kuning" rows={5} />
          ) : rows.length > 0 ? (
            !isMobile && (
              <DataTable
                columns={[
                  {
                    key: 'tanggal',
                    label:
                      'Tanggal',
                  },
                  {
                    key: 'keterangan',
                    label:
                      'Keterangan',
                  },
                  {
                    key: 'voucher',
                    label:
                      'Voucher',
                  },
                  {
                    key: 'pemasukan',
                    label:
                      'Pemasukan',
                    render: (
                      row
                    ) =>
                      formatRupiah(
                        row.pemasukan
                      ),
                  },
                  {
                    key: 'pengeluaran',
                    label:
                      'Pengeluaran',
                    render: (
                      row
                    ) =>
                      formatRupiah(
                        row.pengeluaran
                      ),
                  },
                  {
                    key: 'saldo',
                    label:
                      'Saldo',
                    render: (
                      row
                    ) =>
                      formatRupiah(
                        row.saldo
                      ),
                  },
                ]}
                data={rows.map(
                  (row, i) => ({
                    id: `${i}`,
                    ...row,
                  })
                )}
              />
            )
          ) : (
            <EmptyState
              icon="ℹ️"
              title="Tidak ada transaksi di bulan ini"
            />
          )}
        </>
      )}

      <GenerateBiayaBulananModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};

export default BukuKuningPage;