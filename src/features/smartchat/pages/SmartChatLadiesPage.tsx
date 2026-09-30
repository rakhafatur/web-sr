import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import type { UserWithLadies } from "../../../types/user";
import type { ChatReport } from "../components/ChatReport";
import SmartChatLayarPenuh from "../components/SmartChatLayarPenuh";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { supabase } from "../../../lib/supabaseClient";
import {
  FiGift,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiHeart,
  FiMoon,
} from "react-icons/fi";

type Message = {
  sender: "ai" | "user";
  message: string;
  report?: ChatReport;
  waktu?: string;
};

const jamSekarang = () => dayjs().format("HH:mm");

const SmartChatLadiesPage: React.FC = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const ladiesId = user?.ladies_id;

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      sender: "ai",
      message:
        "Hai! Aku Smart Assistant SR.\n\nAku bisa bantu lihat rincian voucher & absen kamu bulan ini.",
      waktu: jamSekarang(),
    },
  ]);

  const [loading, setLoading] = useState(false);

  const getJumlahVoucherBulanIni = async (): Promise<ChatReport | string> => {
    if (!ladiesId) return "❌ Data ladies tidak ditemukan.";

    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("vouchers")
      .select("jumlah, jumlah_voucher")
      .eq("ladies_id", ladiesId)
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    if (error || !data) return "❌ Gagal mengambil data voucher.";

    const totalPcs = data.reduce(
      (sum, v) => sum + (v.jumlah_voucher || 0),
      0
    );
    const totalRp = data.reduce(
      (sum, v) => sum + (v.jumlah || 0),
      0
    );

    return {
      title: "Voucher Bulan Ini",
      subtitle: dayjs().format("MMMM YYYY"),
      icon: <FiGift />,
      stats: [
        {
          icon: <FiGift size={12} />,
          label: "Total Voucher",
          value: `${totalPcs} pcs`,
        },
        {
          icon: <FiDollarSign size={12} />,
          label: "Total Nominal",
          value: `Rp${totalRp.toLocaleString("id-ID")}`,
        },
      ],
    };
  };

  const getAbsenBulanIni = async (): Promise<ChatReport | string> => {
    if (!ladiesId) return "❌ Data ladies tidak ditemukan.";

    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("absensi")
      .select("tanggal, status")
      .eq("ladies_id", ladiesId)
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    if (error || !data) return "❌ Gagal mengambil data absen.";

    const totalHadir = data.filter((a) => a.status === "KERJA").length;
    const totalMens = data.filter((a) => a.status === "MENS").length;
    const totalOff = data.filter((a) => a.status === "OFF").length;

    const detailHarian = [...data].sort((a, b) =>
      a.tanggal > b.tanggal ? 1 : -1
    );

    return {
      title: "Absen Bulan Ini",
      subtitle: dayjs().format("MMMM YYYY"),
      icon: <FiCalendar />,
      stats: [
        {
          icon: <FiCheckCircle size={12} />,
          label: "Hadir",
          value: `${totalHadir} hari`,
        },
        {
          icon: <FiHeart size={12} />,
          label: "M",
          value: `${totalMens} hari`,
        },
        {
          icon: <FiMoon size={12} />,
          label: "Off",
          value: `${totalOff} hari`,
        },
      ],
      groups:
        detailHarian.length > 0
          ? [
              {
                icon: <FiCalendar size={13} />,
                heading: "Detail Harian",
                items: detailHarian.map((a) => ({
                  name: dayjs(a.tanggal).format("DD MMM YYYY"),
                  value: a.status,
                })),
              },
            ]
          : undefined,
    };
  };

  const questions = [
    {
      icon: <FiGift />,
      label: "Berapa jumlah voucher bulan ini?",
      answer: getJumlahVoucherBulanIni,
    },
    {
      icon: <FiCalendar />,
      label: "Berikan absen bulan ini!",
      answer: getAbsenBulanIni,
    },
  ];

  const handlePickQuestion = async (label: string) => {
    if (loading) return;

    const question = questions.find((q) => q.label === label);
    if (!question) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", message: question.label, waktu: jamSekarang() },
    ]);

    setLoading(true);

    const result = await question.answer();

    if (typeof result === "string") {
      toast.error("Gagal mengambil data. Coba lagi.");
    }

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
      backTo="/ladies/home"
    />
  );
};

export default SmartChatLadiesPage;
