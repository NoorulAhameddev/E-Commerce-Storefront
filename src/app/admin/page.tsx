import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { db } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AdminConsole } from '@/components/admin-console';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  if (user.role !== Role.ADMIN) {
    return (
      <div className="surface rounded-3xl p-8 text-slate-200">
        <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Access denied</div>
        <h1 className="mt-2 text-3xl font-semibold text-white">You do not have permission to manage the store.</h1>
      </div>
    );
  }

  const [products, orders] = await Promise.all([
    db.product.findMany({ orderBy: { createdAt: 'desc' } }),
    db.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Admin</div>
        <h1 className="mt-2 text-4xl font-semibold text-white">Manage products and orders</h1>
      </div>

      <AdminConsole
        initialProducts={products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          price: Number(product.price),
          inventory: product.inventory
        }))}
        initialOrders={orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: Number(order.total),
          shippingName: order.shippingName,
          shippingEmail: order.shippingEmail,
          createdAt: order.createdAt.toISOString(),
          user: { email: order.user.email },
          items: order.items.map((item) => ({
            quantity: item.quantity,
            price: Number(item.price),
            product: { name: item.product.name }
          }))
        }))}
      />
    </div>
  );
}
