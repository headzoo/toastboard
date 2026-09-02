import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ABOUT_PAGE_METADATA } from '@/lib/pageMetadata';

export const metadata: Metadata = {
  title: ABOUT_PAGE_METADATA.title,
  description: ABOUT_PAGE_METADATA.description,
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
