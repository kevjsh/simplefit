import { NextRequest, NextResponse } from "next/server";

const EXPRESS_URL =
  process.env.EXPRESS_API_URL ?? "http://localhost:4000";

const COOKIE_MAX_AGE = 2 * 24 * 60 * 60; // 2 días (igual que el JWT)

export async function POST(req: NextRequest) {
  const body = await req.json();

  let expressRes: Response;
  try {
    expressRes = await fetch(`${EXPRESS_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor." },
      { status: 503 }
    );
  }

  const data = await expressRes.json();

  if (!expressRes.ok) {
    return NextResponse.json(data, { status: expressRes.status });
  }

  const { token, isTempPassword } = data as {
    token: string;
    isTempPassword: boolean;
  };

  const response = NextResponse.json({ token, isTempPassword });

  response.cookies.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
