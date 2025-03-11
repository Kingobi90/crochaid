import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/dashboard/events',
  '/dashboard/chat',
  '/dashboard/profile',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // If it's a protected path and user is not authenticated
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, redirect auth pages to dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Fixed matcher config
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
};
