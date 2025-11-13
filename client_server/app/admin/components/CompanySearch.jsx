"use client";

import { useState, useEffect } from "react";

export default function CompanySearch({ companies, onFilteredResults }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Custom scrollbar styles
  const scrollbarStyles = `
    select::-webkit-scrollbar {
      width: 6px;
    }
    select::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    select::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
    select::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;

  useEffect(() => {
    filterCompanies();
  }, [searchQuery, companies]);

  const filterCompanies = () => {
    let filtered = [...companies];

    // Filter by search query (company name, email, or phone)
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(company => 
        company.name?.toLowerCase().includes(term) ||
        company.email?.toLowerCase().includes(term) ||
        company.phone?.toLowerCase().includes(term)
      );
    }

    onFilteredResults(filtered);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <svg 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}
              width="20" 
              height="20" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            style={{
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '42px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Xóa bộ lọc
          </button>
        )}
      </div>
    </>
  );
}
