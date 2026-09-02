import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { kickerClass, narrowClass } from '@/lib/styles';

export const metadata: Metadata = {
  title: 'Sign in — The Willow Book',
  description: 'Sign in to create and manage your Willow Book guestbooks.',
};

function LoginFallback() {
  return (
    <section className={narrowClass}>
      <p className={kickerClass}>Loading</p>
    </section>
  );
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoginFallback />}>{children}</Suspense>;
}
