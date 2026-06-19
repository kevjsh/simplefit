import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  const isValid = !!token && !isTokenExpired(token);

  if (pathname.startsWith("/dashboard")) {
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/", request.url));
      if (token) response.cookies.delete("authToken");
      return response;
    }
    return NextResponse.next();
  }

  if ((pathname === "/" || pathname === "/signup") && isValid) {
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup", "/dashboard/:path*"],
};
