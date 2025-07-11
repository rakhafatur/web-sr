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
      'Wajib kerja minimal 18 hari dalam sebulan.',
    ],
  },
  {
    title: 'Absen',
    rules: [
      'Wajib melakukan absensi setiap hari melalui polling yang dibagikan di grup WhatsApp.',
      'Pengisian polling absensi paling lambat pukul 15.00, kecuali jika sedang piket.',
      'Permohonan izin off harus disampaikan kepada pengawas sebelum jam absen berakhir.',
    ],
  },
  {
    title: 'Voucher',
    rules: [
        'Voucher direkap secara harian.',
        'Pembayaran voucher dilakukan secara mingguan atau bulanan, sesuai kesepakatan.',
        'Apabila jumlah kasbon melebihi total voucher yang diperoleh, maka voucher akan otomatis digunakan untuk mengurangi kasbon.',
    ],
  },
  {
    title: 'Kasbon',
    rules: [
      'Jumlah kasbon disesuaikan dengan total voucher yang diterima setiap bulan.',
      'Permintaan kasbon dapat diajukan melalui pesan pribadi (personal chat).',
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