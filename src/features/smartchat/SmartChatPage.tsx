import React, { useRef, useState, useEffect } from "react";
import SmartChatBox from "./SmartChatBox";
import dayjs from 'dayjs';
import { supabase } from '../../lib/supabaseClient';

const SmartChatPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", message: "Hai! Aku asisten SR. Pilih pertanyaan:" },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const getJumlahVoucherBulanIni = async (): Promise<string> => {
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('vouchers')
      .select('jumlah')
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth)
      .not('ladies_id', 'is', null);

    if (error) return '❌ Gagal ambil data voucher';

    const totalNominal = data?.reduce((sum, v: any) => sum + Number(v.jumlah), 0) || 0;
    const totalVoucher = totalNominal / 150000;
    const totalLadies = totalNominal;
    const totalKeuntungan = totalVoucher * 75000;
    const totalKeseluruhan = totalVoucher * 225000;

    return `📊 Rincian Voucher Bulan Ini:
Total voucher (pcs): ${totalVoucher.toFixed(0)}
Total Ladies: Rp${totalLadies.toLocaleString('id-ID')}
Total Keuntungan: Rp${totalKeuntungan.toLocaleString('id-ID')}
Total Keseluruhan: Rp${totalKeseluruhan.toLocaleString('id-ID')}`;
  };

  const getLadiesVoucherStatBulanIni = async (): Promise<string> => {
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data: ladiesData, error: ladiesError } = await supabase
      .from('ladies')
      .select('id, nama_ladies, nama_outlet')
      .eq('status', 'active');

    if (ladiesError || !ladiesData) return '❌ Gagal ambil data ladies';

    const { data: voucherData } = await supabase
      .from('vouchers')
      .select('jumlah, ladies_id')
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth);

    const totals: Record<string, number> = {};
    ladiesData.forEach(l => totals[l.id] = 0);
    voucherData?.forEach(v => {
      if (v.ladies_id && totals[v.ladies_id] !== undefined) {
        totals[v.ladies_id] += Number(v.jumlah) / 150000;
      }
    });

    const maxVal = Math.max(...Object.values(totals));
    const minVal = Math.min(...Object.values(totals));

    const maxLadies = ladiesData.filter(l => totals[l.id] === maxVal);
    const minLadies = ladiesData.filter(l => totals[l.id] === minVal);

    const formatList = (arr: typeof maxLadies, totalsMap: Record<string, number>) =>
      arr.map(l => `${l.nama_ladies} (${l.nama_outlet}): ${totalsMap[l.id].toFixed(0)} pcs`).join('\n');

    return `🏆 Ladies dengan voucher terbanyak bulan ini:\n${formatList(maxLadies, totals)}
🎖️ Ladies dengan voucher paling sedikit bulan ini:\n${formatList(minLadies, totals)}`;
  };

  const getLadiesAbsenStatBulanIni = async (): Promise<string> => {
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data: ladiesData, error: ladiesError } = await supabase
      .from('ladies')
      .select('id, nama_ladies, nama_outlet')
      .eq('status', 'active');

    if (ladiesError || !ladiesData) return '❌ Gagal ambil data ladies';

    const { data: absenData } = await supabase
      .from('absensi')
      .select('ladies_id, status')
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth);

    const totals: Record<string, number> = {};
    ladiesData.forEach(l => totals[l.id] = 0);
    absenData?.forEach(a => {
      if (a.ladies_id && totals[a.ladies_id] !== undefined && a.status === 'KERJA') {
        totals[a.ladies_id] += 1;
      }
    });

    const maxVal = Math.max(...Object.values(totals));
    const minVal = Math.min(...Object.values(totals));

    const maxLadies = ladiesData.filter(l => totals[l.id] === maxVal);
    const minLadies = ladiesData.filter(l => totals[l.id] === minVal);

    const formatList = (arr: typeof maxLadies, totalsMap: Record<string, number>) =>
      arr.map(l => `${l.nama_ladies} (${l.nama_outlet}): ${totalsMap[l.id]} hari`).join('\n');

    return `🏆 Ladies dengan absen terbanyak bulan ini:\n${formatList(maxLadies, totals)}
🎖️ Ladies dengan absen paling sedikit bulan ini:\n${formatList(minLadies, totals)}`;
  };

  const questions = [
    { label: "Berapa jumlah voucher bulan ini?", answer: getJumlahVoucherBulanIni },
    { label: "Siapa ladies dengan voucher terbanyak & paling sedikit bulan ini?", answer: getLadiesVoucherStatBulanIni },
    { label: "Siapa ladies dengan absen terbanyak & paling sedikit bulan ini?", answer: getLadiesAbsenStatBulanIni },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePickQuestion = async (label: string) => {
    const question = questions.find(q => q.label === label);
    if (!question) return;

    setMessages(prev => [...prev, { sender: "user", message: question.label }]);
    const answerText = await question.answer();
    setMessages(prev => [...prev, { sender: "ai", message: answerText }]);
    setSelectedQuestion("");
  };

  return (
    <div className="flex flex-col h-screen p-2 sm:p-4 bg-gray-50 text-gray-900">
      <div
        className="flex-1 overflow-y-auto mb-3 px-1 sm:px-3"
        ref={chatContainerRef}
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`my-1 ${msg.sender === "ai" ? "self-start" : "self-end"} max-w-[90%] sm:max-w-[70%]`}>
            <SmartChatBox
              sender={msg.sender as "ai" | "user"}
              message={msg.message}
            />
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="pt-2">
        <select
          value={selectedQuestion}
          onChange={e => handlePickQuestion(e.target.value)}
          className="w-full border border-green-600 text-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
        >
          <option value="" disabled>Pilih pertanyaan...</option>
          {questions.map(q => <option key={q.label} value={q.label}>{q.label}</option>)}
        </select>
      </div>
    </div>
  );
};

export default SmartChatPage;