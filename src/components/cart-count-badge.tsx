"use client";

import { useEffect, useState } from 'react';
import { getCartCount } from '@/lib/cart-storage';

export function CartCountBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(getCartCount());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('cart-updated', refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('cart-updated', refresh as EventListener);
    };
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-semibold text-slate-950">
      {count}
    </span>
  );
}
