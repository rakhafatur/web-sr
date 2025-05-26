import React from 'react';

type Props = {
  keyword: string;
  placeholder?: string;
  onKeywordChange: (value: string) => void;
  onAddClick: () => void;
  addLabel?: string;
  buttonColor?: string;
};

const ListToolbar = ({
  keyword,
  onKeywordChange,
  onAddClick,
  placeholder = '🔍 Cari...',
  addLabel = '➕ Tambah',
  buttonColor = 'btn-primary',
}: Props) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <button className={`btn ${buttonColor} fw-bold`} onClick={onAddClick}>
        {addLabel}
      </button>
      <input
        type="text"
        className="form-control w-25 bg-dark text-light border-secondary"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
    </div>
  );
};

export default ListToolbar;