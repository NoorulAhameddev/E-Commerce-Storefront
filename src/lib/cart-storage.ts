export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

const CART_KEY = 'ecommerce_cart';

function canUseWindow() {
  return typeof window !== 'undefined';
}

export function readCart(): CartItem[] {
  if (!canUseWindow()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('storage'));
}

export function addToCart(item: CartItem) {
  const cart = readCart();
  const existing = cart.find((entry) => entry.productId === item.productId);

  if (existing) {
    existing.quantity += item.quantity;
    writeCart([...cart]);
    return;
  }

  writeCart([...cart, item]);
}

export function updateCartQuantity(productId: string, quantity: number) {
  const cart = readCart().map((item) =>
    item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );

  writeCart(cart);
}

export function removeFromCart(productId: string) {
  writeCart(readCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}
