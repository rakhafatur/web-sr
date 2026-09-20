// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

function pasang(props: { ringkas?: boolean } = {}) {
  render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>,
  );
}

// ThemeProvider menulis ke <html> sungguhan dan menyimpan pilihan di
// localStorage, jadi keadaannya bocor antar test kalau tidak dibersihkan.
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeToggle', () => {
  it('menawarkan tiga pilihan dalam bentuk penuh', () => {
    pasang();
    expect(screen.getByLabelText('Tema tampilan')).toBeTruthy();
    expect(screen.getByText('Terang')).toBeTruthy();
    expect(screen.getByText('Gelap')).toBeTruthy();
    expect(screen.getByText('Sistem')).toBeTruthy();
  });

  it('mengubah tema saat pilihan diklik', () => {
    pasang();
    // fireEvent, bukan .click() langsung: pembaruan state React baru dibilas
    // di dalam act(), dan atribut pada <html> ditulis oleh efek.
    fireEvent.click(screen.getByText('Gelap'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('bentuk ringkas hanya satu tombol', () => {
    pasang({ ringkas: true });
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('bentuk ringkas menjelaskan aksinya ke pembaca layar', () => {
    pasang({ ringkas: true });
    const tombol = screen.getByRole('button');
    expect(tombol.getAttribute('aria-label')).toMatch(/tema/i);
  });

  it('bentuk ringkas membalik tema saat diklik', () => {
    pasang({ ringkas: true });
    const sebelum = document.documentElement.getAttribute('data-theme');
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(sebelum);
  });
});
