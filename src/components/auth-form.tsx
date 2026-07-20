"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthForm({
  mode,
  endpoint,
  redirectTo = '/' as '/' | '/checkout' | '/cart' | '/orders' | '/admin'
}: {
  mode: 'login' | 'register';
  endpoint: string;
  redirectTo?: '/' | '/checkout' | '/cart' | '/orders' | '/admin';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(payload?.error ?? 'Something went wrong');
      return;
    }

    router.refresh();
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="surface space-y-4 rounded-3xl p-6 shadow-2xl shadow-slate-950/30">
      {mode === 'register' ? (
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Full name</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            placeholder="Jordan Lee"
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Email</span>
        <input
          type="email"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          value={formData.email}
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Password</span>
        <input
          type="password"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          value={formData.password}
          onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
          placeholder="••••••••"
        />
      </label>

      {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Working...' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </form>
  );
}
