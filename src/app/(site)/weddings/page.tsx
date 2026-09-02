import type { Metadata } from 'next';
import { EventLandingPage } from '@/components/EventLandingPage';
import { MARKETING_CONTENT } from '@/lib/marketingContent';

const content = MARKETING_CONTENT.wedding;

export const metadata: Metadata = {
  title: `${content.hubTitle} guestbook — The Willow Book`,
  description: content.hubDescription,
};

export default function Page() {
  return <EventLandingPage content={content} />;
}
