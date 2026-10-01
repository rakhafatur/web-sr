import { ReactNode } from 'react';
import LadiesPageBar from './LadiesPageBar';
import './LedgerPageMobile.css';
import './PeraturanMobile.css';

type Bagian = {
  title: string;
  icon: ReactNode;
  rules: string[];
};

/**
 * Peraturan versi mobile — selaras dengan halaman ladies lain. Isinya pendek,
 * jadi semua bagian langsung terbuka (tanpa akordeon) dan aturan diberi nomor
 * supaya mudah dirujuk ("aturan Absen nomor 2").
 */
const PeraturanMobile = ({ sections }: { sections: Bagian[] }) => (
  <div className="lp">
    <LadiesPageBar title="Peraturan" />

    <p className="pr-intro">
      Baca peraturan berikut agar aktivitas kerja berjalan nyaman dan lancar.
    </p>

    <div className="lp-stack">
      {sections.map((section) => (
        <section key={section.title} className="lp-group pr-section" aria-label={section.title}>
          <div className="pr-head">
            <span className="pr-icon" aria-hidden>{section.icon}</span>
            <h2 className="pr-title">{section.title}</h2>
            <span className="pr-count">{section.rules.length} aturan</span>
          </div>

          <ol className="pr-list">
            {section.rules.map((rule, i) => (
              <li key={i} className="pr-item">
                <span className="pr-num" aria-hidden>{i + 1}</span>
                <span className="pr-text">{rule}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  </div>
);

export default PeraturanMobile;
