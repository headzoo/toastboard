import type { Metadata } from "next";
import { HelpPage } from "@/views/HelpPage";
import { HELP_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: HELP_PAGE_METADATA.title,
  description: HELP_PAGE_METADATA.description,
};

export default function Page() {
  return <HelpPage />;
}
