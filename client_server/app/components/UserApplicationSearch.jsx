"use client";

import { useState, useEffect } from 'react';
import './userApplicationSearch.css';

export default function UserApplicationSearch({ applications, onFilteredResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    let filtered = applications;

    // Filter by search query (job title or company name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.JobDetailID?.job_title?.toLowerCase().includes(query) ||
        app.JobDetailID?.company_name?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    onFilteredResults(filtered);
  }, [searchQuery, selectedStatus, applications, onFilteredResults]);

  const handleClear = () => {
    setSearchQuery('');
    setSelectedStatus('all');
  };

  const isFilterActive = searchQuery.trim() || selectedStatus !== 'all';

  // Count applications by status
  const statusCounts = {
    all: applications.length,
    'chưa duyệt': applications.filter(app => app.status === 'chưa duyệt').length,
    'đã duyệt': applications.filter(app => app.status === 'đã duyệt').length,
    'đã từ chối': applications.filter(app => app.status === 'đã từ chối').length,
  };

  return (
    <div className="user-application-search">
      <div className="search-controls">
        <div className="status-filter-wrapper">
          <select
            className="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tất cả ({statusCounts.all})</option>
            <option value="chưa duyệt">Chưa duyệt ({statusCounts['chưa duyệt']})</option>
            <option value="đã duyệt">Đã duyệt ({statusCounts['đã duyệt']})</option>
            <option value="đã từ chối">Đã từ chối ({statusCounts['đã từ chối']})</option>
          </select>
        </div>
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tên công việc hoặc công ty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isFilterActive && (
            <button className="clear-btn" onClick={handleClear} title="Xóa bộ lọc">
              <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>

        
      </div>
    </div>
  );
}
