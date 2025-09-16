"use client"

import { FormEvent } from "react";
// import { useRouter } from "next/router";

export default function LoginPage() {
  // const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      console.log("Logined successfully.");
      // router.push("/profile");
    } else {
      // Handle errors
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="email" placeholder="Email" defaultValue={""} required />
      <input type="password" name="password" placeholder="Password" defaultValue={""} required />
      <button type="submit">Login</button>
    </form>
  );
}
