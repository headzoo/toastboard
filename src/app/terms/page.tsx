import type { Metadata } from "next";
import { TermsPage } from "@/views/TermsPage";
import { TERMS_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: TERMS_PAGE_METADATA.title,
  description: TERMS_PAGE_METADATA.description,
};

export default function Page() {
  return <TermsPage />;
}
