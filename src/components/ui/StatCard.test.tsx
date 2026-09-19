// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('menampilkan label dan nilai', () => {
    render(<StatCard label="Total Ladies" nilai="47" />);
    expect(screen.getByText('Total Ladies')).toBeTruthy();
    expect(screen.getByText('47')).toBeTruthy();
  });

  it('menampilkan catatan kalau ada', () => {
    render(<StatCard label="Aktif" nilai="41" catatan="87% dari total" />);
    expect(screen.getByText('87% dari total')).toBeTruthy();
  });

  it('memakai border, bukan shadow maupun gradient', () => {
    const { container } = render(<StatCard label="Total" nilai="47" />);
    const kelas = container.firstElementChild?.className ?? '';
    expect(kelas).toContain('border');
    expect(kelas).not.toContain('shadow');
    expect(container.innerHTML).not.toContain('gradient');
  });

  it('label memakai ukuran terkecil yang diizinkan, bukan di bawah 12px', () => {
    render(<StatCard label="Total" nilai="47" />);
    expect(screen.getByText('Total').className).toContain('text-xs');
  });
});
