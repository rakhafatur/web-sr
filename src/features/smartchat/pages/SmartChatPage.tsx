import React, { useRef, useState, useEffect } from "react";
import {
  FiMessageCircle,
  FiChevronDown,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiCalendar,
  FiActivity,
  FiClock,
  FiCpu,
  FiGift,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import SmartChatBox, { ChatReport } from "../components/SmartChatBox";
import dayjs from "dayjs";
import { supabase } from "../../../lib/supabaseClient";

type Message = {
  sender: "ai" | "user";
  message: string;
  report?: ChatReport;
};

const SmartChatPage: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      message:
        "👋 Hai! Aku Smart Assistant SR.\n\nAku bisa bantu melihat statistik voucher, performa ladies, absensi, dan insight lainnya.",
    },
  ]);

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // =========================================================
  // JUMLAH VOUCHER BULAN INI
  // =========================================================
  const getJumlahVoucherBulanIni = async (): Promise<ChatReport | string> => {
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("vouchers")
      .select("jumlah")
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth)
      .not("ladies_id", "is", null);

    if (error) return "❌ Gagal mengambil data voucher bulan ini.";

    const totalNominal =
      data?.reduce((sum, v: any) => sum + Number(v.jumlah), 0) || 0;

    const totalVoucher = totalNominal / 150000;
    const totalLadies = totalNominal;
    const totalKeuntungan = totalVoucher * 75000;
    const totalKeseluruhan = totalVoucher * 225000;

    return {
      title: "Voucher Bulan Ini",
      subtitle: dayjs().format("MMMM YYYY"),
      icon: <FiCalendar />,
      stats: [
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
          value: `Rp${totalKeseluruhan.toLocaleString("id-ID")}`,
        },
      ],
    };
  };

  // =========================================================
  // JUMLAH VOUCHER MINGGU INI
  // =========================================================
  const getJumlahVoucherMingguIni = async (): Promise<ChatReport | string> => {
    const today = dayjs();
    const weekday = today.day();

    const startOfWeek =
      weekday >= 2 ? today.day(2) : today.subtract(1, "week").day(2);

    const endOfWeek = startOfWeek.add(6, "day");

    const { data, error } = await supabase
      .from("vouchers")
      .select("jumlah")
      .gte("tanggal", startOfWeek.format("YYYY-MM-DD"))
      .lte("tanggal", endOfWeek.format("YYYY-MM-DD"))
      .not("ladies_id", "is", null);

    if (error) return "❌ Gagal mengambil data voucher minggu ini.";

    const totalNominal =
      data?.reduce((sum, v: any) => sum + Number(v.jumlah), 0) || 0;

    const totalVoucher = totalNominal / 150000;
    const totalLadies = totalNominal;
    const totalKeuntungan = totalVoucher * 75000;
    const totalKeseluruhan = totalVoucher * 225000;

    return {
      title: "Voucher Minggu Ini",
      subtitle: `${startOfWeek.format("DD MMM")} • ${endOfWeek.format("DD MMM")}`,
      icon: <FiTrendingUp />,
      stats: [
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
          value: `Rp${totalKeseluruhan.toLocaleString("id-ID")}`,
        },
      ],
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
      .select("jumlah, ladies_id")
      .gte("tanggal", startOfMonth)
      .lte("tanggal", endOfMonth);

    const totals: Record<string, number> = {};

    ladiesData.forEach((l) => {
      totals[l.id] = 0;
    });

    voucherData?.forEach((v) => {
      if (v.ladies_id && totals[v.ladies_id] !== undefined) {
        totals[v.ladies_id] += Number(v.jumlah) / 150000;
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
      short: "Voucher Minggu Ini",
      answer: getJumlahVoucherMingguIni,
    },
    {
      icon: <FiCalendar />,
      label: "Berapa jumlah voucher bulan ini?",
      short: "Voucher Bulan Ini",
      answer: getJumlahVoucherBulanIni,
    },
    {
      icon: <FiAward />,
      label:
        "Siapa ladies dengan voucher terbanyak & paling sedikit bulan ini?",
      short: "Top Voucher Ladies",
      answer: getLadiesVoucherStatBulanIni,
    },
    {
      icon: <FiActivity />,
      label:
        "Siapa ladies dengan absen terbanyak & paling sedikit bulan ini?",
      short: "Top Absensi Ladies",
      answer: getLadiesAbsenStatBulanIni,
    },
  ];

  // =========================================================
  // AUTO SCROLL
  // =========================================================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =========================================================
  // HANDLE QUESTION
  // =========================================================
  const handlePickQuestion = async (label: string) => {
    const question = questions.find((q) => q.label === label);

    if (!question) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message: question.label,
      },
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
    <div className="page-shell py-4 px-md-4 px-3">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}
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
              width: 60,
              height: 60,
              borderRadius: 18,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              backdropFilter: "blur(8px)",
            }}
          >
            <FiCpu />
          </div>

          <div>
            <h2
              className="fw-semibold mb-0"
              style={{
                fontSize: isMobile
                  ? "1rem"
                  : "1.8rem",
                lineHeight: 1.2,
              }}
            >
              Smart Assistant SR
            </h2>

            <div
              style={{
                opacity: 0.78,
                fontSize: isMobile
                  ? "0.72rem"
                  : "0.92rem",
                marginTop: 2,
              }}
            >
              Insight voucher, absensi, dan performa ladies
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* CHAT CARD */}
      {/* ===================================================== */}
      <div
        className="card border-0 shadow-sm rounded-4"
        style={{
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background:
              "linear-gradient(to right, var(--color-green-lighter), var(--color-surface))",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div
                className="fw-bold d-flex align-items-center gap-2"
                style={{
                  color: "var(--color-dark)",
                }}
              >
                <FiMessageCircle />
                Smart Chat
              </div>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-gray-500)",
                }}
              >
                Tanya statistik dan insight secara cepat
              </div>
            </div>

            <div
              className="px-3 py-1 rounded-pill d-flex align-items-center gap-2"
              style={{
                background: "rgba(var(--color-primary-rgb), 0.14)",
                color: "var(--color-green)",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              <FiClock size={13} />
              Real-time Data
            </div>
          </div>
        </div>

        {/* CHAT CONTENT */}
        <div
          ref={chatContainerRef}
          className="p-3 p-md-4"
          style={{
            height: isMobile ? "60vh" : "68vh",
            overflowY: "auto",
            background:
              "linear-gradient(to bottom, var(--color-bg), var(--color-green-lighter))",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex mb-3 ${msg.sender === "ai"
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
                      fontSize: "0.92rem",
                      color: "var(--color-gray-600)",
                      fontWeight: 500,
                    }}
                  >
                    Smart Assistant sedang menganalisa...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* FOOTER */}
        <div
          className="p-3 p-md-4 border-top"
          style={{
            background: "var(--color-surface)",
          }}
        >
          <div className="mb-2">
            <div
              className="fw-semibold mb-2"
              style={{
                fontSize: "0.92rem",
                color: "var(--color-dark)",
              }}
            >
              Pilih Pertanyaan
            </div>

            <div
              style={{
                position: "relative",
              }}
            >
              <select
                value={selectedQuestion}
                onChange={(e) =>
                  handlePickQuestion(e.target.value)
                }
                className="form-select shadow-none"
                style={{
                  height: 58,
                  borderRadius: 18,
                  border: "2px solid var(--color-green-light)",
                  paddingLeft: 18,
                  paddingRight: 48,
                  fontWeight: 600,
                  fontSize: isMobile
                    ? "0.9rem"
                    : "0.97rem",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-dark)",
                  appearance: "none",
                }}
              >
                <option value="" disabled>
                  -- Pilih pertanyaan --
                </option>

                {questions.map((q) => (
                  <option
                    key={q.label}
                    value={q.label}
                  >
                    {q.label}
                  </option>
                ))}
              </select>

              <FiChevronDown
                size={20}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 18,
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
              display: isMobile ? "grid" : "flex",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : undefined,
              flexWrap: isMobile ? undefined : "wrap",
              gap: isMobile ? 8 : 10,
              marginTop: 12,
            }}
          >
            {questions.map((q) => (
              <button
                key={q.label}
                onClick={() =>
                  handlePickQuestion(q.label)
                }
                title={q.label}
                className="border-0"
                style={{
                  background: "rgba(var(--color-primary-rgb), 0.14)",
                  color: "var(--color-green)",
                  borderRadius: 14,
                  padding: isMobile
                    ? "10px 12px"
                    : "11px 15px",
                  fontSize: isMobile
                    ? "0.76rem"
                    : "0.84rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  textAlign: "left",
                  lineHeight: 1.25,
                  transition: "0.2s",
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

export default SmartChatPage;