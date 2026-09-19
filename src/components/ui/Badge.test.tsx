// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Badge from './Badge';

describe('Badge', () => {
  it('menampilkan labelnya', () => {
    render(<Badge variant="success">Aktif</Badge>);
    expect(screen.getByText('Aktif')).toBeTruthy();
  });

  it('memakai token status, bukan hex literal', () => {
    render(<Badge variant="success">Aktif</Badge>);
    const kelas = screen.getByText('Aktif').className;
    expect(kelas).toContain('bg-success-bg');
    expect(kelas).toContain('text-success-fg');
    expect(kelas).toContain('border-success-line');
  });

  it('varian neutral dipakai kalau tidak disebutkan', () => {
    render(<Badge>Entah</Badge>);
    expect(screen.getByText('Entah').className).toContain('bg-subtle');
  });

  it('punya border — pil tanpa border sulit dibedakan dari latar di tema gelap', () => {
    render(<Badge variant="danger">Resign</Badge>);
    expect(screen.getByText('Resign').className).toContain('border');
  });
});
