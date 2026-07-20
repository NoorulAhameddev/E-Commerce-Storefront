"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearCart, readCart, type CartItem } from '@/lib/cart-storage';
import { formatCurrency } from '@/lib/format';

export function CheckoutForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [items] = useState<CartItem[]>(() => readCart());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingEmail: defaultEmail,
    shippingAddress: ''
  });

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      })
    });

    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setMessage(payload?.error ?? 'Checkout failed');
      return;
    }

    clearCart();
    window.dispatchEvent(new Event('cart-updated'));
    router.push('/orders');
  }

  if (items.length === 0) {
    return (
      <div className="surface rounded-3xl p-8 text-center text-slate-300">
        Add products to your cart before checking out.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="surface space-y-4 rounded-3xl p-6">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Shipping details</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Complete your order</h2>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Name</span>
          <input
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
            value={formData.shippingName}
            onChange={(event) => setFormData((current) => ({ ...current, shippingName: event.target.value }))}
            placeholder="Jordan Lee"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Email</span>
          <input
            required
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
            value={formData.shippingEmail}
            onChange={(event) => setFormData((current) => ({ ...current, shippingEmail: event.target.value }))}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Address</span>
          <textarea
            required
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
            value={formData.shippingAddress}
            onChange={(event) => setFormData((current) => ({ ...current, shippingAddress: event.target.value }))}
            placeholder="123 Main St, City, State"
          />
        </label>

        {message ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</p> : null}

        <button type="submit" disabled={loading} className="rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Placing order...' : 'Place order'}
        </button>
      </form>

      <aside className="surface rounded-3xl p-6">
        <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Order summary</div>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4 border-b border-white/8 pb-4 last:border-0 last:pb-0">
              <div>
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-sm text-slate-300">Qty {item.quantity}</div>
              </div>
              <div className="text-sm text-slate-100">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-slate-300">Total</div>
          <div className="text-2xl font-semibold text-white">{formatCurrency(subtotal)}</div>
        </div>
      </aside>
    </div>
  );
}
