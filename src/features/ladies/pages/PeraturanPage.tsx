import { useState } from 'react';
import './PeraturanPage.css';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

type RuleSection = {
  title: string;
  rules: string[];
};

const ruleSections: RuleSection[] = [
  {
    title: 'Umum',
    rules: [
      'Wajib absen setiap hari hadir.',
      'Jam kerja dimulai pukul 19:00 WIB.',
      'Tidak boleh menerima tamu pribadi saat jam kerja.',
    ],
  },
  {
    title: 'Kasbon',
    rules: [
      'Kasbon maksimal Rp 1.000.000 per minggu.',
      'Kasbon hanya diberikan kepada ladies aktif.',
      'Permintaan kasbon harus melalui pengawas.',
    ],
  },
  {
    title: 'Penampilan',
    rules: [
      'Makeup rapi dan sesuai standar outlet.',
      'Berpakaian sesuai dress code yang ditentukan.',
    ],
  },
  {
    title: 'Voucher',
    rules: [
      'Voucher dihitung berdasarkan kehadiran dan performa.',
      'Voucher dibayarkan mingguan atau bulanan sesuai kesepakatan.',
    ],
  },
];

const PeraturanPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="peraturan-page">
      <h2 className="peraturan-title">📖 Peraturan SR Agency</h2>

      <div className="rule-list">
        {ruleSections.map((section, index) => (
          <div key={index} className={`rule-card ${openIndex === index ? 'open' : ''}`}>
            <div className="rule-header" onClick={() => toggleIndex(index)}>
              <span>{section.title}</span>
              {openIndex === index ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {openIndex === index && (
              <ul className="rule-content">
                {section.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeraturanPage;