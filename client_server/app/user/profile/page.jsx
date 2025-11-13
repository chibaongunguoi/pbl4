"use client";

import { useRouter } from "next/navigation";
import getUser from "@/app/conn/conn";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EditJobForm from "../../components/EditJobForm";
import ApplySearch from "../../components/ApplySearch";
import "./profile.css";

export default function UserInfoPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showEditJobForm, setShowEditJobForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalApplicationId, setStatusModalApplicationId] = useState(null);
  const [statusModalStatus, setStatusModalStatus] = useState('');
  const [statusModalReason, setStatusModalReason] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editCompanyForm, setEditCompanyForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    logo: '',
    description: ''
  });
  const [companyEditLoading, setCompanyEditLoading] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState([]);
  
  useEffect(() => {
    getUser().then(data => setUser(data))
  }, []);
  
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  // Fetch user profile by username (server reads username from token)
  const fetchUserProfile = async () => {
    if (!user?.username) return;
    try {
      setProfileLoading(true);
      const res = await fetch('/api/user/profile', { method: 'GET' });
      if (!res.ok) {
        setUserProfile(null);
        return;
      }
      const data = await res.json();
      setUserProfile(data.data || null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch company information for company role
  const fetchCompanyInfo = async () => {
    if (!user?.username) return;
    try {
      setProfileLoading(true);
      const res = await fetch(`/api/admin/companies?username=${encodeURIComponent(user.username)}`, {
        method: 'GET',
      });
      if (!res.ok) {
        setCompanyInfo(null);
        return;
      }
      const data = await res.json();
      if (data.success && data.companies && data.companies.length > 0) {
        setCompanyInfo(data.companies[0]);
      } else {
        setCompanyInfo(null);
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
      setCompanyInfo(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // When user is loaded, fetch profile or company info based on role
  useEffect(() => {
    if (user?.username) {
      if (user.role === 'company') {
        fetchCompanyInfo();
      } else {
        fetchUserProfile();
      }
    }
  }, [user]);

  // Fetch favorite jobs
  const fetchFavoriteJobs = async () => {
    if (favoritesLoading) return;
    
    try {
      setFavoritesLoading(true);
      const response = await fetch('/api/user/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteJobs(data.data || []);
      } else {
        console.error('Error fetching favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Fetch applications for company role
  const fetchApplications = async () => {
    if (applicationsLoading) return;
    
    try {
      setApplicationsLoading(true);
      const response = await fetch('/api/company/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setApplications(data.data || []);
        setFilteredApplications(data.data || []);
      } else {
        console.error('Error fetching applications:', data.message || 'Unknown error');
        console.error('Response status:', response.status);
        console.error('Response data:', data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Delete application
  const handleDeleteApplication = async (applicationId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn ứng tuyển này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/apply/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Thêm dòng này để gửi cookies
      });

      if (response.ok) {
        alert('Xóa đơn ứng tuyển thành công!');
        // Refresh applications list
        fetchApplications();
      } else {
        const data = await response.json();
        alert(data.error || 'Lỗi khi xóa đơn ứng tuyển');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Lỗi khi xóa đơn ứng tuyển');
    }
  };

  // Open status modal to input reason before updating status
  const openStatusModal = (applicationId, newStatus) => {
    setStatusModalApplicationId(applicationId);
    setStatusModalStatus(newStatus);
    // Set default reason based on status
    const defaultReason = newStatus === 'đã duyệt' 
      ? 'Chúng tôi đã duyệt qua CV của bạn và sẽ liên lạc với bạn sớm nhất có thể'
      : 'Xin lỗi. Bạn không phải là ứng viên mà chúng tôi đang tìm kiếm';
    setStatusModalReason(defaultReason);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setStatusModalApplicationId(null);
    setStatusModalStatus('');
    setStatusModalReason('');
  };

  // Update application status (approve/reject) with optional reason content
  const handleUpdateApplicationStatus = async (applicationId, newStatus, content = '') => {
    try {
      const response = await fetch(`/api/user/apply/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, content }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh list and update modal if open
        fetchApplications();
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        }
        closeStatusModal();
        alert('Cập nhật trạng thái thành công');
      } else {
        alert(data.error || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  // View application detail
  const handleViewApplicationDetail = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetail(true);
  };

  // Close application detail modal
  const handleCloseApplicationDetail = () => {
    setShowApplicationDetail(false);
    setSelectedApplication(null);
  };

  // Fetch jobs for company role
  const fetchCompanyJobs = async () => {
    if (jobsLoading || !companyInfo?.name) return;
    
    try {
      setJobsLoading(true);
      const response = await fetch('/api/jobDetail', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter jobs by company name
        const filtered = (data.data || []).filter(job => 
          job.company_name === companyInfo.name
        );
        setCompanyJobs(filtered);
      } else {
        console.error('Error fetching jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  // Load favorites when switching to favorites tab
  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavoriteJobs();
    }
  }, [activeTab]);

  // Load applications when switching to applications tab
  useEffect(() => {
    if (activeTab === 'applications' && user?.role === 'company') {
      fetchApplications();
      if (companyInfo) {
        fetchCompanyJobs();
      }
    }
  }, [activeTab, companyInfo]);

  // Load jobs when switching to jobs tab
  useEffect(() => {
    if (activeTab === 'jobs' && user?.role === 'company' && companyInfo) {
      fetchCompanyJobs();
    }
  }, [activeTab, companyInfo]);

  // Handle password form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (passwordMessage.text) {
      setPasswordMessage({ type: '', text: '' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordLoading) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Vui lòng điền đầy đủ thông tin'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới và xác nhận mật khẩu không khớp'
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({
          type: 'success',
          text: 'Đổi mật khẩu thành công!'
        });
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordMessage({
          type: 'error',
          text: data.error === 'Current password is incorrect' 
            ? 'Mật khẩu hiện tại không đúng'
            : 'Có lỗi xảy ra khi đổi mật khẩu'
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordMessage({
        type: 'error',
        text: 'Có lỗi xảy ra khi đổi mật khẩu'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle job edit
  const handleEditJob = (job) => {
    setEditingJob({...job});
    setShowEditJobForm(true);
  };

  const handleCancelEditJob = () => {
    setShowEditJobForm(false);
    setEditingJob(null);
  };

  const handleSaveJob = () => {
    fetchCompanyJobs();
    setShowEditJobForm(false);
    setEditingJob(null);
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa công việc "${jobTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/jobDetail/${jobId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Xóa công việc thành công!');
        fetchCompanyJobs(); // Refresh the list
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa công việc');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Có lỗi xảy ra khi xóa công việc');
    }
  };

  // Handle company edit modal
  const openEditCompanyModal = () => {
    if (companyInfo) {
      setEditCompanyForm({
        name: companyInfo.name || '',
        email: companyInfo.email || '',
        phone: companyInfo.phone || '',
        website: companyInfo.website || '',
        address: companyInfo.address || '',
        logo: companyInfo.logo || '',
        description: companyInfo.description || ''
      });
      setShowEditCompanyModal(true);
    }
  };

  const closeEditCompanyModal = () => {
    setShowEditCompanyModal(false);
  };

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target;
    setEditCompanyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.logoUrl) {
        setEditCompanyForm(prev => ({
          ...prev,
          logo: data.logoUrl
        }));
      } else {
        alert(data.error || 'Lỗi khi upload ảnh');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Có lỗi xảy ra khi upload ảnh');
    }
  };

  const handleSaveCompanyInfo = async (e) => {
    e.preventDefault();
    
    if (companyEditLoading) return;

    try {
      setCompanyEditLoading(true);
      const response = await fetch(`/api/admin/companies/${companyInfo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editCompanyForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Cập nhật thông tin công ty thành công!');
        setCompanyInfo(data.data);
        closeEditCompanyModal();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setCompanyEditLoading(false);
    }
  };
  
  async function logOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    router.push("/login");
  }

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-info">
          {user?.role === 'company' && companyInfo ? (
            <>
              <div className="user-avatar">
                {companyInfo.logo ? (
                  <img 
                    src={companyInfo.logo} 
                    alt={companyInfo.name}
                    className="company-logo-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="avatar-placeholder" style={{ display: companyInfo.logo ? 'none' : 'flex' }}>
                  {companyInfo.name?.charAt(0).toUpperCase() || 'C'}
                </div>
              </div>
              <h3 className="username">{companyInfo.name || 'Loading...'}</h3>
              <p className="user-role">Company</p>
            </>
          ) : (
            <>
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <h3 className="username">{user?.username || 'Loading...'}</h3>
              <p className="user-role">{user?.role || 'User'}</p>
            </>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
              </button>
            </li>
            {user?.role === 'company' && (
              <li>
                <button
                  className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('applications')}
                >
                  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Danh sách ứng tuyển
                </button>
              </li>
            )}
            {user?.role === 'company' && (
              <li>
                <button
                  className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Công việc cần tuyển
                </button>
              </li>
            )}
            <li>
              <button
                className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Job yêu thích
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V7a2 2 0 012-2m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
                Đổi mật khẩu
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={logOut} className="logout-btn">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'profile' && (
          <div className="content-section">
            <div className="section-header-with-action">
              <h2>Thông tin cá nhân</h2>
              {user?.role === 'company' ? (
                companyInfo && (
                  <button 
                    onClick={openEditCompanyModal}
                    className="edit-profile-btn"
                  >
                    <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </button>
                )
              ) : (
                userProfile && (
                  <Link href="/user/profile/edit" className="edit-profile-btn">
                    <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </Link>
                )
              )}
            </div>

            {/* UserProfile or Company Info section */}
            <div className="profile-card">
              {profileLoading ? (
                <div className="loading-container">
                  <div className="animate-spin rounded-full h-8 w-8 "></div>
                  <span>Đang tải thông tin...</span>
                </div>
              ) : user?.role === 'company' ? (
                // Display company information
                companyInfo ? (
                  <div className="profile-details">
                    <div className="detail-row">
                      <label>Tên công ty:</label>
                      <span>{companyInfo.name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Email:</label>
                      <span>{companyInfo.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Số điện thoại:</label>
                      <span>{companyInfo.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Website:</label>
                      <span>
                        {companyInfo.website ? (
                          <a href={companyInfo.website} target="_blank" rel="noreferrer" className="cv-link">
                            {companyInfo.website}
                          </a>
                        ) : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>Địa chỉ:</label>
                      <span>{companyInfo.address || 'N/A'}</span>
                    </div>
                    {companyInfo.logo && (
                      <div className="detail-row">
                        <label>Logo:</label>
                        <span>
                          <img src={companyInfo.logo} alt="Company Logo" style={{ maxWidth: '100px', borderRadius: '8px' }} />
                        </span>
                      </div>
                    )}
                    <div className="detail-row description-row">
                      <label>Mô tả:</label>
                      <p className="description-text">{companyInfo.description || 'Chưa có mô tả'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="no-profile">
                    <h3>Chưa có thông tin công ty</h3>
                    <p>Công ty của bạn chưa được thiết lập trong hệ thống.</p>
                  </div>
                )
              ) : (
                // Display user profile information
                userProfile ? (
                  <div className="profile-details">
                    <div className="detail-row">
                      <label>Họ & tên:</label>
                      <span>{userProfile.name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Số điện thoại:</label>
                      <span>{userProfile.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Giới tính:</label>
                      <span>{userProfile.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Ngày sinh:</label>
                      <span>{userProfile.birthdate ? new Date(userProfile.birthdate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>CV:</label>
                      <span>
                        {userProfile.cv ? (
                          <a href={userProfile.cv} target="_blank" rel="noreferrer" className="cv-link">Xem CV</a>
                        ) : 'Chưa có'}
                      </span>
                    </div>
                    <div className="detail-row description-row">
                      <label>Mô tả:</label>
                      <p className="description-text">{userProfile.description || 'Chưa có mô tả'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="no-profile">
                    <h3>Chưa có thông tin cá nhân</h3>
                    <p>Bạn chưa thêm hồ sơ cá nhân. Thêm thông tin để hoàn thiện hồ sơ ứng tuyển.</p>
                    <Link href="/user/profile/edit" className="update-btn">Thêm thông tin</Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Job yêu thích</h2>
              <p className="section-subtitle">
                {favoriteJobs.length} job đã yêu thích
              </p>
            </div>
            
            {favoritesLoading ? (
              <div className="loading-container">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                <span>Đang tải...</span>
              </div>
            ) : favoriteJobs.length === 0 ? (
              <div className="favorites-placeholder">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3>Chưa có job yêu thích</h3>
                <p>Bạn chưa lưu job nào. Hãy khám phá và lưu những job bạn quan tâm!</p>
                <Link href="/" className="browse-btn">
                  Khám phá job
                </Link>
              </div>
            ) : (
              <div className="favorites-grid">
                {favoriteJobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="favorite-job-card"
                    onClick={() => router.push(`/job/${job._id}`)}
                  >
                    <div className="job-card-header">
                      <div className="company-logo-small">
                        <Image
                          src={job.thumbnail}
                          alt={job.company_name}
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="job-card-info">
                        <h4 className="job-card-title">{job.job_title}</h4>
                        <p className="company-card-name">{job.company_name}</p>
                      </div>
                    </div>
                    
                    <div className="job-card-details">
                      <div className="detail-row">
                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.province}</span>
                      </div>
                      
                      <div className="detail-row">
                        <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    
                    <div className="job-card-skills">
                      {job.skills?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag-small">
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 3 && (
                        <span className="more-skills">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && user?.role === 'company' && (
          <div className="content-section">
            <h2>Danh sách ứng tuyển</h2>
            {applicationsLoading ? (
              <div className="loading-container">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                <span>Đang tải...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Chưa có ứng viên nào ứng tuyển</p>
              </div>
            ) : (
              <>
                <div className="apply-search-container">
                  <ApplySearch 
                    applications={applications}
                    companyJobs={companyJobs}
                    onFilteredResults={setFilteredApplications}
                  />
                </div>
                {filteredApplications.length === 0 ? (
                  <div className="empty-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>Không tìm thấy kết quả phù hợp</p>
                  </div>
                ) : (
              <div className="applications-table-container">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Công việc ứng tuyển</th>
                      <th>Họ tên</th>
                      <th>Số điện thoại</th>
                      <th>Ngày sinh</th>
                      <th>CV</th>
                      <th>Trạng thái</th>
                      <th>Thời gian ứng tuyển</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application._id}>
                    
                        <td>
                          <div className="job-title-cell">
                            {application.JobDetailID?.job_title || 'Chưa rõ'}
                          </div>
                        </td>
                        <td>{application.userProfile?.name || 'Chưa cập nhật'}</td>
                        <td>{application.userProfile?.phone || 'Chưa có'}</td>
                
                        <td>
                          {application.userProfile?.birthdate ? 
                            new Date(application.userProfile.birthdate).toLocaleDateString('vi-VN') : 
                            'Chưa cập nhật'}
                        </td>
                        <td>
                          {application.userProfile?.cv ? (
                            <a 
                              href={application.userProfile.cv} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="cv-link-table"
                            >
                              <svg className="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Xem CV
                            </a>
                          ) : (
                            <span className="no-cv">Chưa có</span>
                          )}
                        </td>
                        <td className="status-cell">{application.status || 'chưa duyệt'}</td>
                        <td>{new Date(application.time).toLocaleString('vi-VN')}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleViewApplicationDetail(application)}
                              className="view-detail-btn"
                              title="Xem chi tiết"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openStatusModal(application._id, 'đã duyệt')}
                              className="approve-btn"
                              title="Duyệt"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => openStatusModal(application._id, 'đã từ chối')}
                              className="reject-btn"
                              title="Từ chối"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(application._id)}
                              className="delete-btn"
                              title="Xóa đơn ứng tuyển"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="content-section">
            <h2>Đổi mật khẩu</h2>
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              {passwordMessage.text && (
                <div className={`message ${passwordMessage.type}`}>
                  {passwordMessage.text}
                </div>
              )}
              
              <div className="end-form-group">
                <label htmlFor="current-password">Mật khẩu hiện tại:</label>
                <input 
                  type="password" 
                  id="current-password"
                  name="currentPassword"
                  className="form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordLoading}
                />
              </div>
              
              <div className="end-form-group">
                <label htmlFor="new-password">Mật khẩu mới:</label>
                <input 
                  type="password" 
                  id="new-password"
                  name="newPassword"
                  className="form-input"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordLoading}
                />
              </div>
              
              <div className="end-form-group">
                <label htmlFor="confirm-password">Xác nhận mật khẩu mới:</label>
                <input 
                  type="password" 
                  id="confirm-password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordLoading}
                />
              </div>
              
              <button 
                type="submit" 
                className="update-btn"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <div className="button-loading">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang cập nhật...
                  </div>
                ) : (
                  'Cập nhật mật khẩu'
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'jobs' && user?.role === 'company' && (
          <div className="content-section">
            <div className="section-header">
              <div>
                <h2>Công việc cần tuyển</h2>
                <p className="section-subtitle">
                  {companyJobs.length} công việc đang tuyển
                </p>
              </div>
              <button 
                className="add-job-btn"
                onClick={() => {
                  setEditingJob({
                    job_title: '',
                    company_name: companyInfo?.name || '',
                    province: '',
                    salary: '',
                    thumbnail: companyInfo?.logo || '',
                    skills: [],
                    descriptions: {},
                    job_info: {}
                  });
                  setShowEditJobForm(true);
                }}
              >
                <svg className="add-icon" fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Thêm công việc
              </button>
            </div>
            
            {jobsLoading ? (
              <div className="loading-container">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                <span>Đang tải...</span>
              </div>
            ) : companyJobs.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p>Chưa có công việc nào</p>
              </div>
            ) : (
              <div className="jobs-table-wrapper">
                <table className="jobs-table-profile">
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Tên công việc</th>
                      <th>Địa điểm</th>
                      <th>Mức lương</th>
                      <th>Kỹ năng</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyJobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div className="job-logo-cell">
                            {job.thumbnail && (
                              <img 
                                src={job.thumbnail} 
                                alt={job.company_name}
                                className="job-thumbnail"
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="job-title-info">
                            <span className="job-title-text">{job.job_title}</span>
                          </div>
                        </td>
                        <td>{job.province}</td>
                        <td>{job.salary || 'Thỏa thuận'}</td>
                        <td>
                          <div className="skills-cell">
                            {job.skills?.slice(0, 2).map((skill, index) => (
                              <span key={index} className="skill-tag-table">
                                {skill}
                              </span>
                            ))}
                            {job.skills?.length > 2 && (
                              <span className="more-skills-table">+{job.skills.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEditJob(job)}
                              className="edit-job-btn"
                              title="Chỉnh sửa"
                            >
                              <svg className="edit-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                              Sửa
                            </button>
                            <button
                              onClick={() => router.push(`/job/${job._id}`)}
                              className="view-detail-btn"
                              title="Xem chi tiết"
                            >
                              <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Xem
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job._id, job.job_title)}
                              className="delete-job-btn"
                              title="Xóa"
                            >
                              <svg className="delete-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {showEditJobForm && editingJob && (
        <div className="modal-overlay" onClick={handleCancelEditJob}>
          <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn-top" onClick={handleCancelEditJob}>
              <svg fill="currentColor" viewBox="0 0 20 20" width="24" height="24">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
            <EditJobForm 
              job={editingJob}
              onSave={handleSaveJob}
              onCancel={handleCancelEditJob}
            />
          </div>
        </div>
      )}

      {/* Status Reason Modal (approve/reject) */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="status-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="status-modal-header">
              <h3 className="status-modal-title">
                {statusModalStatus === 'đã duyệt' ? 'Duyệt đơn ứng tuyển' : 'Từ chối đơn ứng tuyển'}
              </h3>
              <button className="status-modal-close" onClick={closeStatusModal}>
                <svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="status-modal-body">
              

              {/* Form */}
              <div>
                <label className="status-form-label">
                  Lý do / Ghi chú
                  <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '13px', marginLeft: '8px' }}>
                    (Nội dung thông báo sẽ gửi cho ứng viên)
                  </span>
                </label>
                <textarea
                  value={statusModalReason}
                  onChange={(e) => setStatusModalReason(e.target.value)}
                  rows={6}
                  className="status-textarea"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="status-modal-footer">
              <button onClick={closeStatusModal} className="status-btn-cancel">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
              <button
                onClick={() => handleUpdateApplicationStatus(statusModalApplicationId, statusModalStatus, statusModalReason)}
                className="status-btn-confirm"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showApplicationDetail && selectedApplication && (
        <div className="modal-overlay" onClick={handleCloseApplicationDetail}>
          <div className="modal-content application-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết ứng viên</h2>
              <button className="modal-close-btn" onClick={handleCloseApplicationDetail}>
                <svg fill="currentColor" viewBox="0 0 20 20" width="24" height="24">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-header">
                  <div className="applicant-avatar">
                    {selectedApplication.userID?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="applicant-info">
                    <h3>{selectedApplication.userProfile?.name || 'Chưa cập nhật'}</h3>
                    <p className="username">@{selectedApplication.userID?.username || 'Unknown'}</p>
                    <p className="application-status">Trạng thái: {selectedApplication.status || 'chưa duyệt'}</p>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Công việc ứng tuyển:</label>
                    <p>{selectedApplication.JobDetailID?.job_title || 'Chưa rõ'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Số điện thoại:</label>
                    <p>{selectedApplication.userProfile?.phone || 'Chưa có'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Email:</label>
                    <p>{selectedApplication.userID?.email || 'Chưa có'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Giới tính:</label>
                    <p>
                      {selectedApplication.userProfile?.gender === 'male' ? 'Nam' : 
                       selectedApplication.userProfile?.gender === 'female' ? 'Nữ' : 
                       'Chưa cập nhật'}
                    </p>
                  </div>

                  <div className="detail-item">
                    <label>Ngày sinh:</label>
                    <p>
                      {selectedApplication.userProfile?.birthdate ? 
                        new Date(selectedApplication.userProfile.birthdate).toLocaleDateString('vi-VN') : 
                        'Chưa cập nhật'}
                    </p>
                  </div>

                  <div className="detail-item">
                    <label>Thời gian ứng tuyển:</label>
                    <p>{new Date(selectedApplication.time).toLocaleString('vi-VN')}</p>
                  </div>

                  <div className="detail-item full-width">
                    <label>Mô tả bản thân:</label>
                    <p className="description-text">
                      {selectedApplication.userProfile?.description || 'Chưa có'}
                    </p>
                  </div>

                  <div className="detail-item full-width">
                    <label>CV:</label>
                    {selectedApplication.userProfile?.cv ? (
                      <a 
                        href={selectedApplication.userProfile.cv} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cv-download-link"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Xem CV
                      </a>
                    ) : (
                      <p className="no-data">Chưa có CV</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={handleCloseApplicationDetail} className="btn-secondary">
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    handleCloseApplicationDetail();
                    handleDeleteApplication(selectedApplication._id);
                  }} 
                  className="btn-danger"
                >
                  Xóa đơn ứng tuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Company Info Modal */}
      {showEditCompanyModal && (
        <div className="modal-overlay" onClick={closeEditCompanyModal}>
          <div className="modal-content-wrapper edit-company-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin công ty</h2>
              <button className="modal-close-btn" onClick={closeEditCompanyModal}>
                <svg fill="currentColor" viewBox="0 0 20 20" width="24" height="24">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSaveCompanyInfo} className="company-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company-name">Tên công ty <span className="required">*</span></label>
                    <input
                      type="text"
                      id="company-name"
                      name="name"
                      className="form-input"
                      value={editCompanyForm.name}
                      onChange={handleCompanyFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company-email">Email <span className="required">*</span></label>
                    <input
                      type="email"
                      id="company-email"
                      name="email"
                      className="form-input"
                      value={editCompanyForm.email}
                      onChange={handleCompanyFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company-phone">Số điện thoại</label>
                    <input
                      type="tel"
                      id="company-phone"
                      name="phone"
                      className="form-input"
                      value={editCompanyForm.phone}
                      onChange={handleCompanyFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company-website">Website</label>
                    <input
                      type="url"
                      id="company-website"
                      name="website"
                      className="form-input"
                      placeholder="https://example.com"
                      value={editCompanyForm.website}
                      onChange={handleCompanyFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company-address">Địa chỉ</label>
                    <input
                      type="text"
                      id="company-address"
                      name="address"
                      className="form-input"
                      value={editCompanyForm.address}
                      onChange={handleCompanyFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company-logo">Logo công ty</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id="company-logo"
                        name="logo"
                        className="file-input"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                      />
                      <label htmlFor="company-logo" className="file-upload-label">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Chọn file ảnh
                      </label>
                      <span className="file-upload-hint">PNG, JPG, GIF (tối đa 5MB)</span>
                    </div>
                    {editCompanyForm.logo && (
                      <div className="logo-preview">
                        <img 
                          src={editCompanyForm.logo} 
                          alt="Logo preview" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          className="remove-logo-btn"
                          onClick={() => setEditCompanyForm(prev => ({ ...prev, logo: '' }))}
                          title="Xóa logo"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company-description">Mô tả công ty</label>
                    <textarea
                      id="company-description"
                      name="description"
                      className="form-input"
                      rows="5"
                      value={editCompanyForm.description}
                      onChange={handleCompanyFormChange}
                      placeholder="Nhập mô tả về công ty..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    onClick={closeEditCompanyModal} 
                    className="btn-secondary"
                    disabled={companyEditLoading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="update-btn"
                    disabled={companyEditLoading}
                  >
                    {companyEditLoading ? (
                      <div className="button-loading">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang lưu...
                      </div>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
