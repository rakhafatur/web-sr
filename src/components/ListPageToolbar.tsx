import { FiSearch } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';

type Props = {
  title: string;
  subtitle: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  placeholder?: string;
};

/** Topbar + search box standar untuk halaman *ListPage (Ladies/User/Pengawas/Agent/
    UserApproval) — sebelumnya markup ini di-copy paste sama persis di tiap halaman. */
const ListPageToolbar = ({ title, subtitle, keyword, onKeywordChange, placeholder = 'Cari...' }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const searchInput = (
    <input
      className="form-control form-control-sm"
      style={!isMobile ? { paddingLeft: 35, borderRadius: 10 } : undefined}
      placeholder={placeholder}
      value={keyword}
      onChange={(e) => onKeywordChange(e.target.value)}
    />
  );

  return (
    <>
      {/* TOPBAR */}
      <div className="px-3 py-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <div>
            <div className="fw-bold">{title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>
              {subtitle}
            </div>
          </div>

          {!isMobile && (
            <div style={{ width: 300, position: 'relative' }}>
              <FiSearch
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  color: 'var(--color-gray-500)',
                }}
              />
              {searchInput}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      {isMobile && <div className="p-2 border-bottom">{searchInput}</div>}
    </>
  );
};

export default ListPageToolbar;
