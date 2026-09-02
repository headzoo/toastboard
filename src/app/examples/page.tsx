import type { Metadata } from "next";
import { ExamplesPage } from "@/views/ExamplesPage";
import { EXAMPLES_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: EXAMPLES_PAGE_METADATA.title,
  description: EXAMPLES_PAGE_METADATA.description,
};

export default function Page() {
  return <ExamplesPage />;
}
