import * as Dialog from '@radix-ui/react-dialog';
import { FiX } from 'react-icons/fi';
import type { ReactNode } from 'react';

export type PenyajianOverlay = 'modal' | 'drawer' | 'sheet';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Wajib — dialog tanpa nama tidak bisa dikenali pembaca layar. */
  title: string;
  description?: string;
  penyajian?: PenyajianOverlay;
  footer?: ReactNode;
  children: ReactNode;
};

/*
  Tiga penyajian, satu perilaku. Yang berbeda hanya posisi dan bentuk sudutnya:
  - modal  : tengah layar, untuk konfirmasi & form pendek
  - drawer : menempel kanan, untuk detail/ubah di desktop tanpa kehilangan daftar
  - sheet  : menempel bawah, bentuk yang wajar di mobile
*/
const POSISI: Record<PenyajianOverlay, string> = {
  modal:
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] rounded-xl border',
  drawer: 'right-0 top-0 bottom-0 w-full max-w-lg border-l',
  sheet: 'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-xl border-t',
};

/**
 * Modal / drawer / bottom sheet.
 *
 * Dibangun di atas Radix Dialog karena semua bagian yang sulit sudah benar di
 * sana: focus trap, pengembalian fokus saat ditutup, Escape, penguncian scroll
 * latar, dan atribut role/aria-modal. `ModalWrapper` yang sekarang dipakai
 * aplikasi tidak punya satupun dari itu — modalnya tidak bisa ditutup dengan
 * keyboard dan fokus bisa lolos ke belakangnya.
 *
 * Ini satu-satunya komponen di pustaka yang boleh memakai shadow, karena ini
 * satu-satunya yang benar-benar melayang di atas halaman.
 */
const Overlay = ({
  open,
  onOpenChange,
  title,
  description,
  penyajian = 'modal',
  footer,
  children,
}: Props) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />

      <Dialog.Content
        // Radix mengunci konteks pembaca layar dengan memasang aria-hidden
        // pada saudara di luar dialog, dan tidak memasang aria-modal sendiri.
        // Ditambahkan di sini karena sebagian teknologi bantu masih
        // mengandalkan atribut itu, dan spec memintanya secara eksplisit.
        aria-modal="true"
        className={[
          'fixed z-50 flex flex-col',
          'bg-surface border-line text-fg shadow-2xl',
          'focus-visible:outline-none',
          POSISI[penyajian],
        ].join(' ')}
      >
        <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-line shrink-0">
          <div className="min-w-0">
            <Dialog.Title className="text-base font-semibold text-fg">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="text-xs text-fg-muted mt-0.5">
                {description}
              </Dialog.Description>
            ) : (
              // Radix memperingatkan kalau Description tidak ada. Disembunyikan
              // dari pandangan supaya tidak menambah kebisingan visual.
              <Dialog.Description className="sr-only">{title}</Dialog.Description>
            )}
          </div>

          <Dialog.Close
            aria-label="Tutup"
            className={[
              'inline-flex items-center justify-center shrink-0',
              'size-9 rounded-md text-fg-muted hover:bg-hover hover:text-fg',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              'focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
            ].join(' ')}
          >
            <FiX aria-hidden="true" />
          </Dialog.Close>
        </header>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 px-4 py-3 border-t border-line shrink-0">
            {footer}
          </footer>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default Overlay;
