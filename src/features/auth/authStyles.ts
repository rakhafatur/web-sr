import type { CSSProperties } from 'react';

/** Tombol submit Login & SignUp (mobile): pil bergradien aksen dengan pendar.
    Kilau yang menyapu tombol ada di auth.css (`.auth-m-submit-gap .btn`). */
export const AUTH_SUBMIT_STYLE: CSSProperties = {
  height: 54,
  borderRadius: 'var(--radius-full)',
  background: 'var(--grad-hero-brand)',
  boxShadow: 'var(--glow-brand)',
  fontWeight: 600,
  fontSize: 'var(--font-size-base)',
};
