import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import robotImg from '../../../assets/robot-assistant.png';
import { ChatReportBody, type ChatReport } from './SmartChatBox';
import './SmartChatMobile.css';

export type ChatMessage = {
  sender: 'ai' | 'user';
  message: string;
  report?: ChatReport;
  /** Jam kirim "HH:mm", ditampilkan kecil di bawah bubble. */
  waktu?: string;
};

export type ChatQuestion = {
  icon: React.ReactNode;
  label: string;
  short: string;
};

type Props = {
  messages: ChatMessage[];
  loading: boolean;
  questions: ChatQuestion[];
  onPick: (label: string) => void;
};

/**
 * Smart Chat layar penuh untuk mobile (pola referensi chatbot): bar atas,
 * robot besar di awal percakapan, bubble biru/abu, dan dok pertanyaan di
 * bawah. Chat ini tidak menerima ketikan bebas — kolom "Message…" referensi
 * diganti tombol pertanyaan berbentuk pil dengan tombol kirim bulat.
 * Header & navbar bawah app dicabut untuk rute ini di MainLayout.
 */
const SmartChatMobile: React.FC<Props> = ({ messages, loading, questions, onPick }) => {
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  return (
    <div className="sc-m">
      <header className="sc-m-bar">
        <button
          type="button"
          className="sc-m-icon-btn"
          onClick={() => navigate('/ladies/home')}
          aria-label="Kembali ke Home"
        >
          <FiArrowLeft />
        </button>
        <h1 className="sc-m-bar-title">Smart Assistant</h1>
        <span className="sc-m-icon-btn" aria-hidden />
      </header>

      <div className="sc-m-scroll">
        <div className="sc-m-hero">
          <img src={robotImg} alt="" className="sc-m-hero-img" width={200} height={200} />
          <p className="sc-m-hero-caption">Pilih pertanyaan di bawah untuk mulai</p>
        </div>

        <div className="sc-m-list" aria-live="polite">
          {messages.map((msg, idx) => {
            const isAI = msg.sender === 'ai';
            return (
              <div key={idx} className={`sc-m-row ${isAI ? 'is-ai' : 'is-user'}`}>
                {isAI && <img src={robotImg} alt="" className="sc-m-avatar" width={36} height={36} />}
                <div className={`sc-m-bubble ${isAI ? 'is-ai' : 'is-user'} ${msg.report ? 'is-report' : ''}`}>
                  {msg.report ? (
                    <ChatReportBody report={msg.report} />
                  ) : (
                    <div className="sc-m-text">{msg.message}</div>
                  )}
                  {msg.waktu && <div className="sc-m-time">{msg.waktu}</div>}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="sc-m-row is-ai">
              <img src={robotImg} alt="" className="sc-m-avatar" width={36} height={36} />
              <div className="sc-m-bubble is-ai" role="status" aria-label="Asisten sedang menyiapkan jawaban">
                <span className="sc-m-typing" aria-hidden>
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

      <div className="sc-m-dock">
        {questions.map((q) => (
          <button
            key={q.label}
            type="button"
            className="sc-m-ask"
            onClick={() => onPick(q.label)}
            disabled={loading}
          >
            <span className="sc-m-ask-icon" aria-hidden>{q.icon}</span>
            <span className="sc-m-ask-label">{q.label}</span>
            <span className="sc-m-send" aria-hidden>
              <FiSend />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartChatMobile;
