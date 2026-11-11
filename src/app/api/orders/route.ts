import { NextRequest, NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { db } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validators';
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

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await db.order.findMany({
    where: session.role === Role.ADMIN ? {} : { userId: session.id },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ orders: orders.map(serializeOrder) });
}

export async function POST(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readRequestBody(request);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout data' }, { status: 400 });
  }

  // Consolidate duplicate items by productId
  const itemMap = new Map<string, number>();
  for (const item of parsed.data.items) {
    itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity);
  }

  const uniqueProductIds = Array.from(itemMap.keys());
  const products = await db.product.findMany({
    where: { id: { in: uniqueProductIds } }
  });

  if (products.length !== uniqueProductIds.length) {
    return NextResponse.json({ error: 'One or more items are unavailable' }, { status: 400 });
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  for (const [productId, requestedQty] of itemMap.entries()) {
    const product = productById.get(productId);
    if (!product || product.inventory < requestedQty) {
      return NextResponse.json({ error: `Not enough inventory for ${product?.name ?? 'an item'}` }, { status: 400 });
    }
  }

  const order = await db.$transaction(async (tx) => {
    let total = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; price: Prisma.Decimal }> = [];

    for (const [productId, quantity] of itemMap.entries()) {
      const product = productById.get(productId)!;
      total += Number(product.price) * quantity;
      orderItemsData.push({
        productId,
        quantity,
        price: product.price as Prisma.Decimal
      });
    }

    const created = await tx.order.create({
      data: {
        userId: session.id,
        total: new Prisma.Decimal(total),
        shippingName: parsed.data.shippingName,
        shippingEmail: parsed.data.shippingEmail,
        shippingAddress: parsed.data.shippingAddress,
        items: {
          create: orderItemsData
        }
      },
      include: { user: true, items: { include: { product: true } } }
    });

    for (const [productId, quantity] of itemMap.entries()) {
      await tx.product.update({
        where: { id: productId },
        data: { inventory: { decrement: quantity } }
      });
    }

    return created;
  });

  return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
}
