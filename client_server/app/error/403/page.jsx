"use client";
import { useRouter } from "next/navigation";
import "./error.css";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">
          <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
          </svg>
        </div>
        <h1 className="error-title">403 - Truy cập bị từ chối</h1>
        <p className="error-message">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc đăng nhập với tài khoản phù hợp.
        </p>
        <div className="error-actions">
          <button 
            onClick={() => router.push('/login')}
            className="error-btn primary"
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => router.push('/')}
            className="error-btn secondary"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
