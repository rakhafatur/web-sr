// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SegmentedControl from './SegmentedControl';

const OPSI = [
  { nilai: 'harian', label: 'Harian' },
  { nilai: 'bulanan', label: 'Bulanan' },
] as const;

describe('SegmentedControl', () => {
  it('menampilkan semua opsi', () => {
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(screen.getByText('Harian')).toBeTruthy();
    expect(screen.getByText('Bulanan')).toBeTruthy();
  });

  it('menandai opsi terpilih lewat data-state — itu yang dibaca CSS-nya', () => {
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(screen.getByText('Harian').getAttribute('data-state')).toBe('on');
    expect(screen.getByText('Bulanan').getAttribute('data-state')).toBe('off');
  });

  it('keadaan terpilih juga terbaca pembaca layar', () => {
    render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    const aktif = screen.getByText('Harian');
    // Radix memakai aria-pressed (tombol toggle) atau aria-checked (radio),
    // tergantung versinya. Yang penting keadaannya diumumkan, bukan caranya.
    const diumumkan =
      aktif.getAttribute('aria-pressed') ?? aktif.getAttribute('aria-checked');
    expect(diumumkan).toBe('true');
  });

  it('memanggil onUbah dengan nilai opsi yang diklik', () => {
    const onUbah = vi.fn();
    render(<SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={onUbah} />);
    screen.getByText('Bulanan').click();
    expect(onUbah).toHaveBeenCalledWith('bulanan');
  });

  it('mengklik opsi yang sudah aktif tidak mengosongkan pilihan', () => {
    const onUbah = vi.fn();
    render(<SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={onUbah} />);
    screen.getByText('Harian').click();
    expect(onUbah).not.toHaveBeenCalled();
  });

  it('punya label untuk pembaca layar', () => {
    render(
      <SegmentedControl
        label="Mode tampilan"
        opsi={[...OPSI]}
        nilai="harian"
        onUbah={() => {}}
      />,
    );
    expect(screen.getByLabelText('Mode tampilan')).toBeTruthy();
  });

  it('tidak memakai gradient — versi lama memakainya untuk chip aktif', () => {
    const { container } = render(
      <SegmentedControl label="Mode" opsi={[...OPSI]} nilai="harian" onUbah={() => {}} />,
    );
    expect(container.innerHTML).not.toContain('gradient');
  });
});
