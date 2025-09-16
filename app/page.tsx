import JobDetail from "@/models/job_detail.model";
import Link from "next/link";
import Image from "next/image";
import "@/app/styles/home.css";

export default async function Home() {
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
        {/* Job Card 1 */}
        <div className="job-card">
          <div className="job-header">
            <div className="company-logo">
              <Image src="/vercel.svg" alt="VIMID" width={64} height={64} />
            </div>
            <div className="job-info">
              <h3 className="job-title">Fullstack DEV</h3>
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
                  15-25 triệu
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
                  Hà Nội
                </span>
              </div>
              <div className="skills-list">
                <span className="skill-tag">Angular</span>
                <span className="skill-tag">Git</span>
                <span className="skill-tag">Spring boot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Card 2 */}
        <div className="job-card">
          <div className="job-header">
            <div className="company-logo">
              <Image src="/vercel.svg" alt="ZENSHO" width={64} height={64} />
            </div>
            <div className="job-info">
              <h3 className="job-title">Kỹ sư cầu nối BrSE - N2 Tiếng Nhật</h3>
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
                  40-50 triệu
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
                  Hà Nội
                </span>
              </div>
              <div className="skills-list">
                <span className="skill-tag">Kotlin</span>
                <span className="skill-tag">Swift</span>
                <span className="skill-tag">Java</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Card 3 */}
        <div className="job-card">
          <div className="job-header">
            <div className="company-logo">
              <Image src="/vercel.svg" alt="VHEC" width={64} height={64} />
            </div>
            <div className="job-info">
              <h3 className="job-title">Brse làm việc tại Tokyo</h3>
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
                  60-80 triệu
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
                  Tokyo
                </span>
              </div>
              <div className="skills-list">
                <span className="skill-tag">Bridge Engineer</span>
                <span className="skill-tag">Java</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
