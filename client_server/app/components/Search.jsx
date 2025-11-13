"use client";

export default function Search({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder = "Tìm kiếm việc làm",
  onSearch 
}) {
  return (
    <div className="form-group form-icon-left">
      <i className="icon-search form-icon"></i>
      <input
        type="text"
        name="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        className="form-control"
      />
      <button 
        aria-label="Tìm kiếm" 
        className="btn"
        onClick={onSearch}
      >
        <i className="icon-arrow-right"></i>
      </button>
    </div>
  );
}
