import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { db } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { readRequestBody } from '@/lib/body';

export async function GET() {
  const products = await db.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      price: Number(product.price),
      inventory: product.inventory,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))
  });
}

export async function POST(request: NextRequest) {
  const session = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await readRequestBody(request);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid product data' }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      category: parsed.data.category || null,
      price: parsed.data.price,
      inventory: parsed.data.inventory
    }
  });

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      price: Number(product.price),
      inventory: product.inventory,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  }, { status: 201 });
}
