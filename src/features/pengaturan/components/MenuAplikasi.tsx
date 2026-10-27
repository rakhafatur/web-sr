import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FiAlertTriangle } from 'react-icons/fi';

import { supabase } from '../../../lib/supabaseClient';
import Skeleton from '../../../components/Skeleton';
import { KUNCI_PENGATURAN_MENU, usePengaturanMenu, type SaklarMenu } from '../../../hooks/useMenu';
import {
  HALAMAN_ADMIN,
  HALAMAN_LADIES,
  HALAMAN_PENGAWAS,
  SIDEBAR_ADMIN,
  SIDEBAR_LADIES,
  SIDEBAR_PENGAWAS,
  type BagianMenu,
  type Halaman,
  type TataSidebar,
} from '../../../layout/menu';
import { kunciMenu, type Peran } from '../../../layout/saringMenu';

type Grup = { peran: Peran; judul: string; halaman: Record<string, Halaman>; tata: TataSidebar<string> };

// Urutan & pengelompokan mengikuti sidebar desktop, supaya admin mengenali
// letak setiap menu.
const GRUP: Grup[] = [
  { peran: 'admin', judul: 'Menu admin', halaman: HALAMAN_ADMIN, tata: SIDEBAR_ADMIN },
  { peran: 'ladies', judul: 'Menu ladies', halaman: HALAMAN_LADIES, tata: SIDEBAR_LADIES },
  { peran: 'pengawas', judul: 'Menu pengawas', halaman: HALAMAN_PENGAWAS, tata: SIDEBAR_PENGAWAS },
];

const bagianGrup = (g: Grup): BagianMenu<string>[] => [...g.tata.bagian, { items: g.tata.bawah }];

/**
 * Saklar menu aktif/nonaktif (khusus admin). Berlaku untuk SEMUA pengguna,
 * beda dengan Tampilan yang tersimpan per perangkat. Menu yang dimatikan
 * hilang dari sidebar & navbar dan ditolak saat dibuka lewat URL.
 */
const MenuAplikasi = ({ varian }: { varian: 'tm' | 'dk' }) => {
  const queryClient = useQueryClient();
  const { data: saklar = [], isLoading, isError } = usePengaturanMenu();
  // Kunci yang sedang disimpan — saklarnya dikunci sampai selesai.
  const [menyimpan, setMenyimpan] = useState<Set<string>>(() => new Set());

  const nonaktif = new Set(saklar.filter((s) => !s.aktif).map((s) => s.kunci));

  const kunciBaris = (kunci: string, sibuk: boolean) =>
    setMenyimpan((prev) => {
      const baru = new Set(prev);
      if (sibuk) baru.add(kunci);
      else baru.delete(kunci);
      return baru;
    });

  const ubah = async (kunci: string, nama: string, aktif: boolean) => {
    await queryClient.cancelQueries({ queryKey: KUNCI_PENGATURAN_MENU });
    queryClient.setQueryData<SaklarMenu[]>(KUNCI_PENGATURAN_MENU, (old) => [
      ...(old ?? []).filter((s) => s.kunci !== kunci),
      { kunci, aktif },
    ]);

    kunciBaris(kunci, true);
    const { error } = await supabase
      .from('pengaturan_menu')
      .upsert({ kunci, aktif, updated_at: new Date().toISOString() }, { onConflict: 'kunci' });
    kunciBaris(kunci, false);

    if (error) toast.error(`Gagal mengubah menu ${nama}: ${error.message}`);
    else toast.success(aktif ? `Menu ${nama} ditampilkan lagi` : `Menu ${nama} disembunyikan`);

    queryClient.invalidateQueries({ queryKey: KUNCI_PENGATURAN_MENU });
  };

  if (isLoading) {
    return (
      <div role="status" aria-label="Memuat pengaturan menu" className="pg-menu-loading">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} height={52} borderRadius="var(--radius-lg)" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pg-menu-warn" role="alert">
        <FiAlertTriangle aria-hidden />
        <div>
          <strong>Pengaturan menu tidak bisa dimuat.</strong> Kalau fitur ini baru dipasang, tabelnya mungkin
          belum ada di Supabase — jalankan <code>supabase/sql/e2-pengaturan-menu.sql</code> di SQL Editor, lalu
          muat ulang halaman ini. Sementara itu semua menu tetap tampil seperti biasa.
        </div>
      </div>
    );
  }

  const jumlahMati = GRUP.reduce(
    (n, g) => n + Object.keys(g.halaman).filter((id) => nonaktif.has(kunciMenu(g.peran, id))).length,
    0
  );

  return (
    <>
      <div className={`pg-menu-ringkas ${jumlahMati > 0 ? 'is-ada' : ''}`} role="status">
        {jumlahMati > 0 ? `${jumlahMati} menu sedang disembunyikan` : 'Semua menu sedang tampil'}
      </div>

      <div className={`pg-menu-grid pg-menu-grid--${varian}`}>
        {GRUP.map((g) => (
          <section key={g.peran} className="pg-menu-kolom" aria-labelledby={`pg-menu-${g.peran}`}>
            <h3 className="pg-menu-judul" id={`pg-menu-${g.peran}`}>
              {g.judul}
            </h3>

            {bagianGrup(g).map((b, bi) => (
              <div key={bi} className="pg-menu-bagian">
                {b.judul && <div className="pg-menu-subjudul">{b.judul}</div>}
                <ul className="pg-menu-list">
                  {b.items.map((id) => {
                    const h = g.halaman[id];
                    const kunci = kunciMenu(g.peran, id);
                    const nama = h.namaLengkap ?? h.label;
                    const terkunci = !!h.selaluAktif;
                    const aktif = terkunci || !nonaktif.has(kunci);
                    const labelId = `pg-menu-${kunci.replace('.', '-')}`;

                    return (
                      <li key={id} className={`pg-menu-row ${aktif ? '' : 'is-off'}`}>
                        <span className="pg-menu-icon" aria-hidden>
                          {h.ikon}
                        </span>
                        <span className="pg-menu-text">
                          <span className="pg-menu-label" id={labelId}>
                            {nama}
                          </span>
                          <span className="pg-menu-sub">
                            {terkunci ? 'Selalu aktif' : aktif ? h.rute : 'Disembunyikan dari semua pengguna'}
                          </span>
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={aktif}
                          aria-labelledby={labelId}
                          className={varian === 'tm' ? 'tm-switch' : 'dk-switch'}
                          disabled={terkunci || menyimpan.has(kunci)}
                          title={terkunci ? 'Menu ini tidak bisa dinonaktifkan' : undefined}
                          onClick={() => ubah(kunci, nama, !aktif)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
};

export default MenuAplikasi;
