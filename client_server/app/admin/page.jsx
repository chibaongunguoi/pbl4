"use client";

import { useRouter } from "next/navigation";
import getUser from "@/app/conn/conn";
import { useEffect, useState } from "react";
import "./admin.css";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeButtonActive, setScrapeButtonActive] = useState(true);
  const [loadingScrape, setLoadingScrape] = useState(false);
  
  const router = useRouter();
  function convertDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
        return dateTimeString; // hoặc trả về chuỗi mặc định
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}
  useEffect(() => {
    // Get user info and stats
    const fetchData = async () => {
      try {
        const userData = await getUser();
        
        // Check if user is admin
        if (!userData || userData.role !== 'admin') {
          router.push('/error/403');
          return;
        }
        
        setUser(userData);
        
        // Fetch dashboard stats from API
        try {
          const [usersRes, jobsRes] = await Promise.all([
            fetch('/api/admin/users/count'),
            fetch('/api/admin/jobs/count')
          ]);
          
          let usersData = { count: 0 };
          let jobsData = { count: 0 };

          // Handle users response
          if (usersRes.ok) {
            try {
              usersData = await usersRes.json();
            } catch (e) {
              console.error('Error parsing users response:', e);
            }
          }

          // Handle jobs response  
          if (jobsRes.ok) {
            try {
              jobsData = await jobsRes.json();
            } catch (e) {
              console.error('Error parsing jobs response:', e);
            }
          }
          
          setStats({
            totalUsers: usersData.count || 0,
            totalJobs: jobsData.count || 0
          });
        } catch (error) {
          console.error('Error fetching stats:', error);
          // Fallback to sample data if API fails
          setStats({
            totalUsers: 45,   
            totalJobs: 287    
          });
        }
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function logOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    router.push("/login");
  }

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
    setLoadingUsers(false);
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await fetch('/api/jobDetail');
      
      // Check if response is ok and has content
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        setJobs([]);
        return;
      }

      // Check if response has content
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
    }
    setLoadingJobs(false);
  };

  const renderDashboard = () => (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Dashboard</h1>
        <p className="admin-content-subtitle">Tổng quan hệ thống quản lý</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card users">
            <div className="stat-header">
              <div className="stat-icon users">
                <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
            </div>
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Tổng số người dùng</div>
          </div>

          <div className="stat-card jobs">
            <div className="stat-header">
              <div className="stat-icon jobs">
                <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <div className="stat-number">{stats.totalJobs}</div>
            <div className="stat-label">Tổng số công việc</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Quản lý người dùng</h1>
        <p className="admin-content-subtitle">Danh sách tất cả người dùng trong hệ thống</p>
      </div>

      {loadingUsers ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          Đang tải danh sách người dùng...
        </div>
      ) : (
        <div className="users-section">
          <div className="users-header">
            <h2>Danh sách người dùng ({users.length})</h2>
            <button className="refresh-btn" onClick={fetchUsers}>
              <svg className="refresh-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              Làm mới
            </button>
          </div>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Tên người dùng</th>
                  <th>Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-users">
                      Không có người dùng nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="user-row">
                      <td>
                        <div className="user-avatar">
                          <div className="avatar-circle">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                      </td>
                      <td className="username-cell">
                        <div className="username-info">
                          <span className="username">{user.username}</span>
                          <span className="user-id">ID: {user._id}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
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

  const renderJobManagement = () => (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Quản lý công việc</h1>
        <p className="admin-content-subtitle">Danh sách tất cả công việc trong hệ thống</p>
      </div>

      {loadingJobs ? (
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
                  <th>Mức lương</th>
                  <th>Ngày đăng</th>
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
                      <td>
                        <div className="job-logo">
                          {console.log(job)}

                          {job.thumbnail ? (
                            <img 
                              src={job.thumbnail} 
                              alt={job.company}
                              className="company-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="job-title-cell">
                        <div className="job-title-info">
                          <span className="job-title">{job.title}</span>
                          <div className="job-skills">
                            {job.skills && job.skills.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="skill-tag-mini">{skill}</span>
                            ))}
                            {job.skills && job.skills.length > 2 && (
                              <span className="more-skills-mini">+{job.skills.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="company-cell">{job.company_name}</td>
                      <td className="location-cell">{job.province}</td>
                      <td className="salary-cell">
                        <span className="salary-badge">
                          {job.salary || 'Thỏa thuận'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {convertDateTime(job.collected_at) || 'N/A'}
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

  const handleScrapeSubmit = async (e) => {
    setScrapeButtonActive(false);
    setLoadingScrape(true);
    e.preventDefault();
    const form_data = new FormData(e.currentTarget);
    const url = form_data.get("url");
    
    try {
      const response = await fetch("/api/scrape/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        // Reload jobs after scraping
        fetchJobs();
        alert("Cào dữ liệu thành công!");
        setScrapeUrl("");
      } else {
        alert("Có lỗi xảy ra khi cào dữ liệu!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi cào dữ liệu!");
    } finally {
      setScrapeButtonActive(true);
      setLoadingScrape(false);
    }
  };

  const renderScrapeManagement = () => {

    return (
      <div>
        <div className="admin-content-header">
          <h1 className="admin-content-title">Cào thông tin việc làm</h1>
          <p className="admin-content-subtitle">Nhập URL để cào dữ liệu việc làm mới</p>
        </div>

        <div className="scrape-section">
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
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'jobs':
        return renderJobManagement();
      case 'scrape':
        return renderScrapeManagement();
      default:
        return renderDashboard();
    }
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <h1 className="admin-title">
            Admin Panel
          </h1>
          <p className="admin-subtitle">Quản trị hệ thống</p>
        </div>

        <nav className="admin-nav">
          <ul>
            <li>
              <button
                className={`admin-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('users');
                  if (users.length === 0) {
                    fetchUsers();
                  }
                }}
              >
                <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Quản lý người dùng
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('jobs');
                  if (jobs.length === 0) {
                    fetchJobs();
                  }
                }}
              >
                <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                Quản lý công việc
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-link ${activeTab === 'scrape' ? 'active' : ''}`}
                onClick={() => setActiveTab('scrape')}
              >
                <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Cào thông tin việc làm
              </button>
            </li>
          </ul>
        </nav>

        <div className="admin-footer">
          <button onClick={logOut} className="admin-logout-btn">
            <svg className="admin-nav-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            Đăng xuất ({user?.role})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="admin-main">
        {renderContent()}
      </main>
    </div>
  );
}
