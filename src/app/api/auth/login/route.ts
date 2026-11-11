import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { createSessionToken, readSessionToken, verifyPassword, SESSION_COOKIE } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { readRequestBody } from '@/lib/body';

import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limiter = checkRateLimit(`login:${clientIp}`, 10, 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }

  const body = await readRequestBody(request);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid login details' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });

  response.cookies.set(SESSION_COOKIE, createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: session });
}
