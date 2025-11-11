'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import JobCard from '../ui/components/JobCard';
import './search.css';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const skill = searchParams.get('skill') || '';
  const city = searchParams.get('city') || '';
  const [results, setResults] = useState([]);
  const [followCounts, setFollowCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim() && !skill && !city) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query.trim()) params.append('q', query.trim());
        if (skill) params.append('skill', skill);
        if (city) params.append('city', city);
        
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setResults(data.data || []);
        
        // Fetch follow counts for search results
        if (data.data && data.data.length > 0) {
          const jobIds = data.data.map(job => job._id);
          const followResponse = await fetch("/api/follow/count", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jobIds }),
          });
          
          if (followResponse.ok) {
            const followData = await followResponse.json();
            setFollowCounts(followData);
          }
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, skill, city]);

  const handleCardClick = (jobId) => {
    router.push(`/job/${jobId}`);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>Kết quả tìm kiếm</h1>
          {(query || skill || city) && (
            <p className="search-query">
              {query && <span>Từ khóa: <span className="query-text">"{query}"</span></span>}
              {skill && <span className="filter-text"> • Kỹ năng: <span className="query-text">{skill}</span></span>}
              {city && <span className="filter-text"> • Thành phố: <span className="query-text">{city}</span></span>}
            </p>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tìm kiếm...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>Có lỗi xảy ra: {error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>Không tìm thấy kết quả</h2>
            <p>Không có công việc nào phù hợp với bộ lọc của bạn</p>
            <p className="suggestion">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
          </div>
        ) : (
          <div className="search-results">
            <div className="results-count">
              Tìm thấy <strong>{results.length}</strong> công việc
            </div>
            <div className="jobs-grid">
              {results.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  followCount={followCounts[job._id]}
                  showFollowBadge={true}
                  onClick={() => handleCardClick(job._id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
