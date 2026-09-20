// @vitest-environment happy-dom
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import { NAV_ADMIN } from '../../layout/navItems';
import Sidebar from './Sidebar';

function pasang(pathname: string, props: Partial<ComponentProps<typeof Sidebar>> = {}) {
  const onLogout = vi.fn();
  const onToggleCollapse = vi.fn();
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <ThemeProvider>
        <Sidebar
          grup={NAV_ADMIN}
          collapsed={false}
          onToggleCollapse={onToggleCollapse}
          namaUser="Rakha"
          peran="Admin"
          onLogout={onLogout}
          {...props}
        />
      </ThemeProvider>
    </MemoryRouter>,
  );
  return { onLogout, onToggleCollapse };
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('Sidebar', () => {
  it('menampilkan seluruh item menu tanpa perlu dibuka dulu', () => {
    pasang('/');
    // Accordion lama menyembunyikan ini sampai grupnya diklik.
    expect(screen.getByRole('link', { name: /Buku Kuning$/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Outlet/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Rekap Voucher/ })).toBeTruthy();
  });

  it('menampilkan label grup', () => {
    pasang('/');
    expect(screen.getByText('Keuangan')).toBeTruthy();
    expect(screen.getByText('Master Data')).toBeTruthy();
  });

  it('menandai item aktif lewat aria-current', () => {
    pasang('/rekap-voucher');
    const aktif = screen.getByRole('link', { name: /Rekap Voucher/ });
    expect(aktif.getAttribute('aria-current')).toBe('page');
  });

  it('halaman detail tetap menyalakan item induknya', () => {
    pasang('/ladies-detail/abc');
    // Nama persis, bukan regex: menu juga punya "Transaksi Ladies" dan
    // "Performa Ladies", jadi /Ladies/ akan cocok dengan tiga tautan.
    expect(screen.getByRole('link', { name: 'Ladies' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('hanya satu item yang aktif', () => {
    pasang('/buku-kuning-pengawas');
    const aktif = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page');
    expect(aktif).toHaveLength(1);
  });

  it('menampilkan nama dan peran pengguna', () => {
    pasang('/');
    expect(screen.getByText('Rakha')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
  });

  it('tombol keluar memanggil onLogout', () => {
    const { onLogout } = pasang('/');
    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('tombol ciutkan memanggil onToggleCollapse', () => {
    const { onToggleCollapse } = pasang('/');
    fireEvent.click(screen.getByRole('button', { name: /Ciutkan/ }));
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('mode rail menyembunyikan teks tapi item tetap bisa dijangkau', () => {
    pasang('/', { collapsed: true });
    // Label grup hilang, tapi tautannya tetap ada dan tetap bernama.
    expect(screen.queryByText('Master Data')).toBeNull();
    expect(screen.getByRole('link', { name: /Outlet/ })).toBeTruthy();
  });

  it('tidak memakai gradient maupun shadow', () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <Sidebar
            grup={NAV_ADMIN}
            collapsed={false}
            onToggleCollapse={() => {}}
            namaUser="Rakha"
            peran="Admin"
            onLogout={() => {}}
          />
        </ThemeProvider>
      </MemoryRouter>,
    );
    expect(container.innerHTML).not.toContain('gradient');
    expect(container.innerHTML).not.toContain('shadow-');
  });
});
