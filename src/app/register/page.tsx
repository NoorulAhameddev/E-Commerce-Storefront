import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

const allowedRedirects = new Set(['/', '/checkout', '/cart', '/orders', '/admin']);

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const redirectTo = resolvedSearchParams.next && allowedRedirects.has(resolvedSearchParams.next) ? (resolvedSearchParams.next as '/' | '/checkout' | '/cart' | '/orders' | '/admin') : '/';

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="space-y-5">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-200">
          New customer
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Create a customer account for faster checkout.</h1>
        <p className="max-w-xl text-slate-300">Registration stores a hashed password, creates a session cookie, and defaults the account to the User role. Admin accounts can be added directly in the database seed.</p>
        <Link href="/login" className="inline-flex rounded-full border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:text-cyan-200">
          Already have an account?
        </Link>
      </section>
      <AuthForm mode="register" endpoint="/api/auth/register" redirectTo={redirectTo} />
    </div>
  );
}
