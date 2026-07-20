"use client";

import { useState } from 'react';
import { addToCart } from '@/lib/cart-storage';
import type { CartItem } from '@/lib/cart-storage';

export function AddToCartButton({ item }: { item: CartItem }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({ ...item, quantity: 1 });
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
    >
      {added ? 'Added' : 'Add to cart'}
    </button>
  );
}
