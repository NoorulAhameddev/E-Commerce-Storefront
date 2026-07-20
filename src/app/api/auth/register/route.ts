import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { hashPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { readRequestBody } from '@/lib/body';

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid registration details' }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash
    }
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }, { status: 201 });

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
