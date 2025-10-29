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

            <div className="form-group">
              <label>Họ & tên</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
              <label>Ngày sinh</label>
              <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <label>CV (File PDF)</label>
              <input 
                type="file" 
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="form-input file-input"
                disabled={uploading}
              />
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

            <div className="form-group">
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
