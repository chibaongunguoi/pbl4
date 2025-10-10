// Utility functions để quản lý user session
export const userSession = {
  // Lưu user vào session
  setUser: (userData) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
  },

  // Lấy user từ session
  getUser: () => {
    if (typeof window !== 'undefined') {
      try {
        const userData = sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error parsing user from session:', error);
        return null;
      }
    }
    return null;
  },

  // Xóa user khỏi session
  clearUser: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user');
    }
  },

  // Kiểm tra có user trong session không
  hasUser: () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('user') !== null;
    }
    return false;
  }
};