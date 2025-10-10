"use client";

import Link from "next/link";
import Image from "next/image";
import "./userLayout.css";
import { useEffect, useState } from "react";
import getUser from "@/app/conn/conn";
import { useRouter } from "next/navigation";
export default function Header() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    getUser().then(data => {
      setUser(data);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error loading user:', error);
      setIsLoading(false);
    });
  }, [])
  const router = useRouter();
   async function logOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    router.push("/login");
  }

  return (
    <header className="sticky-header">
      <div className="header-container">
        <nav id="navigation" className="menu d-xs-none">
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
        </div>
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
            <li>
              <a href="/scrape" className="">
                Cào thông tin việc làm
              </a>
            </li>{" "}
            {isLoading ? (
              <li>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                  <span className="text-sm text-gray-500">Đang tải...</span>
                </div>
              </li>
            ) : user ? (
              <li className="user-dropdown">
                <a href="#" className="">
                  {user.username}
                </a>
                <ul className="sub-menu user-menu">
                  <li>
                    <a href="/user/profile" className="">
                      Thông tin tài khoản
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={logOut} className="">
                      Đăng xuất
                    </a>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li>
                  <a href="/login" className="">
                    Đăng nhập
                  </a>
                </li>{" "}
                <li>
                  <a href="/dang-ky" className="btn-register btn-warning gradient">
                    Đăng ký tài khoản
                  </a>
                </li>
              </>
            )}
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
