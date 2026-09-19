// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('menampilkan judul dan deskripsi', () => {
    render(
      <EmptyState
        icon={<svg data-testid="ikon" />}
        title="Belum ada transaksi"
        description="Tambahkan transaksi pertama."
      />,
    );
    expect(screen.getByText('Belum ada transaksi')).toBeTruthy();
    expect(screen.getByText('Tambahkan transaksi pertama.')).toBeTruthy();
  });

  it('menerima ikon sebagai elemen, bukan emoji', () => {
    render(<EmptyState icon={<svg data-testid="ikon" />} title="Kosong" />);
    expect(screen.getByTestId('ikon')).toBeTruthy();
  });

  it('menampilkan slot aksi kalau diberikan', () => {
    render(
      <EmptyState icon={<svg />} title="Kosong" action={<button>Tambah data</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Tambah data' })).toBeTruthy();
  });

  it('deskripsi boleh kosong', () => {
    render(<EmptyState icon={<svg />} title="Kosong" />);
    expect(screen.getByText('Kosong')).toBeTruthy();
  });
});
