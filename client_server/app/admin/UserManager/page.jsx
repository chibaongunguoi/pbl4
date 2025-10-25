"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import Pagination from "../components/Pagination";

export default function UserManagerPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const handleEdit = (user) => {
    // TODO: Implement edit functionality
    alert(`Chỉnh sửa người dùng: ${user.username}\nChức năng này đang được phát triển.`);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Xóa người dùng thành công!');
        fetchUsers();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa người dùng');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
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
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-users">
                      Không có người dùng nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedUsers = users.slice(startIndex, endIndex);
                    
                    return paginatedUsers.map((user) => (
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
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(user)}
                              className="edit-company-btn"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              title="Chỉnh sửa"
                            >
                              <svg className="edit-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
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
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
