import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import SmartChatLadiesBox from "./SmartChatLadiesBox";
import dayjs from "dayjs";
import { supabase } from "../../lib/supabaseClient";

const SmartChatLadiesPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [messages, setMessages] = useState([
    { sender: "ai", message: "Hai! Aku asisten SR. Pilih pertanyaan:" },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const ladiesId = user?.id;

  const getJumlahVoucherBulanIni = async (): Promise<string> => {
    if (!ladiesId) return "❌ Tidak ada ID ladies";

    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("ladies_id", ladiesId)
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    if (error || !data) return "❌ Gagal ambil data voucher";

    const totalPcs = data.reduce((sum, v: any) => sum + (v.jumlah_voucher || 0), 0);
    const totalRp = totalPcs * 150000;
    const totalKeuntungan = totalPcs * 75000;
    const totalKeseluruhan = totalPcs * 225000;

    return `📊 Rincian Voucher Bulan Ini:
Total voucher (pcs): ${totalPcs}
Total nominal: Rp${totalRp.toLocaleString("id-ID")}
Total keuntungan: Rp${totalKeuntungan.toLocaleString("id-ID")}
Total keseluruhan: Rp${totalKeseluruhan.toLocaleString("id-ID")}`;
  };

  const getAbsenBulanIni = async (): Promise<string> => {
    if (!ladiesId) return "❌ Tidak ada ID ladies";

    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("absensi")
      .select("tanggal, status")
      .eq("ladies_id", ladiesId)
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    if (error || !data) return "❌ Gagal ambil data absen";

    const totalHadir = data.filter((a) => a.status === "KERJA").length;
    const totalSakit = data.filter((a) => a.status === "SAKIT").length;
    const totalIzin = data.filter((a) => a.status === "IZIN").length;

    const detailHarian = data
      .sort((a, b) => (a.tanggal > b.tanggal ? 1 : -1))
      .map((a) => `${dayjs(a.tanggal).format("DD/MM/YYYY")}: ${a.status}`)
      .join("\n");

    return `📅 Absen Bulan Ini:
Total hadir: ${totalHadir} hari
Total sakit: ${totalSakit} hari
Total izin: ${totalIzin} hari

Detail harian:
${detailHarian}`;
  };

  const questions = [
    { label: "Berapa jumlah voucher bulan ini?", answer: getJumlahVoucherBulanIni },
    { label: "Berikan absen bulan ini!", answer: getAbsenBulanIni },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePickQuestion = async (label: string) => {
    const question = questions.find((q) => q.label === label);
    if (!question) return;

    setMessages((prev) => [...prev, { sender: "user", message: question.label }]);
    const answerText = await question.answer();
    setMessages((prev) => [...prev, { sender: "ai", message: answerText }]);
    setSelectedQuestion("");
  };

  return (
    <div className="flex flex-col h-screen p-2 sm:p-4 bg-gray-50 text-gray-900">
      <div
        className="flex-1 overflow-y-auto mb-3 px-1 sm:px-3"
        ref={chatContainerRef}
        style={{ scrollbarWidth: "thin" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-1 ${msg.sender === "ai" ? "self-start" : "self-end"} max-w-[90%] sm:max-w-[70%]`}
          >
            <SmartChatLadiesBox sender={msg.sender as "ai" | "user"} message={msg.message} />
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="pt-2">
        <select
          value={selectedQuestion}
          onChange={(e) => handlePickQuestion(e.target.value)}
          className="w-full border border-green-600 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
        >
          <option value="" disabled>
            Pilih pertanyaan...
          </option>
          {questions.map((q) => (
            <option key={q.label} value={q.label}>
              {q.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SmartChatLadiesPage;
