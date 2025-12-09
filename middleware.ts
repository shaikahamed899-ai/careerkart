import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or localStorage (middleware runs on server, so we need cookies)
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/applications', '/profile', '/settings', '/explore'];
  const employerOnlyRoutes = ['/employer'];
  const jobSeekerOnlyRoutes = ['/jobs', '/applications'];
  
  // If accessing protected routes without token, redirect to home
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // For employer routes, we'll need to check the user role on the client side
  // since middleware can't access the auth store directly
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
