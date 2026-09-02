import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login/?callbackUrl=/account/");
  }
  return children;
}
