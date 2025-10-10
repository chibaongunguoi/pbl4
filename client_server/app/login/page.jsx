"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();

  // Focus when the page finishes loading
  const form_field_ref = useRef(null);
  useEffect(() => {
    form_field_ref.current?.focus();
  }, []);

  const [error_message, setErrorMessage] = useState("");
  const [is_checking_login, setIsCheckingLogin] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setIsCheckingLogin(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const status_code = response.status;

    if (response.ok) {
      console.log("Logined successfully.");
      const data = await response.json();
      if (data?.redirect) {
        router.push(data.redirect);
      } 
    } else if (status_code == 401) {
      setErrorMessage("Sai tên đăng nhập hoặc mật khẩu.");
    } else {
      setErrorMessage("Máy chủ đang gặp sự cố, vui lòng thử lại sau.");
    }

    setIsCheckingLogin(false);
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex flex-col w-[30%]">
        <div className="h-[5%]"></div>
        <h1 className="text-center font-bold p-4 text-2xl">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="">
          <div className="flex flex-col rounded-lg border-1 px-5 py-5">
            <div className="mb-4">
              <div className="fot-light text-xs pl-1 mb-1">Tên đăng nhập</div>
              <input ref={form_field_ref} className="w-full border-1 border-gray-200 rounded-lg px-2 py-2" type="text" name="username" placeholder="Tên đăng nhập" defaultValue={""} autoComplete="off" required />
            </div>
            <div className="mb-4">
              <div className="font-light text-xs pl-1 mb-1">Mật khẩu</div>
              <input className="w-full border-1 border-gray-200 rounded-lg px-2 py-2" type="password" name="password" placeholder="Mật khẩu" defaultValue={""} autoComplete="off" required />
            </div>
            <div className="text-red-600 mb-3 text-sm">{error_message}</div>
            <button type="submit" disabled={is_checking_login} className="flex justify-center bg-sky-200 disabled:bg-gray-200 font-bold py-2 text-sm rounded-md">{is_checking_login ? <div className="h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div> : "Đăng nhập"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
