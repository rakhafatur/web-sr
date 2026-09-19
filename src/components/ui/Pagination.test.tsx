// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('menyebut rentang dan total, bukan sekadar "1/5"', () => {
    render(
      <Pagination halaman={1} totalHalaman={5} totalData={47} perHalaman={10} onUbah={() => {}} />,
    );
    expect(screen.getByText(/1–10 dari 47/)).toBeTruthy();
  });

  it('rentang halaman terakhir berhenti di jumlah data sebenarnya', () => {
    render(
      <Pagination halaman={5} totalHalaman={5} totalData={47} perHalaman={10} onUbah={() => {}} />,
    );
    expect(screen.getByText(/41–47 dari 47/)).toBeTruthy();
  });

  it('jatuh ke "Halaman x dari y" kalau total data tidak diketahui', () => {
    render(<Pagination halaman={2} totalHalaman={5} onUbah={() => {}} />);
    expect(screen.getByText(/Halaman 2 dari 5/)).toBeTruthy();
  });

  it('tombol sebelumnya mati di halaman pertama', () => {
    render(<Pagination halaman={1} totalHalaman={5} onUbah={() => {}} />);
    const tombol = screen.getByRole('button', {
      name: 'Halaman sebelumnya',
    }) as HTMLButtonElement;
    expect(tombol.disabled).toBe(true);
  });

  it('tombol berikutnya mati di halaman terakhir', () => {
    render(<Pagination halaman={5} totalHalaman={5} onUbah={() => {}} />);
    const tombol = screen.getByRole('button', {
      name: 'Halaman berikutnya',
    }) as HTMLButtonElement;
    expect(tombol.disabled).toBe(true);
  });

  it('meneruskan nomor halaman berikutnya', () => {
    const onUbah = vi.fn();
    render(<Pagination halaman={2} totalHalaman={5} onUbah={onUbah} />);
    screen.getByRole('button', { name: 'Halaman berikutnya' }).click();
    expect(onUbah).toHaveBeenCalledWith(3);
  });

  it('meneruskan nomor halaman sebelumnya', () => {
    const onUbah = vi.fn();
    render(<Pagination halaman={2} totalHalaman={5} onUbah={onUbah} />);
    screen.getByRole('button', { name: 'Halaman sebelumnya' }).click();
    expect(onUbah).toHaveBeenCalledWith(1);
  });
});
