import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Primeira barreira do painel: sem cookie de sessão, redirecciona para o login.
 * A validação real da sessão é feita em `app/admin/(protected)/layout.tsx` e em
 * cada Server Action (`requireAdmin`) — o middleware só evita navegação inútil.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession =
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("authjs.session-token");

  if (pathname === "/admin/login") {
    if (hasSession) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
