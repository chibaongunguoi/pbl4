import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

const rules = [
  { pattern: /^\/user/, roles: ["user"], permit: true, redirect: "/error/403" },
  { pattern: /^\/admin/, roles: ["admin"], permit: true, redirect: "/error/403" },
  { pattern: /^\/login/, roles: ["guest"], permit: true, redirect: "/error/403" },
  { pattern: /^\/scrape/, roles: ["user", "admin"], permit: true, redirect: "/error/403" }
];

export async function middleware(req) {
  const token = req.cookies.get("auth")?.value;
  const user = token ? await verifyToken(token) : null;
  const { pathname } = req.nextUrl;

  var current_rule = null;
  for (const rule of rules) {
    if (rule.pattern.test(pathname)) {
      current_rule = rule;
      break;
    }
  }

  if (!current_rule) {
    return NextResponse.next();
  }

  const role = user ? user.role : "guest";
  const redirect = NextResponse.redirect(new URL(current_rule.redirect, req.url));

  if (current_rule.permit) {
    return current_rule.roles.includes(role) ? NextResponse.next() : redirect;
  }
  return current_rule.roles.includes(role) ? redirect : NextResponse.next();
}
