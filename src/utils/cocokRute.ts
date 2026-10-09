/**
 * Cocokkan `pathname` dengan daftar pola rute. Pola yang diakhiri '/'
 * dicocokkan sebagai awalan (rute ber-parameter, mis. '/user-detail/' untuk
 * '/user-detail/:id'); selain itu harus sama persis. '/' sendiri selalu
 * dicocokkan persis — kalau tidak, semua rute akan cocok.
 */
export const cocokRute = (pola: string[], pathname: string) =>
  pola.some((r) => (r.endsWith('/') && r !== '/' ? pathname.startsWith(r) : pathname === r));
