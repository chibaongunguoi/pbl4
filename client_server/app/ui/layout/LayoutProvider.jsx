"use client";

import { useEffect, useState } from "react";
import getUser from "@/app/conn/conn";
import { userSession } from "@/app/lib/userSession";
import Header from "./header";
import Footer from "./footer";

export default function LayoutProvider({ children }) {
  const [user, setUser] = useState(userSession.getUser()? userSession.getUser() : null);
  
  

  return (
    <>
      <Header user={user} />
      <main className="content-body">{children}</main>
      <Footer />
    </>
  );
}