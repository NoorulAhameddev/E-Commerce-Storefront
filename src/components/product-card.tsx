import Link from 'next/link';
import { AddToCartButton } from './add-to-cart-button';
import { formatCurrency } from '@/lib/format';

export type ProductCardData = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category?: string | null;
  price: number;
  inventory: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="surface overflow-hidden rounded-[2rem]">
      <div className="aspect-[4/3] overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl ?? 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{product.category ?? 'General'}</div>
            <h3 className="text-xl font-semibold text-white">{product.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-300">{product.description}</p>
          </div>
          <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm text-cyan-200">{product.inventory} in stock</div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Price</div>
            <div className="text-2xl font-semibold text-white">{formatCurrency(product.price)}</div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/products/${product.id}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-200">
              View details
            </Link>
            <AddToCartButton item={{ productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1 }} />
          </div>
        </div>
      </div>
    </article>
  );
}
