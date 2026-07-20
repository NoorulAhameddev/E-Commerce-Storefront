import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { CartCountBadge } from './cart-count-badge';
import { HeaderActions } from './header-actions';

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-400/20">
            S
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">Shopwave</div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Storefront</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/" className="transition hover:text-cyan-200">Catalog</Link>
          <Link href="/cart" className="transition hover:text-cyan-200">
            Cart
            <CartCountBadge />
          </Link>
          <Link href="/checkout" className="transition hover:text-cyan-200">Checkout</Link>
        </nav>

        <HeaderActions user={user} />
      </div>
    </header>
  );
}
