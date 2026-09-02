import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { auth } from '@/auth';
import { Shell } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Create a guestbook — The Willow Book',
  description:
    'Start a Willow Book guestbook in minutes. Sign in to save it to your account — guests still never log in.',
};

function CreateFallback() {
  return (
    <Shell>
      <section className='max-w-[760px]'>
        <p className='kicker'>Loading</p>
      </section>
    </Shell>
  );
}

export default async function CreateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login/?callbackUrl=/create/');
  }
  return <Suspense fallback={<CreateFallback />}>{children}</Suspense>;
}
