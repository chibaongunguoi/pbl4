"use client";

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage = 20, 
  onPageChange 
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Không hiển thị pagination nếu chỉ có 1 trang hoặc không có dữ liệu
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          className={`pagination-button ${currentPage === pageNumber ? "active" : ""}`}
          onClick={() => handlePageClick(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}

      <button
        className="pagination-button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
