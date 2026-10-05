import React, { useState } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiCalendar,
  FiActivity,
  FiGift,
  FiUsers,
  FiBriefcase,
  FiRotateCcw,
} from "react-icons/fi";
import type { ChatReport, ChatStat } from "../components/ChatReport";
import SmartChatLayarPenuh from "../components/SmartChatLayarPenuh";
import dayjs from "dayjs";
import { supabase } from "../../../lib/supabaseClient";
import { untungBaris, type VoucherRow } from "../../transaction/utils/rekapVoucher";
import {
  SENIN,
  SELASA,
  hariAwalMingguOutlet,
  kelompokkanPerOutlet,
  labelPeriodeMinggu,
  rentangMinggu,
} from "../utils/voucherPerOutlet";

type Message = {
  sender: "ai" | "user";
  message: string;
  report?: ChatReport;
  waktu?: string;
};

const jamSekarang = () => dayjs().format("HH:mm");

/** Jawaban sebuah pertanyaan: satu laporan, beberapa laporan (mis. satu per
    outlet — dikirim sebagai pesan terpisah), atau pesan teks (gagal). */
type Jawaban = ChatReport | ChatReport[] | string;

/** Empat angka ringkasan yang sama untuk semua laporan voucher. Nilainya
    dibaca dari kolom yang tersimpan di baris transaksi, bukan dihitung ulang
    dari harga yang berlaku sekarang (untungBaris: tarif lama untuk baris
    tanpa kolom untung). */
const statVoucher = (rows: VoucherRow[]): ChatStat[] => {
  const totalVoucher = rows.reduce(
    (sum, v) => sum + Number(v.jumlah_voucher || 0),
    0
  );
  const totalLadies = rows.reduce((sum, v) => sum + Number(v.jumlah), 0);
  const totalKeuntungan = rows.reduce((sum, v) => sum + untungBaris(v), 0);

  return [
    {
      icon: <FiGift size={12} />,
      label: "Total Voucher",
      value: `${totalVoucher.toFixed(0)} pcs`,
    },
    {
      icon: <FiUsers size={12} />,
      label: "Total Ladies",
      value: `Rp${totalLadies.toLocaleString("id-ID")}`,
    },
    {
      icon: <FiTrendingUp size={12} />,
      label: "Total Keuntungan",
      value: `Rp${totalKeuntungan.toLocaleString("id-ID")}`,
    },
    {
      icon: <FiBriefcase size={12} />,
      label: "Total Keseluruhan",
      value: `Rp${(totalLadies + totalKeuntungan).toLocaleString("id-ID")}`,
    },
  ];
};

/** Ambil baris voucher milik ladies dalam satu rentang tanggal (inklusif),
    lengkap dengan outlet & tanggal untuk dikelompokkan per outlet. */
const ambilBarisVoucher = async (awal: string, akhir: string) => {
  const { data, error } = await supabase
    .from("vouchers")
    .select("jumlah, jumlah_voucher, untung, outlet, tanggal, ladies ( id, nama_ladies, nama_outlet )")
    .gte("tanggal", awal)
    .lte("tanggal", akhir)
    .not("ladies_id", "is", null);

  // Supabase mengetik relasi `ladies` sebagai array untuk nested select,
  // padahal selalu satu baris — dinormalkan lewat unknown (sama seperti
  // RekapVoucherPage).
  return { rows: (data ?? []) as unknown as VoucherRow[], error };
};

/** Nama outlet aktif — supaya tiap outlet tetap dijawab walau tanpa voucher. */
const ambilDaftarOutlet = async () => {
  const { data, error } = await supabase
    .from("outlets")
    .select("nama_outlet")
    .eq("is_active", true)
    .order("nama_outlet", { ascending: true });

  return { daftar: (data ?? []).map((o) => o.nama_outlet as string), error };
};

const dalamRentang = (tanggal: string, awal: string, akhir: string) =>
  tanggal >= awal && tanggal <= akhir;

const SmartChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      sender: "ai",
      message:
        "Hai! Aku Smart Assistant SR.\n\nAku bisa bantu melihat statistik voucher, performa ladies, absensi, dan insight lainnya.",
      waktu: jamSekarang(),
    },
  ]);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // VOUCHER MINGGU INI / MINGGU LALU — satu laporan per outlet, masing-masing
  // dengan periode minggunya sendiri (Travel Senin–Minggu, lainnya
  // Selasa–Senin; lihat hariAwalMingguOutlet).
  // =========================================================
  const getVoucherMingguPerOutlet = async (mundur: 0 | 1): Promise<Jawaban> => {
    const judul = mundur === 0 ? "Minggu Ini" : "Minggu Lalu";
    const { daftar, error: errorOutlet } = await ambilDaftarOutlet();
    if (errorOutlet) return "Gagal mengambil daftar outlet.";

    const hariIni = dayjs();
    // Ambil sekali untuk gabungan semua periode, lalu saring per outlet.
    const semua = ([SENIN, SELASA] as const).map((h) => rentangMinggu(h, mundur, hariIni));
    const awalGabungan = semua.reduce((m, r) => (r.awal.isBefore(m) ? r.awal : m), semua[0].awal);
    const akhirGabungan = semua.reduce((m, r) => (r.akhir.isAfter(m) ? r.akhir : m), semua[0].akhir);

    const { rows, error } = await ambilBarisVoucher(
      awalGabungan.format("YYYY-MM-DD"),
      akhirGabungan.format("YYYY-MM-DD")
    );
    if (error) return `Gagal mengambil data voucher ${judul.toLowerCase()}.`;

    const laporan = [...kelompokkanPerOutlet(rows, daftar).entries()]
      .map(([outlet, baris]) => {
        const hariAwal = hariAwalMingguOutlet(outlet);
        const { awal, akhir } = rentangMinggu(hariAwal, mundur, hariIni);
        const dalam = baris.filter((v) =>
          dalamRentang(v.tanggal, awal.format("YYYY-MM-DD"), akhir.format("YYYY-MM-DD"))
        );
        return { outlet, dalam, report: {
          title: `Voucher ${judul} · ${outlet}`,
          subtitle: `${awal.format("DD MMM")} – ${akhir.format("DD MMM")} (${labelPeriodeMinggu(hariAwal)})`,
          icon: mundur === 0 ? <FiTrendingUp /> : <FiRotateCcw />,
          stats: statVoucher(dalam),
        } as ChatReport };
      })
      // Outlet di luar daftar aktif hanya ditampilkan kalau ada transaksinya.
      .filter((x) => daftar.includes(x.outlet) || x.dalam.length > 0)
      .map((x) => x.report);

    return laporan.length > 0 ? laporan : "Belum ada outlet aktif.";
  };

  // =========================================================
  // VOUCHER BULAN INI — satu laporan per outlet
  // =========================================================
  const getVoucherBulanIniPerOutlet = async (): Promise<Jawaban> => {
    const { daftar, error: errorOutlet } = await ambilDaftarOutlet();
    if (errorOutlet) return "Gagal mengambil daftar outlet.";

    const { rows, error } = await ambilBarisVoucher(
      dayjs().startOf("month").format("YYYY-MM-DD"),
      dayjs().endOf("month").format("YYYY-MM-DD")
    );
    if (error) return "Gagal mengambil data voucher bulan ini.";

    const labelBulan = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const laporan = [...kelompokkanPerOutlet(rows, daftar).entries()].map(
      ([outlet, baris]): ChatReport => ({
        title: `Voucher Bulan Ini · ${outlet}`,
        subtitle: labelBulan,
        icon: <FiCalendar />,
        stats: statVoucher(baris),
      })
    );

    return laporan.length > 0 ? laporan : "Belum ada outlet aktif.";
  };

  // =========================================================
  // STAT VOUCHER BULAN INI
  // =========================================================
  const getLadiesVoucherStatBulanIni = async (): Promise<ChatReport | string> => {
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data: ladiesData, error: ladiesError } = await supabase
      .from("ladies")
      .select("id, nama_ladies, nama_outlet")
      .eq("status", "active");

    if (ladiesError || !ladiesData)
      return "Gagal mengambil data ladies.";

    const { data: voucherData } = await supabase
      .from("vouchers")
      .select("jumlah_voucher, ladies_id")
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    const totals: Record<string, number> = {};

    ladiesData.forEach((l) => {
      totals[l.id] = 0;
    });

    voucherData?.forEach((v) => {
      if (v.ladies_id && totals[v.ladies_id] !== undefined) {
        totals[v.ladies_id] += Number(v.jumlah_voucher || 0);
      }
    });

    const maxVal = Math.max(...Object.values(totals));
    const minVal = Math.min(...Object.values(totals));

    const maxLadies = ladiesData.filter(
      (l) => totals[l.id] === maxVal
    );

    const minLadies = ladiesData.filter(
      (l) => totals[l.id] === minVal
    );

    const toItems = (
      arr: typeof maxLadies,
      totalsMap: Record<string, number>
    ) =>
      arr.map((l) => ({
        name: l.nama_ladies,
        sub: l.nama_outlet,
        value: `${totalsMap[l.id].toFixed(0)} pcs`,
      }));

    return {
      title: "Statistik Voucher Ladies",
      subtitle: dayjs().format("MMMM YYYY"),
      icon: <FiAward />,
      groups: [
        {
          icon: <FiAward size={13} />,
          heading: "Terbanyak",
          items: toItems(maxLadies, totals),
        },
        {
          icon: <FiTrendingDown size={13} />,
          heading: "Paling Sedikit",
          items: toItems(minLadies, totals),
        },
      ],
    };
  };

  // =========================================================
  // STAT ABSENSI BULAN INI
  // =========================================================
  const getLadiesAbsenStatBulanIni = async (): Promise<ChatReport | string> => {
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data: ladiesData, error: ladiesError } = await supabase
      .from("ladies")
      .select("id, nama_ladies, nama_outlet")
      .eq("status", "active");

    if (ladiesError || !ladiesData)
      return "Gagal mengambil data ladies.";

    const { data: absenData } = await supabase
      .from("absensi")
      .select("ladies_id, status")
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    const totals: Record<string, number> = {};

    ladiesData.forEach((l) => {
      totals[l.id] = 0;
    });

    absenData?.forEach((a) => {
      if (
        a.ladies_id &&
        totals[a.ladies_id] !== undefined &&
        a.status === "KERJA"
      ) {
        totals[a.ladies_id] += 1;
      }
    });

    const maxVal = Math.max(...Object.values(totals));
    const minVal = Math.min(...Object.values(totals));

    const maxLadies = ladiesData.filter(
      (l) => totals[l.id] === maxVal
    );

    const minLadies = ladiesData.filter(
      (l) => totals[l.id] === minVal
    );

    const toItems = (
      arr: typeof maxLadies,
      totalsMap: Record<string, number>
    ) =>
      arr.map((l) => ({
        name: l.nama_ladies,
        sub: l.nama_outlet,
        value: `${totalsMap[l.id]} hari`,
      }));

    return {
      title: "Statistik Absensi Ladies",
      subtitle: dayjs().format("MMMM YYYY"),
      icon: <FiActivity />,
      groups: [
        {
          icon: <FiAward size={13} />,
          heading: "Terbanyak",
          items: toItems(maxLadies, totals),
        },
        {
          icon: <FiTrendingDown size={13} />,
          heading: "Paling Sedikit",
          items: toItems(minLadies, totals),
        },
      ],
    };
  };

  // =========================================================
  // QUESTIONS
  // =========================================================
  const questions = [
    {
      icon: <FiTrendingUp />,
      label: "Berapa jumlah voucher minggu ini?",
      answer: () => getVoucherMingguPerOutlet(0),
    },
    {
      icon: <FiRotateCcw />,
      label: "Berapa jumlah voucher minggu lalu?",
      answer: () => getVoucherMingguPerOutlet(1),
    },
    {
      icon: <FiCalendar />,
      label: "Berapa jumlah voucher bulan ini?",
      answer: getVoucherBulanIniPerOutlet,
    },
    {
      icon: <FiAward />,
      label:
        "Siapa ladies dengan voucher terbanyak & paling sedikit bulan ini?",
      answer: getLadiesVoucherStatBulanIni,
    },
    {
      icon: <FiActivity />,
      label:
        "Siapa ladies dengan absen terbanyak & paling sedikit bulan ini?",
      answer: getLadiesAbsenStatBulanIni,
    },
  ];

  // =========================================================
  // HANDLE QUESTION
  // =========================================================
  const handlePickQuestion = async (label: string) => {
    if (loading) return;

    const question = questions.find((q) => q.label === label);

    if (!question) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message: question.label,
        waktu: jamSekarang(),
      },
    ]);

    setLoading(true);

    const result: Jawaban = await question.answer();
    const waktu = jamSekarang();

    // Beberapa laporan (mis. per outlet) dikirim sebagai pesan terpisah.
    const balasan: Message[] =
      typeof result === "string"
        ? [{ sender: "ai", message: result, waktu }]
        : (Array.isArray(result) ? result : [result]).map((r) => ({
            sender: "ai" as const,
            message: r.title,
            report: r,
            waktu,
          }));

    setMessages((prev) => [...prev, ...balasan]);

    setLoading(false);
  };

  return (
    <SmartChatLayarPenuh
      messages={messages}
      loading={loading}
      questions={questions}
      onPick={handlePickQuestion}
      backTo="/"
    />
  );
};

export default SmartChatPage;