import { NextResponse } from 'next/server';

export function middleware() {
  // This is a minimal middleware that just passes through all requests
  return NextResponse.next();
}

// Match nothing explicitly
export const config = {
  matcher: [],
}; 