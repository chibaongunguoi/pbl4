"use client";

import Link from "next/link";
import Image from "next/image";
import "@/app/styles/home.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([]); // State để lưu dữ liệu từ API

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.data);
        // Cập nhật state jobs với data.data
        if (data.data) {
          setJobs(data.data);
        }
      }
    })();
  }, []);

  const jobsPerPage = 24;
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Calculate jobs for current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <div className="header-section">
        <h1>Cơ hội việc làm</h1>
        <Link href="/jobs">
          Xem thêm <span className="arrow-icon">→</span>
        </Link>
      </div>

      {/* Job Cards Grid */}
      <div className="jobs-grid">
        {currentJobs.map((job) => (
          <div key={job._id} className="job-card">
            <div className="job-header">
              <div className="company-logo">
                <Image
                  src={job.thumbnail}
                  alt={job.company_name}
                  width={64}
                  height={64}
                />
              </div>
              <div className="job-info">
                <h3 className="job-title">{job.company_name}</h3>
                <div className="job-details">
                  <span className="detail-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {job.salary}
                  </span>
                  <span className="detail-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.province}
                  </span>
                </div>
                <div className="skills-list">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`pagination-button ${currentPage === pageNumber ? "active" : ""
                }`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}

        <button
          className="pagination-button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
