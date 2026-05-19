import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';

import AddAbsensiModal from '../components/AddAbsensiModal';
import CardTableAbsensi from '../components/CardTableAbsensi';
import DataTable from '../../../components/DataTable';

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUsers,
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

const AbsensiPage = () => {
  const isMobile = useMediaQuery({
    maxWidth: 768,
  });

  const [ladies, setLadies] = useState<
    Lady[]
  >([]);

  const [selectedLadyId, setSelectedLadyId] =
    useState('');

  const [tanggal, setTanggal] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const [status, setStatus] =
    useState('KERJA');

  const [keterangan, setKeterangan] =
    useState('');

  const [riwayat, setRiwayat] = useState<
    Absensi[]
  >([]);

  const [rekapRiwayat, setRekapRiwayat] =
    useState<Absensi[]>([]);

  const [bulan, setBulan] = useState(
    dayjs().month() + 1
  );

  const [tahun, setTahun] = useState(
    dayjs().year()
  );

  const [page, setPage] = useState(1);

  const limit = isMobile ? 5 : 10;

  const [showModal, setShowModal] =
    useState(false);

  const [editAbsensi, setEditAbsensi] =
    useState<Absensi | null>(null);

  const [
    selectedTanggal,
    setSelectedTanggal,
  ] = useState<string | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil(rekapRiwayat.length / limit)
  );

  const selectedLady = ladies.find(
    (l) => l.id === selectedLadyId
  );

  useEffect(() => {
    const fetchLadies = async () => {
      const { data } = await supabase
        .from('ladies')
        .select('*')
        .eq('status', 'active')
        .order('nama_ladies', {
          ascending: true,
        });

      setLadies(data || []);
    };

    fetchLadies();
  }, []);

  const handleSubmit = async () => {
    if (
      !selectedLadyId ||
      !tanggal ||
      !status
    ) {
      return alert(
        'Lengkapi semua data!'
      );
    }

    const today = dayjs().format(
      'YYYY-MM-DD'
    );

    if (tanggal > today) {
      return alert(
        '🛑 Tanggal tidak boleh di masa depan!'
      );
    }

    const { data: existing } =
      await supabase
        .from('absensi')
        .select('*')
        .eq(
          'ladies_id',
          selectedLadyId
        )
        .eq('tanggal', tanggal);

    if (
      existing &&
      existing.length > 0
    ) {
      return alert(
        '⚠️ Absensi untuk tanggal ini sudah ada!'
      );
    }

    const { error } =
      await supabase
        .from('absensi')
        .upsert({
          ladies_id: selectedLadyId,
          tanggal,
          status,
          keterangan:
            keterangan || null,
        });

    if (error) {
      alert(
        '❌ Gagal menyimpan absensi'
      );
    } else {
      alert(
        '✅ Absensi berhasil disimpan!'
      );

      setKeterangan('');

      fetchRiwayat();
      fetchRekapRiwayat();
    }
  };

  const fetchRiwayat = async () => {
    if (!selectedLadyId) return;

    const start = `${tahun}-${String(
      bulan
    ).padStart(2, '0')}-01`;

    const end = dayjs(start)
      .endOf('month')
      .format('YYYY-MM-DD');

    const from = (page - 1) * limit;

    const to = from + limit - 1;

    const { data } = await supabase
      .from('absensi')
      .select(
        'tanggal, status, keterangan'
      )
      .eq(
        'ladies_id',
        selectedLadyId
      )
      .gte('tanggal', start)
      .lte('tanggal', end)
      .order('tanggal', {
        ascending: false,
      })
      .range(from, to);

    setRiwayat(data || []);
  };

  const fetchRekapRiwayat =
    async () => {
      if (!selectedLadyId) return;

      const start = `${tahun}-${String(
        bulan
      ).padStart(2, '0')}-01`;

      const end = dayjs(start)
        .endOf('month')
        .format('YYYY-MM-DD');

      const { data } = await supabase
        .from('absensi')
        .select(
          'tanggal, status, keterangan'
        )
        .eq(
          'ladies_id',
          selectedLadyId
        )
        .gte('tanggal', start)
        .lte('tanggal', end)
        .order('tanggal', {
          ascending: false,
        });

      setRekapRiwayat(data || []);
    };

  useEffect(() => {
    if (selectedLadyId) {
      fetchRiwayat();
      fetchRekapRiwayat();
    }

    // eslint-disable-next-line
  }, [
    selectedLadyId,
    bulan,
    tahun,
    page,
  ]);

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

  const handleEdit = (
    absen: Absensi
  ) => {
    setEditAbsensi(absen);
    setSelectedTanggal(
      absen.tanggal
    );
    setShowModal(true);
  };

  const handleDelete = async (
    tanggal: string
  ) => {
    const confirm =
      window.confirm(
        '❗ Yakin ingin menghapus absensi ini?'
      );

    if (
      !confirm ||
      !selectedLadyId
    )
      return;

    const { error } =
      await supabase
        .from('absensi')
        .delete()
        .eq(
          'ladies_id',
          selectedLadyId
        )
        .eq('tanggal', tanggal);

    if (error) {
      alert(
        '❌ Gagal hapus data: ' +
        error.message
      );
    } else {
      fetchRiwayat();
      fetchRekapRiwayat();
    }
  };

  const totalKERJA =
    rekapRiwayat.filter(
      (r) => r.status === 'KERJA'
    ).length;

  const totalMENS =
    rekapRiwayat.filter(
      (r) => r.status === 'MENS'
    ).length;

  const totalOFF =
    rekapRiwayat.filter(
      (r) => r.status === 'OFF'
    ).length;

  const totalSAKIT =
    rekapRiwayat.filter(
      (r) => r.status === 'SAKIT'
    ).length;

  const riwayatWithId = riwayat.map(
    (row, idx) => ({
      ...row,
      id:
        row.tanggal + '-' + idx,
    })
  );

  return (
    <div
      className="container-fluid py-4 px-md-4 px-3"
      style={{
        background:
          'linear-gradient(to bottom, #f7fff9 0%, #ffffff 100%)',
        minHeight: '100vh',
      }}
    >
      {/* HERO */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, var(--color-green), #7be0a9)',
          color: 'white',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background:
                'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
              fontSize: 26,
              backdropFilter:
                'blur(8px)',
            }}
          >
            <FiCalendar />
          </div>

          <div>
            <h2
              className="fw-semibold mb-0"
              style={{
                fontSize:
                  isMobile
                    ? '1rem'
                    : '1.8rem',
                lineHeight: 1.2,
              }}
            >
              Absensi Harian
            </h2>

            <div
              style={{
                opacity: 0.75,
                fontSize:
                  isMobile
                    ? '0.74rem'
                    : '0.92rem',
                marginTop: 2,
              }}
            >
              Kelola absensi ladies
              harian
            </div>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4"
        style={{
          overflow: 'hidden',
        }}
      >
        <div
          className="px-4 py-3 border-bottom"
          style={{
            background:
              'linear-gradient(to right, #effff4, #ffffff)',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiUsers
              size={18}
              style={{
                color:
                  'var(--color-green)',
              }}
            />

            <div>
              <div className="fw-bold">
                Input Absensi
              </div>

              <div
                style={{
                  fontSize:
                    '0.85rem',
                  color: '#666',
                }}
              >
                Isi data absensi
                harian ladies
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="row g-4">
            {/* LADIES */}
            <div className="col-12 col-lg-4">
              <label
                className="fw-semibold mb-2"
                style={{
                  fontSize: isMobile
                    ? '0.82rem'
                    : '0.95rem',
                }}
              >
                Pilih Ladies
              </label>

              <select
                className="form-select shadow-none"
                value={
                  selectedLadyId
                }
                onChange={(e) => {
                  setSelectedLadyId(
                    e.target.value
                  );

                  setPage(1);
                }}
                style={{
                  height: isMobile
                    ? 50
                    : 58,

                  borderRadius: isMobile
                    ? 14
                    : 18,

                  border:
                    '2px solid #d8f3df',

                  paddingLeft: isMobile
                    ? 14
                    : 18,

                  paddingRight: 40,

                  fontWeight: 600,

                  fontSize: isMobile
                    ? '0.82rem'
                    : '0.95rem',
                }}
              >
                <option value="">
                  -- Pilih Ladies --
                </option>

                {ladies.map((l) => (
                  <option
                    key={l.id}
                    value={l.id}
                  >
                    {
                      l.nama_ladies
                    }{' '}
                    •{' '}
                    {
                      l.nama_outlet
                    }{' '}
                    ({l.pin})
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}
            <div className="col-12 col-lg-4">
              <label className="fw-semibold mb-2">
                Tanggal
              </label>

              <input
                type="date"
                className="form-control shadow-none"
                value={tanggal}
                onChange={(e) =>
                  setTanggal(
                    e.target.value
                  )
                }
                style={{
                  height: isMobile
                    ? 50
                    : 58,

                  borderRadius: isMobile
                    ? 14
                    : 18,

                  border:
                    '2px solid #d8f3df',

                  paddingInline: isMobile
                    ? 14
                    : 18,

                  fontSize: isMobile
                    ? '0.82rem'
                    : '0.95rem',
                }}
              />
            </div>

            {/* STATUS */}
            {/* STATUS */}
            <div className="col-12 col-lg-4">
              <label className="fw-semibold mb-2">
                Status
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? 'repeat(4, 1fr)'
                    : 'repeat(4, auto)',
                  gap: isMobile ? 8 : 10,
                }}
              >
                {[
                  'KERJA',
                  'MENS',
                  'OFF',
                  'SAKIT',
                ].map((opt) => {
                  const active =
                    status === opt;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setStatus(opt)
                      }
                      className="btn"
                      style={{
                        borderRadius: 14,

                        height: isMobile
                          ? 42
                          : 46,

                        padding: isMobile
                          ? '0 6px'
                          : '0 16px',

                        fontWeight: 700,

                        fontSize: isMobile
                          ? '0.7rem'
                          : '0.88rem',

                        border: active
                          ? 'none'
                          : '1px solid #dfeee4',

                        background: active
                          ? 'linear-gradient(135deg,#22c55e,#4ade80)'
                          : '#fff',

                        color: active
                          ? 'white'
                          : '#444',

                        whiteSpace: 'nowrap',

                        boxShadow: active
                          ? '0 8px 18px rgba(34,197,94,0.18)'
                          : 'none',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* KETERANGAN */}
            <div className="col-12">
              <label className="fw-semibold mb-2">
                Keterangan
              </label>

              <textarea
                className="form-control shadow-none"
                rows={isMobile ? 2 : 3}
                value={keterangan}
                onChange={(e) =>
                  setKeterangan(
                    e.target.value
                  )
                }
                placeholder="Tambahkan catatan..."
                style={{
                  borderRadius: 16,
                  border:
                    '2px solid #d8f3df',

                  padding: isMobile
                    ? '12px 14px'
                    : 16,

                  fontSize: isMobile
                    ? '0.82rem'
                    : '0.92rem',

                  minHeight: isMobile
                    ? 80
                    : 110,

                  resize: 'none',
                }}
              />
            </div>
          </div>

          {/* BUTTON */}
          <div
            className="mt-4 d-flex"
            style={{
              justifyContent: isMobile
                ? 'center'
                : 'flex-start',
            }}
          >
            <button
              className="btn"
              onClick={handleSubmit}
              style={{
                background:
                  'linear-gradient(135deg,#22c55e,#4ade80)',

                color: 'white',

                border: 'none',

                borderRadius: isMobile
                  ? 14
                  : 16,

                height: isMobile
                  ? 48
                  : 54,

                width: isMobile
                  ? '100%'
                  : 'auto',

                maxWidth: isMobile
                  ? 260
                  : 'unset',

                paddingInline: isMobile
                  ? 20
                  : 28,

                fontWeight: 700,

                fontSize: isMobile
                  ? '0.84rem'
                  : '0.95rem',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                boxShadow:
                  '0 10px 25px rgba(34,197,94,0.25)',
              }}
            >
              <FiPlus
                size={18}
                className="me-2"
              />
              Simpan Absensi
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {selectedLadyId && (
        <>
          {/* HEADER REKAP */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div
                className="fw-bold"
                style={{
                  fontSize: '1.1rem',
                  color:
                    'var(--color-dark)',
                }}
              >
                Rekap Absensi
              </div>

              <div
                style={{
                  fontSize:
                    '0.9rem',
                  color: '#666',
                }}
              >
                {
                  monthNames[
                  bulan - 1
                  ]
                }{' '}
                {tahun}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-light border"
                onClick={
                  handlePrevMonth
                }
              >
                ←
              </button>

              <button
                className="btn btn-light border"
                onClick={
                  handleNextMonth
                }
              >
                →
              </button>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="row g-3 mb-4">
            {[
              {
                label: 'Kerja',
                total: totalKERJA,
                bg: '#dcfce7',
                color: '#166534',
              },
              {
                label: 'Mens',
                total: totalMENS,
                bg: '#fee2e2',
                color: '#991b1b',
              },
              {
                label: 'Off',
                total: totalOFF,
                bg: '#e5e7eb',
                color: '#374151',
              },
              {
                label: 'Sakit',
                total: totalSAKIT,
                bg: '#fef3c7',
                color: '#92400e',
              },
            ].map((item) => (
              <div
                className="col-6 col-lg-3"
                key={item.label}
              >
                <div
                  className="p-4 rounded-4 shadow-sm h-100"
                  style={{
                    background:
                      item.bg,
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        '0.85rem',
                      opacity: 0.75,
                      color:
                        item.color,
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    className="fw-bold"
                    style={{
                      fontSize:
                        '2rem',
                      color:
                        item.color,
                    }}
                  >
                    {item.total}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIWAYAT */}
          <div
            className="card border-0 shadow-sm rounded-4"
            style={{
              overflow: 'hidden',
            }}
          >
            <div
              className="px-4 py-3 border-bottom"
              style={{
                background:
                  'linear-gradient(to right,#ffffff,#f5fff8)',
              }}
            >
              <div className="fw-bold">
                Riwayat Absensi
              </div>

              <div
                style={{
                  fontSize:
                    '0.85rem',
                  color: '#666',
                }}
              >
                Histori absensi{' '}
                {selectedLady?.nama_ladies}
              </div>
            </div>

            <div
              className={
                isMobile
                  ? 'p-2'
                  : 'p-3'
              }
            >
              {!isMobile ? (
                <>
                  <DataTable
                    columns={[
                      {
                        key:
                          'tanggal',
                        label:
                          'Tanggal',
                      },
                      {
                        key:
                          'status',
                        label:
                          'Status',
                        render: (
                          a
                        ) => (
                          <span
                            className={`badge ${a.status ===
                              'KERJA'
                              ? 'bg-success'
                              : a.status ===
                                'MENS'
                                ? 'bg-danger'
                                : a.status ===
                                  'OFF'
                                  ? 'bg-secondary'
                                  : 'bg-warning text-dark'
                              }`}
                          >
                            {
                              a.status
                            }
                          </span>
                        ),
                      },
                      {
                        key:
                          'keterangan',
                        label:
                          'Keterangan',
                        render: (
                          a
                        ) =>
                          a.keterangan ||
                          '-',
                      },
                      {
                        key: 'id',
                        label:
                          'Aksi',
                        render: (
                          a
                        ) => (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-light border"
                              onClick={() =>
                                handleEdit(
                                  a
                                )
                              }
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              className="btn btn-sm btn-light border text-danger"
                              onClick={() =>
                                handleDelete(
                                  a.tanggal
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={
                      riwayatWithId
                    }
                  />

                  {/* PAGINATION */}
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <button
                      className="btn btn-outline-success rounded-pill px-4"
                      disabled={
                        page <= 1
                      }
                      onClick={() =>
                        setPage(
                          page - 1
                        )
                      }
                    >
                      ← Sebelumnya
                    </button>

                    <div
                      style={{
                        color:
                          '#666',
                      }}
                    >
                      Halaman {page}{' '}
                      dari{' '}
                      {
                        totalPages
                      }
                    </div>

                    <button
                      className="btn btn-outline-success rounded-pill px-4"
                      disabled={
                        page >=
                        totalPages
                      }
                      onClick={() =>
                        setPage(
                          page + 1
                        )
                      }
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </>
              ) : (
                <CardTableAbsensi
                  data={
                    rekapRiwayat
                  }
                  page={page - 1}
                  rowsPerPage={limit}
                  onPageChange={(
                    p
                  ) => {
                    if (
                      p >= 0 &&
                      p <
                      totalPages
                    ) {
                      setPage(
                        p + 1
                      );
                    }
                  }}
                  onEdit={
                    handleEdit
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL */}
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

          const { error } =
            await supabase
              .from('absensi')
              .update({
                status:
                  data.status,
                keterangan:
                  data.keterangan ??
                  null,
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
            alert(
              '❌ Gagal update data: ' +
              error.message
            );
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