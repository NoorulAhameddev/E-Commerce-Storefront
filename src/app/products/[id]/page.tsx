import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-cyan-200 hover:text-cyan-100">← Back to catalog</Link>
      <div className="surface overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl ?? 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">{product.category ?? 'General'}</div>
              <h1 className="mt-2 text-4xl font-semibold text-white">{product.name}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-300">{product.description}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Price</div>
              <div className="mt-2 text-4xl font-semibold text-white">{formatCurrency(Number(product.price))}</div>
              <div className="mt-3 text-sm text-slate-300">{product.inventory} units available</div>
            </div>
            <Link href="/checkout" className="inline-flex rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">
              Continue to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
