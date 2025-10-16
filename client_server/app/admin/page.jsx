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
  
  const router = useRouter();

  useEffect(() => {
    // Get user info and stats
    const fetchData = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
        
        // Fetch dashboard stats from API
        try {
          const [usersRes, jobsRes] = await Promise.all([
            fetch('/api/admin/users/count'),
            fetch('/api/admin/jobs/count')
          ]);
          
          const usersData = await usersRes.json();
          const jobsData = await jobsRes.json();
          
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

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboard();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <h1 className="admin-title">
            <svg className="admin-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
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
