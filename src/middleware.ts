import { NextRequest, NextResponse } from 'next/server';
import type { NextRequest as NextRequestType } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('Middleware running for:', pathname);

  // Protect lender and borrower pages
  if (pathname.startsWith('/lender') || pathname.startsWith('/borrower')) {
    console.log('Checking auth for:', pathname);
    const tokenCookie = request.cookies.get('token')?.value;
    console.log('Token cookie:', tokenCookie ? 'present' : 'missing');

    if (!tokenCookie) {
      console.log('No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // JWT verification is handled by tRPC context and API routes
    // This middleware only checks for token presence to avoid Edge Runtime issues
    console.log('Middleware - Token present, allowing access');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lender/:path*', '/borrower/:path*'],
};