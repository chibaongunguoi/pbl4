"use client";

import Link from "next/link";
import Image from "next/image";
import "./userLayout.css";
import { useEffect, useState } from "react";
import getUser from "@/app/conn/conn";
import { useRouter, usePathname } from "next/navigation";
export default function Header() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Danh sách kỹ năng phổ biến
  const skills = [
    'JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring',
    'HTML/CSS', 'TypeScript', 'SQL', 'MongoDB', 'Docker', 'Kubernetes'
  ];

  // Danh sách thành phố
  const cities = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Buôn Ma Thuột'
  ];

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const data = await getUser();
      setUser(data);
      // Fetch notifications if user is logged in
      if (data) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('Notification response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Notification data received:', data);
        console.log('Notifications array:', data.data);
        console.log('Notifications length:', data.data?.length);
        setNotifications(data.data || []);
        const unread = (data.data || []).filter(n => n.status === 'chưa đọc').length;
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'đã đọc' }),
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-fetch user when route changes

  // Listen for custom login/logout events
  useEffect(() => {
    const handleLoginSuccess = () => {
      fetchUser();
    };

    const handleLogoutSuccess = () => {
      setUser(null);
    };

    // Listen for storage events (cross-tab login/logout)
    const handleStorageChange = () => {
      fetchUser();
    };

    // Add event listeners
    window.addEventListener('userLoginSuccess', handleLoginSuccess);
    window.addEventListener('userLogoutSuccess', handleLogoutSuccess);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('userLoginSuccess', handleLoginSuccess);
      window.removeEventListener('userLogoutSuccess', handleLogoutSuccess);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

   async function logOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setUser(null); // Immediately update local state
    window.dispatchEvent(new CustomEvent('userLogoutSuccess'));
    router.push("/login");
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    if (selectedSkill) {
      params.append('skill', selectedSkill);
    }
    if (selectedCity) {
      params.append('city', selectedCity);
    }
    
    if (params.toString()) {
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="sticky-header">
      <div className="header-container">
        <nav id="navigation" className="menu d-xs-none">
          <div id="brand" className="logo">
          <h1>
            <a
              href="/"
              aria-current="page"
              className="router-link-exact-active router-link-active"
            >
              <div className="logo">ITWORKER</div>
            </a>
          </h1>
        </div>
          <ul className="search">
            <li>
              <div className="search-form-wrapper">
                <div className="form-group form-icon-left">
                  <i className="icon-search form-icon"></i>{" "}
                  <input
                    type="text"
                    name="text"
                    placeholder="Tìm kiếm việc làm "
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="form-control"
                  />{" "}
                  <button 
                    aria-label="Tìm kiếm" 
                    className="btn"
                    onClick={handleSearch}
                  >
                    <i className="icon-arrow-right"></i>
                  </button>
                </div>
                <div className="search-filters">
                  <select 
                    className="filter-select"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    <option value="">Tất cả kỹ năng</option>
                    {skills.map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <select 
                    className="filter-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">Tất cả thành phố</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                  <div style={{visibility: "hidden"}}>l</div>
                </div>
              </div>
            </li>
            
          </ul>{" "}
          <ul className="float-right">
            

            {isLoading ? (
              <li>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                  <span className="text-sm text-gray-500">Đang tải...</span>
                </div>
              </li>
            ) : user ? (
              <>
                <li className="notification-dropdown">
                  <a 
                    href="#" 
                    className="notification-bell"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowNotifications(!showNotifications);
                    }}
                  >
                    <i className="icon-bell"></i>
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </a>
                  {showNotifications && (
                    <div className="notification-dropdown-menu">
                      <div className="notification-header">
                        <h4>Thông báo</h4>
                        {unreadCount > 0 && (
                          <span className="unread-count">{unreadCount} chưa đọc</span>
                        )}
                      </div>
                      <div className="notification-list">
                        {notifications.length === 0 ? (
                          <div className="no-notifications">
                            Không có thông báo nào
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification._id}
                              className={`notification-item ${notification.status === 'chưa đọc' ? 'unread' : ''}`}
                              onClick={() => {
                                if (notification.status === 'chưa đọc') {
                                  markAsRead(notification._id);
                                }
                              }}
                            >
                              <div className="notification-content">
                                <p>{notification.content}</p>
                                <span className="notification-time">
                                  {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              {notification.status === 'chưa đọc' && (
                                <span className="notification-dot"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 10 && (
                        <div className="notification-footer">
                          <a href="/user/notifications">Xem tất cả</a>
                        </div>
                      )}
                    </div>
                  )}
                </li>
                <li className="user-dropdown">
                  <a href="#" className="">
                    {user.username}
                  </a>
                  <ul className="sub-menu user-menu">
                    <li>
                      <a href="/user/profile" className="">
                        Thông tin tài khoản
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={logOut} className="">
                        Đăng xuất
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/login" className="">
                    Đăng nhập
                  </a>
                </li>{" "}
                <li>
                  <a href="/dang-ky" className="btn-register btn-warning gradient">
                    Đăng ký tài khoản
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>{" "}
        <nav className="d-md-none mobile-nav">
          <span className="search">
            "Đăng nhập" <i className="icon-search"></i>
          </span>{" "}
          <span className="menu-bar">
            <i className="icon-bar"></i>
          </span>
        </nav>
      </div>
    </header>
  );
}
