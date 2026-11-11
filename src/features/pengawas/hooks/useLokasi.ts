import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ringkasAlamat, type AlamatOsm } from '../utils/stempelFoto';

export type Koordinat = { lat: number; lon: number; akurasi: number; diambil: number };

export type StatusLokasi = 'mencari' | 'ok' | 'ditolak' | 'gagal' | 'tidak-didukung';

const OPSI_GPS: PositionOptions = { enableHighAccuracy: true, timeout: 20_000, maximumAge: 15_000 };

/**
 * Nama tempat dari OpenStreetMap (Nominatim). Koordinat dikirim ke layanan
 * luar ini — tidak ada data lain yang ikut. Gagal = null, stempel lalu
 * memakai koordinat sebagai cadangan.
 */
const ambilAlamat = async (lat: number, lon: number, signal?: AbortSignal) => {
  const url =
    'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1' +
    `&accept-language=id&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const json = (await res.json()) as { address?: AlamatOsm };
  return ringkasAlamat(json.address);
};

/**
 * Lokasi HP untuk stempel foto: satu kali ambil GPS saat dibuka, bisa
 * diulang lewat `perbarui()`. Sengaja bukan watchPosition — tiap pergeseran
 * kecil akan memicu permintaan baru ke Nominatim (batasnya 1/detik).
 */
export const useLokasi = () => {
  const didukung = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  const [status, setStatus] = useState<StatusLokasi>(didukung ? 'mencari' : 'tidak-didukung');
  const [koordinat, setKoordinat] = useState<Koordinat | null>(null);

  const perbarui = useCallback(() => {
    if (!didukung) return;
    setStatus('mencari');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setKoordinat({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          akurasi: p.coords.accuracy,
          diambil: Date.now(),
        });
        setStatus('ok');
      },
      (e) => setStatus(e.code === e.PERMISSION_DENIED ? 'ditolak' : 'gagal'),
      OPSI_GPS
    );
  }, [didukung]);

  useEffect(() => {
    perbarui();
  }, [perbarui]);

  // Dibulatkan ke 5 desimal (~1 m) supaya kunci cache stabil.
  const lat = koordinat ? Number(koordinat.lat.toFixed(5)) : null;
  const lon = koordinat ? Number(koordinat.lon.toFixed(5)) : null;

  const alamatQuery = useQuery({
    queryKey: ['alamat-osm', lat, lon],
    queryFn: ({ signal }) => ambilAlamat(lat!, lon!, signal),
    enabled: lat !== null && lon !== null,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
    // Gagal mengambil nama tempat bukan kesalahan halaman — cadangannya
    // koordinat, jadi tanpa toast.
    meta: { senyap: true },
  });

  return {
    status,
    koordinat,
    alamat: alamatQuery.data ?? null,
    alamatMemuat: alamatQuery.isFetching,
    perbarui,
  };
};
