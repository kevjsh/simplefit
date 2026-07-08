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

export function proxy(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  const isValid = !!token && !isTokenExpired(token);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/", request.url));
      if (token) response.cookies.delete("authToken");
      return response;
    }
    return NextResponse.next();
  }

  /* /signup should never be shown to authenticated users. We bounce them to
     the site root so the client-side smart redirect (see app/page.tsx) can
     pick the correct panel based on active roles + last-visited preference.
     We deliberately do NOT redirect "/" here — it needs the client to read
     localStorage and the user's roles, neither of which are available in
     middleware. app/page.tsx handles that transition without ever showing
     the marketing content. */
  if (pathname === "/signup" && isValid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup", "/dashboard/:path*", "/profile"],
};
