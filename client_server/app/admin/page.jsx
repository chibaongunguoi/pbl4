"use client";

import { useEffect, useState } from "react";
import "./admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, jobsRes, companiesRes] = await Promise.all([
        fetch('/api/admin/users/count'),
        fetch('/api/admin/jobs/count'),
        fetch('/api/admin/companies/count')
      ]);
      
      let usersData = { count: 0 };
      let jobsData = { count: 0 };
      let companiesData = { count: 0 };

      if (usersRes.ok) {
        try {
          usersData = await usersRes.json();
        } catch (e) {
          console.error('Error parsing users response:', e);
        }
      }

      if (jobsRes.ok) {
        try {
          jobsData = await jobsRes.json();
        } catch (e) {
          console.error('Error parsing jobs response:', e);
        }
      }

      if (companiesRes.ok) {
        try {
          companiesData = await companiesRes.json();
        } catch (e) {
          console.error('Error parsing companies response:', e);
        }
      }

      setStats({
        totalUsers: usersData.count || 0,
        totalJobs: jobsData.count || 0,
        totalCompanies: companiesData.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Dashboard</h1>
        <p className="admin-content-subtitle">Tổng quan hệ thống</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card users">
          <div className="stat-header">
            <div className="stat-icon users">
              <svg fill="white" viewBox="0 0 20 20" width="24" height="24">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
          </div>
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Người dùng</div>
        </div>

        <div className="stat-card jobs">
          <div className="stat-header">
            <div className="stat-icon jobs">
              <svg fill="white" viewBox="0 0 20 20" width="24" height="24">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <div className="stat-number">{stats.totalJobs}</div>
          <div className="stat-label">Công việc</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon companies">
              <svg fill="white" viewBox="0 0 20 20" width="24" height="24">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <div className="stat-number">{stats.totalCompanies}</div>
          <div className="stat-label">Công ty</div>
        </div>
      </div>
    </div>
  );
}
