// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Input from './Input';

describe('Input', () => {
  it('bertipe text secara bawaan', () => {
    render(<Input aria-label="Cari" />);
    expect((screen.getByLabelText('Cari') as HTMLInputElement).type).toBe('text');
  });

  it('meneruskan onChange', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Cari" onChange={onChange} />);
    // fireEvent.change, bukan menyetel .value lalu dispatch Event manual:
    // React melacak nilai lewat setter-nya sendiri, jadi perubahan yang
    // ditulis langsung ke properti tidak pernah terbaca sebagai onChange.
    fireEvent.change(screen.getByLabelText('Cari'), { target: { value: 'sisi' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('input tanggal memakai gaya yang sama dengan input teks', () => {
    const { rerender, container } = render(<Input aria-label="A" type="text" />);
    const kelasTeks = container.querySelector('input')?.className;
    rerender(<Input aria-label="A" type="date" />);
    expect(container.querySelector('input')?.className).toBe(kelasTeks);
  });

  it('berukuran 16px di mobile supaya Safari iOS tidak men-zoom halaman', () => {
    render(<Input aria-label="Cari" />);
    expect(screen.getByLabelText('Cari').className).toContain('text-md');
  });

  it('setinggi 44px di mobile — target sentuh minimum', () => {
    render(<Input aria-label="Cari" />);
    expect(screen.getByLabelText('Cari').className).toContain('h-11');
  });

  it('punya cincin fokus yang terlihat', () => {
    render(<Input aria-label="Cari" />);
    expect(screen.getByLabelText('Cari').className).toContain('focus-visible:ring-2');
  });

  it('state invalid memakai warna danger, bukan biru brand', () => {
    render(<Input aria-label="Cari" invalid />);
    const kelas = screen.getByLabelText('Cari').className;
    expect(kelas).toContain('border-danger-strong');
    expect(kelas).not.toContain('border-line-strong');
  });

  it('multiline merender textarea, bukan input', () => {
    const { container } = render(<Input aria-label="Catatan" multiline />);
    expect(container.querySelector('textarea')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });
});
