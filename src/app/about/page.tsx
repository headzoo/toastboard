import type { Metadata } from "next";
import { AboutPage } from "@/views/AboutPage";
import { ABOUT_PAGE_METADATA } from "@/lib/pageMetadata";

export const metadata: Metadata = {
  title: ABOUT_PAGE_METADATA.title,
  description: ABOUT_PAGE_METADATA.description,
};

export default function Page() {
  return <AboutPage />;
}
