import { describe, expect, it } from 'vitest';
import { ringkasBeranda, type BarisVoucher } from './ringkasBeranda';
import { agregasiRekapVoucher, type VoucherRow } from '../../transaction/utils/rekapVoucher';

const baris = (
  tanggal: string,
  pcs: number | null,
  untung: number | null,
  ladies: string | null = 'a'
): BarisVoucher => ({
  tanggal,
  jumlah_voucher: pcs,
  untung,
  ladies_id: ladies,
  ladies: ladies ? { nama_ladies: `Ladies ${ladies.toUpperCase()}`, nama_outlet: 'Outlet 1' } : null,
});

describe('ringkasBeranda', () => {
  it('menjumlahkan pcs dan untung bulan berjalan dari kolom tersimpan', () => {
    const r = ringkasBeranda(
      [baris('2026-11-03', 4, 200_000), baris('2026-11-17', 6, 330_000), baris('2026-11-17', 1, 50_000, 'b')],
      '2026-11-17'
    );

    expect(r.pcsBulan).toBe(11);
    expect(r.untungBulan).toBe(580_000);
  });

  it('tidak memasukkan bulan lain ke total bulan berjalan', () => {
    const r = ringkasBeranda(
      [baris('2026-10-31', 9, 900_000), baris('2026-11-01', 2, 100_000), baris('2026-12-01', 5, 500_000)],
      '2026-11-02'
    );

    expect(r.pcsBulan).toBe(2);
    expect(r.untungBulan).toBe(100_000);
  });

  it('menyusun tujuh hari terakhir, termasuk hari tanpa transaksi', () => {
    const r = ringkasBeranda(
      [baris('2026-11-17', 3, 0), baris('2026-11-15', 2, 0), baris('2026-11-15', 1, 0)],
      '2026-11-17'
    );

    expect(r.harian.map((h) => h.tanggal)).toEqual([
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
    ]);
    expect(r.harian.map((h) => h.pcs)).toEqual([0, 0, 0, 0, 3, 0, 3]);
    expect(r.pcsHariIni).toBe(3);
    expect(r.pcsKemarin).toBe(0);
  });

  it('grafik tetap menghitung hari bulan lalu saat 7 hari melewati awal bulan', () => {
    const r = ringkasBeranda([baris('2026-10-30', 7, 700_000), baris('2026-11-02', 1, 50_000)], '2026-11-02');

    expect(r.harian[0].tanggal).toBe('2026-10-27');
    expect(r.harian.find((h) => h.tanggal === '2026-10-30')?.pcs).toBe(7);
    // …tetapi total bulan hanya November.
    expect(r.pcsBulan).toBe(1);
    expect(r.untungBulan).toBe(50_000);
  });

  it('mengurutkan ladies terbanyak, membawa nama & outlet, dan membatasi jumlahnya', () => {
    const r = ringkasBeranda(
      [
        baris('2026-11-01', 2, 0, 'a'),
        baris('2026-11-02', 5, 0, 'b'),
        baris('2026-11-03', 3, 0, 'a'),
        baris('2026-11-04', 9, 0, 'c'),
        baris('2026-11-05', 1, 0, 'd'),
      ],
      '2026-11-17'
    );

    expect(r.top).toEqual([
      { ladiesId: 'c', nama: 'Ladies C', outlet: 'Outlet 1', pcs: 9 },
      // a (2+3) dan b (5) seri — diurutkan menurut id.
      { ladiesId: 'a', nama: 'Ladies A', outlet: 'Outlet 1', pcs: 5 },
      { ladiesId: 'b', nama: 'Ladies B', outlet: 'Outlet 1', pcs: 5 },
    ]);
  });

  it('untung transaksi lama (kolom kosong) memakai tarif lama, seperti Rekap Voucher', () => {
    const r = ringkasBeranda([baris('2026-11-10', 2, null), baris('2026-11-10', 1, 60_000)], '2026-11-17');

    expect(r.untungBulan).toBe(2 * 75_000 + 60_000);
  });

  it('melewati baris tanpa ladies dan tidak memeringkat ladies tanpa voucher', () => {
    const r = ringkasBeranda(
      [baris('2026-11-10', 4, 100_000, null), baris('2026-11-10', 0, 0, 'z'), baris('2026-11-17', 3, 30_000, 'a')],
      '2026-11-17'
    );

    expect(r.pcsBulan).toBe(3);
    expect(r.untungBulan).toBe(30_000);
    expect(r.pcsHariIni).toBe(3);
    expect(r.top.map((t) => t.ladiesId)).toEqual(['a']);
  });

  it('total bulan sama dengan Rekap Voucher untuk data yang sama', () => {
    const rows = [
      baris('2026-11-01', 3, 150_000, 'a'),
      baris('2026-11-09', 2, null, 'b'),
      baris('2026-11-12', 5, 260_000, null),
      baris('2026-11-17', 1, 40_000, 'a'),
    ];
    const untukRekap: VoucherRow[] = rows.map((r) => ({
      jumlah: 0,
      jumlah_voucher: r.jumlah_voucher ?? 0,
      outlet: 'Outlet 1',
      untung: r.untung,
      tanggal: r.tanggal,
      ladies: r.ladies ? { id: r.ladies_id as string, nama_ladies: r.ladies.nama_ladies, nama_outlet: 'Outlet 1' } : null,
    }));

    const beranda = ringkasBeranda(rows, '2026-11-17');
    const rekap = agregasiRekapVoucher(untukRekap);

    expect(beranda.pcsBulan).toBe(rekap.totalVoucher);
    expect(beranda.untungBulan).toBe(rekap.totalUntung);
  });

  it('menerima tanggal berformat timestamp', () => {
    const r = ringkasBeranda([baris('2026-11-17T08:30:00+07:00', 2, 10_000)], '2026-11-17');

    expect(r.pcsHariIni).toBe(2);
    expect(r.pcsBulan).toBe(2);
  });

  it('semua nol saat tidak ada data', () => {
    const r = ringkasBeranda([], '2026-11-17');

    expect(r).toMatchObject({ pcsBulan: 0, untungBulan: 0, pcsHariIni: 0, pcsKemarin: 0, top: [] });
    expect(r.harian).toHaveLength(7);
  });
});
