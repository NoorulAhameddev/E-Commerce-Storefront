"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearCart, readCart, removeFromCart, updateCartQuantity, type CartItem } from '@/lib/cart-storage';
import { formatCurrency } from '@/lib/format';

export function CartPanel() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(readCart());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('cart-updated', refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('cart-updated', refresh as EventListener);
    };
  }, []);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function handleRemove(productId: string) {
    removeFromCart(productId);
    window.dispatchEvent(new Event('cart-updated'));
  }

  function handleQuantity(productId: string, quantity: number) {
    updateCartQuantity(productId, quantity);
    window.dispatchEvent(new Event('cart-updated'));
  }

  function handleClear() {
    clearCart();
    window.dispatchEvent(new Event('cart-updated'));
  }

  if (items.length === 0) {
    return (
      <div className="surface rounded-3xl p-8 text-center">
        <p className="text-lg font-semibold text-white">Your cart is empty.</p>
        <p className="mt-2 text-sm text-slate-300">Browse the catalog and add a few products to get started.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="surface flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold text-white">{item.name}</div>
              <div className="text-sm text-slate-300">{formatCurrency(item.price)} each</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => handleQuantity(item.productId, Number(event.target.value))}
                className="w-20 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-center text-white outline-none"
              />
              <button type="button" onClick={() => handleRemove(item.productId)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-rose-400/40 hover:text-rose-200">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="surface flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Subtotal</div>
          <div className="text-3xl font-semibold text-white">{formatCurrency(subtotal)}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleClear} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-white/20 hover:bg-white/5">
            Clear cart
          </button>
          <Link href="/checkout" className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
