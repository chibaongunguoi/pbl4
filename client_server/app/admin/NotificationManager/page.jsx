"use client";

import { useEffect, useState } from "react";
import "../admin.css";
import "./notification-manager.css";

export default function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, chưa đọc, đã đọc

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      } else {
        console.error('Error fetching notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa thông báo thành công!');
        fetchNotifications();
      } else {
        const data = await response.json();
        alert(data.error || 'Lỗi khi xóa thông báo');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Lỗi khi xóa thông báo');
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.status === filter;
  });

  const unreadCount = notifications.filter(n => n.status === 'chưa đọc').length;
  const readCount = notifications.filter(n => n.status === 'đã đọc').length;

  return (
    <div className="admin-content notification-manager-container">
      {/* Header */}
      <div className="admin-content-header">
        <h1 className="admin-content-title">Quản lý thông báo</h1>
        <p className="admin-content-subtitle">Danh sách tất cả thông báo trong hệ thống</p>
      </div>


      {/* Filter and Actions */}
      <div className="notification-actions-bar">
        <div className="filter-controls">
          <span className="filter-label">Lọc theo trạng thái:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="notification-filter-select"
          >
            <option value="all">📋 Tất cả ({notifications.length})</option>
            <option value="chưa đọc">🔔 Chưa đọc ({unreadCount})</option>
            <option value="đã đọc">✅ Đã đọc ({readCount})</option>
          </select>
        </div>
        <button onClick={fetchNotifications} className="refresh-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="notification-loading">
          <div className="spinner"></div>
          <p>Đang tải thông báo...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notification-empty">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3>{filter === 'all' ? 'Chưa có thông báo nào' : `Không có thông báo "${filter}"`}</h3>
          <p>Các thông báo sẽ xuất hiện tại đây khi có người dùng ứng tuyển</p>
        </div>
      ) : (
        <div className="notification-table-wrapper">
          <table className="notification-table">
            <thead>
              <tr>
                <th>Người nhận</th>
                <th>Công việc</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((notification) => (
                <tr key={notification._id}>
                  <td>
                    <div className="user-cell">
                      <span className="user-name">
                        {notification.userID?.username || 'N/A'}
                      </span>
                      <span className="user-id">
                        {notification.userID?._id ? `#${notification.userID._id.slice(-8)}` : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="job-cell">
                      <div className="job-title">
                        {notification.JobDetailID?.job_title || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="content-cell">
                      <div className="notification-content">
                        {notification.content}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`notification-status ${notification.status === 'chưa đọc' ? 'unread' : 'read'}`}>
                      {notification.status}
                    </span>
                  </td>
                  <td>
                    <div className="time-cell">
                      {new Date(notification.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="delete-notification-btn"
                      title="Xóa thông báo"
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
