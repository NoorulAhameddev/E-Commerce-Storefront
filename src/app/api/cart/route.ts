import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { cartItemSchema } from '@/lib/validators';
import { readRequestBody } from '@/lib/body';

function serializeCartItem(item: {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string; description: string; imageUrl: string | null; price: unknown; inventory: number };
}) {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      imageUrl: item.product.imageUrl,
      price: Number(item.product.price),
      inventory: item.product.inventory
    }
  };
}

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cart = await db.cart.findFirst({
    where: { userId: session.id },
    include: { items: { include: { product: true } } }
  });

  return NextResponse.json({ cart: cart ? { id: cart.id, items: cart.items.map(serializeCartItem) } : { id: null, items: [] } });
}

export async function POST(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readRequestBody(request);
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (product.inventory < parsed.data.quantity) {
    return NextResponse.json({ error: 'Not enough inventory' }, { status: 400 });
  }

  let cart = await db.cart.findFirst({ where: { userId: session.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: session.id } });
  }

  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId: parsed.data.productId }
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + parsed.data.quantity }
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId: parsed.data.productId, quantity: parsed.data.quantity }
    });
  }

  const updatedCart = await db.cart.findFirst({
    where: { userId: session.id },
    include: { items: { include: { product: true } } }
  });

  return NextResponse.json({ cart: updatedCart ? { id: updatedCart.id, items: updatedCart.items.map(serializeCartItem) } : { id: null, items: [] } }, { status: 201 });
}
