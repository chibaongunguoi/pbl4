"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../profile.css";

export default function EditUserProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: 'nam',
    birthdate: '',
    cv: '',
    description: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            const p = data.data;
            setForm({
              name: p.name || '',
              phone: p.phone || '',
              gender: p.gender || 'nam',
              birthdate: p.birthdate ? new Date(p.birthdate).toISOString().slice(0,10) : '',
              cv: p.cv || '',
              description: p.description || ''
            });
          }
        }
      } catch (err) {
        console.error('Fetch profile error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setMessage({ type: 'error', text: 'Chỉ chấp nhận file PDF' });
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File phải nhỏ hơn 5MB' });
      e.target.value = '';
      return;
    }

    setCvFile(file);
    setMessage({ type: '', text: '' });

    // Auto-upload the file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const res = await fetch('/api/user/profile/upload-cv', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, cv: data.url }));
        setMessage({ type: 'success', text: 'Tải file CV thành công' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Tải file thất bại' });
        setCvFile(null);
        e.target.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: 'Có lỗi khi tải file' });
      setCvFile(null);
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Lưu thông tin thành công' });
        // Redirect back to profile page after short delay
        setTimeout(() => router.push('/user/profile'), 900);
      } else {
        setMessage({ type: 'error', text: data.error || 'Lưu thất bại' });
      }
    } catch (err) {
      console.error('Save profile error', err);
      setMessage({ type: 'error', text: 'Có lỗi khi lưu thông tin' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="content-section">
        <div className="section-header">
          <h2>Chỉnh sửa hồ sơ cá nhân</h2>
          <p className="section-subtitle">Cập nhật thông tin để hồ sơ ứng tuyển đầy đủ hơn</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <span>Đang tải...</span>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <div className="end-form-group">
              <label>Họ & tên</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-input" />
            </div>

            <div className="end-form-group">
              <label>Số điện thoại</label>
              <input 
                name="phone" 
                type="tel"
                value={form.phone} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="end-form-group">
              <label>Giới tính</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="nam" 
                    checked={form.gender === 'nam'}
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <span>Nam</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="nữ" 
                    checked={form.gender === 'nữ'}
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <span>Nữ</span>
                </label>
              </div>
            </div>

            <div className="end-form-group">
              <label>Ngày sinh</label>
              <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} className="form-input" />
            </div>

            <div className="end-form-group">
              <label>CV (File PDF)</label>
              {form.cv && !uploading && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px', 
                  marginBottom: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <svg style={{ color: '#3b82f6', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <a 
                      href={form.cv} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ 
                        color: '#2563eb',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      CV hiện tại
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, cv: '' }))}
                    style={{
                      padding: '4px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s',
                      flexShrink: 0
                    }}
                    title="Xóa CV"
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  id="cv-file-input-user"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ 
                    position: 'absolute',
                    width: '0.1px',
                    height: '0.1px',
                    opacity: 0,
                    overflow: 'hidden',
                    zIndex: -1
                  }}
                />
                <label 
                  htmlFor="cv-file-input-user"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: uploading ? '#f9fafb' : 'white',
                    color: uploading ? '#9ca3af' : '#374151',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => !uploading && (e.target.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => !uploading && (e.target.style.backgroundColor = 'white')}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {uploading ? 'Đang tải lên...' : (form.cv ? 'Tải file mới' : 'Chọn file PDF')}
                </label>
              </div>
              {uploading && (
                <div className="upload-status">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  <span>Đang tải lên...</span>
                </div>
              )}
              {form.cv && !uploading && (
                <div className="cv-preview">
                  <svg className="pdf-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <a href={form.cv} target="_blank" rel="noreferrer" className="cv-link">
                    Xem CV hiện tại
                  </a>
                </div>
              )}
              <small className="muted">Chỉ chấp nhận file PDF, tối đa 5MB</small>
            </div>

            <div className="end-form-group">
              <label>Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-input" rows={6} />
            </div>

            <div className="form-actions">
              <button type="submit" className="update-btn" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <Link href="/user/profile" className="cancel-link">Hủy</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
