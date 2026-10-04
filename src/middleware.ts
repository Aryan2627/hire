import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from './lib/session';

export async function middleware(request: NextRequest) {
  // Update session expiration on every request
  const res = await updateSession(request);
  const updatedRes = res || NextResponse.next();

  const sessionCookie = request.cookies.get('session')?.value;
  let sessionData = null;
  
  if (sessionCookie) {
    try {
      sessionData = await decrypt(sessionCookie);
    } catch (e) {
      // invalid session
    }
  }

  const isPendingOnboarding = sessionData?.user?.email === 'pending_onboarding';
  const isLoggedIn = !!sessionData;

  // Protect exam routes
  if (request.nextUrl.pathname.startsWith('/exam')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isPendingOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Redirect authenticated users from login page
  if (request.nextUrl.pathname === '/') {
    if (isLoggedIn) {
      if (isPendingOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      } else {
        return NextResponse.redirect(new URL('/exam', request.url));
      }
    }
  }

  // Protect onboarding route
  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (!isPendingOnboarding) {
      // They already onboarded, go to exam
      return NextResponse.redirect(new URL('/exam', request.url));
    }
  }

  return updatedRes;
}

export const config = {
  matcher: ['/', '/exam', '/onboarding'],
};
