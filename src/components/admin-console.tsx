"use client";

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';

type ProductRow = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  inventory: number;
};

type OrderRow = {
  id: string;
  status: string;
  total: number;
  shippingName: string;
  shippingEmail: string;
  createdAt: string;
  user: { email: string };
  items: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
};

const emptyProduct = {
  id: '',
  name: '',
  description: '',
  imageUrl: '',
  price: 0,
  inventory: 0
};

export function AdminConsole({
  initialProducts,
  initialOrders
}: {
  initialProducts: ProductRow[];
  initialOrders: OrderRow[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [formData, setFormData] = useState({ ...emptyProduct });
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(selectedProduct);

  const productCount = useMemo(() => products.length, [products.length]);

  function startEdit(product: ProductRow) {
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl ?? '',
      price: product.price,
      inventory: product.inventory
    });
  }

  function resetForm() {
    setSelectedProduct(null);
    setFormData({ ...emptyProduct });
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing ? `/api/products/${selectedProduct?.id}` : '/api/products';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to save product');
      return;
    }

    const updated = payload.product as ProductRow;
    setProducts((current) =>
      isEditing ? current.map((product) => (product.id === updated.id ? updated : product)) : [updated, ...current]
    );
    resetForm();
    router.refresh();
  }

  async function deleteProduct(productId: string) {
    const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? 'Unable to delete product');
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  async function updateOrderStatus(orderId: string) {
    const nextStatus = statusDrafts[orderId];
    if (!nextStatus) {
      return;
    }

    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? 'Unable to update order');
      return;
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
  }

  return (
    <div className="space-y-8">
      {error ? <div className="surface rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">{error}</div> : null}

      <section className="surface rounded-[2rem] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Product management</div>
            <h2 className="mt-2 text-3xl font-semibold text-white">{isEditing ? 'Edit product' : 'Create product'}</h2>
            <p className="mt-1 text-sm text-slate-300">{productCount} products in the catalog.</p>
          </div>
          {isEditing ? (
            <button type="button" onClick={resetForm} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/5">
              Cancel edit
            </button>
          ) : null}
        </div>

        <form onSubmit={submitProduct} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 md:col-span-1">
            <span className="text-sm text-slate-300">Name</span>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="block space-y-2 md:col-span-1">
            <span className="text-sm text-slate-300">Image URL</span>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none" value={formData.imageUrl} onChange={(event) => setFormData((current) => ({ ...current, imageUrl: event.target.value }))} />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm text-slate-300">Description</span>
            <textarea rows={4} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none" value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Price</span>
            <input type="number" step="0.01" min="0" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none" value={formData.price} onChange={(event) => setFormData((current) => ({ ...current, price: Number(event.target.value) }))} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Inventory</span>
            <input type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none" value={formData.inventory} onChange={(event) => setFormData((current) => ({ ...current, inventory: Number(event.target.value) }))} />
          </label>
          <div className="flex items-end justify-end md:col-span-2">
            <button type="submit" className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">
              {isEditing ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </section>

      <section className="surface rounded-[2rem] p-6">
        <div className="mb-4 text-sm uppercase tracking-[0.28em] text-slate-400">Catalog overview</div>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-4 rounded-3xl border border-white/8 bg-slate-950/30 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-white">{product.name}</div>
                <div className="text-sm text-slate-300">{formatCurrency(product.price)} · {product.inventory} units</div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => startEdit(product)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-200">Edit</button>
                <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-full border border-rose-400/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface rounded-[2rem] p-6">
        <div className="mb-4 text-sm uppercase tracking-[0.28em] text-slate-400">Orders</div>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-white/8 bg-slate-950/30 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-white">Order {order.id.slice(0, 8)}</div>
                  <div className="text-sm text-slate-300">{order.shippingName} · {order.shippingEmail} · {new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="text-sm text-slate-400">Customer: {order.user.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-white">{formatCurrency(order.total)}</div>
                  <div className="text-sm text-slate-300">{order.status}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select value={statusDrafts[order.id] ?? order.status} onChange={(event) => setStatusDrafts((current) => ({ ...current, [order.id]: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-white outline-none">
                  {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button type="button" onClick={() => updateOrderStatus(order.id)} className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15">
                  Update status
                </button>
                <div className="text-sm text-slate-400">{order.items.reduce((total, item) => total + item.quantity, 0)} items</div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.product.name}`} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2">
                    <span>{item.product.name}</span>
                    <span>{item.quantity} x {formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
