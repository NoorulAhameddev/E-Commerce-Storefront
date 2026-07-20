import { NextRequest, NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { db } from '@/lib/prisma';
import { orderStatusSchema } from '@/lib/validators';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { readRequestBody } from '@/lib/body';

function serializeOrder(order: {
  id: string;
  status: string;
  total: Prisma.Decimal | number;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; email: string; name: string | null; role: Role };
  items: Array<{
    id: string;
    quantity: number;
    price: Prisma.Decimal | number;
    product: { id: string; name: string; description: string; imageUrl: string | null };
  }>;
}) {
  return {
    id: order.id,
    status: order.status,
    total: Number(order.total),
    shippingName: order.shippingName,
    shippingEmail: order.shippingEmail,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: item.product
    }))
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } }
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (session.role !== Role.ADMIN && order.userId !== session.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ order: serializeOrder(order) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readRequestBody(request);
  const parsed = orderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
  }

  const { id } = await params;
  const order = await db.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { user: true, items: { include: { product: true } } }
  });

  return NextResponse.json({ order: serializeOrder(order) });
}
