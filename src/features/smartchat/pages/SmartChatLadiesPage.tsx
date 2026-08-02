import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import type { UserWithLadies } from "../../../types/user";
import SmartChatBox, { ChatReport } from "../components/SmartChatBox";
import dayjs from "dayjs";
import { supabase } from "../../../lib/supabaseClient";
import {
  FiMessageCircle,
  FiChevronDown,
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
};

const SmartChatLadiesPage: React.FC = () => {
  const user = useSelector(
    (state: RootState) => state.user.currentUser
  ) as UserWithLadies;

  const ladiesId = user?.ladies_id;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      message:
        "👋 Hai! Aku Smart Assistant SR.\n\nAku bisa bantu lihat rincian voucher & absen kamu bulan ini.",
    },
  ]);

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const getJumlahVoucherBulanIni = async (): Promise<ChatReport | string> => {
    if (!ladiesId) return "❌ Data ladies tidak ditemukan.";

    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("vouchers")
      .select("jumlah_voucher")
      .eq("ladies_id", ladiesId)
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    if (error || !data) return "❌ Gagal mengambil data voucher.";

    const totalPcs = data.reduce(
      (sum, v) => sum + (v.jumlah_voucher || 0),
      0
    );
    const totalRp = totalPcs * 150000;

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
      short: "Voucher Bulan Ini",
      answer: getJumlahVoucherBulanIni,
    },
    {
      icon: <FiCalendar />,
      label: "Berikan absen bulan ini!",
      short: "Absen Bulan Ini",
      answer: getAbsenBulanIni,
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handlePickQuestion = async (label: string) => {
    const question = questions.find((q) => q.label === label);
    if (!question) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", message: question.label },
    ]);

    setLoading(true);

    const result = await question.answer();

    setMessages((prev) => [
      ...prev,
      typeof result === "string"
        ? { sender: "ai", message: result }
        : { sender: "ai", message: result.title, report: result },
    ]);

    setLoading(false);
    setSelectedQuestion("");
  };

  return (
    <div
      className="page-shell py-4 px-3"
      style={{ maxWidth: 560 }}
    >
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, var(--color-green), var(--color-accent))",
          color: "white",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              backdropFilter: "blur(8px)",
            }}
          >
            <FiMessageCircle />
          </div>

          <div>
            <h2
              className="fw-semibold mb-0"
              style={{ fontSize: "1rem", lineHeight: 1.2 }}
            >
              Smart Assistant
            </h2>

            <div
              style={{
                opacity: 0.78,
                fontSize: "0.72rem",
                marginTop: 2,
              }}
            >
              Voucher & absen kamu bulan ini
            </div>
          </div>
        </div>
      </div>

      {/* CHAT CARD */}
      <div
        className="card border-0 shadow-sm rounded-4"
        style={{ overflow: "hidden" }}
      >
        {/* CHAT CONTENT */}
        <div
          ref={chatContainerRef}
          className="p-3"
          style={{
            height: "58vh",
            overflowY: "auto",
            background:
              "linear-gradient(to bottom, var(--color-bg), var(--color-green-lighter))",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex mb-3 ${
                msg.sender === "ai"
                  ? "justify-content-start"
                  : "justify-content-end"
              }`}
            >
              <SmartChatBox
                sender={msg.sender}
                message={msg.message}
                report={msg.report}
              />
            </div>
          ))}

          {loading && (
            <div className="d-flex justify-content-start mb-3">
              <div
                style={{
                  background: "rgba(var(--color-bg-rgb),0.85)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid var(--color-gray-200)",
                  padding: "14px 18px",
                  borderRadius: "24px 24px 24px 8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                    style={{
                      color: "var(--color-green)",
                      width: 18,
                      height: 18,
                    }}
                  />

                  <span
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--color-gray-600)",
                      fontWeight: 500,
                    }}
                  >
                    Sedang menganalisa...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* FOOTER */}
        <div
          className="p-3 border-top"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="mb-2">
            <div
              className="fw-semibold mb-2"
              style={{ fontSize: "0.88rem", color: "var(--color-dark)" }}
            >
              Pilih Pertanyaan
            </div>

            <div style={{ position: "relative" }}>
              <select
                value={selectedQuestion}
                onChange={(e) => handlePickQuestion(e.target.value)}
                className="form-select shadow-none"
                style={{
                  height: 50,
                  borderRadius: 14,
                  border: "2px solid var(--color-green-light)",
                  paddingLeft: 14,
                  paddingRight: 40,
                  fontWeight: 600,
                  fontSize: "0.84rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-dark)",
                  appearance: "none",
                }}
              >
                <option value="" disabled>
                  -- Pilih pertanyaan --
                </option>

                {questions.map((q) => (
                  <option key={q.label} value={q.label}>
                    {q.label}
                  </option>
                ))}
              </select>

              <FiChevronDown
                size={18}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 14,
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "var(--color-gray-500)",
                }}
              />
            </div>
          </div>

          {/* QUICK BUTTONS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
              marginTop: 12,
            }}
          >
            {questions.map((q) => (
              <button
                key={q.label}
                onClick={() => handlePickQuestion(q.label)}
                title={q.label}
                className="border-0"
                style={{
                  background: "rgba(var(--color-primary-rgb), 0.14)",
                  color: "var(--color-green)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  textAlign: "left",
                  lineHeight: 1.25,
                }}
              >
                <span style={{ display: "flex", flexShrink: 0 }}>
                  {q.icon}
                </span>
                <span>{q.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartChatLadiesPage;
