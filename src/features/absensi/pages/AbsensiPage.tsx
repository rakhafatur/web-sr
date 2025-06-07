import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import AddAbsensiModal from '../components/AddAbsensiModal';
import { useMediaQuery } from 'react-responsive';
import CardTableAbsensi from '../components/CardTableAbsensi';
import DataTable from '../../../components/DataTable'; // Tambahkan ini
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

type Lady = {
  id: string;
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
};

type Absensi = {
  status: string;
  keterangan: string | null;
  tanggal: string;
};

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const AbsensiPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [ladies, setLadies] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');
  const [tanggal, setTanggal] = useState(dayjs().format('YYYY-MM-DD'));
  const [status, setStatus] = useState('KERJA');
  const [keterangan, setKeterangan] = useState('');
  const [riwayat, setRiwayat] = useState<Absensi[]>([]);
  const [rekapRiwayat, setRekapRiwayat] = useState<Absensi[]>([]);
  const [bulan, setBulan] = useState(dayjs().month() + 1);
  const [tahun, setTahun] = useState(dayjs().year());
  const [page, setPage] = useState(1);
  const limit = isMobile ? 5 : 10;

  const [showModal, setShowModal] = useState(false);
  const [editAbsensi, setEditAbsensi] = useState<Absensi | null>(null);
  const [selectedTanggal, setSelectedTanggal] = useState<string | null>(null);

  // TOTAL PAGE logic
  const totalPages = Math.max(1, Math.ceil(rekapRiwayat.length / limit));

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase.from('ladies').select('*');
      setLadies(data || []);
    };
    fetchLadies();
  }, []);

  const handleSubmit = async () => {
    if (!selectedLadyId || !tanggal || !status) return alert('Lengkapi semua data!');

    const today = dayjs().format('YYYY-MM-DD');
    if (tanggal > today) return alert('🛑 Tanggal tidak boleh di masa depan!');

    const { data: existing } = await supabase
      .from('absensi')
      .select('*')
      .eq('ladies_id', selectedLadyId)
      .eq('tanggal', tanggal);

    if (existing && existing.length > 0) {
      return alert('⚠️ Absensi untuk tanggal ini sudah ada!');
    }

    const { error } = await supabase.from('absensi').upsert({
      ladies_id: selectedLadyId,
      tanggal,
      status,
      keterangan: keterangan || null,
    });

    if (error) {
      alert('❌ Gagal menyimpan absen');
    } else {
      alert('✅ Absen berhasil disimpan!');
      fetchRiwayat();
      fetchRekapRiwayat();
    }
  };

  const fetchRiwayat = async () => {
    if (!selectedLadyId) return;

    const start = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data } = await supabase
      .from('absensi')
      .select('tanggal, status, keterangan')
      .eq('ladies_id', selectedLadyId)
      .gte('tanggal', start)
      .lte('tanggal', end)
      .order('tanggal', { ascending: true })
      .range(from, to);

    setRiwayat(data || []);
  };

  const fetchRekapRiwayat = async () => {
    if (!selectedLadyId) return;

    const start = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD');

    const { data } = await supabase
      .from('absensi')
      .select('tanggal, status, keterangan')
      .eq('ladies_id', selectedLadyId)
      .gte('tanggal', start)
      .lte('tanggal', end)
      .order('tanggal', { ascending: true });

    setRekapRiwayat(data || []);
  };

  useEffect(() => {
    if (selectedLadyId) {
      fetchRiwayat();
      fetchRekapRiwayat();
    }
    // eslint-disable-next-line
  }, [selectedLadyId, bulan, tahun, page]);

  const handlePrevMonth = () => {
    if (bulan === 1) {
      setBulan(12);
      setTahun((prev) => prev - 1);
    } else {
      setBulan((prev) => prev - 1);
    }
    setPage(1);
  };

  const handleNextMonth = () => {
    if (bulan === 12) {
      setBulan(1);
      setTahun((prev) => prev + 1);
    } else {
      setBulan((prev) => prev + 1);
    }
    setPage(1);
  };

  const handleEdit = (absen: Absensi) => {
    setEditAbsensi(absen);
    setSelectedTanggal(absen.tanggal);
    setShowModal(true);
  };

  const handleDelete = async (tanggal: string) => {
    const confirm = window.confirm('❗ Yakin ingin menghapus absensi tanggal ini?');
    if (!confirm || !selectedLadyId) return;

    const { error } = await supabase
      .from('absensi')
      .delete()
      .eq('ladies_id', selectedLadyId)
      .eq('tanggal', tanggal);

    if (error) alert('❌ Gagal hapus data: ' + error.message);
    else {
      fetchRiwayat();
      fetchRekapRiwayat();
    }
  };

  const totalKERJA = rekapRiwayat.filter((r) => r.status === 'KERJA').length;
  const totalMENS = rekapRiwayat.filter((r) => r.status === 'MENS').length;
  const totalOFF = rekapRiwayat.filter((r) => r.status === 'OFF').length;
  const totalSAKIT = rekapRiwayat.filter((r) => r.status === 'SAKIT').length;

  // MAPPING UNTUK DataTable (wajib ada id unik)
  const riwayatWithId = riwayat.map((row, idx) => ({
    ...row,
    id: row.tanggal + '-' + idx,
  }));

  return (
    <div className="container py-4" style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <h2 className="fw-bold fs-4 mb-4" style={{ color: 'var(--color-dark)' }}>
        🗓️ Absensi Harian
      </h2>

      {/* Form */}
      <div className="row mb-3">
        <div className="col-md-4 mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>Pilih Ladies</label>
          <select
            className="form-select"
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-dark)',
              borderColor: 'var(--color-green)',
            }}
            value={selectedLadyId}
            onChange={(e) => {
              setSelectedLadyId(e.target.value);
              setPage(1);
            }}
          >
            <option value="" disabled>-- Pilih --</option>
            {ladies.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama_ladies} - {l.nama_outlet} ({l.pin})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>Tanggal</label>
          <input
            type="date"
            className="form-control"
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-dark)',
              borderColor: 'var(--color-green)',
            }}
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>Status</label>
          <div className="d-flex gap-3">
            {['KERJA', 'MENS', 'OFF', 'SAKIT'].map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={opt}
                  name="status"
                  value={opt}
                  checked={status === opt}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <label className="form-check-label" htmlFor={opt} style={{ color: 'var(--color-dark)' }}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold" style={{ color: 'var(--color-dark)' }}>Keterangan (opsional)</label>
        <textarea
          className="form-control"
          rows={2}
          style={{
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-dark)',
            borderColor: 'var(--color-green)',
          }}
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
        />
      </div>

      <button className="btn btn-success mt-2 mb-4" onClick={handleSubmit}>
        ✅ Simpan Absen
      </button>

      {/* Ringkasan + Tabel/Card */}
      {selectedLadyId && (
        <>
          <div className="d-flex align-items-center gap-2 mt-4 mb-3">
            <button className="btn btn-outline-success btn-sm" onClick={handlePrevMonth}>←</button>
            <span className="fw-semibold" style={{ color: 'var(--color-dark)' }}>{monthNames[bulan - 1]} {tahun}</span>
            <button className="btn btn-outline-success btn-sm" onClick={handleNextMonth}>→</button>
          </div>

          <div className="mb-4" style={{ color: 'var(--color-dark)' }}>
            <strong>Rekap Bulan Ini:</strong><br />
            Kerja: {totalKERJA} | Mens: {totalMENS} | Off: {totalOFF} | Sakit: {totalSAKIT}
          </div>

          {!isMobile ? (
            <>
              <DataTable
                columns={[
                  { key: 'tanggal', label: 'Tanggal' },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (a) => (
                      <span className={`badge ${a.status === 'KERJA'
                        ? 'bg-success'
                        : a.status === 'MENS'
                          ? 'bg-danger'
                          : a.status === 'OFF'
                            ? 'bg-secondary'
                            : a.status === 'SAKIT'
                              ? 'bg-warning text-dark'
                              : 'bg-light text-dark'
                        }`}>
                        {a.status}
                      </span>
                    ),
                  },
                  { key: 'keterangan', label: 'Keterangan', render: (a) => a.keterangan || '-' },
                  {
                    key: 'id', // <--- PENTING: harus pakai salah satu key data!
                    label: 'Aksi',
                    render: (a) => (
                      <>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(a)}>
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.tanggal)}>
                          < FiTrash2 />
                        </button>
                      </>
                    ),
                  },
                ]}
                data={riwayatWithId}
              />

              {/* PAGINATION */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  className="btn btn-outline-success"
                  onClick={() => page > 1 && setPage(page - 1)}
                  disabled={page <= 1}
                >
                  ← Sebelumnya
                </button>
                <span style={{ color: 'var(--color-dark)' }}>
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  className="btn btn-outline-success"
                  onClick={() => page < totalPages && setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Selanjutnya →
                </button>
              </div>
            </>
          ) : (
            <CardTableAbsensi
              data={rekapRiwayat}
              page={page - 1}
              rowsPerPage={limit}
              onPageChange={(p) => {
                if (p >= 0 && p < totalPages) setPage(p + 1);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      <AddAbsensiModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditAbsensi(null);
          setSelectedTanggal(null);
        }}
        absensi={editAbsensi}
        onSubmit={async (data) => {
          if (!selectedLadyId || !selectedTanggal) return;

          const { error } = await supabase
            .from('absensi')
            .update({
              status: data.status,
              keterangan: data.keterangan ?? null,
            })
            .eq('ladies_id', selectedLadyId)
            .eq('tanggal', selectedTanggal);

          if (error) {
            alert('❌ Gagal update data: ' + error.message);
          }

          setShowModal(false);
          setEditAbsensi(null);
          setSelectedTanggal(null);
          fetchRiwayat();
          fetchRekapRiwayat();
        }}
      />
    </div>
  );
};

export default AbsensiPage;
