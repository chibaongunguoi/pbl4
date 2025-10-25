"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import "../../admin.css";
import "@/app/ui/components/JobCard.css";
import JobCard from "@/app/ui/components/JobCard";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [followCounts, setFollowCounts] = useState({});

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetail();
    }
  }, [params.id]);

  useEffect(() => {
    if (company) {
      fetchCompanyJobs();
    }
  }, [company]);

  const convertDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const fetchCompanyDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${params.id}`);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setCompany(data.company);
      } else {
        console.error('Failed to fetch company:', data.error);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await fetch('/api/jobDetail');
      
      if (!response.ok) {
        console.error('Response not ok:', response.status);
        return;
      }

      const data = await response.json();
      
      if (data.data && company) {
        // Filter jobs by company_name
        const companyJobs = data.data.filter(job => job.company_name === company.name);
        setJobs(companyJobs);
        
        // Fetch follow counts for these jobs
        if (companyJobs.length > 0) {
          fetchFollowCounts(companyJobs);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchFollowCounts = async (jobsList) => {
    try {
      const jobIds = jobsList.map(job => job._id);
      
      const response = await fetch('/api/follow/count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobIds }),
      });
      
      if (response.ok) {
        const counts = await response.json();
        setFollowCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-content-header">
          <h1 className="admin-content-title">Chi tiết công ty</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          Đang tải thông tin công ty...
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <div className="admin-content-header">
          <h1 className="admin-content-title">Không tìm thấy công ty</h1>
        </div>
        <div className="error-container">
          <p>Công ty không tồn tại hoặc đã bị xóa.</p>
          <button 
            onClick={() => router.push('/admin/CompanyManager')}
            className="back-btn"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-content-header" style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => router.push('/admin/CompanyManager')}
          className="back-button"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#475569',
            marginBottom: '16px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#e2e8f0';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Quay lại
        </button>
        <h1 className="admin-content-title">Chi tiết công ty</h1>
        <p className="admin-content-subtitle">Thông tin chi tiết về công ty</p>
      </div>

      <div className="company-detail-container">
        {/* Company Info Card */}
        <div className="detail-card">
          <div className="detail-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {company.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                  {company.name}
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>ID: {company._id}</p>
              </div>
            </div>
          </div>

          <div className="detail-card-body">
            <div className="detail-grid">
                 <div className="detail-item">
                <div className="detail-label">
                  Username
                </div>
                <div className="detail-value">{company.username || 'Chưa cập nhật'}</div>
              </div>

              
              <div className="detail-item">
                <div className="detail-label">
                  Ngày tạo
                </div>
                <div className="detail-value">
                  {company.createdAt ? convertDateTime(company.createdAt) : 'Chưa có thông tin'}
                </div>
              </div>
            <div className="detail-item">
                <div className="detail-label">
                  Email
                </div>
                <div className="detail-value">{company.email || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">

                  Website
                </div>
                <div className="detail-value">
                  {company.website ? (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'none' }}
                      onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {company.website}
                    </a>
                  ) : 'Chưa cập nhật'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">
                  Số điện thoại
                </div>
                <div className="detail-value">{company.phone || 'Chưa cập nhật'}</div>
              </div>
        
              <div className="detail-item">
                <div className="detail-label">
                  Địa chỉ
                </div>
                <div className="detail-value">{company.address || 'Chưa cập nhật'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Card */}
        {company.description && (
          <div className="detail-card" style={{ marginTop: '24px' }}>
            <div className="detail-card-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Mô tả công ty
              </h3>
            </div>
            <div className="detail-card-body">
              <div className="detail-value" style={{ lineHeight: '1.8', fontSize: '15px', color: '#334155' }}>
                {company.description}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Card */}
        <div className="detail-card" style={{ marginTop: '24px' }}>
          <div className="detail-card-header">
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
              Công việc đã đăng ({jobs.length})
            </h3>
          </div>
          <div className="detail-card-body">
            {loadingJobs ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
                Đang tải danh sách công việc...
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                <p>Công ty chưa đăng công việc nào</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', 
                gap: '20px',
                padding: '8px 0'
              }}>
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    followCount={followCounts[job._id]}
                    showFollowBadge={true}
                    onClick={() => router.push(`/job/${job._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
