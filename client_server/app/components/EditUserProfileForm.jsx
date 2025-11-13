"use client";

import { useEffect, useState } from "react";

export default function EditUserProfileForm({ userId, onSave, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

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
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/users/${userId}/profile`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!res.ok) {
          console.error('API response not OK:', res.status);
          setMessage({ type: 'error', text: `Không thể tải thông tin (${res.status})` });
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('Profile data received:', data);
        
        if (data.success && data.data) {
          const p = data.data;
          setForm({
            name: p.name || '',
            phone: p.phone || '',
            gender: p.gender || 'nam',
            birthdate: p.birthdate ? new Date(p.birthdate).toISOString().slice(0,10) : '',
            cv: p.cv || '',
            description: p.description || ''
          });
        } else if (data.success && !data.data) {
          // No profile exists yet, use empty form
          console.log('No profile found, using empty form');
        }
      } catch (err) {
        console.error('Fetch profile error', err);
        setMessage({ type: 'error', text: 'Không thể tải thông tin người dùng' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear message when user types
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
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
        e.target.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: 'Có lỗi khi tải file' });
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
      const res = await fetch(`/api/admin/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Lưu thông tin thành công' });
        setTimeout(() => {
          if (onSave) onSave();
        }, 500);
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải thông tin...</span>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '100%'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#111827'
      }}>
        Chỉnh sửa hồ sơ người dùng
      </h2>

      <form onSubmit={handleSubmit}>
        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: message.type === 'error' ? '#dc2626' : '#059669',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}`
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Họ & tên
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Số điện thoại
          </label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Giới tính
          </label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}>
              <input
                type="radio"
                name="gender"
                value="nam"
                checked={form.gender === 'nam'}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              />
              <span>Nam</span>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}>
              <input
                type="radio"
                name="gender"
                value="nữ"
                checked={form.gender === 'nữ'}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              />
              <span>Nữ</span>
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Ngày sinh
          </label>
          <input
            name="birthdate"
            type="date"
            value={form.birthdate}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            CV (File PDF)
          </label>

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
              id="cv-file-input-admin"
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
              htmlFor="cv-file-input-admin"
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span>Đang tải lên...</span>
            </div>
          )}

          <small style={{
            display: 'block',
            marginTop: '6px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Chỉ chấp nhận file PDF, tối đa 5MB
          </small>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Mô tả
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: 'white',
              color: '#374151',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: saving ? 0.5 : 1
            }}
            onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = 'white')}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: saving ? '#9ca3af' : '#3b82f6',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {saving && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
