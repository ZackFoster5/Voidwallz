import { Suspense } from 'react';
import PasswordClient from './password-client';

export default function PasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <PasswordClient />
    </Suspense>
  );
}
