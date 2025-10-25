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
          <div className="stat-label">Tổng số người dùng</div>
          <div className="stat-number">{stats.totalUsers}</div>
        </div>

        <div className="stat-card jobs">
          <div className="stat-label">Tổng số công việc</div>
          <div className="stat-number">{stats.totalJobs}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tổng số công ty</div>
          <div className="stat-number">{stats.totalCompanies}</div>
        </div>
      </div>
    </div>
  );
}
