import { NextResponse } from "next/server";

import {
  PASSWORD_COOKIE_MAX_AGE,
  PASSWORD_COOKIE_NAME,
  PASSWORD_COOKIE_VALUE,
} from "@/lib/password-protect";

const PASSWORD = process.env.SITE_ACCESS_PASSWORD;

export async function POST(request: Request) {
  if (!PASSWORD) {
    return NextResponse.json({ success: true });
  }

  const { password }: { password?: string } = await request.json().catch(() => ({ password: undefined }));

  if (!password) {
    return NextResponse.json({ success: false, error: "Password is required." }, { status: 400 });
  }

  if (password !== PASSWORD) {
    return NextResponse.json({ success: false, error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(PASSWORD_COOKIE_NAME, PASSWORD_COOKIE_VALUE, {
    maxAge: PASSWORD_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
