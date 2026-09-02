import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { TERMS_PAGE_METADATA } from '@/lib/pageMetadata';

export const metadata: Metadata = {
  title: TERMS_PAGE_METADATA.title,
  description: TERMS_PAGE_METADATA.description,
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
