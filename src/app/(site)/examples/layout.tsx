import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EXAMPLES_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: EXAMPLES_PAGE_METADATA.title,
  description: EXAMPLES_PAGE_METADATA.description,
};

export default function ExamplesLayout({ children }: { children: ReactNode }) {
  return children;
}
