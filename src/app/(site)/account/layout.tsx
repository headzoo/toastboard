import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Your guestbooks — The Willow Book",
  description: "View and manage the Willow Book guestbooks tied to your account.",
};

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login/?callbackUrl=/account/");
  }
  return children;
}
