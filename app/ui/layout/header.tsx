"use client";

import Link from "next/link";
import Image from "next/image";
import "./userLayout.css";
import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky-header">
      <div className="container">
        <div id="brand" className="logo">
          <h1>
            <a
              href="/"
              aria-current="page"
              className="router-link-exact-active router-link-active"
            >
              <div className="logo">KrowlworK</div>
            </a>
          </h1>
        </div>{" "}
        <nav id="navigation" className="menu d-xs-none">
          <ul className="search">
            <li>
              <div className="form-group form-icon-left">
                <i className="icon-search form-icon"></i>{" "}
                <input
                  type="email"
                  name="text"
                  placeholder="Tìm kiếm việc làm "
                  defaultValue=""
                  className="form-control"
                />{" "}
                <button aria-label="Tìm kiếm" className="btn">
                  <i className="icon-arrow-right"></i>
                </button>
              </div>
            </li>
          </ul>{" "}
          <ul className="float-right">
            <li>
              <a href="#" className="">
                Việc làm
              </a>{" "}
              <ul className="sub-menu">
                <li>
                  <a href="/viec-lam?country=vietnam" className="">
                    IT Việt Nam
                  </a>
                </li>{" "}
                <li>
                  <a href="/viec-lam?country=japan" className="">
                    IT Nhật Bản
                  </a>
                </li>{" "}
                <li>
                  <a
                    href="https://devwork.kr/it-jobs-korea"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    IT Hàn Quốc
                  </a>
                </li>
              </ul>
            </li>{" "}
            {/* <li>
              <a href="#" className="">
                Tin tức
              </a>{" "}
              <ul className="sub-menu">
                <li>
                  <a href="/blog/category/6/tin-cong-nghe" className="">
                    Tin công nghệ
                  </a>
                </li>
                <li>
                  <a href="/blog/category/4/company-tour" className="">
                    Company Tour
                  </a>
                </li>
                <li>
                  <a href="/blog/category/3/khoi-nghiep-ky-su" className="">
                    Khởi Nghiệp Ký Sự
                  </a>
                </li>
                <li>
                  <a href="/blog/category/2/tam-su-hr" className="">
                    Tâm sự HR
                  </a>
                </li>
                <li>
                  <a href="/blog/category/1/cam-nang-tuyen-dung" className="">
                    Cẩm nang tuyển dụng
                  </a>
                </li>
              </ul>
            </li>{" "} */}
            {/* <li>
              <a href="#" className="">
                Công cụ
              </a>{" "}
              <ul className="sub-menu">
                <li>
                  <a href="/tai-lieu-mien-phi" className="">
                    Tài liệu miễn phí
                  </a>
                </li>{" "}
                <li>
                  <a href="#" className="">
                    Chuyển lương Net - Gross
                  </a>
                </li>{" "}
                <li>
                  <a href="#" className="">
                    Tính bảo hiểm thất nghiệp
                  </a>
                </li>{" "}
                <li>
                  <a href="#" className="">
                    Tính Nenkin
                  </a>
                </li>
              </ul>
            </li>{" "} */}
            <li>
              <a href="/login?callback=%2F" className="">
                Đăng nhập
              </a>
            </li>{" "}
            <li>
              <a href="/dang-ky" className="btn-register btn-warning gradient">
                Đăng ký tài khoản
              </a>
            </li>
          </ul>
        </nav>{" "}
        <nav className="d-md-none mobile-nav">
          <span className="search">
            "Đăng nhập" <i className="icon-search"></i>
          </span>{" "}
          <span className="menu-bar">
            <i className="icon-bar"></i>
          </span>
        </nav>
      </div>
    </header>
  );
}
