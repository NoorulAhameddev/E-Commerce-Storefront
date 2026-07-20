import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/orders');
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Orders</div>
        <h1 className="mt-2 text-4xl font-semibold text-white">Track your purchases</h1>
      </div>

      {orders.length === 0 ? (
        <div className="surface rounded-3xl p-8 text-slate-300">
          You have not placed any orders yet. <Link href="/">Browse the catalog</Link> to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="surface rounded-3xl p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">Order {order.id.slice(0, 8)}</div>
                  <div className="text-sm text-slate-300">Placed {new Date(order.createdAt).toLocaleString()}</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.24em] text-cyan-200">{order.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-white">{formatCurrency(Number(order.total))}</div>
                  <div className="text-sm text-slate-300">{order.items.reduce((total, item) => total + item.quantity, 0)} items</div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <span>{item.product.name}</span>
                    <span>{item.quantity} x {formatCurrency(Number(item.price))}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
