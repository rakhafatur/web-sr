import React from 'react';

type Props = {
  keyword: string;
  placeholder?: string;
  onKeywordChange: (value: string) => void;
  onAddClick: () => void;
  addLabel?: React.ReactNode;
  buttonColor?: string; // contoh: 'btn-success', 'btn-outline-success', dsb
};

const ListToolbar = ({
  keyword,
  onKeywordChange,
  onAddClick,
  placeholder = '🔍 Cari...',
  addLabel = '➕ Tambah',
  buttonColor = 'btn-success',
}: Props) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <button className={`btn ${buttonColor} fw-bold`} onClick={onAddClick}>
        {addLabel}
      </button>
      <input
        type="text"
        className="form-input-sr"
        style={{ maxWidth: '300px' }}
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
    </div>
  );
};

export default ListToolbar;