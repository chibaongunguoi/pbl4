"use client";

import { useState } from "react";
import "./EditJobForm.css";

export default function EditJobForm({ job, onSave, onCancel }) {
  const [editingJob, setEditingJob] = useState({...job});
  const [saving, setSaving] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

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
        setTimeout(() => {
          onSave();
        }, 1500);
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

  return (
    <div className="edit-job-form-container">
      <div className="edit-job-form-header">
        <h1>Chỉnh sửa công việc</h1>
        <p className="subtitle">Cập nhật thông tin công việc</p>
      </div>

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

      <form onSubmit={handleSaveEdit} className="job-edit-form">
        <h3 className="section-title">Thông tin cơ bản</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tên công việc *</label>
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

        <div className="section-header-with-button">
          <h3 className="section-title">Mô tả công việc</h3>
          <button 
            type="button"
            onClick={addDescriptionField}
            className="add-field-btn"
          >
            <svg className="add-icon" fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Thêm trường
          </button>
        </div>

        {Object.keys(editingJob.descriptions || {}).map((key, index) => (
          <div key={index} className="description-field">
            <div className="field-header">
              <input
                type="text"
                value={key}
                onChange={(e) => updateDescriptionKey(key, e.target.value)}
                className="form-input field-name-input"
                placeholder="Nhập tên trường (VD: Mô tả công việc, Yêu cầu công việc...)"
              />
              <button
                type="button"
                onClick={() => removeDescriptionField(key)}
                className="delete-field-btn"
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
        ))}

        {Object.keys(editingJob.descriptions || {}).length === 0 && (
          <div className="empty-state">
            Chưa có trường mô tả nào. Nhấn nút "Thêm trường" để thêm.
          </div>
        )}

        <div className="section-header-with-button">
          <h3 className="section-title">Thông tin tuyển dụng</h3>
          <button 
            type="button"
            onClick={addJobInfoField}
            className="add-field-btn"
          >
            <svg className="add-icon" fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Thêm trường
          </button>
        </div>

        {Object.keys(editingJob.job_info || {}).map((key, index) => (
          <div key={index} className="job-info-field">
            <input
              type="text"
              value={key}
              onChange={(e) => updateJobInfoKey(key, e.target.value)}
              className="form-input info-key-input"
              placeholder="Nhập tên trường (VD: Kinh nghiệm, Trình độ...)"
            />
            <input
              type="text"
              value={editingJob.job_info[key] || ''}
              onChange={(e) => handleJobInfoChange(key, e.target.value)}
              className="form-input info-value-input"
              placeholder="Nhập giá trị..."
            />
            <button
              type="button"
              onClick={() => removeJobInfoField(key)}
              className="delete-field-btn"
              title="Xóa trường này"
            >
              <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        ))}

        {Object.keys(editingJob.job_info || {}).length === 0 && (
          <div className="empty-state">
            Chưa có trường thông tin nào. Nhấn nút "Thêm trường" để thêm.
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
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
  );
}
