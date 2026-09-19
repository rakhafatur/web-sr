// @vitest-environment happy-dom
import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Overlay from './Overlay';

function buka(props: Partial<ComponentProps<typeof Overlay>> = {}) {
  const onOpenChange = vi.fn();
  render(
    <Overlay open onOpenChange={onOpenChange} title="Konfirmasi" {...props}>
      <p>Isi dialog</p>
    </Overlay>,
  );
  return { onOpenChange };
}

describe('Overlay', () => {
  it('tidak merender apa pun saat tertutup', () => {
    render(
      <Overlay open={false} onOpenChange={() => {}} title="Konfirmasi">
        <p>Isi dialog</p>
      </Overlay>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('merender sebagai dialog — ModalWrapper lama tidak punya role ini', () => {
    buka();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('menandai dirinya modal supaya pembaca layar mengunci konteks', () => {
    buka();
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  });

  it('judulnya menamai dialog', () => {
    buka();
    expect(screen.getByRole('dialog', { name: 'Konfirmasi' })).toBeTruthy();
  });

  it('bisa ditutup dengan Escape — ModalWrapper lama tidak bisa', () => {
    const { onOpenChange } = buka();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('punya tombol tutup yang bisa dijangkau pembaca layar', () => {
    buka();
    expect(screen.getByRole('button', { name: 'Tutup' })).toBeTruthy();
  });

  it('menampilkan isinya', () => {
    buka();
    expect(screen.getByText('Isi dialog')).toBeTruthy();
  });

  it('menampilkan footer kalau diberikan', () => {
    buka({ footer: <button>Simpan</button> });
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeTruthy();
  });

  it('deskripsi ikut menerangkan dialog', () => {
    buka({ description: 'Tindakan ini tidak bisa dibatalkan.' });
    const dialog = screen.getByRole('dialog');
    const deskripsi = screen.getByText('Tindakan ini tidak bisa dibatalkan.');
    expect(dialog.getAttribute('aria-describedby')).toBe(deskripsi.id);
  });

  it('penyajian sheet menempel di bawah layar', () => {
    buka({ penyajian: 'sheet' });
    expect(screen.getByRole('dialog').className).toContain('bottom-0');
  });

  it('penyajian drawer menempel di kanan layar', () => {
    buka({ penyajian: 'drawer' });
    expect(screen.getByRole('dialog').className).toContain('right-0');
  });

  it('overlay boleh memakai shadow — satu-satunya tempat yang diizinkan spec', () => {
    buka();
    expect(screen.getByRole('dialog').className).toContain('shadow');
  });
});
