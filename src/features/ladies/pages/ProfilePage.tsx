import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { supabase } from '../../../lib/supabaseClient';
import {
  FiMapPin,
  FiKey,
  FiSmartphone,
  FiUser,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';
import logo from '../../../assets/logosr-green.png';

type UserWithLadies = {
  id: string;
  username: string;
  nama: string;
  ladies_id: string;
};

type LadiesData = {
  nama_ladies: string;
  nama_outlet: string;
  pin: string;
  status: string;
};

const ProfilePage = () => {
  const user = useSelector(
    (state: RootState) =>
      state.user.currentUser
  ) as UserWithLadies;

  const [ladies, setLadies] =
    useState<LadiesData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchLadies =
      async () => {
        if (
          !user?.ladies_id
        )
          return;

        setLoading(true);

        const {
          data,
          error,
        } = await supabase
          .from('ladies')
          .select(
            'nama_ladies, nama_outlet, pin, status'
          )
          .eq(
            'id',
            user.ladies_id
          )
          .single();

        if (!error) {
          setLadies(data);
        }

        setLoading(false);
      };

    fetchLadies();
  }, [user?.ladies_id]);

  const getStatusStyle = (
    status?: string
  ) => {
    switch (
      status?.toUpperCase()
    ) {
      case 'AKTIF':
        return {
          bg: '#dcfce7',
          text: '#15803d',
          label: 'Aktif',
        };

      case 'NONAKTIF':
        return {
          bg: '#fee2e2',
          text: '#dc2626',
          label:
            'Nonaktif',
        };

      default:
        return {
          bg: '#f3f4f6',
          text: '#374151',
          label: status || '-',
        };
    }
  };

  const statusStyle =
    getStatusStyle(
      ladies?.status
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
          Memuat profile...
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column gap-3"
      style={{
        paddingBottom: 24,
      }}
    >
      {/* HERO CARD */}
      <div
        style={{
          background:
            'linear-gradient(135deg,#22c55e,#16a34a)',
          borderRadius: 24,
          padding:
            '24px 20px',
          color: '#fff',
          position:
            'relative',
          overflow:
            'hidden',
          boxShadow:
            '0 10px 30px rgba(34,197,94,0.18)',
        }}
      >
        {/* BG CIRCLE */}
        <div
          style={{
            position:
              'absolute',
            width: 160,
            height: 160,
            borderRadius:
              '50%',
            background:
              'rgba(255,255,255,0.08)',
            top: -60,
            right: -60,
          }}
        />

        <div
          className="d-flex flex-column align-items-center text-center"
          style={{
            position:
              'relative',
            zIndex: 2,
          }}
        >
          {/* AVATAR */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 82,
              height: 82,
              borderRadius:
                '50%',
              background:
                'rgba(255,255,255,0.18)',
              backdropFilter:
                'blur(10px)',
              marginBottom: 14,
              border:
                '2px solid rgba(255,255,255,0.25)',
            }}
          >
            <FiUser
              size={34}
            />
          </div>

          {/* NAME */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {ladies?.nama_ladies ||
              '-'}
          </div>

          {/* OUTLET */}
          <div
            className="d-flex align-items-center gap-1"
            style={{
              marginTop: 6,
              fontSize: 13,
              opacity: 0.92,
            }}
          >
            <FiMapPin
              size={13}
            />
            {
              ladies?.nama_outlet
            }
          </div>

          {/* STATUS */}
          <div
            style={{
              marginTop: 16,
              padding:
                '6px 14px',
              borderRadius: 999,
              background:
                'rgba(255,255,255,0.16)',
              fontSize: 12,
              fontWeight: 700,
              backdropFilter:
                'blur(10px)',
            }}
          >
            {statusStyle.label}
          </div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="d-flex flex-column gap-2">
        {/* USERNAME */}
        <div
          style={{
            background:
              '#fff',
            border:
              '1px solid #f1f5f9',
            borderRadius: 18,
            padding:
              '14px 16px',
            boxShadow:
              '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background:
                  '#dbeafe',
                color:
                  '#2563eb',
                flexShrink: 0,
              }}
            >
              <FiSmartphone
                size={18}
              />
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color:
                    '#999',
                  fontWeight: 600,
                }}
              >
                Username
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color:
                    '#111827',
                  marginTop: 2,
                }}
              >
                {user.username ||
                  '-'}
              </div>
            </div>
          </div>
        </div>

        {/* PIN */}
        <div
          style={{
            background:
              '#fff',
            border:
              '1px solid #f1f5f9',
            borderRadius: 18,
            padding:
              '14px 16px',
            boxShadow:
              '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background:
                  '#fee2e2',
                color:
                  '#dc2626',
                flexShrink: 0,
              }}
            >
              <FiKey
                size={18}
              />
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color:
                    '#999',
                  fontWeight: 600,
                }}
              >
                PIN
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color:
                    '#111827',
                  marginTop: 2,
                  letterSpacing: 1,
                }}
              >
                {ladies?.pin ||
                  '-'}
              </div>
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div
          style={{
            background:
              '#fff',
            border:
              '1px solid #f1f5f9',
            borderRadius: 18,
            padding:
              '14px 16px',
            boxShadow:
              '0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background:
                  statusStyle.bg,
                color:
                  statusStyle.text,
                flexShrink: 0,
              }}
            >
              <FiCheckCircle
                size={18}
              />
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color:
                    '#999',
                  fontWeight: 600,
                }}
              >
                Status Account
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color:
                    statusStyle.text,
                  marginTop: 2,
                }}
              >
                {
                  statusStyle.label
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CARD */}
      <div
        style={{
          background:
            '#fff',
          border:
            '1px solid #f1f5f9',
          borderRadius: 18,
          padding:
            '16px',
          marginTop: 2,
          boxShadow:
            '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <FiShield
            size={16}
            color="#16a34a"
          />

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color:
                '#111827',
            }}
          >
            Keamanan Akun
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            color: '#666',
            lineHeight: 1.6,
          }}
        >
          Jangan bagikan PIN
          akun kepada siapapun
          untuk menjaga
          keamanan data dan
          transaksi kamu.
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;