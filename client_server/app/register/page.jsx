"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  // Focus when the page finishes loading
  const form_field_ref = useRef(null);
  useEffect(() => {
    form_field_ref.current?.focus();
  }, []);

  const [error_message, setErrorMessage] = useState("");
  const [success_message, setSuccessMessage] = useState("");
  const [is_registering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error message when user starts typing
    if (error_message) {
      setErrorMessage("");
    }
    if (success_message) {
      setSuccessMessage("");
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      setErrorMessage("Vui lòng nhập tên đăng nhập.");
      return;
    }

    if (formData.username.trim().length < 3) {
      setErrorMessage("Tên đăng nhập phải có ít nhất 3 ký tự.");
      return;
    }

    if (!formData.password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsRegistering(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      const status_code = response.status;
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Đăng ký thành công! Chuyển hướng đến trang đăng nhập...");
        
        // Clear form
        setFormData({
          username: "",
          password: "",
          confirmPassword: ""
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);

      } else if (status_code === 400) {
        setErrorMessage(data.error || "Thông tin đăng ký không hợp lệ.");
      } else if (status_code === 409) {
        setErrorMessage("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
      } else {
        setErrorMessage("Máy chủ đang gặp sự cố, vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex flex-col w-[30%]">
        <div className="h-[5%]"></div>
        <h1 className="text-center font-bold p-4 text-2xl">Đăng ký tài khoản</h1>
        
        <form onSubmit={handleSubmit} className="">
          <div className="flex flex-col rounded-lg border-1 px-5 py-5">
            <div className="mb-4">
              <div className="font-light text-xs pl-1 mb-1">Tên đăng nhập *</div>
              <input 
                ref={form_field_ref}
                className="w-full border-1 border-gray-200 rounded-lg px-2 py-2" 
                type="text" 
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Tên đăng nhập (ít nhất 3 ký tự)" 
                autoComplete="off" 
                required 
              />
            </div>

            <div className="mb-4">
              <div className="font-light text-xs pl-1 mb-1">Mật khẩu *</div>
              <input 
                className="w-full border-1 border-gray-200 rounded-lg px-2 py-2" 
                type="password" 
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mật khẩu (ít nhất 6 ký tự)" 
                autoComplete="new-password" 
                required 
              />
            </div>

            <div className="mb-4">
              <div className="font-light text-xs pl-1 mb-1">Xác nhận mật khẩu *</div>
              <input 
                className="w-full border-1 border-gray-200 rounded-lg px-2 py-2" 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Nhập lại mật khẩu" 
                autoComplete="new-password" 
                required 
              />
            </div>

            {error_message && (
              <div className="text-red-600 mb-3 text-sm">{error_message}</div>
            )}

            {success_message && (
              <div className="text-green-600 mb-3 text-sm">{success_message}</div>
            )}

            <button 
              type="submit" 
              disabled={is_registering} 
              className="flex justify-center bg-sky-200 disabled:bg-gray-200 font-bold py-2 text-sm rounded-md"
            >
              {is_registering ? (
                <div className="h-8 w-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Đăng ký"
              )}
            </button>

            <div className="text-center mt-4 text-sm">
              <span className="text-gray-600">Đã có tài khoản? </span>
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}