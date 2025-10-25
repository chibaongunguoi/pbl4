"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import "../../admin.css";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetail();
      fetchCompanyJobs();
    }
  }, [params.id]);

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
      
      if (data.data) {
        // Filter jobs by company_id
        const companyJobs = data.data.filter(job => job.company_id === params.id);
        setJobs(companyJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
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
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  Email
                </div>
                <div className="detail-value">{company.email || 'Chưa cập nhật'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  Số điện thoại
                </div>
                <div className="detail-value">{company.phone || 'Chưa cập nhật'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  Username
                </div>
                <div className="detail-value">{company.username || 'Chưa cập nhật'}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                  </svg>
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
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                  Ngày tạo
                </div>
                <div className="detail-value">
                  {company.createdAt ? convertDateTime(company.createdAt) : 'Chưa có thông tin'}
                </div>
              </div>

              <div className="detail-item full-width">
                <div className="detail-label">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  Địa chỉ
                </div>
                <div className="detail-value">{company.address || 'Chưa cập nhật'}</div>
              </div>

              {company.description && (
                <div className="detail-item full-width">
                  <div className="detail-label">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    Mô tả
                  </div>
                  <div className="detail-value" style={{ lineHeight: '1.6' }}>
                    {company.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
                <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" style={{ margin: '0 auto 16px', opacity: '0.3' }}>
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                <p>Công ty chưa đăng công việc nào</p>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="job-item"
                    style={{
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => router.push(`/job/${job._id}`)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {job.thumbnail && (
                        <img 
                          src={job.thumbnail} 
                          alt={job.job_title}
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            objectFit: 'contain',
                            borderRadius: '4px' 
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                          {job.job_title}
                        </h4>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                          {job.province && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                              </svg>
                              {job.province}
                            </span>
                          )}
                          {job.collected_at && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                              </svg>
                              {convertDateTime(job.collected_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
