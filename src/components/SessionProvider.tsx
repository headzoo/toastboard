'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { AuthSync } from './AuthSync';

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthSync />
      {children}
    </NextAuthSessionProvider>
  );
}
