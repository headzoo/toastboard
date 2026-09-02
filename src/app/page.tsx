import type { Metadata } from "next";
import { HomePage } from "@/views/HomePage";
import { HUB_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: HUB_PAGE_METADATA.title,
  description: HUB_PAGE_METADATA.description,
};

export default function Page() {
  return <HomePage />;
}
