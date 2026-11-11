import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { Role } from '@prisma/client';

export function middleware(request: NextRequest) {
  let response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
