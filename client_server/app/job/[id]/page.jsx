"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./page.css";

export default function CardDetail() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');
  function convertInlineAsterisks(text) {
  return text
    .split(/\s*\*\s+/)     // Tách bằng dấu *
    .map(s => s.trim())    // Xóa khoảng trắng thừa
    .filter(Boolean)       // Bỏ chuỗi rỗng
    .map(s => '- ' + s)    // Thêm dấu gạch đầu dòng
    .join('\n');           // Nối bằng xuống dòng
}
  useEffect(() => {
    if (jobId) {
      fetchJobDetail(jobId);
    }
  }, [jobId]);

  const fetchJobDetail = async (id) => {
    try {
      setLoading(true);
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const foundJob = data.data?.find(job => job._id === id);
        console.log(foundJob);
        setJob(foundJob || null);
      }
    } catch (error) {
      console.error('Error fetching job detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy công việc</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      {/* Header */}
      <div className="job-detail-header">
        <Link href="/" className="back-button">
          ← Quay lại
        </Link>
        <div className="job-header-content">
          <div className="company-logo-large">
            <Image
              src={job.thumbnail}
              alt={job.company_name}
              width={100}
              height={100}
            />
          </div>
          <div className="job-header-info">
            <h1 className="job-title-large">{job.job_title || job.company_name}</h1>
            <h2 className="company-name">{job.company_name}</h2>
            <div className="job-meta">
              <span className="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="meta-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.province}
              </span>
              <span className="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="meta-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {job.salary}
              </span>
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <button className="save-button">
            Yêu thích
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="job-detail-content">
        <div className="main-content">
           {Object.entries(job.descriptions).map(([key, value]) => (
        <section className="content-section" key={key}>
            <h3>{key}</h3>
            <div className="content-text">
              {convertInlineAsterisks(value)}
            </div>
          </section>
      ))}

          {/* Skills */}
          <section className="content-section">
            <h3>Kỹ năng yêu cầu</h3>
            <div className="skills-container">
              {job.skills.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="info-card">
            <h3>Thông tin chung</h3>
            <div className="info-list">
              {Object.entries(job.job_info).map(([key, value]) => (
         <div className="info-item" key={key}>
                <span className="info-label">{key}:</span>
                <span className="info-value">{value}</span>
              </div>
      ))}    
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}