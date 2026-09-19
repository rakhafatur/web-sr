// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Money from './Money';

describe('Money', () => {
  it('menampilkan Rp dan digit berpemisah titik', () => {
    render(<Money value={2700000} />);
    expect(screen.getByText('Rp')).toBeTruthy();
    expect(screen.getByText('2.700.000')).toBeTruthy();
  });

  it('memakai angka tabular supaya digit sejajar antar baris', () => {
    const { container } = render(<Money value={1000} />);
    expect(container.firstElementChild?.className).toContain('tabular');
  });

  it('meredupkan awalan Rp supaya digitnya yang terbaca lebih dulu', () => {
    render(<Money value={1000} />);
    expect(screen.getByText('Rp').className).toContain('text-fg-faint');
  });

  it('uang masuk memakai warna money-in', () => {
    const { container } = render(<Money value={450000} arah="masuk" />);
    expect(container.firstElementChild?.className).toContain('text-money-in');
  });

  it('uang keluar memakai warna money-out', () => {
    const { container } = render(<Money value={200000} arah="keluar" />);
    expect(container.firstElementChild?.className).toContain('text-money-out');
  });

  it('tanda +/- ditampilkan kalau diminta — warna saja tidak cukup untuk buta warna', () => {
    render(<Money value={450000} arah="masuk" tampilkanTanda />);
    expect(screen.getByText(/\+/)).toBeTruthy();
  });

  it('memakai minus tipografis, bukan tanda hubung', () => {
    const { container } = render(<Money value={200000} arah="keluar" tampilkanTanda />);
    expect(container.textContent).toContain('−');
    expect(container.textContent).not.toContain('-Rp');
  });

  it('memberi label utuh untuk pembaca layar', () => {
    const { container } = render(<Money value={2700000} />);
    expect(container.firstElementChild?.getAttribute('aria-label')).toBe('Rp 2.700.000');
  });

  it('ukuran display dipakai untuk nominal utama Home Ladies', () => {
    const { container } = render(<Money value={2700000} ukuran="display" />);
    expect(container.firstElementChild?.className).toContain('text-display');
  });
});
