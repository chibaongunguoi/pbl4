"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";
import Pagination from "../components/Pagination";

export default function CompanyManagerPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
    description: '',
    address: '',
    username: '',
    password: ''
  });
  const [addingCompany, setAddingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [companyErrors, setCompanyErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    fetchCompanies();
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

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/companies');
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        setCompanies([]);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        setCompanies([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response body');
        setCompanies([]);
        return;
      }

      const data = JSON.parse(text);
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const validateCompanyField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Tên công ty không được để trống';
        } else if (value.trim().length < 2) {
          error = 'Tên công ty phải có ít nhất 2 ký tự';
        }
        break;
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;
      case 'phone':
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          error = 'Số điện thoại chỉ được chứa số và ký tự +, -, (), khoảng trắng';
        }
        break;
      case 'website':
        if (value && !/^https?:\/\/.+/.test(value)) {
          error = 'Website phải bắt đầu bằng http:// hoặc https://';
        }
        break;
      case 'username':
        if (!value || !value.trim()) {
          error = 'Username là bắt buộc';
        } else if (value.trim().length < 3) {
          error = 'Username phải có ít nhất 3 ký tự';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username chỉ được chứa chữ cái, số và dấu gạch dưới';
        }
        break;
      case 'password':
        if (!value || !value.trim()) {
          error = 'Password là bắt buộc';
        } else if (value.length < 6) {
          error = 'Password phải có ít nhất 6 ký tự';
        }
        break;
    }
    
    return error;
  };

  const handleCompanyInputChange = (field, value) => {
    setNewCompany(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (companyErrors[field]) {
      setCompanyErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setCompanyErrors(prev => ({ ...prev, logo: 'Vui lòng chọn file ảnh' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCompanyErrors(prev => ({ ...prev, logo: 'Kích thước ảnh không được vượt quá 5MB' }));
      return;
    }

    setUploadingLogo(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/scrape/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setNewCompany(prev => ({ ...prev, logo: data.url }));
        setLogoPreview(data.url);
        setCompanyErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.logo;
          return newErrors;
        });
      } else {
        setCompanyErrors(prev => ({ ...prev, logo: data.error || 'Lỗi khi upload ảnh' }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setCompanyErrors(prev => ({ ...prev, logo: 'Lỗi khi upload ảnh' }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const clearLogo = () => {
    setNewCompany(prev => ({ ...prev, logo: '' }));
    setLogoPreview(null);
    document.getElementById('company-logo').value = '';
  };

  const handleAddCompanySubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const errors = {};
    const nameError = validateCompanyField('name', newCompany.name);
    const emailError = validateCompanyField('email', newCompany.email);
    const phoneError = validateCompanyField('phone', newCompany.phone);
    const websiteError = validateCompanyField('website', newCompany.website);
    const usernameError = validateCompanyField('username', newCompany.username);
    const passwordError = validateCompanyField('password', newCompany.password);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (websiteError) errors.website = websiteError;
    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;

    if (Object.keys(errors).length > 0) {
      setCompanyErrors(errors);
      return;
    }

    setAddingCompany(true);
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ type: 'success', text: 'Thêm công ty thành công!' });
        setNewCompany({
          name: '',
          email: '',
          phone: '',
          website: '',
          logo: '',
          description: '',
          address: '',
          username: '',
          password: ''
        });
        clearLogo();
        setCompanyErrors({});
        fetchCompanies();
        setTimeout(() => {
          setShowAddForm(false);
          setSubmitMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra khi thêm công ty' });
      }
    } catch (error) {
      console.error('Error adding company:', error);
      setSubmitMessage({ type: 'error', text: 'Có lỗi xảy ra khi thêm công ty' });
    } finally {
      setAddingCompany(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany({...company});
    setLogoPreview(company.logo || null);
    setShowEditForm(true);
    setSubmitMessage({ type: '', text: '' });
    setCompanyErrors({});
  };

  const handleEditCompanySubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const errors = {};
    const nameError = validateCompanyField('name', editingCompany.name);
    const emailError = validateCompanyField('email', editingCompany.email);
    const phoneError = validateCompanyField('phone', editingCompany.phone);
    const websiteError = validateCompanyField('website', editingCompany.website);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (websiteError) errors.website = websiteError;

    if (Object.keys(errors).length > 0) {
      setCompanyErrors(errors);
      return;
    }

    setAddingCompany(true);
    try {
      const response = await fetch(`/api/admin/companies/${editingCompany._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCompany),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage({ type: 'success', text: 'Cập nhật công ty thành công!' });
        fetchCompanies();
        setTimeout(() => {
          setShowEditForm(false);
          setEditingCompany(null);
          clearLogo();
          setSubmitMessage({ type: '', text: '' });
          setCompanyErrors({});
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra khi cập nhật công ty' });
      }
    } catch (error) {
      console.error('Error updating company:', error);
      setSubmitMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật công ty' });
    } finally {
      setAddingCompany(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditingCompany(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (companyErrors[field]) {
      setCompanyErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEditLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setCompanyErrors(prev => ({ ...prev, logo: 'Vui lòng chọn file ảnh' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCompanyErrors(prev => ({ ...prev, logo: 'Kích thước ảnh không được vượt quá 5MB' }));
      return;
    }

    setUploadingLogo(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/scrape/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setEditingCompany(prev => ({ ...prev, logo: data.url }));
        setLogoPreview(data.url);
        setCompanyErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.logo;
          return newErrors;
        });
      } else {
        setCompanyErrors(prev => ({ ...prev, logo: data.error || 'Lỗi khi upload ảnh' }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setCompanyErrors(prev => ({ ...prev, logo: 'Lỗi khi upload ảnh' }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDelete = async (companyId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công ty này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Xóa công ty thành công!');
        fetchCompanies();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa công ty');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Có lỗi xảy ra khi xóa công ty');
    }
  };

  if (showEditForm && editingCompany) {
    return (
      <div>
        <div className="admin-content-header">
          <h1 className="admin-content-title">Chỉnh sửa công ty</h1>
          <p className="admin-content-subtitle">Cập nhật thông tin công ty</p>
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

          <form onSubmit={handleEditCompanySubmit} className="add-company-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-company-name" className="form-label required">
                  Tên công ty *
                </label>
                <input
                  type="text"
                  id="edit-company-name"
                  value={editingCompany.name}
                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('name', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, name: error }));
                  }}
                  className={`form-input ${companyErrors.name ? 'error' : ''}`}
                  placeholder="Nhập tên công ty..."
                  required
                />
                {companyErrors.name && (
                  <div className="error-message">{companyErrors.name}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit-company-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="edit-company-email"
                  value={editingCompany.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('email', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, email: error }));
                  }}
                  className={`form-input ${companyErrors.email ? 'error' : ''}`}
                  placeholder="contact@company.com"
                />
                {companyErrors.email && (
                  <div className="error-message">{companyErrors.email}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-company-phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="edit-company-phone"
                  value={editingCompany.phone}
                  onChange={(e) => handleEditInputChange('phone', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('phone', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, phone: error }));
                  }}
                  className={`form-input ${companyErrors.phone ? 'error' : ''}`}
                  placeholder="0123 456 789"
                />
                {companyErrors.phone && (
                  <div className="error-message">{companyErrors.phone}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="edit-company-website" className="form-label">
                  Website
                </label>
                <input
                  type="url"
                  id="edit-company-website"
                  value={editingCompany.website}
                  onChange={(e) => handleEditInputChange('website', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('website', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, website: error }));
                  }}
                  className={`form-input ${companyErrors.website ? 'error' : ''}`}
                  placeholder="https://company.com"
                />
                {companyErrors.website && (
                  <div className="error-message">{companyErrors.website}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="edit-company-logo" className="form-label">
                  Logo công ty
                </label>
                <div className="logo-upload-container">
                  <input
                    type="file"
                    id="edit-company-logo"
                    accept="image/*"
                    onChange={handleEditLogoUpload}
                    className="file-input"
                    disabled={uploadingLogo}
                  />
                  <label htmlFor="edit-company-logo" className={`file-input-label ${uploadingLogo ? 'uploading' : ''}`}>
                    {uploadingLogo ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <svg className="upload-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                        Chọn ảnh logo mới
                      </>
                    )}
                  </label>
                  {logoPreview && (
                    <div className="logo-preview">
                      <img src={logoPreview} alt="Logo preview" className="preview-image" />
                      <button 
                        type="button" 
                        className="remove-logo-btn"
                        onClick={clearLogo}
                      >
                        <svg className="remove-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {companyErrors.logo && (
                  <div className="error-message">{companyErrors.logo}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="edit-company-description" className="form-label">
                  Mô tả công ty
                </label>
                <textarea
                  id="edit-company-description"
                  value={editingCompany.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  className="form-textarea"
                  placeholder="Mô tả về công ty..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="edit-company-address" className="form-label">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="edit-company-address"
                  value={editingCompany.address}
                  onChange={(e) => handleEditInputChange('address', e.target.value)}
                  className="form-input"
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingCompany(null);
                  clearLogo();
                  setSubmitMessage({ type: '', text: '' });
                  setCompanyErrors({});
                }}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={addingCompany}
              >
                {addingCompany ? (
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

  if (showAddForm) {
    return (
      <div>
        <div className="admin-content-header">
          <h1 className="admin-content-title">Thêm công ty mới</h1>
          <p className="admin-content-subtitle">Nhập thông tin công ty để thêm vào hệ thống</p>
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

          <form onSubmit={handleAddCompanySubmit} className="add-company-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company-name" className="form-label required">
                  Tên công ty *
                </label>
                <input
                  type="text"
                  id="company-name"
                  value={newCompany.name}
                  onChange={(e) => handleCompanyInputChange('name', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('name', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, name: error }));
                  }}
                  className={`form-input ${companyErrors.name ? 'error' : ''}`}
                  placeholder="Nhập tên công ty..."
                  required
                />
                {companyErrors.name && (
                  <div className="error-message">{companyErrors.name}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="company-email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="company-email"
                  value={newCompany.email}
                  onChange={(e) => handleCompanyInputChange('email', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('email', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, email: error }));
                  }}
                  className={`form-input ${companyErrors.email ? 'error' : ''}`}
                  placeholder="contact@company.com"
                />
                {companyErrors.email && (
                  <div className="error-message">{companyErrors.email}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company-phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="company-phone"
                  value={newCompany.phone}
                  onChange={(e) => handleCompanyInputChange('phone', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('phone', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, phone: error }));
                  }}
                  className={`form-input ${companyErrors.phone ? 'error' : ''}`}
                  placeholder="0123 456 789"
                />
                {companyErrors.phone && (
                  <div className="error-message">{companyErrors.phone}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="company-website" className="form-label">
                  Website
                </label>
                <input
                  type="url"
                  id="company-website"
                  value={newCompany.website}
                  onChange={(e) => handleCompanyInputChange('website', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('website', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, website: error }));
                  }}
                  className={`form-input ${companyErrors.website ? 'error' : ''}`}
                  placeholder="https://company.com"
                />
                {companyErrors.website && (
                  <div className="error-message">{companyErrors.website}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="company-logo" className="form-label">
                  Logo công ty
                </label>
                <div className="logo-upload-container">
                  <input
                    type="file"
                    id="company-logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="file-input"
                    disabled={uploadingLogo}
                  />
                  <label htmlFor="company-logo" className={`file-input-label ${uploadingLogo ? 'uploading' : ''}`}>
                    {uploadingLogo ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <svg className="upload-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                        Chọn ảnh logo
                      </>
                    )}
                  </label>
                  {logoPreview && (
                    <div className="logo-preview">
                      <img src={logoPreview} alt="Logo preview" className="preview-image" />
                      <button 
                        type="button" 
                        className="remove-logo-btn"
                        onClick={clearLogo}
                      >
                        <svg className="remove-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {companyErrors.logo && (
                  <div className="error-message">{companyErrors.logo}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="company-description" className="form-label">
                  Mô tả công ty
                </label>
                <textarea
                  id="company-description"
                  value={newCompany.description}
                  onChange={(e) => handleCompanyInputChange('description', e.target.value)}
                  className="form-textarea"
                  placeholder="Mô tả về công ty..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="company-address" className="form-label">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="company-address"
                  value={newCompany.address}
                  onChange={(e) => handleCompanyInputChange('address', e.target.value)}
                  className="form-input"
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company-username" className="form-label required">
                  Username tài khoản *
                </label>
                <input
                  type="text"
                  id="company-username"
                  value={newCompany.username}
                  onChange={(e) => handleCompanyInputChange('username', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('username', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, username: error }));
                  }}
                  className={`form-input ${companyErrors.username ? 'error' : ''}`}
                  placeholder="username_congty"
                  required
                />
                {companyErrors.username && (
                  <div className="error-message">{companyErrors.username}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="company-password" className="form-label required">
                  Password *
                </label>
                <input
                  type="password"
                  id="company-password"
                  value={newCompany.password}
                  onChange={(e) => handleCompanyInputChange('password', e.target.value)}
                  onBlur={(e) => {
                    const error = validateCompanyField('password', e.target.value);
                    if (error) setCompanyErrors(prev => ({ ...prev, password: error }));
                  }}
                  className={`form-input ${companyErrors.password ? 'error' : ''}`}
                  placeholder="Nhập password..."
                  required
                />
                {companyErrors.password && (
                  <div className="error-message">{companyErrors.password}</div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setSubmitMessage({ type: '', text: '' });
                  setCompanyErrors({});
                }}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={addingCompany}
              >
                {addingCompany ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Đang thêm...
                  </>
                ) : (
                  'Thêm công ty'
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
        <h1 className="admin-content-title">Quản lý công ty</h1>
        <p className="admin-content-subtitle">Danh sách tất cả công ty trong hệ thống</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          Đang tải danh sách công ty...
        </div>
      ) : (
        <div className="companies-section">
          <div className="companies-header">
            <h2>Danh sách công ty ({companies.length})</h2>
            <div className="companies-header-actions">
              <button className="add-company-btn" onClick={() => {
                setShowAddForm(true);
                setSubmitMessage({ type: '', text: '' });
                setCompanyErrors({});
              }}>
                <svg className="add-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Thêm công ty
              </button>
              <button className="refresh-btn" onClick={fetchCompanies}>
                <svg className="refresh-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                Làm mới
              </button>
            </div>
          </div>
          
          <div className="companies-table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Tên công ty</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Website</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-companies">
                      Không có công ty nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedCompanies = companies.slice(startIndex, endIndex);
                    
                    return paginatedCompanies.map((company) => (
                      <tr key={company._id} className="company-row">
                        <td>
                          <div className="company-logo">
                            {company.logo ? (
                              <img 
                                src={company.logo} 
                                alt={company.name}
                                className="company-logo-img"
                              />
                            ) : (
                              <div className="logo-placeholder">
                                {company.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="company-name-cell">
                          <div className="company-name-info">
                            <span className="company-name">{company.name}</span>
                            <span className="company-id">ID: {company._id}</span>
                          </div>
                        </td>
                        <td className="email-cell">{company.email || 'N/A'}</td>
                        <td className="phone-cell">{company.phone || 'N/A'}</td>
                        <td className="website-cell">
                          {company.website ? (
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="website-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {company.website}
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="date-cell">
                          {company.createdAt ? convertDateTime(company.createdAt) : 'N/A'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(company)}
                              className="edit-company-btn"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              title="Chỉnh sửa"
                            >
                              <svg className="edit-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(company._id)}
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
            totalItems={companies.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
