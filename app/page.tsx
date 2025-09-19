"use client";

import Link from "next/link";
import Image from "next/image";
import "@/app/styles/home.css";
import { useEffect, useState } from "react";

// Sample job data
const sampleJobs = [
  {
    id: 1,
    title: "Fullstack Developer",
    company: "VIMID",
    salary: "15-25 triệu",
    location: "Hà Nội",
    skills: ["Angular", "Git", "Spring Boot"],
  },
  {
    id: 2,
    title: "Kỹ sư cầu nối BrSE - N2 Tiếng Nhật",
    company: "ZENSHO",
    salary: "40-50 triệu",
    location: "Hà Nội",
    skills: ["Kotlin", "Swift", "Java"],
  },
  {
    id: 3,
    title: "BrSE làm việc tại Tokyo",
    company: "VHEC",
    salary: "60-80 triệu",
    location: "Tokyo",
    skills: ["Bridge Engineer", "Java"],
  },
  {
    id: 4,
    title: "Frontend Developer React",
    company: "TechCorp",
    salary: "20-30 triệu",
    location: "TP.HCM",
    skills: ["React", "TypeScript", "CSS"],
  },
  {
    id: 5,
    title: "Backend Developer Node.js",
    company: "StartupXYZ",
    salary: "25-35 triệu",
    location: "Đà Nẵng",
    skills: ["Node.js", "MongoDB", "Express"],
  },
  {
    id: 6,
    title: "Mobile Developer Flutter",
    company: "MobileTech",
    salary: "18-28 triệu",
    location: "Hà Nội",
    skills: ["Flutter", "Dart", "Firebase"],
  },
  {
    id: 7,
    title: "DevOps Engineer",
    company: "CloudSystems",
    salary: "30-45 triệu",
    location: "TP.HCM",
    skills: ["AWS", "Docker", "Kubernetes"],
  },
  {
    id: 8,
    title: "Data Scientist",
    company: "AILab",
    salary: "35-50 triệu",
    location: "Hà Nội",
    skills: ["Python", "Machine Learning", "TensorFlow"],
  },
  {
    id: 9,
    title: "UI/UX Designer",
    company: "DesignStudio",
    salary: "15-25 triệu",
    location: "TP.HCM",
    skills: ["Figma", "Adobe XD", "Sketch"],
  },
  {
    id: 10,
    title: "QA Engineer",
    company: "QualityFirst",
    salary: "12-20 triệu",
    location: "Hà Nội",
    skills: ["Selenium", "TestNG", "API Testing"],
  },
  {
    id: 11,
    title: "Product Manager",
    company: "ProductCo",
    salary: "40-60 triệu",
    location: "TP.HCM",
    skills: ["Product Strategy", "Analytics", "Agile"],
  },
  {
    id: 12,
    title: "Blockchain Developer",
    company: "CryptoTech",
    salary: "45-70 triệu",
    location: "Hà Nội",
    skills: ["Solidity", "Web3", "Smart Contracts"],
  },
  {
    id: 13,
    title: "Game Developer Unity",
    company: "GameStudio",
    salary: "20-30 triệu",
    location: "TP.HCM",
    skills: ["Unity", "C#", "3D Modeling"],
  },
  {
    id: 14,
    title: "Cybersecurity Specialist",
    company: "SecureNet",
    salary: "35-55 triệu",
    location: "Hà Nội",
    skills: ["Penetration Testing", "CISSP", "Network Security"],
  },
  {
    id: 15,
    title: "Cloud Architect",
    company: "CloudPro",
    salary: "50-80 triệu",
    location: "TP.HCM",
    skills: ["Azure", "AWS", "GCP"],
  },
  {
    id: 16,
    title: "AI Engineer",
    company: "AITech",
    salary: "40-65 triệu",
    location: "Hà Nội",
    skills: ["PyTorch", "Computer Vision", "NLP"],
  },
  {
    id: 17,
    title: "Database Administrator",
    company: "DataCorp",
    salary: "25-40 triệu",
    location: "Đà Nẵng",
    skills: ["PostgreSQL", "MySQL", "MongoDB"],
  },
  {
    id: 18,
    title: "iOS Developer",
    company: "AppleDev",
    salary: "22-35 triệu",
    location: "TP.HCM",
    skills: ["Swift", "SwiftUI", "Xcode"],
  },
  {
    id: 19,
    title: "Android Developer",
    company: "AndroidPro",
    salary: "20-32 triệu",
    location: "Hà Nội",
    skills: ["Kotlin", "Android Studio", "Jetpack Compose"],
  },
  {
    id: 20,
    title: "System Administrator",
    company: "SysAdmin Inc",
    salary: "18-28 triệu",
    location: "TP.HCM",
    skills: ["Linux", "Windows Server", "VMware"],
  },
  {
    id: 21,
    title: "Technical Lead",
    company: "TechLead Co",
    salary: "45-70 triệu",
    location: "Hà Nội",
    skills: ["Team Leadership", "Architecture", "Microservices"],
  },
  {
    id: 22,
    title: "Software Architect",
    company: "ArchitectFirm",
    salary: "55-90 triệu",
    location: "TP.HCM",
    skills: ["System Design", "Clean Architecture", "Design Patterns"],
  },
  {
    id: 23,
    title: "Machine Learning Engineer",
    company: "MLCorp",
    salary: "38-60 triệu",
    location: "Hà Nội",
    skills: ["Scikit-learn", "Pandas", "Apache Spark"],
  },
  {
    id: 24,
    title: "Site Reliability Engineer",
    company: "ReliableSys",
    salary: "42-65 triệu",
    location: "TP.HCM",
    skills: ["Monitoring", "Incident Response", "Automation"],
  },
];

export default function Home() {
  useEffect(
    () => {
      (async () => {
        const response = await fetch("/api/demo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
        }
      })();
    }, []
  );

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 24;
  const totalPages = Math.ceil(sampleJobs.length / jobsPerPage);

  // Calculate jobs for current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = sampleJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Pagination handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <div className="header-section">
        <h1>Cơ hội nhận thưởng</h1>
        <Link href="/jobs">
          Xem thêm <span className="arrow-icon">→</span>
        </Link>
      </div>

      {/* Job Cards Grid */}
      <div className="jobs-grid">
        {currentJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <div className="company-logo">
                <Image
                  src="https://devwork.vn/_ipx/f_webp/https://static.devworks.jp/images/company/aGnkOEGECWpD1wXCiNFKY7cM6qZNtMNWWXjDVncb.png"
                  alt={job.company}
                  width={64}
                  height={64}
                />
              </div>
              <div className="job-info">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-details">
                  <span className="detail-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {job.salary}
                  </span>
                  <span className="detail-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.location}
                  </span>
                </div>
                <div className="skills-list">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <button
          className="pagination-button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="pagination-info">
          Page {currentPage} of {totalPages}
        </div>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`pagination-button ${currentPage === pageNumber ? "active" : ""
                }`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}

        <button
          className="pagination-button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
