// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SectionCard from './SectionCard';

describe('SectionCard', () => {
  it('menampilkan isinya', () => {
    render(<SectionCard>Isi kartu</SectionCard>);
    expect(screen.getByText('Isi kartu')).toBeTruthy();
  });

  it('menampilkan judul sebagai heading supaya struktur halaman terbaca', () => {
    render(<SectionCard title="Riwayat Transaksi">Isi</SectionCard>);
    expect(screen.getByRole('heading', { name: 'Riwayat Transaksi' })).toBeTruthy();
  });

  it('tidak merender area header kalau tidak ada judul maupun aksi', () => {
    const { container } = render(<SectionCard>Isi</SectionCard>);
    expect(container.querySelector('header')).toBeNull();
  });

  it('merender header kalau hanya ada aksi tanpa judul', () => {
    const { container } = render(
      <SectionCard actions={<button>Ekspor</button>}>Isi</SectionCard>,
    );
    expect(container.querySelector('header')).not.toBeNull();
  });

  it('memakai border, bukan shadow — shadow hanya untuk overlay', () => {
    const { container } = render(<SectionCard>Isi</SectionCard>);
    const kelas = container.firstElementChild?.className ?? '';
    expect(kelas).toContain('border');
    expect(kelas).not.toContain('shadow');
  });

  it('tidak memakai gradient — band gradient adalah pola lama yang diganti', () => {
    const { container } = render(<SectionCard title="Judul">Isi</SectionCard>);
    expect(container.innerHTML).not.toContain('gradient');
  });
});
