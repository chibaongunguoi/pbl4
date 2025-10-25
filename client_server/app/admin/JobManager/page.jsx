"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import Pagination from "../components/Pagination";

export default function JobManagerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [followCounts, setFollowCounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      const jobsData = data.data || [];
      setJobs(jobsData);
      
      // Fetch follow counts for all jobs
      if (jobsData.length > 0) {
        fetchFollowCounts(jobsData);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
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
      } else {
        console.error('Error fetching follow counts:', response.status);
        // Set all counts to 0 if failed
        const zeroCounts = {};
        jobIds.forEach(id => { zeroCounts[id] = 0; });
        setFollowCounts(zeroCounts);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
      // Set all counts to 0 if failed
      const zeroCounts = {};
      jobsList.forEach(job => { zeroCounts[job._id] = 0; });
      setFollowCounts(zeroCounts);
    }
  };

  const handleEdit = (job) => {
    setEditingJob({...job});
    setShowEditForm(true);
    setSubmitMessage({ type: '', text: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch(`/api/jobDetail/${editingJob._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingJob),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage({ type: 'success', text: 'Cập nhật công việc thành công!' });
        fetchJobs();
        setTimeout(() => {
          setShowEditForm(false);
          setEditingJob(null);
          setSubmitMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra khi cập nhật công việc' });
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setSubmitMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật công việc' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditingJob(prev => ({ ...prev, [field]: value }));
  };

  const handleDescriptionChange = (key, value) => {
    setEditingJob(prev => ({
      ...prev,
      descriptions: {
        ...prev.descriptions,
        [key]: value
      }
    }));
  };

  const handleJobInfoChange = (key, value) => {
    setEditingJob(prev => ({
      ...prev,
      job_info: {
        ...prev.job_info,
        [key]: value
      }
    }));
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditingJob(prev => ({ ...prev, skills: skillsArray }));
  };

  const addDescriptionField = () => {
    // Thêm một trường mô tả mới với key rỗng
    setEditingJob(prev => ({
      ...prev,
      descriptions: {
        ...prev.descriptions,
        [`Trường mới ${Object.keys(prev.descriptions || {}).length + 1}`]: ''
      }
    }));
  };

  const removeDescriptionField = (key) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa trường "${key}"?`)) {
      return;
    }
    
    setEditingJob(prev => {
      const newDescriptions = { ...prev.descriptions };
      delete newDescriptions[key];
      return {
        ...prev,
        descriptions: newDescriptions
      };
    });
  };

  const updateDescriptionKey = (oldKey, newKey) => {
    if (oldKey === newKey) return;
    
    setEditingJob(prev => {
      const newDescriptions = {};
      Object.keys(prev.descriptions || {}).forEach(key => {
        if (key === oldKey) {
          newDescriptions[newKey] = prev.descriptions[key];
        } else {
          newDescriptions[key] = prev.descriptions[key];
        }
      });
      return {
        ...prev,
        descriptions: newDescriptions
      };
    });
  };

  const addJobInfoField = () => {
    setEditingJob(prev => ({
      ...prev,
      job_info: {
        ...prev.job_info,
        [`Trường mới ${Object.keys(prev.job_info || {}).length + 1}`]: ''
      }
    }));
  };

  const removeJobInfoField = (key) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa trường "${key}"?`)) {
      return;
    }
    
    setEditingJob(prev => {
      const newJobInfo = { ...prev.job_info };
      delete newJobInfo[key];
      return {
        ...prev,
        job_info: newJobInfo
      };
    });
  };

  const updateJobInfoKey = (oldKey, newKey) => {
    if (oldKey === newKey) return;
    
    setEditingJob(prev => {
      const newJobInfo = {};
      Object.keys(prev.job_info || {}).forEach(key => {
        if (key === oldKey) {
          newJobInfo[newKey] = prev.job_info[key];
        } else {
          newJobInfo[key] = prev.job_info[key];
        }
      });
      return {
        ...prev,
        job_info: newJobInfo
      };
    });
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
        fetchJobs();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa công việc');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Có lỗi xảy ra khi xóa công việc');
    }
  };

  if (showEditForm && editingJob) {
    return (
      <div>
        <div className="admin-content-header">
          <h1 className="admin-content-title">Chỉnh sửa công việc</h1>
          <p className="admin-content-subtitle">Cập nhật thông tin công việc</p>
        </div>

        <div className="add-company-section">
          {submitMessage.text && (
            <div className={`submit-message ${submitMessage.type}`}>
              <svg className="message-icon" fill="currentColor" viewBox="0 0 20 20">
                {submitMessage.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                )}
              </svg>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="add-company-form">
            {/* Thông tin cơ bản */}
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#374151', fontSize: '18px' }}>Thông tin cơ bản</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tên công việc </label>
                <input
                  type="text"
                  value={editingJob.job_title || ''}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL công việc</label>
                <input
                  type="url"
                  value={editingJob.url || ''}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tên công ty</label>
                <input
                  type="text"
                  value={editingJob.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL công ty</label>
                <input
                  type="url"
                  value={editingJob.company_url || ''}
                  onChange={(e) => handleInputChange('company_url', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Địa điểm</label>
                <input
                  type="text"
                  value={editingJob.province || ''}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mức lương</label>
                <input
                  type="text"
                  value={editingJob.salary || ''}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className="form-input"
                  placeholder="VD: 60-80 triệu"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">URL thumbnail</label>
                <input
                  type="url"
                  value={editingJob.thumbnail || ''}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Kỹ năng (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={editingJob.skills?.join(', ') || ''}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="form-input"
                  placeholder="VD: Bridge Engineer, Java, Python"
                />
              </div>
            </div>

            {/* Mô tả công việc */}
            <h3 style={{ marginTop: '32px', marginBottom: '20px', color: '#374151', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Mô tả công việc</span>
              <button 
                type="button"
                onClick={addDescriptionField}
                className="add-company-btn"
                style={{ marginBottom: 0, padding: '8px 16px', fontSize: '14px' }}
              >
                <svg className="add-icon" fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </h3>

            {Object.keys(editingJob.descriptions || {}).map((key, index) => (
              <div key={index} className="form-row" style={{ position: 'relative', marginBottom: '24px' }}>
                <div className="form-group full-width">
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateDescriptionKey(key, e.target.value)}
                      className="form-input"
                      placeholder="Nhập tên trường (VD: Mô tả công việc, Yêu cầu công việc...)"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeDescriptionField(key)}
                      className="delete-company-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', minWidth: 'auto' }}
                      title="Xóa trường này"
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={editingJob.descriptions[key] || ''}
                    onChange={(e) => handleDescriptionChange(key, e.target.value)}
                    className="form-textarea"
                    rows="5"
                    placeholder="Nhập nội dung..."
                  />
                </div>
              </div>
            ))}

            {Object.keys(editingJob.descriptions || {}).length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontStyle: 'italic' }}>
                Chưa có trường mô tả nào. Nhấn nút "Thêm trường" để thêm.
              </div>
            )}

            {/* Thông tin tuyển dụng */}
            <h3 style={{ marginTop: '32px', marginBottom: '20px', color: '#374151', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Thông tin tuyển dụng</span>
              <button 
                type="button"
                onClick={addJobInfoField}
                className="add-company-btn"
                style={{ marginBottom: 0, padding: '8px 16px', fontSize: '14px' }}
              >
                <svg className="add-icon" fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </h3>

            {Object.keys(editingJob.job_info || {}).map((key, index) => (
              <div key={index} className="form-row" style={{ position: 'relative', marginBottom: '16px' }}>
                <div className="form-group full-width">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateJobInfoKey(key, e.target.value)}
                      className="form-input"
                      placeholder="Nhập tên trường (VD: Kinh nghiệm, Trình độ...)"
                      style={{ flex: '0 0 200px' }}
                    />
                    <input
                      type="text"
                      value={editingJob.job_info[key] || ''}
                      onChange={(e) => handleJobInfoChange(key, e.target.value)}
                      className="form-input"
                      placeholder="Nhập giá trị..."
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeJobInfoField(key)}
                      className="delete-company-btn"
                      style={{ padding: '8px 12px', fontSize: '12px', minWidth: 'auto' }}
                      title="Xóa trường này"
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {Object.keys(editingJob.job_info || {}).length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontStyle: 'italic' }}>
                Chưa có trường thông tin nào. Nhấn nút "Thêm trường" để thêm.
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingJob(null);
                  setSubmitMessage({ type: '', text: '' });
                }}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
                  <th style={{ width: '140px' }}>Lượt yêu thích</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-jobs">
                      Không có công việc nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedJobs = jobs.slice(startIndex, endIndex);
                    
                    return paginatedJobs.map((job, index) => (
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
                        <td className="date-cell" style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span>{followCounts[job._id] !== undefined ? followCounts[job._id] : '...'}</span>
                          </div>
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
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={jobs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
