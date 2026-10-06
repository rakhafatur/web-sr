import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { supabase } from '../../../lib/supabaseClient';
import Button from '../../../components/Button';
import DesktopField from '../../../components/desktop/DesktopField';
import { useOutletPricing } from '../hooks/useOutletPricing';
import { validasiWajib } from '../../../utils/validasiForm';
import {
  pilihTier,
  perluPilihTier,
  hitungJumlahVoucher,
  hitungUntungVoucher,
  labelVoucher,
} from '../utils/pilihTier';
import {
  FiGift,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiPlus,
  FiCalendar,
  FiEdit3,
} from 'react-icons/fi';
import '../../../styles/mobile-admin.css';
import '../../../styles/desktop-admin.css';

/** Tombol simpan versi mobile: pil solid tanpa gradien (selaras layar lain). */
const TOMBOL_PIL: React.CSSProperties = {
  height: 52,
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-primary)',
  boxShadow: 'none',
  fontWeight: 600,
};

type Props = {
  ladiesId: string;
  outlet: string;
};

const TIPE_LABELS: Record<string, string> = {
  voucher: 'Voucher',
  pemasukan_lain: 'Pemasukan Lain',
  kasbon: 'Kasbon',
  dokter: 'Dokter',
};

const TIPE_PRIORITY: Record<string, number> = {
  voucher: 1,
  pemasukan_lain: 2,
  kasbon: 3,
  dokter: 4,
};

type RiwayatRow = {
  id: string;
  tanggal: string;
  tipe: string;
  tipeLabel: string;
  jumlah: number;
  keterangan: string;
  priority: number;
};

type TransaksiPayload = {
  tanggal: string;
  ladies_id: string;
  jumlah: number;
  jumlah_voucher?: number;
  keterangan?: string;
  outlet?: string;
  untung?: number;
};

