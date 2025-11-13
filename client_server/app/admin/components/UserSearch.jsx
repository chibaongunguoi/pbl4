"use client";

import { useState, useEffect } from "react";

export default function UserSearch({ users, onFilteredResults }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term (username)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(term)
      );
    }

    onFilteredResults(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedRole("all");
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
        
      {/* Role Filter */}
      <div style={{ minWidth: '180px' }}>
        <select
          value={selectedRole}
          onChange={handleRoleChange}
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
          <option value="all">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="company">Công ty</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>
          
      {/* Search Input */}
      <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người dùng..."
          value={searchTerm}
          onChange={handleSearchChange}
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
  );
}
