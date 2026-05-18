import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import dayjs from 'dayjs';
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
} from 'react-icons/fi';
import logo from '../../../assets/logosr-green.png';

type PemasukanLain = {
  id: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
};

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
};

const PemasukanLainListPage = () => {
  const user = useSelector(
    (state: RootState) =>
      state.user.currentUser
  ) as UserWithLadies;

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    dayjs().startOf('month')
  );

  const [
    pemasukanList,
    setPemasukanList,
  ] = useState<
    PemasukanLain[]
  >([]);

  const [
    totalJumlah,
    setTotalJumlah,
  ] = useState(0);

  const [page, setPage] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const rowsPerPage = 10;

  const handleMonthChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value;

    let newDate = dayjs(
      `${value}-01`
    );

    if (!newDate.isValid()) {
      newDate =
        dayjs().startOf(
          'month'
        );
    }

    setSelectedMonth(
      newDate
    );

    setPage(0);
  };

  const prevMonth = () => {
    setSelectedMonth(
      selectedMonth.subtract(
        1,
        'month'
      )
    );

    setPage(0);
  };

  const nextMonth = () => {
    const next =
      selectedMonth.add(
        1,
        'month'
      );

    if (
      next.isAfter(
        dayjs(),
        'month'
      )
    )
      return;

    setSelectedMonth(next);

    setPage(0);
  };

  useEffect(() => {
    if (user?.ladies_id) {
      fetchPemasukan(
        user.ladies_id
      );
    }
  }, [user, selectedMonth]);

  const fetchPemasukan =
    async (
      ladiesId: string
    ) => {
      setLoading(true);

      const bulanAwal =
        selectedMonth.startOf(
          'month'
        );

      const bulanAkhir =
        selectedMonth.endOf(
          'month'
        );

      const {
        data,
        error,
      } = await supabase
        .from(
          'pemasukan_lain'
        )
        .select('*')
        .eq(
          'ladies_id',
          ladiesId
        )
        .gte(
          'tanggal',
          bulanAwal.format(
            'YYYY-MM-DD'
          )
        )
        .lte(
          'tanggal',
          bulanAkhir.format(
            'YYYY-MM-DD'
          )
        )
        .order('tanggal', {
          ascending: false,
        });

      if (error || !data) {
        setPemasukanList(
          []
        );

        setTotalJumlah(0);

        setLoading(false);

        return;
      }

      setPemasukanList(
        data
      );

      const total =
        data.reduce(
          (
            sum,
            item
          ) =>
            sum +
            (item.jumlah ||
              0),
          0
        );

      setTotalJumlah(
        total
      );

      setLoading(false);
    };

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        pemasukanList.length /
          rowsPerPage
      )
    );

  const start =
    page * rowsPerPage;

  const end =
    start + rowsPerPage;

  const currentRows =
    pemasukanList.slice(
      start,
      end
    );

  const isNextDisabled =
    selectedMonth.isSame(
      dayjs().startOf(
        'month'
      ),
      'month'
    );

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          minHeight:
            '70vh',
        }}
      >
        <img
          src={logo}
          alt="loading"
          style={{
            width: 90,
            marginBottom: 14,
            animation:
              'pulse 1.5s infinite',
          }}
        />

        <div
          style={{
            fontSize: 14,
            color: '#666',
            fontWeight: 500,
          }}
        >
          Memuat data
          pemasukan...
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column gap-3"
      style={{
        paddingBottom: 20,
      }}
    >
      {/* MONTH BAR */}
      <div
        className="d-flex align-items-center justify-content-between"
        style={{
          gap: 10,
        }}
      >
        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background:
              '#f4f4f5',
          }}
          onClick={
            prevMonth
          }
        >
          <FiChevronLeft />
        </button>

        <input
          type="month"
          value={selectedMonth.format(
            'YYYY-MM'
          )}
          onChange={
            handleMonthChange
          }
          max={dayjs().format(
            'YYYY-MM'
          )}
          className="form-control"
          style={{
            borderRadius: 12,
            height: 38,
            fontSize: 13,
            fontWeight: 600,
            border:
              '1px solid #e5e7eb',
          }}
        />

        <button
          className="btn border-0 d-flex align-items-center justify-content-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background:
              '#f4f4f5',
          }}
          onClick={
            nextMonth
          }
          disabled={
            isNextDisabled
          }
        >
          <FiChevronRight />
        </button>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          background:
            'linear-gradient(135deg,#f59e0b,#d97706)',
          borderRadius: 18,
          padding:
            '18px 16px',
          color: '#fff',
          boxShadow:
            '0 6px 18px rgba(245,158,11,0.18)',
        }}
      >
        <div
          className="d-flex align-items-center gap-2 mb-2"
        >
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background:
                'rgba(255,255,255,0.15)',
            }}
          >
            <FiDollarSign
              size={18}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              Total Pemasukan
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              Rp{' '}
              {totalJumlah.toLocaleString(
                'id-ID'
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          Total pemasukan
          tambahan bulan ini
        </div>
      </div>

      {/* EMPTY */}
      {pemasukanList.length ===
      0 ? (
        <div
          style={{
            background:
              '#fff',
            border:
              '1px solid #f1f5f9',
            borderRadius: 16,
            padding:
              '30px 20px',
            textAlign:
              'center',
            color: '#777',
            fontSize: 13,
          }}
        >
          Belum ada data
          pemasukan bulan ini
          ✨
        </div>
      ) : (
        <>
          {/* CARD LIST */}
          <div className="d-flex flex-column gap-2">
            {currentRows.map(
              (item) => (
                <div
                  key={item.id}
                  style={{
                    background:
                      '#fff',

                    border:
                      '1px solid #f4f4f5',

                    borderRadius: 14,

                    padding:
                      '12px 14px',

                    boxShadow:
                      '0 1px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {/* DATE */}
                      <div
                        style={{
                          fontSize: 11,
                          color:
                            '#999',
                          fontWeight: 600,
                          marginBottom: 6,
                        }}
                      >
                        {dayjs(
                          item.tanggal
                        ).format(
                          'DD MMM YYYY'
                        )}
                      </div>

                      {/* JUMLAH */}
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color:
                            '#d97706',
                          lineHeight: 1.1,
                        }}
                      >
                        + Rp{' '}
                        {item.jumlah.toLocaleString(
                          'id-ID'
                        )}
                      </div>

                      {/* KETERANGAN */}
                      <div
                        style={{
                          fontSize: 11,
                          color:
                            '#777',
                          marginTop: 6,

                          whiteSpace:
                            'nowrap',

                          overflow:
                            'hidden',

                          textOverflow:
                            'ellipsis',
                        }}
                      >
                        {item.keterangan ||
                          'Tidak ada catatan'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-center align-items-center gap-2 mt-1">
            <button
              className="btn border-0 d-flex align-items-center justify-content-center"
              style={{
                width: 34,
                height: 34,

                borderRadius: 10,

                background:
                  '#f4f4f5',
              }}
              onClick={() =>
                page > 0 &&
                setPage(
                  page - 1
                )
              }
              disabled={
                page === 0
              }
            >
              <FiChevronLeft size={15} />
            </button>

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#666',
                minWidth: 42,
                textAlign:
                  'center',
              }}
            >
              {page + 1}/
              {totalPages}
            </div>

            <button
              className="btn border-0 d-flex align-items-center justify-content-center"
              style={{
                width: 34,
                height: 34,

                borderRadius: 10,

                background:
                  '#f4f4f5',
              }}
              onClick={() =>
                page <
                  totalPages -
                    1 &&
                setPage(
                  page + 1
                )
              }
              disabled={
                page >=
                totalPages -
                  1
              }
            >
              <FiChevronRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PemasukanLainListPage;