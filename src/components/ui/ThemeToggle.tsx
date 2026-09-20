import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import type { ThemePreference } from '../../lib/theme';
import Button from './Button';
import SegmentedControl from './SegmentedControl';

const OPSI: { nilai: ThemePreference; label: string }[] = [
  { nilai: 'light', label: 'Terang' },
  { nilai: 'dark', label: 'Gelap' },
  { nilai: 'system', label: 'Sistem' },
];

type Props = {
  /** Bentuk satu tombol untuk ruang sempit, mis. sidebar mode rail.
      Sengaja hanya membalik terang/gelap: pilihan "ikut sistem" butuh tiga
      keadaan dan tidak bisa dijelaskan lewat satu tombol. */
  ringkas?: boolean;
};

const ThemeToggle = ({ ringkas = false }: Props) => {
  const { preference, theme, setPreference } = useTheme();

  if (ringkas) {
    const berikutnya: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Ganti ke tema ${berikutnya === 'dark' ? 'gelap' : 'terang'}`}
        onClick={() => setPreference(berikutnya)}
      >
        {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
      </Button>
    );
  }

  return (
    <SegmentedControl
      label="Tema tampilan"
      fullWidth
      opsi={OPSI}
      nilai={preference}
      onUbah={setPreference}
    />
  );
};

export default ThemeToggle;
