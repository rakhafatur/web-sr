import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiSend } from 'react-icons/fi';
import robotImg from '../../../assets/robot-assistant.png';
import { ChatReportBody, type ChatReport } from './ChatReport';
import './SmartChatLayarPenuh.css';

export type ChatMessage = {
  sender: 'ai' | 'user';
  message: string;
  report?: ChatReport;
  /** Jam kirim "HH:mm", ditampilkan kecil di bawah bubble. */
  waktu?: string;
};

export type ChatQuestion = {
  label: string;
};

type Props = {
  messages: ChatMessage[];
  loading: boolean;
  questions: ChatQuestion[];
  onPick: (label: string) => void;
  /** Tujuan tombol kembali di bar atas. */
  backTo: string;
};

/**
 * Smart Chat bergaya referensi chatbot: bar atas, robot besar di awal
 * percakapan, bubble biru/abu, dan dok bawah. Dipakai halaman ladies & admin.
 *
 * - Mobile: layar penuh — MainLayout mencabut header & navbar bawah.
 * - Desktop: mengisi penuh area konten di samping sidebar, di bawah header.
 *
 * Chat ini tidak menerima ketikan bebas, jadi kolom "Message…" referensi
 * diganti picklist pertanyaan + tombol kirim bulat.
 */
const SmartChatLayarPenuh: React.FC<Props> = ({ messages, loading, questions, onPick, backTo }) => {
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [pilihan, setPilihan] = useState('');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilihan || loading) return;
    onPick(pilihan);
    setPilihan('');
  };

  return (
    <div className="sc">
      <header className="sc-bar">
        <div className="sc-inner sc-bar-inner">
          <button
            type="button"
            className="sc-icon-btn"
            onClick={() => navigate(backTo)}
            aria-label="Kembali"
          >
            <FiArrowLeft />
          </button>
          <h1 className="sc-bar-title">Smart Assistant</h1>
          <span className="sc-icon-btn" aria-hidden />
        </div>
      </header>

      <div className="sc-scroll">
        <div className="sc-inner">
          <div className="sc-hero">
            <img src={robotImg} alt="" className="sc-hero-img" width={200} height={200} />
            <p className="sc-hero-caption">Pilih pertanyaan di bawah untuk mulai</p>
          </div>

          <div className="sc-list" aria-live="polite">
            {messages.map((msg, idx) => {
              const isAI = msg.sender === 'ai';
              return (
                <div key={idx} className={`sc-row ${isAI ? 'is-ai' : 'is-user'}`}>
                  {isAI && <img src={robotImg} alt="" className="sc-avatar" width={36} height={36} />}
                  <div className={`sc-bubble ${isAI ? 'is-ai' : 'is-user'} ${msg.report ? 'is-report' : ''}`}>
                    {msg.report ? (
                      <ChatReportBody report={msg.report} />
                    ) : (
                      <div className="sc-text">{msg.message}</div>
                    )}
                    {msg.waktu && <div className="sc-time">{msg.waktu}</div>}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="sc-row is-ai">
                <img src={robotImg} alt="" className="sc-avatar" width={36} height={36} />
                <div className="sc-bubble is-ai" role="status" aria-label="Asisten sedang menyiapkan jawaban">
                  <span className="sc-typing" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>
      </div>

      <form className="sc-dock" onSubmit={kirim}>
        <div className="sc-inner sc-dock-inner">
          <div className="sc-pick">
            <label htmlFor="sc-pertanyaan" className="visually-hidden">Pilih pertanyaan</label>
            <select
              id="sc-pertanyaan"
              className="sc-pick-select"
              value={pilihan}
              onChange={(e) => setPilihan(e.target.value)}
              disabled={loading}
            >
              <option value="" disabled>
                Pilih pertanyaan…
              </option>
              {questions.map((q) => (
                <option key={q.label} value={q.label}>
                  {q.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="sc-pick-chevron" aria-hidden />
          </div>

          <button
            type="submit"
            className="sc-send"
            disabled={!pilihan || loading}
            aria-label="Kirim pertanyaan"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmartChatLayarPenuh;
