import { NextRequest, NextResponse } from "next/server";

interface TokenPayload {
  NID: string;
  Name: string;
  Email: string;
  iat: number;
  exp: number;
}

function decodePayload(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = decodePayload(token);

  if (!payload || payload.exp * 1000 < Date.now()) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.set("authToken", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.json({ authenticated: true, token, payload });
}
