import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for login page, Next.js internals, and API routes
  if (pathname === '/' || pathname.startsWith('/_next') || pathname.includes('/api/')) {
    return NextResponse.next();
  }

  // Get user cookie
  const userCookie = request.cookies.get('user')?.value;
  const isAuthenticated = !!userCookie;

  // If accessing login page and already logged in, redirect to dashboard
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing protected route and not logged in, redirect to login
  if (pathname !== '/login' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|fonts).*)', '/'],
}; 