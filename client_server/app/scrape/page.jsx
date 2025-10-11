"use client";

import "@/app/styles/home.css";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [button_active, setButtonActive] = useState(true);


  const handleSubmit = async (e) => {
    setButtonActive(false);
    e.preventDefault();
    const form_data = new FormData(e.currentTarget);
    const url = form_data.get("url");
    fetch("/api/scrape/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  };

  return (
    <div className="container">
      <h1>Nhập URL của nơi bạn muốn cào thông tin</h1>
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Nhập URL..."
            className="url-input"
            required
          />
          <button type="submit" className="submit-btn disabled:bg-gray-200" disabled={!button_active}>
            Bắt đầu
          </button>
        </div>
      </form>
    </div>
  );
}
