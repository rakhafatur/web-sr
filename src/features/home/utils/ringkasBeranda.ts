/**
 * Ringkasan voucher untuk Home admin: total bulan berjalan, 7 hari terakhir,
 * dan ladies dengan voucher terbanyak.
 *
 * Murni & diuji (lihat CLAUDE.md, "Fungsi perhitungan uang"). Aturannya
 * SENGAJA sama dengan Rekap Voucher (transaction/utils/rekapVoucher.ts)
 * supaya angka di Home cocok dengan laporan untuk periode yang sama:
 *  - angka dibaca dari kolom yang tersimpan di baris transaksi
 *    (`jumlah_voucher`, `untung`), tidak dihitung ulang dari harga;
 *  - untung transaksi lama (kolom `untung` kosong) memakai `untungBaris`;
 *  - baris tanpa relasi ladies dilewati.
 */
import dayjs from 'dayjs';
import { untungBaris } from '../../transaction/utils/rekapVoucher';

export type BarisVoucher = {
  tanggal: string;
  jumlah_voucher: number | null;
  untung: number | null;
  ladies_id: string | null;
  ladies: { nama_ladies: string; nama_outlet: string | null } | null;
};

export type VoucherHarian = { tanggal: string; pcs: number };

export type LadiesTeratas = { ladiesId: string; nama: string; outlet: string | null; pcs: number };

export type RingkasanBeranda = {
  /** Total voucher (pcs) dalam bulan yang memuat `hariIni`. */
  pcsBulan: number;
  /** Total untung dalam bulan yang memuat `hariIni`. */
  untungBulan: number;
  pcsHariIni: number;
  pcsKemarin: number;
  /** Tujuh hari berakhir di `hariIni`, urut dari yang paling lama. Hari tanpa
      transaksi tetap ada dengan pcs 0. */
  harian: VoucherHarian[];
  /** Ladies dengan voucher terbanyak bulan ini, terbanyak dulu. */
  top: LadiesTeratas[];
};

export const JUMLAH_HARI_GRAFIK = 7;

/**
 * @param rows   baris voucher; boleh memuat tanggal di luar bulan berjalan
 *               (dipakai untuk grafik saat 7 hari terakhir melewati awal bulan)
 * @param hariIni tanggal acuan, format YYYY-MM-DD
 */
export function ringkasBeranda(rows: BarisVoucher[], hariIni: string, jumlahTop = 3): RingkasanBeranda {
  const bulan = hariIni.slice(0, 7);
  const acuan = dayjs(hariIni);

  const harian: VoucherHarian[] = [];
  for (let i = JUMLAH_HARI_GRAFIK - 1; i >= 0; i -= 1) {
    harian.push({ tanggal: acuan.subtract(i, 'day').format('YYYY-MM-DD'), pcs: 0 });
  }
  const perTanggal = new Map(harian.map((h) => [h.tanggal, h]));

  let pcsBulan = 0;
  let untungBulan = 0;
  const perLadies = new Map<string, LadiesTeratas>();

  for (const row of rows) {
    if (!row.ladies || !row.ladies_id) continue;

    // Kolom tanggal bisa berupa date atau timestamp — ambil bagian tanggalnya.
    const tanggal = (row.tanggal || '').slice(0, 10);
    const pcs = Number(row.jumlah_voucher || 0);

    const hari = perTanggal.get(tanggal);
    if (hari) hari.pcs += pcs;

    if (tanggal.slice(0, 7) !== bulan) continue;

    pcsBulan += pcs;
    untungBulan += untungBaris({ untung: row.untung, jumlah_voucher: pcs });

    const ada = perLadies.get(row.ladies_id);
    if (ada) ada.pcs += pcs;
    else {
      perLadies.set(row.ladies_id, {
        ladiesId: row.ladies_id,
        nama: row.ladies.nama_ladies,
        outlet: row.ladies.nama_outlet,
        pcs,
      });
    }
  }

  const top = [...perLadies.values()]
    .filter((l) => l.pcs > 0)
    // Seri diurutkan menurut id supaya urutannya tidak berubah-ubah.
    .sort((a, b) => b.pcs - a.pcs || a.ladiesId.localeCompare(b.ladiesId))
    .slice(0, jumlahTop);

  return {
    pcsBulan,
    untungBulan,
    pcsHariIni: harian[harian.length - 1].pcs,
    pcsKemarin: harian[harian.length - 2].pcs,
    harian,
    top,
  };
}
