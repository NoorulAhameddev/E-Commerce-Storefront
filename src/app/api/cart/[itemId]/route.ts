import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cartItemSchema } from '@/lib/validators';
import { readRequestBody } from '@/lib/body';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readRequestBody(request);
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
  }

  const { itemId } = await params;
  const item = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
  }

  const cart = await db.cart.findUnique({ where: { id: item.cartId } });
  if (!cart || cart.userId !== session.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity: parsed.data.quantity }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { itemId } = await params;
  const item = await db.cartItem.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
  }

  const cart = await db.cart.findUnique({ where: { id: item.cartId } });
  if (!cart || cart.userId !== session.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.cartItem.delete({ where: { id: itemId } });

  return NextResponse.json({ success: true });
}
