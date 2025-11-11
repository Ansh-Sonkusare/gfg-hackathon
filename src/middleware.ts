import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // Use env in production

export const runtime = 'nodejs';

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

    try {
      const decoded = jwt.verify(tokenCookie, JWT_SECRET);
      console.log('Token verified:', decoded);
    } catch (err) {
      console.log('Token invalid:', err);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lender/:path*', '/borrower/:path*'],
};