import type { Metadata } from "next";
import { PrivacyPage } from "@/views/PrivacyPage";
import { PRIVACY_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: PRIVACY_PAGE_METADATA.title,
  description: PRIVACY_PAGE_METADATA.description,
};

export default function Page() {
  return <PrivacyPage />;
}
