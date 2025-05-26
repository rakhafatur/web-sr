import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import AddAbsensiModal from '../components/AddAbsensiModal';

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
  const limit = 10;

  const [showModal, setShowModal] = useState(false);
  const [editAbsensi, setEditAbsensi] = useState<Absensi | null>(null);
  const [selectedTanggal, setSelectedTanggal] = useState<string | null>(null);

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase.from('ladies').select('*');
      setLadies(data || []);
    };
    fetchLadies();
  }, []);

  const handleSubmit = async () => {
    if (!selectedLadyId || !tanggal || !status) return alert('Lengkapi semua data!');

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

  return (
    <div className="container py-4">
      <h2 className="text-light fw-bold fs-4 mb-4">🗓️ Absensi Harian</h2>

      <div className="row mb-3">
        <div className="col-md-4 mb-3">
          <label className="form-label text-light">Pilih Ladies</label>
          <select
            className="form-select bg-dark text-light border-secondary"
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
          <label className="form-label text-light">Tanggal</label>
          <div style={{ position: 'relative', maxWidth: '180px' }}>
            <input
              type="date"
              className="form-control bg-dark text-light border-secondary pe-5"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              right: 5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px',
              fontSize: '13px',
              userSelect: 'none',
            }}>
              <span onClick={() => {
                const next = new Date(tanggal);
                next.setDate(next.getDate() + 1);
                setTanggal(next.toISOString().slice(0, 10));
              }} style={{ cursor: 'pointer', color: 'white', textAlign: 'center' }}>▲</span>
              <span onClick={() => {
                const prev = new Date(tanggal);
                prev.setDate(prev.getDate() - 1);
                setTanggal(prev.toISOString().slice(0, 10));
              }} style={{ cursor: 'pointer', color: 'white', textAlign: 'center' }}>▼</span>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label text-light">Status</label>
          <div className="d-flex gap-3">
            {['KERJA', 'MENS', 'OFF'].map((opt) => (
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
                <label className="form-check-label text-light" htmlFor={opt}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label text-light">Keterangan (opsional)</label>
        <textarea
          className="form-control bg-dark text-light border-secondary"
          rows={2}
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
        />
      </div>

      <button className="btn btn-success mt-2 mb-4" onClick={handleSubmit}>
        ✅ Simpan Absen
      </button>

      {selectedLadyId && (
        <>
          <div className="d-flex align-items-center gap-2 mt-4 mb-3">
            <button className="btn btn-outline-light btn-sm" onClick={handlePrevMonth}>←</button>
            <span className="text-light fw-semibold">{monthNames[bulan - 1]} {tahun}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleNextMonth}>→</button>
          </div>

          <div className="text-light mb-4">
            <strong>Rekap Bulan Ini (semua data):</strong><br />
            🟢 Kerja: {totalKERJA} hari | 🩸 Mens: {totalMENS} hari | ⚪ Off: {totalOFF} hari
          </div>

          <table className="table table-dark table-bordered text-center align-middle mt-2">
            <thead className="table-secondary text-dark">
              <tr>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((a, i) => (
                <tr key={i}>
                  <td>{a.tanggal}</td>
                  <td>{a.status}</td>
                  <td>{a.keterangan || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => handleEdit(a)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(a.tanggal)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="text-light">Halaman {page}</span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={riwayat.length < limit}
            >
              Next →
            </button>
          </div>
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
