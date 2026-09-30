import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiChevronDown, FiHelpCircle, FiSend } from 'react-icons/fi';
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
  icon?: React.ReactNode;
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
 * diganti picklist pertanyaan + tombol kirim bulat. Picklist-nya panel
 * buatan sendiri (bukan <select> bawaan) supaya ikut tema — <select> di iOS
 * memunculkan roda pemilih sistem yang tidak bisa diberi gaya.
 */
const SmartChatLayarPenuh: React.FC<Props> = ({ messages, loading, questions, onPick, backTo }) => {
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement | null>(null);
  const pickRef = useRef<HTMLDivElement | null>(null);
  const [pilihan, setPilihan] = useState('');
  const [terbuka, setTerbuka] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  // Tutup panel saat tap/klik di luar atau tekan Escape.
  useEffect(() => {
    if (!terbuka) return;
    const diLuar = (e: PointerEvent) => {
      if (pickRef.current && !pickRef.current.contains(e.target as Node)) setTerbuka(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTerbuka(false);
    };
    document.addEventListener('pointerdown', diLuar);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', diLuar);
      document.removeEventListener('keydown', esc);
    };
  }, [terbuka]);

  // Jangan biarkan panel terbuka saat jawaban sedang dimuat.
  useEffect(() => {
    if (loading) setTerbuka(false);
  }, [loading]);

  const pertanyaanTerpilih = questions.find((q) => q.label === pilihan);

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
          <div className="sc-pick" ref={pickRef}>
            {terbuka && (
              <div className="sc-pick-panel" role="listbox" aria-label="Pilih pertanyaan">
                <div className="sc-pick-panel-title">Pilih pertanyaan</div>
                {questions.map((q) => {
                  const aktif = q.label === pilihan;
                  return (
                    <button
                      key={q.label}
                      type="button"
                      role="option"
                      aria-selected={aktif}
                      className={`sc-pick-option ${aktif ? 'is-active' : ''}`}
                      onClick={() => {
                        setPilihan(q.label);
                        setTerbuka(false);
                      }}
                    >
                      <span className="sc-pick-option-icon" aria-hidden>
                        {q.icon ?? <FiHelpCircle />}
                      </span>
                      <span className="sc-pick-option-label">{q.label}</span>
                      {aktif && <FiCheck className="sc-pick-option-check" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              className={`sc-pick-trigger ${pilihan ? 'has-value' : ''}`}
              onClick={() => setTerbuka((v) => !v)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={terbuka}
            >
              {pertanyaanTerpilih?.icon && (
                <span className="sc-pick-trigger-icon" aria-hidden>{pertanyaanTerpilih.icon}</span>
              )}
              <span className="sc-pick-trigger-label">
                {pilihan || 'Pilih pertanyaan…'}
              </span>
              <FiChevronDown className={`sc-pick-chevron ${terbuka ? 'is-open' : ''}`} aria-hidden />
            </button>
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
