"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useEffect } from "react";
import { watchFirebaseAuth } from "@/lib/firebaseAuth";

/** Keep Auth.js and Firebase client auth aligned. */
export function AuthSync() {
  const { status } = useSession();

  useEffect(() => {
    return watchFirebaseAuth((user) => {
      if (!user && status === "authenticated") {
        void nextAuthSignOut({ redirect: false });
      }
    });
  }, [status]);

  return null;
}
