"use client";

import { useState } from "react";
import "../admin.css";

export default function ScrapeManagerPage() {
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeButtonActive, setScrapeButtonActive] = useState(true);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleScrapeSubmit = async (e) => {
    e.preventDefault();
    setScrapeButtonActive(false);
    setLoadingScrape(true);
    setMessage({ type: '', text: '' });
    
    const form_data = new FormData(e.currentTarget);
    const url = form_data.get("url");
    
    try {
      const response = await fetch("/api/scrape/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cào dữ liệu thành công!' });
        setScrapeUrl("");
      } else {
        setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cào dữ liệu!' });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cào dữ liệu!' });
    } finally {
      setScrapeButtonActive(true);
      setLoadingScrape(false);
    }
  };

  return (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Crawl thông tin việc làm</h1>
        <p className="admin-content-subtitle">Nhập URL để cào dữ liệu việc làm mới</p>
      </div>

      <div className="scrape-section">
        {message.text && (
          <div className={`submit-message ${message.type}`} style={{ marginBottom: '24px' }}>
            <svg className="message-icon" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              )}
            </svg>
            {message.text}
          </div>
        )}

        <div className="scrape-form-container">
          <form onSubmit={handleScrapeSubmit} className="scrape-form">
            <div className="form-group">
              <label htmlFor="url" className="form-label">
                URL cần cào dữ liệu:
              </label>
              <div className="input-group">
                <input
                  type="url"
                  name="url"
                  id="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="Nhập URL (ví dụ: https://www.topcv.vn/tim-viec-lam)..."
                  className="url-input"
                  required
                />
                <button 
                  type="submit" 
                  className={`submit-btn ${!scrapeButtonActive ? 'disabled' : ''}`}
                  disabled={!scrapeButtonActive}
                >
                  {loadingScrape ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Đang cào...
                    </>
                  ) : (
                    'Bắt đầu cào'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="scrape-instructions">
          <h3>Hướng dẫn sử dụng:</h3>
          <ul>
            <li>Nhập URL của trang web chứa thông tin việc làm</li>
            <li>Hệ thống sẽ tự động phân tích và trích xuất dữ liệu</li>
            <li>Dữ liệu sau khi cào sẽ được lưu vào hệ thống</li>
            <li>Kiểm tra tab "Quản lý công việc" để xem kết quả</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
