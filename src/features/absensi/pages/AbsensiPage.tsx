import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import AddAbsensiModal from '../components/AddAbsensiModal';
import { useMediaQuery } from 'react-responsive';
import CardTableAbsensi from '../components/CardTableAbsensi';
import DataTable from '../../../components/DataTable';

import {
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from 'react-icons/fi';

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
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const STATUS_OPTIONS = [
  {
    value: 'KERJA',
    label: 'KERJA',
    color: '#198754',
  },
  {
    value: 'MENS',
    label: 'MENS',
    color: '#dc3545',
  },
  {
    value: 'OFF',
    label: 'OFF',
    color: '#6c757d',
  },
  {
    value: 'SAKIT',
    label: 'SAKIT',
    color: '#ffc107',
  },
];

const AbsensiPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [ladies, setLadies] = useState<Lady[]>([]);
  const [selectedLadyId, setSelectedLadyId] = useState('');

  const [tanggal, setTanggal] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const [status, setStatus] = useState('KERJA');

  const [keterangan, setKeterangan] = useState('');

  const [riwayat, setRiwayat] = useState<Absensi[]>([]);
  const [rekapRiwayat, setRekapRiwayat] = useState<
    Absensi[]
  >([]);

  const [bulan, setBulan] = useState(
    dayjs().month() + 1
  );

  const [tahun, setTahun] = useState(dayjs().year());

  const [page, setPage] = useState(1);

  const limit = isMobile ? 5 : 10;

  const [showModal, setShowModal] = useState(false);

  const [editAbsensi, setEditAbsensi] =
    useState<Absensi | null>(null);

  const [selectedTanggal, setSelectedTanggal] =
    useState<string | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil(rekapRiwayat.length / limit)
  );

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase
        .from('ladies')
        .select('*')
        .eq('status', 'active');

      setLadies(data || []);
    };

    fetchLadies();
  }, []);

  const fetchRiwayat = async () => {
    if (!selectedLadyId) return;

    const start = `${tahun}-${String(bulan).padStart(
      2,
      '0'
    )}-01`;

    const end = dayjs(start)
      .endOf('month')
      .format('YYYY-MM-DD');

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

    const start = `${tahun}-${String(bulan).padStart(
      2,
      '0'
    )}-01`;

    const end = dayjs(start)
      .endOf('month')
      .format('YYYY-MM-DD');

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

  const handleSubmit = async () => {
    if (!selectedLadyId)
      return alert('Pilih ladies dulu');

    const today = dayjs().format('YYYY-MM-DD');

    if (tanggal > today) {
      return alert(
        'Tanggal tidak boleh di masa depan'
      );
    }

    const { data: existing } = await supabase
      .from('absensi')
      .select('*')
      .eq('ladies_id', selectedLadyId)
      .eq('tanggal', tanggal);

    if (existing && existing.length > 0) {
      return alert(
        'Absensi tanggal ini sudah ada'
      );
    }

    const { error } = await supabase
      .from('absensi')
      .upsert({
        ladies_id: selectedLadyId,
        tanggal,
        status,
        keterangan: keterangan || null,
      });

    if (error) {
      alert('Gagal simpan absensi');
    } else {
      alert('Absensi berhasil disimpan');

      setKeterangan('');

      fetchRiwayat();
      fetchRekapRiwayat();
    }
  };

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
    const confirm = window.confirm(
      'Yakin hapus absensi ini?'
    );

    if (!confirm || !selectedLadyId) return;

    const { error } = await supabase
      .from('absensi')
      .delete()
      .eq('ladies_id', selectedLadyId)
      .eq('tanggal', tanggal);

    if (error) {
      alert(error.message);
    } else {
      fetchRiwayat();
      fetchRekapRiwayat();
    }
  };

  const totalKERJA = rekapRiwayat.filter(
    (r) => r.status === 'KERJA'
  ).length;

  const totalMENS = rekapRiwayat.filter(
    (r) => r.status === 'MENS'
  ).length;

  const totalOFF = rekapRiwayat.filter(
    (r) => r.status === 'OFF'
  ).length;

  const totalSAKIT = rekapRiwayat.filter(
    (r) => r.status === 'SAKIT'
  ).length;

  const riwayatWithId = riwayat.map((r, i) => ({
    ...r,
    id: `${r.tanggal}-${i}`,
  }));

  return (
    <div
      className="container py-4"
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-4">
        <FiCalendar
          size={24}
          style={{ color: 'var(--color-green)' }}
        />
        <h2
          className="fw-bold mb-0"
          style={{ color: 'var(--color-dark)' }}
        >
          Absensi Harian
        </h2>
      </div>

      {/* LADIES CARD */}
      <div className="mb-4">
        <h6
          className="fw-bold mb-3"
          style={{ color: 'var(--color-dark)' }}
        >
          Pilih Ladies
        </h6>

        <div
          className="d-flex gap-3 overflow-auto pb-2"
          style={{
            scrollbarWidth: 'none',
          }}
        >
          {ladies.map((lady) => {
            const active =
              selectedLadyId === lady.id;

            return (
              <div
                key={lady.id}
                onClick={() => {
                  setSelectedLadyId(lady.id);
                  setPage(1);
                }}
                style={{
                  minWidth: 180,
                  cursor: 'pointer',
                  borderRadius: 20,
                  padding: 16,
                  transition: '0.2s',
                  border: active
                    ? '2px solid var(--color-green)'
                    : '1px solid #ddd',
                  background: active
                    ? 'rgba(25,135,84,0.08)'
                    : 'white',
                  boxShadow: active
                    ? '0 4px 12px rgba(25,135,84,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  className="fw-bold mb-1"
                  style={{
                    color: 'var(--color-dark)',
                  }}
                >
                  {lady.nama_ladies}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: '#777',
                  }}
                >
                  {lady.nama_outlet}
                </div>

                <div
                  className="mt-2"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-green)',
                  }}
                >
                  PIN {lady.pin}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FORM */}
      <div
        className="p-4 mb-4"
        style={{
          background: 'white',
          borderRadius: 24,
          boxShadow:
            '0 4px 14px rgba(0,0,0,0.06)',
        }}
      >
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label fw-semibold">
              Tanggal
            </label>

            <input
              type="date"
              className="form-control"
              value={tanggal}
              onChange={(e) =>
                setTanggal(e.target.value)
              }
            />
          </div>

          <div className="col-md-8 mb-3">
            <label className="form-label fw-semibold">
              Status
            </label>

            <div className="d-flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active =
                  status === opt.value;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setStatus(opt.value)
                    }
                    className="btn"
                    style={{
                      borderRadius: 999,
                      padding:
                        '10px 18px',
                      fontWeight: 700,
                      border: `2px solid ${opt.color}`,
                      background: active
                        ? opt.color
                        : 'white',
                      color: active
                        ? 'white'
                        : opt.color,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Keterangan
          </label>

          <textarea
            className="form-control"
            rows={2}
            value={keterangan}
            onChange={(e) =>
              setKeterangan(e.target.value)
            }
            placeholder="Opsional..."
          />
        </div>

        <button
          className="btn btn-success px-4 py-2 fw-bold"
          onClick={handleSubmit}
        >
          Simpan Absensi
        </button>
      </div>

      {/* REKAP */}
      {selectedLadyId && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-light border"
              onClick={handlePrevMonth}
            >
              <FiChevronLeft />
            </button>

            <h5 className="fw-bold mb-0">
              {monthNames[bulan - 1]} {tahun}
            </h5>

            <button
              className="btn btn-light border"
              onClick={handleNextMonth}
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="row g-3 mb-4">
            {[
              {
                label: 'KERJA',
                value: totalKERJA,
                color: '#198754',
              },
              {
                label: 'MENS',
                value: totalMENS,
                color: '#dc3545',
              },
              {
                label: 'OFF',
                value: totalOFF,
                color: '#6c757d',
              },
              {
                label: 'SAKIT',
                value: totalSAKIT,
                color: '#ffc107',
              },
            ].map((item) => (
              <div
                className="col-6 col-md-3"
                key={item.label}
              >
                <div
                  className="p-3 h-100"
                  style={{
                    borderRadius: 20,
                    background: 'white',
                    boxShadow:
                      '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: '#777',
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize: 28,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isMobile ? (
            <DataTable
              columns={[
                {
                  key: 'tanggal',
                  label: 'Tanggal',
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (a) => (
                    <span
                      className={`badge ${
                        a.status === 'KERJA'
                          ? 'bg-success'
                          : a.status === 'MENS'
                          ? 'bg-danger'
                          : a.status === 'OFF'
                          ? 'bg-secondary'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {a.status}
                    </span>
                  ),
                },
                {
                  key: 'keterangan',
                  label: 'Keterangan',
                  render: (a) =>
                    a.keterangan || '-',
                },
                {
                  key: 'id',
                  label: 'Aksi',
                  render: (a) => (
                    <>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() =>
                          handleEdit(a)
                        }
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleDelete(
                            a.tanggal
                          )
                        }
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  ),
                },
              ]}
              data={riwayatWithId}
            />
          ) : (
            <CardTableAbsensi
              data={rekapRiwayat}
              page={page - 1}
              rowsPerPage={limit}
              onPageChange={(p) => {
                if (
                  p >= 0 &&
                  p < totalPages
                ) {
                  setPage(p + 1);
                }
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
          if (
            !selectedLadyId ||
            !selectedTanggal
          )
            return;

          const { error } = await supabase
            .from('absensi')
            .update({
              status: data.status,
              keterangan:
                data.keterangan ?? null,
            })
            .eq(
              'ladies_id',
              selectedLadyId
            )
            .eq(
              'tanggal',
              selectedTanggal
            );

          if (error) {
            alert(error.message);
          }

          setShowModal(false);

          fetchRiwayat();
          fetchRekapRiwayat();
        }}
      />
    </div>
  );
};

export default AbsensiPage;