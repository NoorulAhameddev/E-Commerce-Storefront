"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Role } from '@prisma/client';

export function HeaderActions({
  user
}: {
  user: { email: string; name: string | null; role: Role } | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-200">
        <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-300/50 hover:text-cyan-200" href="/login">
          Log in
        </Link>
        <Link className="rounded-full bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-200" href="/register">
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <div className="hidden text-right sm:block">
        <div className="font-semibold text-white">{user.name ?? user.email}</div>
        <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">{user.role}</div>
      </div>
      <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-300/50 hover:text-cyan-200" href="/orders">
        Orders
      </Link>
      {user.role === 'ADMIN' ? (
        <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-purple-300/50 hover:text-purple-200" href="/admin">
          Admin
        </Link>
      ) : null}
      <button className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/18" onClick={handleLogout} type="button">
        Log out
      </button>
    </div>
  );
}
