"use client";

import { useEffect, useState } from "react";
import "../admin.css";

export default function JobManagerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobDetail');
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        setJobs([]);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        setJobs([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response body');
        setJobs([]);
        return;
      }

      const data = JSON.parse(text);
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    // TODO: Implement edit functionality
    alert(`Chỉnh sửa công việc: ${job.title}\nChức năng này đang được phát triển.`);
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobDetail/${jobId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Xóa công việc thành công!');
        fetchJobs();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa công việc');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Có lỗi xảy ra khi xóa công việc');
    }
  };

  return (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Quản lý công việc</h1>
        <p className="admin-content-subtitle">Danh sách tất cả công việc trong hệ thống</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          Đang tải danh sách công việc...
        </div>
      ) : (
        <div className="jobs-section">
          <div className="jobs-header">
            <h2>Danh sách công việc ({jobs.length})</h2>
            <button className="refresh-btn" onClick={fetchJobs}>
              <svg className="refresh-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              Làm mới
            </button>
          </div>
          
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Tên công việc</th>
                  <th>Công ty</th>
                  <th>Địa điểm</th>
                  <th>Ngày đăng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-jobs">
                      Không có công việc nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  jobs.map((job, index) => (
                    
                    <tr key={job.id || index} className="job-row">
                        {console.log(job)}
                      <td>
                        <div className="job-logo">
                          {job.thumbnail ? (
                            <img 
                              src={job.thumbnail} 
                              alt={job.company}
                              className="company-logo"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="job-title-cell">
                        <div className="job-title-info">
                          <span className="job-title">{job.job_title}</span>
                          <div className="job-skills">
                            {/* {job.skills && job.skills.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="skill-tag-mini">{skill}</span>
                            ))}
                            {job.skills && job.skills.length > 2 && (
                              <span className="more-skills-mini">+{job.skills.length - 2}</span>
                            )} */}
                          </div>
                        </div>
                      </td>
                      <td className="company-cell">{job.company_name}</td>
                      <td className="location-cell">{job.province}</td>
                
                      <td className="date-cell">
                        {convertDateTime(job.collected_at) || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(job)}
                            className="edit-company-btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            title="Chỉnh sửa"
                          >
                            <svg className="edit-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="delete-company-btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            title="Xóa"
                          >
                            <svg className="delete-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
