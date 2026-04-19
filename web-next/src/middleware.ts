import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define public paths that don't require authentication
  const isPublicPath = 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/img') || 
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico';

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 2. Check for authentication token
  const token = request.cookies.get('token')?.value;

  // 3. If no token and trying to access a protected path, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    // Optional: add a 'callbackUrl' to redirect back after login
    // loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 4. Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled in isPublicPath but added here for safety)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
