import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { CheckoutForm } from '@/components/checkout-form';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/checkout');
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Checkout</div>
        <h1 className="mt-2 text-4xl font-semibold text-white">Complete your order</h1>
      </div>
      <CheckoutForm defaultEmail={user.email} />
    </div>
  );
}
