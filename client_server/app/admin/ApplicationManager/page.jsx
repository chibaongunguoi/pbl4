"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";
import Pagination from "../components/Pagination";

export default function ApplicationManagerPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const convertDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/user-companies');
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        setApplications([]);
        return;
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (applicationId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ứng tuyển này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/user-companies?id=${applicationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Xóa ứng tuyển thành công!');
        fetchApplications();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa ứng tuyển');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Có lỗi xảy ra khi xóa ứng tuyển');
    }
  };

  return (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Quản lý ứng tuyển</h1>
        <p className="admin-content-subtitle">Danh sách tất cả ứng tuyển trong hệ thống</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          Đang tải danh sách ứng tuyển...
        </div>
      ) : (
        <div className="companies-section">
          <div className="companies-header">
            <h2>Danh sách ứng tuyển ({applications.length})</h2>
            <div className="companies-header-actions">
              <button className="refresh-btn" onClick={fetchApplications}>
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
                  <th>Username</th>
                  <th>Tên công ty</th>
                  <th>Email công ty</th>
                  <th>Số điện thoại</th>
                  <th>Thời gian ứng tuyển</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-companies">
                      Không có ứng tuyển nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedApplications = applications.slice(startIndex, endIndex);
                    
                    return paginatedApplications.map((application) => (
                      <tr 
                        key={application._id} 
                        className="company-row"
                      >
                        <td className="company-name-cell">
                          <div className="company-name-info">
                            <span className="company-name">
                              {application.userID?.username || 'N/A'}
                            </span>
                            <span className="company-id">
                              Role: {application.userID?.role || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="company-name-cell">
                          <div className="company-name-info">
                            <span className="company-name">
                              {application.companyID?.name || 'N/A'}
                            </span>
                            <span className="company-id">
                              ID: {application.companyID?._id || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="email-cell">
                          {application.companyID?.email || 'N/A'}
                        </td>
                        <td className="phone-cell">
                          {application.companyID?.phone || 'N/A'}
                        </td>
                        <td className="date-cell">
                          {application.time ? convertDateTime(application.time) : 'N/A'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(application._id)}
                            className="delete-company-btn"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            title="Xóa"
                          >
                            <svg className="delete-icon" fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
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
            totalItems={applications.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
