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

type Message = {
  sender: "ai" | "user";
  message: string;
  report?: ChatReport;
  waktu?: string;
};

const jamSekarang = () => dayjs().format("HH:mm");

/** Bentuk baris voucher yang dipakai laporan chat. `untung` bisa null untuk
    transaksi lama yang dibuat sebelum kolom itu ada — penanganannya lewat
    fallback di tiap perhitungan. */
type VoucherRow = {
  jumlah: number;
  jumlah_voucher: number | null;
  untung: number | null;
};

const untungDariBaris = (v: VoucherRow) =>
  v.untung != null ? Number(v.untung) : Number(v.jumlah_voucher || 0) * 75000;

/** Minggu operasional SR dimulai hari Selasa. `mundur` dihitung dalam minggu:
    0 = minggu yang sedang berjalan, 1 = minggu sebelumnya, dst. */
const rentangMingguSR = (mundur = 0) => {
  const today = dayjs();
  const awalMingguIni =
    today.day() >= 2 ? today.day(2) : today.subtract(1, "week").day(2);

  const awal = awalMingguIni.subtract(mundur, "week");

  return { awal, akhir: awal.add(6, "day") };
};

/** Empat angka ringkasan yang sama untuk semua laporan voucher. Nilainya
    dibaca dari kolom yang tersimpan di baris transaksi, bukan dihitung ulang
    dari harga yang berlaku sekarang. */
const statVoucher = (rows: VoucherRow[]): ChatStat[] => {
  const totalVoucher = rows.reduce(
    (sum, v) => sum + Number(v.jumlah_voucher || 0),
    0
  );
  const totalLadies = rows.reduce((sum, v) => sum + Number(v.jumlah), 0);
  const totalKeuntungan = rows.reduce((sum, v) => sum + untungDariBaris(v), 0);

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

/** Ambil baris voucher milik ladies dalam satu rentang tanggal (inklusif). */
const ambilBarisVoucher = async (awal: string, akhir: string) => {
  const { data, error } = await supabase
    .from("vouchers")
    .select("jumlah, jumlah_voucher, untung")
    .gte("tanggal", awal)
    .lte("tanggal", akhir)
    .not("ladies_id", "is", null);

  return { rows: (data ?? []) as VoucherRow[], error };
};

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
  // JUMLAH VOUCHER BULAN INI
  // =========================================================
  const getJumlahVoucherBulanIni = async (): Promise<ChatReport | string> => {
    const { rows, error } = await ambilBarisVoucher(
      dayjs().startOf("month").format("YYYY-MM-DD"),
      dayjs().endOf("month").format("YYYY-MM-DD")
    );

    if (error) return "❌ Gagal mengambil data voucher bulan ini.";

    return {
      title: "Voucher Bulan Ini",
      subtitle: dayjs().format("MMMM YYYY"),
      icon: <FiCalendar />,
      stats: statVoucher(rows),
    };
  };

  // =========================================================
  // JUMLAH VOUCHER MINGGU INI
  // =========================================================
  const getJumlahVoucherMingguIni = async (): Promise<ChatReport | string> => {
    const { awal, akhir } = rentangMingguSR(0);

    const { rows, error } = await ambilBarisVoucher(
      awal.format("YYYY-MM-DD"),
      akhir.format("YYYY-MM-DD")
    );

    if (error) return "❌ Gagal mengambil data voucher minggu ini.";

    return {
      title: "Voucher Minggu Ini",
      subtitle: `${awal.format("DD MMM")} • ${akhir.format("DD MMM")}`,
      icon: <FiTrendingUp />,
      stats: statVoucher(rows),
    };
  };

  // =========================================================
  // JUMLAH VOUCHER MINGGU LALU
  // =========================================================
  const getJumlahVoucherMingguLalu = async (): Promise<ChatReport | string> => {
    const { awal, akhir } = rentangMingguSR(1);

    const { rows, error } = await ambilBarisVoucher(
      awal.format("YYYY-MM-DD"),
      akhir.format("YYYY-MM-DD")
    );

    if (error) return "❌ Gagal mengambil data voucher minggu lalu.";

    return {
      title: "Voucher Minggu Lalu",
      subtitle: `${awal.format("DD MMM")} • ${akhir.format("DD MMM")}`,
      icon: <FiRotateCcw />,
      stats: statVoucher(rows),
    };
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
      return "❌ Gagal mengambil data ladies.";

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
      return "❌ Gagal mengambil data ladies.";

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
      answer: getJumlahVoucherMingguIni,
    },
    {
      icon: <FiRotateCcw />,
      label: "Berapa jumlah voucher minggu lalu?",
      answer: getJumlahVoucherMingguLalu,
    },
    {
      icon: <FiCalendar />,
      label: "Berapa jumlah voucher bulan ini?",
      answer: getJumlahVoucherBulanIni,
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

    const result = await question.answer();

    setMessages((prev) => [
      ...prev,
      typeof result === "string"
        ? { sender: "ai", message: result, waktu: jamSekarang() }
        : { sender: "ai", message: result.title, report: result, waktu: jamSekarang() },
    ]);

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