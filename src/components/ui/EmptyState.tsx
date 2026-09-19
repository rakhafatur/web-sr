import type { ReactNode } from 'react';

type Props = {
  /** Ikon Feather (`react-icons/fi`), bukan emoji — emoji dirender berbeda di
      tiap sistem operasi dan terbaca informal. */
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Keadaan kosong. Selalu sertakan `action` kalau memang ada yang bisa
    dilakukan pengguna — layar kosong tanpa jalan keluar itu jalan buntu. */
const EmptyState = ({ icon, title, description, action }: Props) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-12">
    <div
      className="flex items-center justify-center size-11 rounded-lg bg-subtle text-fg-faint mb-3 [&>svg]:size-5"
      aria-hidden="true"
    >
      {icon}
    </div>

    <h3 className="text-base font-semibold text-fg">{title}</h3>

    {description && <p className="text-sm text-fg-muted mt-1 max-w-xs">{description}</p>}

    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
