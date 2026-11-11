import Link from 'next/link';
import { db } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10">
      <section className="surface overflow-hidden rounded-[2rem] p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
              Full-Stack Storefront & Orders System
            </div>
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Modern e-commerce platform with live catalog & order fulfillment.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Shopwave provides a production-ready e-commerce experience: customer cart sessions, role-based admin controls, inventory tracking, and database persistence powered by Prisma and PostgreSQL.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/checkout" className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">
                Start checkout
              </Link>
              <Link href="/admin" className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:text-cyan-200">
                Admin console
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface rounded-[1.75rem] p-5">
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Products</div>
              <div className="mt-3 text-4xl font-semibold text-white">{products.length}</div>
              <div className="mt-2 text-sm text-slate-300">Catalog items available for purchase.</div>
            </div>
            <div className="surface rounded-[1.75rem] p-5">
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Checkout</div>
              <div className="mt-3 text-4xl font-semibold text-white">Secure</div>
              <div className="mt-2 text-sm text-slate-300">Role-aware auth protects customer checkout and admin access.</div>
            </div>
            <div className="surface rounded-[1.75rem] p-5">
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Database</div>
              <div className="mt-3 text-4xl font-semibold text-white">Prisma</div>
              <div className="mt-2 text-sm text-slate-300">Products, orders, and users live in PostgreSQL.</div>
            </div>
            <div className="surface rounded-[1.75rem] p-5">
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Catalog Value</div>
              <div className="mt-3 text-4xl font-semibold text-white">{formatCurrency(products.reduce((total, product) => total + Number(product.price), 0))}</div>
              <div className="mt-2 text-sm text-slate-300">Combined value of active product inventory.</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Catalog</div>
            <h2 className="mt-2 text-3xl font-semibold text-white">Featured products</h2>
          </div>
          <Link href="/cart" className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200 sm:inline-flex">
            View cart
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="surface rounded-3xl p-8 text-slate-300">
            No products yet. Seed the database to populate the store.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  imageUrl: product.imageUrl,
                  category: product.category,
                  price: Number(product.price),
                  inventory: product.inventory
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
