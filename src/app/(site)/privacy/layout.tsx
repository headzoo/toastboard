import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PRIVACY_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: PRIVACY_PAGE_METADATA.title,
  description: PRIVACY_PAGE_METADATA.description,
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
