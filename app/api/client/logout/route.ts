import { NextResponse } from "next/server";
import {
  getClientAuthCookieName,
  shouldUseSecureClientCookie,
} from "@/lib/auth/client-session";

export async function POST() {
  const prod = shouldUseSecureClientCookie();
  const cookieName = getClientAuthCookieName();

  const response = NextResponse.json({ success: true } as { success: boolean }, { status: 200 });

  response.cookies.set({
    name: cookieName,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: prod,
    maxAge: 0,
  });

  response.cookies.set({
    name: "client_session_established",
    value: "",
    path: "/",
    sameSite: "lax",
    secure: prod,
    httpOnly: false,
    maxAge: 0,
  });

  return response;
}
