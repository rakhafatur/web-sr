import React, { useEffect, useRef, useState } from 'react';
import { FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi';

export type DataCardListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
};

function DataCardList<T>({ items, getId, renderItem, onEdit, onDelete }: DataCardListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((item) => {
        const id = getId(item);
        return (
          <div
            key={id}
            className="p-3 rounded position-relative shadow-sm"
            style={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-green)',
              color: 'var(--color-dark)',
            }}
          >
            {(onEdit || onDelete) && (
              <div className="position-absolute" style={{ top: 10, right: 10 }}>
                <button
                  className="btn btn-sm border-0"
                  style={{
                    backgroundColor: '#f1f1f1',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                  onClick={() => toggleMenu(id)}
                >
                  <FiMoreHorizontal size={18} />
                </button>

                {activeId === id && (
                  <div
                    ref={menuRef}
                    className="position-absolute bg-white border rounded shadow-sm p-2"
                    style={{ top: '110%', right: 0, minWidth: 120, zIndex: 1000 }}
                  >
                    {onEdit && (
                      <button
                        className="dropdown-item text-success d-flex align-items-center gap-2"
                        onClick={() => {
                          onEdit(item);
                          setActiveId(null);
                        }}
                      >
                        <FiEdit2 /> Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={() => {
                          onDelete(id);
                          setActiveId(null);
                        }}
                      >
                        <FiTrash2 /> Hapus
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {renderItem(item)}
          </div>
        );
      })}
    </div>
  );
}

export default DataCardList;
