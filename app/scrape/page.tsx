"use client";

import "@/app/styles/home.css";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container">
      <h1>Nhập URL của nơi bạn muốn cào thông tin</h1>
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Nhập URL..."
            className="url-input"
            required
          />
          <button type="submit" className="submit-btn">
            Bắt đầu
          </button>
        </div>
      </form>
    </div>
  );
}
