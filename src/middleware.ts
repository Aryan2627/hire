import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/session';

export async function middleware(request: NextRequest) {
  // Update session expiration on every request
  const res = await updateSession(request);
  const updatedRes = res || NextResponse.next();

  // Protect exam routes
  if (request.nextUrl.pathname.startsWith('/exam')) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect authenticated users from login page
  if (request.nextUrl.pathname === '/') {
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/exam', request.url));
    }
  }

  return updatedRes;
}

export const config = {
  matcher: ['/', '/exam'],
};
