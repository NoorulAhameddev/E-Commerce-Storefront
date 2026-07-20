import { CartPanel } from '@/components/cart-panel';

export default function CartPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Cart</div>
        <h1 className="mt-2 text-4xl font-semibold text-white">Review your items</h1>
      </div>
      <CartPanel />
    </div>
  );
}
