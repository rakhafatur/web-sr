// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Field from './Field';
import Input from './Input';

describe('Field', () => {
  it('mengaitkan label ke kontrol di dalamnya', () => {
    render(
      <Field label="Nama Ladies">
        <Input />
      </Field>,
    );
    // getByLabelText hanya berhasil kalau htmlFor dan id benar-benar cocok.
    expect(screen.getByLabelText('Nama Ladies')).toBeTruthy();
  });

  it('menandai field wajib untuk yang melihat dan yang memakai pembaca layar', () => {
    render(
      <Field label="PIN" required>
        <Input />
      </Field>,
    );
    expect(screen.getByText('*')).toBeTruthy();
    expect(screen.getByText('(wajib diisi)')).toBeTruthy();
  });

  it('menampilkan teks bantuan dan mengaitkannya lewat aria-describedby', () => {
    render(
      <Field label="Nominal" helper="Tanpa titik atau koma">
        <Input />
      </Field>,
    );
    const kontrol = screen.getByLabelText('Nominal');
    const bantuan = screen.getByText('Tanpa titik atau koma');
    expect(kontrol.getAttribute('aria-describedby')).toBe(bantuan.id);
  });

  it('pesan galat menggantikan teks bantuan', () => {
    render(
      <Field label="Nominal" helper="Tanpa titik" error="Wajib diisi">
        <Input />
      </Field>,
    );
    expect(screen.getByText('Wajib diisi')).toBeTruthy();
    expect(screen.queryByText('Tanpa titik')).toBeNull();
  });

  it('galat menyalakan aria-invalid pada kontrolnya', () => {
    render(
      <Field label="Nominal" error="Wajib diisi">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText('Nominal').getAttribute('aria-invalid')).toBe('true');
  });

  it('galat diumumkan sebagai peringatan langsung', () => {
    render(
      <Field label="Nominal" error="Wajib diisi">
        <Input />
      </Field>,
    );
    expect(screen.getByRole('alert').textContent).toBe('Wajib diisi');
  });
});
