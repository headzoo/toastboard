import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PRICING_PAGE_METADATA } from '@/lib/pageMetadata';

export const metadata: Metadata = {
  title: PRICING_PAGE_METADATA.title,
  description: PRICING_PAGE_METADATA.description,
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
