import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { db } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { readRequestBody } from '@/lib/body';

function productDto(product: {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string | null;
  price: unknown;
  inventory: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    category: product.category,
    price: Number(product.price),
    inventory: product.inventory,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product: productDto(product) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await readRequestBody(request);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid product data' }, { status: 400 });
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      category: parsed.data.category || null,
      price: parsed.data.price,
      inventory: parsed.data.inventory
    }
  });

  return NextResponse.json({ product: productDto(product) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.product.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: 'Product could not be deleted' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
