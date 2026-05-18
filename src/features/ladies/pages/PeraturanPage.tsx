import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiCalendar,
  FiCheckCircle,
  FiGift,
  FiCreditCard,
  FiShield,
} from 'react-icons/fi';

type RuleSection = {
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  rules: string[];
};

const ruleSections: RuleSection[] =
  [
    {
      title: 'Umum',
      icon: (
        <FiShield size={18} />
      ),
      color: '#2563eb',
      bg: '#dbeafe',
      rules: [
        'Wajib kerja minimal 18 hari dalam sebulan.',
      ],
    },

    {
      title: 'Absen',
      icon: (
        <FiCalendar size={18} />
      ),
      color: '#16a34a',
      bg: '#dcfce7',
      rules: [
        'Wajib melakukan absensi setiap hari melalui polling yang dibagikan di grup WhatsApp.',

        'Pengisian polling absensi paling lambat pukul 15.00, kecuali jika sedang piket.',

        'Permohonan izin off harus disampaikan kepada pengawas sebelum jam absen berakhir.',
      ],
    },

    {
      title: 'Voucher',
      icon: (
        <FiGift size={18} />
      ),
      color: '#d97706',
      bg: '#fef3c7',
      rules: [
        'Voucher direkap secara harian.',

        'Pembayaran voucher dilakukan secara mingguan atau bulanan, sesuai kesepakatan.',

        'Apabila jumlah kasbon melebihi total voucher yang diperoleh, maka voucher akan otomatis digunakan untuk mengurangi kasbon.',
      ],
    },

    {
      title: 'Kasbon',
      icon: (
        <FiCreditCard size={18} />
      ),
      color: '#dc2626',
      bg: '#fee2e2',
      rules: [
        'Jumlah kasbon disesuaikan dengan total voucher yang diterima setiap bulan.',

        'Permintaan kasbon dapat diajukan melalui pesan pribadi (personal chat).',
      ],
    },
  ];

const PeraturanPage = () => {
  const [openIndex, setOpenIndex] =
    useState<number | null>(
      0
    );

  const toggleIndex = (
    index: number
  ) => {
    setOpenIndex(
      (prev) =>
        prev === index
          ? null
          : index
    );
  };

  return (
    <div
      className="d-flex flex-column gap-3"
      style={{
        paddingBottom: 24,
      }}
    >
      {/* HERO */}
      <div
        style={{
          background:
            'linear-gradient(135deg,#22c55e,#16a34a)',
          borderRadius: 24,
          padding:
            '22px 20px',
          color: '#fff',
          position:
            'relative',
          overflow:
            'hidden',
          boxShadow:
            '0 10px 30px rgba(34,197,94,0.18)',
        }}
      >
        {/* BG */}
        <div
          style={{
            position:
              'absolute',
            width: 180,
            height: 180,
            borderRadius:
              '50%',
            background:
              'rgba(255,255,255,0.08)',
            top: -70,
            right: -70,
          }}
        />

        <div
          style={{
            position:
              'relative',
            zIndex: 2,
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-2">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background:
                  'rgba(255,255,255,0.15)',
              }}
            >
              <FiCheckCircle size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.9,
                }}
              >
                Informasi
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Peraturan
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 13,
              opacity: 0.92,
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Bacalah peraturan
            dengan baik agar
            aktivitas kerja
            berjalan nyaman dan
            lancar ✨
          </div>
        </div>
      </div>

      {/* RULE LIST */}
      <div className="d-flex flex-column gap-2">
        {ruleSections.map(
          (
            section,
            index
          ) => {
            const isOpen =
              openIndex ===
              index;

            return (
              <div
                key={index}
                style={{
                  background:
                    '#fff',
                  border:
                    isOpen
                      ? `1px solid ${section.bg}`
                      : '1px solid #f1f5f9',
                  borderRadius: 20,
                  overflow:
                    'hidden',
                  boxShadow:
                    '0 1px 5px rgba(0,0,0,0.03)',
                  transition:
                    'all 0.2s ease',
                }}
              >
                {/* HEADER */}
                <div
                  onClick={() =>
                    toggleIndex(
                      index
                    )
                  }
                  className="d-flex align-items-center justify-content-between"
                  style={{
                    padding:
                      '16px',
                    cursor:
                      'pointer',
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        background:
                          section.bg,
                        color:
                          section.color,
                        flexShrink: 0,
                      }}
                    >
                      {
                        section.icon
                      }
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color:
                            '#111827',
                        }}
                      >
                        {
                          section.title
                        }
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color:
                            '#999',
                          marginTop: 2,
                        }}
                      >
                        {
                          section
                            .rules
                            .length
                        }{' '}
                        peraturan
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      color:
                        '#666',
                    }}
                  >
                    {isOpen ? (
                      <FiChevronDown size={20} />
                    ) : (
                      <FiChevronRight size={20} />
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                {isOpen && (
                  <div
                    style={{
                      padding:
                        '0 16px 16px 16px',
                    }}
                  >
                    <div className="d-flex flex-column gap-2">
                      {section.rules.map(
                        (
                          rule,
                          i
                        ) => (
                          <div
                            key={i}
                            className="d-flex align-items-start gap-2"
                            style={{
                              background:
                                '#fafafa',
                              border:
                                '1px solid #f3f4f6',
                              borderRadius: 14,
                              padding:
                                '12px 13px',
                            }}
                          >
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius:
                                  '50%',
                                background:
                                  section.color,
                                marginTop: 7,
                                flexShrink: 0,
                              }}
                            />

                            <div
                              style={{
                                fontSize: 13,
                                color:
                                  '#444',
                                lineHeight: 1.6,
                              }}
                            >
                              {
                                rule
                              }
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default PeraturanPage;