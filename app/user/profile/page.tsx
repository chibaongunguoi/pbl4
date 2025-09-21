"use client";

import { useRouter } from "next/navigation";

export default function UserInfoPage() {
  const router = useRouter();
  async function logOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    router.push("/login");
  }

  return (
    <div className="flex justify-center">
      <button onClick={logOut} className="bg-amber-400 rounded-md px-2 py-4">Đăng xuất</button>
    </div>
  );
}
