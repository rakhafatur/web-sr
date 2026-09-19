// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('menampilkan labelnya', () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeTruthy();
  });

  it('bertipe button secara bawaan, supaya tidak mengirim form tanpa sengaja', () => {
    render(<Button>Batal</Button>);
    const tombol = screen.getByRole('button') as HTMLButtonElement;
    expect(tombol.type).toBe('button');
  });

  it('meneruskan onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('saat loading: tombol nonaktif dan klik tidak diteruskan', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Simpan
      </Button>,
    );
    const tombol = screen.getByRole('button') as HTMLButtonElement;
    expect(tombol.disabled).toBe(true);
    tombol.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('saat loading: label tetap terlihat supaya lebar tombol tidak melompat', () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByRole('button').textContent).toContain('Simpan');
  });

  it('saat loading: mengumumkan kesibukan ke pembaca layar', () => {
    render(<Button loading>Simpan</Button>);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('disabled biasa juga tidak meneruskan klik', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Simpan
      </Button>,
    );
    screen.getByRole('button').click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('punya cincin fokus yang terlihat — nol :focus-visible adalah temuan audit', () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole('button').className).toContain('focus-visible:ring-2');
  });

  it('tidak memakai bobot huruf 700/800 yang dilarang spec', () => {
    render(<Button variant="primary">Simpan</Button>);
    const kelas = screen.getByRole('button').className;
    expect(kelas).not.toContain('font-bold');
    expect(kelas).not.toContain('font-extrabold');
  });

  it('tidak memakai gradient', () => {
    render(<Button variant="primary">Simpan</Button>);
    expect(screen.getByRole('button').className).not.toContain('gradient');
  });
});
