import React, { useState } from "react";
import dayjs from "dayjs";
import {
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiCoffee,
  FiHeart,
  FiMoon,
} from "react-icons/fi";
import type { ChatReport } from "../components/ChatReport";
import SmartChatLayarPenuh from "../components/SmartChatLayarPenuh";
import { supabase } from "../../../lib/supabaseClient";
import { HALAMAN_PENGAWAS } from "../../../layout/menu";
import { statusAbsenPerOutlet } from "../utils/statusAbsenPerOutlet";

type Message = {
  sender: "ai" | "user";
  message: string;
  report?: ChatReport;
  waktu?: string;
};

const jamSekarang = () => dayjs().format("HH:mm");

/** Jawaban sebuah pertanyaan: satu laporan per outlet, atau pesan teks (gagal/kosong). */
type Jawaban = ChatReport[] | string;

const SmartChatPengawasPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      sender: "ai",
      message:
        "Hai! Aku Smart Assistant SR.\n\nAku bisa bantu lihat status absen hari ini.",
      waktu: jamSekarang(),
    },
  ]);

  const [loading, setLoading] = useState(false);

  const getStatusAbsenHariIni = async (): Promise<Jawaban> => {
    const [ladiesResult, absensiResult] = await Promise.all([
      supabase
        .from("ladies")
        .select("id, nama_ladies, nama_outlet")
        .eq("status", "active")
        .order("nama_ladies", { ascending: true }),
      supabase
        .from("absensi")
        .select("ladies_id, status")
        .eq("tanggal", dayjs().format("YYYY-MM-DD")),
    ]);

    if (ladiesResult.error || absensiResult.error) {
      return "Gagal mengambil data absen hari ini.";
    }

    const tanggal = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const laporan = statusAbsenPerOutlet(
      ladiesResult.data ?? [],
      absensiResult.data ?? []
    ).map(
      ({ outlet, rekap, belum }): ChatReport => ({
        title: `Absen Hari Ini · ${outlet}`,
        subtitle: tanggal,
        icon: <FiClipboard />,
        stats: [
          { icon: <FiCheckCircle size={12} />, label: "Kerja", value: `${rekap.KERJA} orang` },
          { icon: <FiHeart size={12} />, label: "M", value: `${rekap.MENS} orang` },
          { icon: <FiMoon size={12} />, label: "Off", value: `${rekap.OFF} orang` },
          { icon: <FiCoffee size={12} />, label: "Sakit", value: `${rekap.SAKIT} orang` },
          { icon: <FiClock size={12} />, label: "Belum Absen", value: `${belum.length} orang` },
        ],
        groups:
          belum.length > 0
            ? [
                {
                  icon: <FiClock size={13} />,
                  heading: "Belum Absen",
                  items: belum.map((nama) => ({ name: nama, value: "Belum" })),
                },
              ]
            : undefined,
      })
    );

    return laporan.length > 0 ? laporan : "Belum ada ladies aktif.";
  };

  const questions = [
    {
      icon: <FiClipboard />,
      label: "Bagaimana status absen hari ini?",
      answer: getStatusAbsenHariIni,
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
    const waktu = jamSekarang();

    // Tiap outlet dikirim sebagai pesan terpisah, sama seperti SmartChat admin.
    const balasan: Message[] =
      typeof result === "string"
        ? [{ sender: "ai", message: result, waktu }]
        : result.map((r) => ({
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
      backTo={HALAMAN_PENGAWAS.home.rute}
    />
  );
};

export default SmartChatPengawasPage;
