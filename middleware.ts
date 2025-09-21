import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/app/lib/auth";

type Rule = {
  pattern: RegExp,
  roles: Array<string>
  permit: Boolean
  redirect: string
}

const rules: Array<Rule> = [
  { pattern: /^\/user/, roles: ["user"], permit: true, redirect: "/error/403" },
  { pattern: /^\/admin/, roles: ["admin"], permit: true, redirect: "/error/403" },
  { pattern: /^\/login/, roles: ["guest"], permit: true, redirect: "/error/403" }
];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  console.log(token)
  const user = token ? await verifyToken(token) : null;
  const { pathname } = req.nextUrl;

  var current_rule: Rule | null = null;
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