const TransaksiForm = ({
  ladiesId,
  outlet,
}: Props) => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const queryClient = useQueryClient();
  const riwayatKey = ['riwayat-transaksi', ladiesId];

  const { data: tiers = [], isLoading: pricingLoading } =
    useOutletPricing(outlet);

  const [selectedTierName, setSelectedTierName] = useState<
    string | null
  >(null);

  const activeTier = pilihTier(tiers, selectedTierName);

  const [form, setForm] = useState({
    tanggal: '',
    jumlah: '',
    jumlah_voucher: '',
    keterangan: '',
    tipe: 'voucher',
  });

  const [fieldSalah, setFieldSalah] = useState<string | null>(null);

  const formatNumber = (
    value: string
  ) => {
    const number = value.replace(
      /[^\d]/g,
      ''
    );

    return number.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      '.'
    );
  };

  const unformatNumber = (
    value: string
  ) => {
    return value.replace(/\./g, '');
  };

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Sorotan hilang begitu field-nya disentuh — kalau tidak, garis merah
    // tetap tertinggal padahal user sudah memperbaikinya.
    setFieldSalah((prev) => (prev === name ? null : prev));

    if (
      name === 'jumlah' ||
      name === 'jumlah_voucher'
    ) {
      const raw =
        unformatNumber(value);

      setForm((prev) => ({
        ...prev,
        [name]: formatNumber(raw),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const mutation = useMutation({
    mutationFn: async ({ table, payload }: { table: string; payload: TransaksiPayload }) => {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    },
    onMutate: async ({ table, payload }) => {
      await queryClient.cancelQueries({ queryKey: riwayatKey });

      const previous = queryClient.getQueryData<RiwayatRow[]>(riwayatKey);

      const optimisticRow: RiwayatRow = {
        id: `temp-${Date.now()}`,
        tanggal: payload.tanggal,
        tipe: form.tipe,
        tipeLabel: TIPE_LABELS[form.tipe],
        jumlah: payload.jumlah,
        keterangan: payload.keterangan ?? '',
        priority: TIPE_PRIORITY[form.tipe],
      };

      queryClient.setQueryData<RiwayatRow[]>(riwayatKey, (old = []) => [
        optimisticRow,
        ...old,
      ]);

      return { previous, table };
    },
    onError: (error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(riwayatKey, context.previous);
      }

      toast.error(
        'Gagal menambahkan transaksi: ' +
          (error instanceof Error ? error.message : '')
      );
    },
    onSuccess: () => {
      toast.success('Transaksi berhasil ditambahkan!');

      setForm({
        tanggal: '',
        jumlah: '',
        jumlah_voucher: '',
        keterangan: '',
        tipe: 'voucher',
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: riwayatKey });
      queryClient.invalidateQueries({ queryKey: ['ledger', variables.table, ladiesId] });
      queryClient.invalidateQueries({ queryKey: ['home-ladies', ladiesId] });
    },
  });

  const handleSubmit = () => {
    // Voucher mengisi `jumlah_voucher`, tipe lain mengisi `jumlah` — jadi
    // field nominalnya bergantung tipe transaksi yang sedang dipilih.
    const error = validasiWajib([
      { label: 'Tanggal', value: form.tanggal, name: 'tanggal' },
      {
        label: form.tipe === 'voucher' ? 'Jumlah voucher' : 'Jumlah',
        value: form.tipe === 'voucher' ? form.jumlah_voucher : form.jumlah,
        name: form.tipe === 'voucher' ? 'jumlah_voucher' : 'jumlah',
      },
    ]);

    if (error) {
      setFieldSalah(error.nama);
      toast.error(error.pesan);
      return;
    }

    setFieldSalah(null);

    const table =
      form.tipe === 'voucher'
        ? 'vouchers'
        : form.tipe;

    const payload: TransaksiPayload = {
      tanggal: form.tanggal,
      ladies_id: ladiesId,
      jumlah: 0,
    };

    if (form.tipe === 'voucher') {
      if (pricingLoading || !activeTier) {
        toast.error(
          'Harga outlet belum termuat atau belum dikonfigurasi. Hubungi admin.'
        );
        return;
      }

      const jumlahVoucher =
        parseFloat(
          unformatNumber(
            form.jumlah_voucher
          )
        );

      payload.jumlah_voucher =
        jumlahVoucher;

      payload.jumlah =
        hitungJumlahVoucher(jumlahVoucher, activeTier);

      payload.outlet = outlet;

      // Simpan tipe harga yang dipakai ("Voucher - Single", dst.) supaya
      // terbaca saat rekapan. Butuh kolom vouchers.keterangan
      // (supabase/sql/e1-voucher-keterangan.sql).
      payload.keterangan = labelVoucher(activeTier);

      payload.untung =
        hitungUntungVoucher(jumlahVoucher, activeTier);
    } else {
      payload.jumlah = parseFloat(
        unformatNumber(form.jumlah)
      );

      payload.keterangan =
        form.keterangan;
    }

    mutation.mutate({ table, payload });
  };

  const jumlahVoucherRaw =
    parseInt(
      unformatNumber(
        form.jumlah_voucher || '0'
      )
    );

  const hargaVoucher =
    activeTier?.harga_ladies ?? 0;

  const transactionTypes = [
    {
      value: 'voucher',
      label: 'Voucher',
      icon: <FiGift />,
      color: 'var(--color-income)',
      bg: 'var(--color-income-soft)',
    },

    {
      value: 'pemasukan_lain',
      label: 'Pemasukan',
      icon: <FiTrendingUp />,
      color: 'var(--color-voucher)',
      bg: 'var(--color-voucher-soft)',
    },

    {
      value: 'kasbon',
      label: 'Kasbon',
      icon: <FiTrendingDown />,
      color: 'var(--color-expense)',
      bg: 'var(--color-expense-soft)',
    },

    {
      value: 'dokter',
      label: 'Dokter',
      icon: <FiFileText />,
      color: 'var(--color-medical)',
      bg: 'var(--color-medical-soft)',
    },
  ];

  const tombolSimpan = (style?: React.CSSProperties) => (
    <Button
      variant="primary"
      fullWidth
      onClick={handleSubmit}
      disabled={mutation.isPending}
      icon={mutation.isPending ? <div className="spinner-border spinner-border-sm" role="status" /> : <FiPlus size={isMobile ? 16 : 18} />}
      style={style}
    >
      {mutation.isPending ? 'Menyimpan...' : 'Tambah Transaksi'}
    </Button>
  );

  // Mobile: tampilan baru, selaras Transaksi Pengawas. State, validasi,
  // resolusi harga (pilihTier), dan penyimpanan sama persis dengan desktop (dk-).
  if (isMobile) {
    const wajib = (
      <>
        <span className="tm-req" aria-hidden="true">*</span>
        <span className="visually-hidden"> (wajib diisi)</span>
      </>
    );
    const isVoucher = form.tipe === 'voucher';
    // Pratinjau memakai fungsi yang sama dengan saat menyimpan, jadi angka
    // yang tampil = angka yang tersimpan.
    const pratinjauTotal =
      activeTier && !isNaN(jumlahVoucherRaw)
        ? hitungJumlahVoucher(jumlahVoucherRaw, activeTier)
        : 0;

    return (
      <div>
        <div
          className="tm-types"
          role="radiogroup"
          aria-label="Tipe transaksi"
          style={{ gridTemplateColumns: `repeat(${transactionTypes.length}, 1fr)` }}
        >
          {transactionTypes.map((item) => {
            const active = form.tipe === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={`tm-type ${active ? 'is-active' : ''}`}
                style={active ? { background: item.bg, borderColor: item.color, color: item.color } : undefined}
                onClick={() => setForm({ ...form, tipe: item.value })}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        {isVoucher ? (
          <div className={`tm-amount ${fieldSalah === 'jumlah_voucher' ? 'is-invalid' : ''}`}>
            <label htmlFor="tm-jumlah-voucher" className="tm-amount-label">
              Jumlah voucher{wajib}
            </label>
            <div className="tm-amount-row">
              <input
                id="tm-jumlah-voucher"
                name="jumlah_voucher"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={form.jumlah_voucher}
                onChange={handleChange}
                className="tm-amount-input"
                aria-invalid={fieldSalah === 'jumlah_voucher' || undefined}
              />
              <span className="tm-amount-suffix" aria-hidden>pcs</span>
            </div>
          </div>
        ) : (
          <div className={`tm-amount ${fieldSalah === 'jumlah' ? 'is-invalid' : ''}`}>
            <label htmlFor="tm-jumlah" className="tm-amount-label">
              Jumlah{wajib}
            </label>
            <div className="tm-amount-row">
              <span className="tm-amount-prefix" aria-hidden>Rp</span>
              <input
                id="tm-jumlah"
                name="jumlah"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={form.jumlah}
                onChange={handleChange}
                className="tm-amount-input"
                aria-invalid={fieldSalah === 'jumlah' || undefined}
              />
            </div>
          </div>
        )}

        {isVoucher && perluPilihTier(tiers) && (
          <div className="tm-field">
            <span className="tm-label" id="tm-tier-label">Tipe harga</span>
            <div className="tm-chips" role="radiogroup" aria-labelledby="tm-tier-label">
              {tiers.map((t) => {
                const active = activeTier?.tier_name === t.tier_name;
                return (
                  <button
                    key={t.tier_name}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`tm-chip ${active ? 'is-active' : ''}`}
                    onClick={() => setSelectedTierName(t.tier_name)}
                  >
                    {t.tier_name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isVoucher && (
          <div className="tm-total" aria-live="polite">
            <div>
              <div className="tm-total-label">Total untuk ladies</div>
              <div className="tm-total-detail">
                {jumlahVoucherRaw || 0} × Rp{formatNumber(hargaVoucher.toString())}
              </div>
            </div>
            <div className="tm-total-value">Rp{formatNumber(pratinjauTotal.toString())}</div>
          </div>
        )}

        <div className="tm-field">
          <label htmlFor="tm-tanggal" className="tm-label">
            Tanggal{wajib}
          </label>
          <div className="tm-input-wrap">
            <FiCalendar className="tm-input-icon" aria-hidden />
            <input
              id="tm-tanggal"
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
              className={`tm-input ${fieldSalah === 'tanggal' ? 'is-invalid' : ''}`}
              aria-invalid={fieldSalah === 'tanggal' || undefined}
            />
          </div>
        </div>

        {/* Voucher tidak punya keterangan (kolomnya tidak ada di tabel vouchers). */}
        {!isVoucher && (
          <div className="tm-field">
            <label htmlFor="tm-keterangan" className="tm-label">
              Keterangan (opsional)
            </label>
            <div className="tm-input-wrap">
              <FiEdit3 className="tm-input-icon" aria-hidden />
              <input
                id="tm-keterangan"
                name="keterangan"
                type="text"
                placeholder="Catatan singkat"
                value={form.keterangan}
                onChange={handleChange}
                className="tm-input"
              />
            </div>
          </div>
        )}

        <div className="tm-submit">{tombolSimpan(TOMBOL_PIL)}</div>
      </div>
    );
  }

  // Desktop (gaya dk-): chip tipe, jumlah besar, pilihan tipe harga sebagai
  // chip, kotak total. State, validasi, resolusi harga (pilihTier), dan
  // penyimpanan sama persis dengan mobile.
  const isVoucher = form.tipe === 'voucher';
  // Pratinjau memakai fungsi yang sama dengan saat menyimpan, jadi angka yang
  // tampil = angka yang tersimpan (dulu desktop memakai pcs × harga sendiri).
  const pratinjauTotal =
    activeTier && !isNaN(jumlahVoucherRaw) ? hitungJumlahVoucher(jumlahVoucherRaw, activeTier) : 0;
  // Penyimpanan tetap diblokir di handleSubmit; ini hanya memperingatkan lebih awal.
  const hargaBelumAda = !pricingLoading && !activeTier;

  return (
    <div className="dk-stack">
      <DesktopField label="Tipe" labelId="dk-trx-tipe-label">
        <div
          className="dk-chips dk-chips--status"
          role="radiogroup"
          aria-labelledby="dk-trx-tipe-label"
          style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
        >
          {transactionTypes.map((item) => {
            const active = form.tipe === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={`dk-chip ${active ? 'is-active' : ''}`}
                style={active ? { background: item.bg, borderColor: item.color, color: item.color } : undefined}
                onClick={() => setForm({ ...form, tipe: item.value })}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </DesktopField>

      {isVoucher ? (
        <>
          <DesktopField label="Jumlah voucher" htmlFor="dk-trx-jumlah-voucher" required>
            <div className="dk-input-wrap">
              <input
                id="dk-trx-jumlah-voucher"
                name="jumlah_voucher"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={form.jumlah_voucher}
                onChange={handleChange}
                className={`dk-input dk-input--amount dk-input--suffix ${fieldSalah === 'jumlah_voucher' ? 'is-invalid' : ''}`}
                aria-invalid={fieldSalah === 'jumlah_voucher' || undefined}
              />
              <span className="dk-suffix" aria-hidden>pcs</span>
            </div>
          </DesktopField>

          {perluPilihTier(tiers) && (
            <DesktopField label="Tipe harga" labelId="dk-trx-tier-label">
              <div className="dk-chips" role="radiogroup" aria-labelledby="dk-trx-tier-label">
                {tiers.map((t) => {
                  const active = activeTier?.tier_name === t.tier_name;
                  return (
                    <button
                      key={t.tier_name}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`dk-chip ${active ? 'is-active' : ''}`}
                      onClick={() => setSelectedTierName(t.tier_name)}
                    >
                      {t.tier_name}
                    </button>
                  );
                })}
              </div>
            </DesktopField>
          )}

          <div className={`dk-total ${hargaBelumAda ? 'is-warn' : ''}`} aria-live="polite">
            {pricingLoading ? (
              // Pengecualian yang disengaja: status pilihan harga yang sedang
              // diambil di halaman Add Transaksi (lihat CLAUDE.md).
              <span className="dk-total-detail">Memuat harga outlet {outlet}...</span>
            ) : hargaBelumAda ? (
              <span className="dk-total-detail">
                Harga voucher untuk outlet {outlet || 'ini'} belum dikonfigurasi, jadi voucher belum bisa
                disimpan. Atur tier harganya di menu Outlet.
              </span>
            ) : (
              <>
                <div>
                  <div className="dk-total-label">Total untuk ladies</div>
                  <div className="dk-total-detail">
                    {jumlahVoucherRaw || 0} × Rp{formatNumber(hargaVoucher.toString())}
                    {activeTier?.tier_name ? ` · ${activeTier.tier_name}` : ''}
                  </div>
                </div>
                <div className="dk-total-value">Rp{formatNumber(pratinjauTotal.toString())}</div>
              </>
            )}
          </div>
        </>
      ) : (
        <DesktopField label="Jumlah" htmlFor="dk-trx-jumlah" required>
          <div className="dk-input-wrap">
            <span className="dk-prefix" aria-hidden>Rp</span>
            <input
              id="dk-trx-jumlah"
              name="jumlah"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={form.jumlah}
              onChange={handleChange}
              className={`dk-input dk-input--prefix dk-input--amount ${fieldSalah === 'jumlah' ? 'is-invalid' : ''}`}
              aria-invalid={fieldSalah === 'jumlah' || undefined}
            />
          </div>
        </DesktopField>
      )}

      <DesktopField label="Tanggal" htmlFor="dk-trx-tanggal" required>
        <input
          id="dk-trx-tanggal"
          name="tanggal"
          type="date"
          value={form.tanggal}
          onChange={handleChange}
          className={`dk-input ${fieldSalah === 'tanggal' ? 'is-invalid' : ''}`}
          aria-invalid={fieldSalah === 'tanggal' || undefined}
        />
      </DesktopField>

      {/* Keterangan voucher diisi otomatis dari tipe harga (labelVoucher). */}
      {!isVoucher && (
        <DesktopField label="Keterangan (opsional)" htmlFor="dk-trx-keterangan">
          <input
            id="dk-trx-keterangan"
            name="keterangan"
            type="text"
            placeholder="Catatan singkat"
            value={form.keterangan}
            onChange={handleChange}
            className="dk-input"
          />
        </DesktopField>
      )}

      <button
        type="button"
        className="dk-btn dk-btn--primary dk-btn--block"
        onClick={handleSubmit}
        disabled={mutation.isPending}
      >
        <FiPlus aria-hidden />
        {mutation.isPending ? 'Menyimpan...' : 'Tambah transaksi'}
      </button>
    </div>
  );
};

export default TransaksiForm;
