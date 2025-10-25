"use client";

import { useEffect, useState } from "react";
import "../admin.css";

export default function UserManagerPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        setUsers([]);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        setUsers([]);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response body');
        setUsers([]);
        return;
      }

      const data = JSON.parse(text);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Quản lý người dùng</h1>
        <p className="admin-content-subtitle">Danh sách tất cả người dùng trong hệ thống</p>
      </div>

      {loading ? (
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
                    <td colSpan="3" className="no-users">
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
                        <span className={`role-badge`}>
                          {user.role === 'admin' ? 'Quản trị viên' : user.role === 'company' ? 'Công ty' : 'Người dùng'}
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
}
