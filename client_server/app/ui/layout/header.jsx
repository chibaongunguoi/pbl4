"use client";

import Link from "next/link";
import Image from "next/image";
import "./userLayout.css";
import { useEffect, useState,useRef } from "react";
import getUser from "@/app/conn/conn";
export default function Header() {
  const [user, setUser] = useState(null);
  const checkUser = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  if (user === null && !checkUser.current) {
    checkUser.current = true;
  getUser().then(data =>{ console.log(data); setUser(data) })}
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
            {user ? (
              <li>
                <a href="/user/profile" className="">
                  {user.username}
                </a>
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
