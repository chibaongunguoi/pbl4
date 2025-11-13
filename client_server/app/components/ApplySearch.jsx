"use client";

import { useState } from "react";
import Search from "./Search";

export default function ApplySearch({ applications, companyJobs, onFilteredResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    filterApplications(searchQuery, selectedJobFilter);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterApplications(query, selectedJobFilter);
  };

  const handleJobFilterChange = (e) => {
    const jobTitle = e.target.value;
    setSelectedJobFilter(jobTitle);
    filterApplications(searchQuery, jobTitle);
  };

  const filterApplications = (query, jobFilter) => {
    let filtered = applications;

    // Filter by job title first
    if (jobFilter) {
      filtered = filtered.filter(app => app.JobDetailID?.job_title === jobFilter);
    }

    // Then filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      filtered = filtered.filter(application => {
        // Search in job title
        const jobTitle = application.JobDetailID?.job_title?.toLowerCase() || '';
        
        // Search in applicant name
        const applicantName = application.userProfile?.name?.toLowerCase() || '';
        
        // Search in phone
        const phone = application.userProfile?.phone?.toLowerCase() || '';
        
        // Search in status
        const status = application.status?.toLowerCase() || '';
        
        return jobTitle.includes(lowerQuery) || 
               applicantName.includes(lowerQuery) || 
               phone.includes(lowerQuery) ||
               status.includes(lowerQuery);
      });
    }

    onFilteredResults(filtered);
  };

  return (
    <div className="apply-search-wrapper">
      <div className="apply-search-row">
       <select 
          className="job-filter-select"
          value={selectedJobFilter}
          onChange={handleJobFilterChange}
        >
          <option value="">Tất cả công việc</option>
          {companyJobs && companyJobs.map((job) => (
            <option key={job._id} value={job.job_title}>{job.job_title}</option>
          ))}
        </select>
        <div style={{visibility: 'hidden'}}>l</div>
        <Search
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          onSearch={handleSearch}
          placeholder="Tìm kiếm theo tên, công việc, SĐT, trạng thái..."
        />
        
      </div>
    </div>
  );
}
