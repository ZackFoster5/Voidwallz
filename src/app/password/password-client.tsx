"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { PASSWORD_API_ROUTE } from '@/lib/password-protect';

export default function PasswordClient() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(PASSWORD_API_ROUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Invalid password.');
        setIsSubmitting(false);
        return;
      }

      router.replace(from);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Unexpected error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8 border-2 border-foreground bg-card p-8 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
        <div className="space-y-2 text-center">
          <h1 className="font-mono text-2xl uppercase tracking-wide">Restricted Access</h1>
          <p className="text-sm text-foreground/70">
            This site is protected. Enter the access password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="from" value={from} />
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wide text-foreground/60">
              Access Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm font-mono text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Checking...' : 'Unlock Site'}
          </button>
        </form>

        <div className="text-xs text-foreground/50 text-center">
          Need help? Contact the site owner on{' '}
          <Link href="/landing#contact" className="underline">
            /landing#contact
          </Link>
        </div>
      </div>
    </div>
  );
}
