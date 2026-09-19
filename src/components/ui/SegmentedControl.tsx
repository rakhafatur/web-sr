import * as ToggleGroup from '@radix-ui/react-toggle-group';

export type OpsiSegment<T extends string> = {
  nilai: T;
  label: string;
};

type Props<T extends string> = {
  /** Tidak tampil di layar; dipakai pembaca layar untuk menyebut gunanya. */
  label: string;
  opsi: OpsiSegment<T>[];
  nilai: T;
  onUbah: (nilai: T) => void;
  fullWidth?: boolean;
};

/**
 * Pengalih pilihan tunggal.
 *
 * Menggantikan tiga implementasi terpisah yang sekarang ada: `.segmented-chip`
 * di global.css, pill inline di AddTransaksiPage, dan pill inline di
 * PerformaLadiesPage — ketiganya terlihat berbeda padahal gunanya sama.
 *
 * Radix ToggleGroup dipakai demi roving focus dan navigasi panah kiri/kanan;
 * itu bagian yang paling sering salah kalau ditulis tangan.
 */
function SegmentedControl<T extends string>({
  label,
  opsi,
  nilai,
  onUbah,
  fullWidth = false,
}: Props<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={nilai}
      aria-label={label}
      onValueChange={(berikutnya) => {
        // Radix mengirim string kosong saat opsi aktif diklik ulang. Ini
        // pilihan tunggal wajib, jadi klik itu diabaikan.
        if (berikutnya) onUbah(berikutnya as T);
      }}
      className={[
        'inline-flex items-center gap-0.5 p-0.5',
        'rounded-md border border-line bg-subtle',
        fullWidth ? 'w-full' : '',
      ].join(' ')}
    >
      {opsi.map((item) => (
        <ToggleGroup.Item
          key={item.nilai}
          value={item.nilai}
          className={[
            'inline-flex items-center justify-center whitespace-nowrap',
            'h-9 px-3 text-sm font-medium rounded-sm md:h-8',
            fullWidth ? 'flex-1' : '',
            'text-fg-muted hover:text-fg',
            // Penanda aktif: permukaan terangkat + teks penuh. Tanpa gradient.
            'data-[state=on]:bg-surface data-[state=on]:text-fg',
            'data-[state=on]:border data-[state=on]:border-line',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            'focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
          ].join(' ')}
        >
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export default SegmentedControl;
