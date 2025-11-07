"use client";

import { useState, useEffect, useRef } from "react";
import "../admin.css";

export default function ScrapeManagerPage() {
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeButtonActive, setScrapeButtonActive] = useState(true);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentJobId, setCurrentJobId] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const pollingIntervalRef = useRef(null);

  // Show toast notification
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Poll job status
  const pollJobStatus = async (jobId) => {
    try {
      const response = await fetch(`/api/scrape/status/${jobId}`);
      if (response.ok) {
        const { job } = await response.json();
        
        // Update job in recent jobs list
        setRecentJobs(prev => {
          const index = prev.findIndex(j => j.id === jobId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = job;
            return updated;
          }
          return [job, ...prev];
        });

        // If job is completed or failed, stop polling and show notification
        if (job.status === 'completed' || job.status === 'failed') {
          if (currentJobId === jobId) {
            setCurrentJobId(null);
            setScrapeButtonActive(true);
            setLoadingScrape(false);
            
            if (job.status === 'completed') {
              showToast('success', `Cào dữ liệu thành công! Đã thu thập ${job.jobCount} công việc.`);
              setMessage({ type: 'success', text: `Hoàn thành! Đã thu thập ${job.jobCount} công việc.` });
              setScrapeUrl("");
            } else {
              showToast('error', `Cào dữ liệu thất bại: ${job.errorMessage || 'Lỗi không xác định'}`);
              setMessage({ type: 'error', text: job.errorMessage || 'Có lỗi xảy ra khi cào dữ liệu!' });
            }
          }
          
          // Stop polling for this job
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error("Error polling job status:", error);
    }
  };

  // Fetch recent jobs on mount
  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response = await fetch('/api/scrape/jobs');
        if (response.ok) {
          const { jobs } = await response.json();
          setRecentJobs(jobs || []);
        }
      } catch (error) {
        console.error("Error fetching recent jobs:", error);
      }
    };
    
    fetchRecentJobs();
  }, []);

  // Start polling when a job is submitted
  useEffect(() => {
    if (currentJobId) {
      // Poll immediately
      pollJobStatus(currentJobId);
      
      // Then poll every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(currentJobId);
      }, 3000);
    }

    // Cleanup on unmount or when jobId changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [currentJobId]);

  const handleScrapeSubmit = async (e) => {
    e.preventDefault();
    setScrapeButtonActive(false);
    setLoadingScrape(true);
    setMessage({ type: '', text: '' });
    
    const form_data = new FormData(e.currentTarget);
    const url = form_data.get("url");
    
    try {
      const response = await fetch("/api/scrape/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const { jobId } = await response.json();
        setCurrentJobId(jobId);
        setMessage({ type: 'info', text: 'Đang xử lý yêu cầu cào dữ liệu...' });
        // Polling will be handled by useEffect
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra khi gửi yêu cầu!' });
        setScrapeButtonActive(true);
        setLoadingScrape(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi gửi yêu cầu!' });
      setScrapeButtonActive(true);
      setLoadingScrape(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            {toast.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            )}
          </svg>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="admin-content-header">
        <h1 className="admin-content-title">Crawl thông tin việc làm</h1>
        <p className="admin-content-subtitle">Nhập URL để cào dữ liệu việc làm mới</p>
      </div>

      <div className="scrape-section">
        {message.text && (
          <div className={`submit-message ${message.type}`} style={{ marginBottom: '24px' }}>
            <svg className="message-icon" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              )}
            </svg>
            {message.text}
          </div>
        )}

        <div className="scrape-form-container">
          <form onSubmit={handleScrapeSubmit} className="scrape-form">
            <div className="form-group">
              <label htmlFor="url" className="form-label">
                URL cần cào dữ liệu:
              </label>
              <div className="input-group">
                <input
                  type="url"
                  name="url"
                  id="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="Nhập URL (ví dụ: https://www.topcv.vn/tim-viec-lam)..."
                  className="url-input"
                  required
                />
                <button 
                  type="submit" 
                  className={`submit-btn ${!scrapeButtonActive ? 'disabled' : ''}`}
                  disabled={!scrapeButtonActive}
                >
                  {loadingScrape ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Đang cào...
                    </>
                  ) : (
                    'Bắt đầu cào'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="scrape-instructions">
          <h3>Hướng dẫn sử dụng:</h3>
          <ul>
            <li>Nhập URL của trang web chứa thông tin việc làm</li>
            <li>Hệ thống sẽ tự động phân tích và trích xuất dữ liệu</li>
            <li>Dữ liệu sau khi cào sẽ được lưu vào hệ thống</li>
            <li>Kiểm tra tab "Quản lý công việc" để xem kết quả</li>
          </ul>
        </div>
      </div>

      {/* Recent Jobs Section */}
      {recentJobs.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            Lịch sử cào dữ liệu
          </h2>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>URL</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Số công việc</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Thời gian tạo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job, index) => (
                  <tr key={job.id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        {job.url}
                      </a>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(job.status)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                      {job.status === 'completed' ? job.jobCount : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {formatDate(job.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>
                      {formatDate(job.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
