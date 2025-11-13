"use client";

import { useState, useEffect } from "react";

export default function AdminJobSearch({ jobs, onFilteredResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [skills, setSkills] = useState([]);
  const [cities, setCities] = useState([]);

  // Custom scrollbar styles
  const scrollbarStyles = `
    select::-webkit-scrollbar {
      width: 6px;
    }
    select::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    select::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }
    select::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;

  useEffect(() => {
    extractSkillsAndCities();
  }, [jobs]);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, selectedSkill, selectedCity, jobs]);

  const extractSkillsAndCities = () => {
    // Extract unique skills
    const allSkills = new Set();
    jobs.forEach(job => {
      if (job.skills && Array.isArray(job.skills)) {
        job.skills.forEach(skill => {
          if (skill && skill.trim()) {
            allSkills.add(skill.trim());
          }
        });
      }
    });
    
    // Extract unique cities
    const cityMap = new Map();
    jobs.forEach(job => {
      if (job.province && job.province.trim()) {
        const normalizedCity = normalizeCity(job.province.trim());
        if (!cityMap.has(normalizedCity.toLowerCase())) {
          cityMap.set(normalizedCity.toLowerCase(), normalizedCity);
        }
      }
      if (job.location && job.location.trim()) {
        const normalizedCity = normalizeCity(job.location.trim());
        if (!cityMap.has(normalizedCity.toLowerCase())) {
          cityMap.set(normalizedCity.toLowerCase(), normalizedCity);
        }
      }
    });
    
    setSkills(Array.from(allSkills).sort());
    setCities(Array.from(cityMap.values()).sort());
  };

  const normalizeCity = (cityName) => {
    return cityName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by search query (job title or company)
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.job_title?.toLowerCase().includes(term) ||
        job.company_name?.toLowerCase().includes(term)
      );
    }

    // Filter by skill
    if (selectedSkill) {
      filtered = filtered.filter(job => 
        job.skills && Array.isArray(job.skills) && 
        job.skills.some(skill => skill.trim() === selectedSkill)
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(job => 
        normalizeCity(job.province || '').toLowerCase() === selectedCity.toLowerCase() ||
        normalizeCity(job.location || '').toLowerCase() === selectedCity.toLowerCase()
      );
    }

    onFilteredResults(filtered);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedSkill('');
    setSelectedCity('');
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
      {/* Search Input */}
      <div style={{ flex: '1', minWidth: '250px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Tên công việc hoặc công ty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <svg 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none'
            }}
            width="20" 
            height="20" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Skills Filter */}
      <div style={{ minWidth: '180px' }}>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        >
          <option value="">Tất cả kỹ năng</option>
          {skills.map((skill, index) => (
            <option key={index} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div style={{ minWidth: '180px' }}>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        >
          <option value="">Tất cả thành phố</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>
      </div>

    </div>
    </>
  );
}
