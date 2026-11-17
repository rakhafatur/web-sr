/** Sapaan menurut jam setempat (0–23): pagi, siang, sore, malam. */
export const sapaanWaktu = (jam: number): string => {
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
};
