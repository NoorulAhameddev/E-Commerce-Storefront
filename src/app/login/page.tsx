import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

const allowedRedirects = new Set(['/', '/checkout', '/cart', '/orders', '/admin']);

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const redirectTo = resolvedSearchParams.next && allowedRedirects.has(resolvedSearchParams.next) ? (resolvedSearchParams.next as '/' | '/checkout' | '/cart' | '/orders' | '/admin') : '/';

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="space-y-5">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-200">
          Welcome back
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Log in to continue shopping and tracking orders.</h1>
        <p className="max-w-xl text-slate-300">Use the demo accounts from the seed data or create your own customer profile. Admin users can access product and order management from the console.</p>
        <Link href="/register" className="inline-flex rounded-full border border-white/10 px-5 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:text-cyan-200">
          Create a new account
        </Link>
      </section>
      <AuthForm mode="login" endpoint="/api/auth/login" redirectTo={redirectTo} />
    </div>
  );
}
