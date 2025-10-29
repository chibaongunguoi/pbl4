"use client";

import { useRouter } from "next/navigation";
import getUser from "@/app/conn/conn";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./profile.css";

export default function UserInfoPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
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
    }
  }, [activeTab]);

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
          <div className="user-avatar">
            <div className="avatar-placeholder">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <h3 className="username">{user?.username || 'Loading...'}</h3>
          <p className="user-role">{user?.role || 'User'}</p>
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
                  <Link href={`/admin/CompanyManager/${companyInfo._id}`} className="edit-profile-btn">
                    <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem chi tiết
                  </Link>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
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
                      <label>Giới tính:</label>
                      <span>{userProfile.gender || 'N/A'}</span>
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
                {favoriteJobs.length} job đã lưu
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
              <div className="applications-table-container">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Họ tên</th>
                      <th>Giới tính</th>
                      <th>Ngày sinh</th>
                      <th>Mô tả</th>
                      <th>CV</th>
                      <th>Thời gian ứng tuyển</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <div className="username-cell">
                            <div className="user-avatar-table">
                              {application.userID?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span>{application.userID?.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td>{application.userProfile?.name || 'Chưa cập nhật'}</td>
                        <td>
                          {application.userProfile?.gender === 'male' ? 'Nam' : 
                           application.userProfile?.gender === 'female' ? 'Nữ' : 
                           'Chưa cập nhật'}
                        </td>
                        <td>
                          {application.userProfile?.birthdate ? 
                            new Date(application.userProfile.birthdate).toLocaleDateString('vi-VN') : 
                            'Chưa cập nhật'}
                        </td>
                        <td>
                          <div className="description-cell">
                            {application.userProfile?.description || 'Chưa có'}
                          </div>
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
                        <td>{new Date(application.time).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              
              <div className="form-group">
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
              
              <div className="form-group">
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
              
              <div className="form-group">
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
      </div>
    </div>
  );
}
