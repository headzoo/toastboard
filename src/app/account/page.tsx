import type { Metadata } from "next";
import { AccountPage } from "@/views/AccountPage";

export const metadata: Metadata = {
  title: "Your guestbooks — The Willow Book",
  description: "View and manage the Willow Book guestbooks tied to your account.",
};

export default function Page() {
  return <AccountPage />;
}
