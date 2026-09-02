import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      authorize: async (credentials) => {
        const idToken = credentials?.idToken;
        if (!idToken || typeof idToken !== "string") return null;

        try {
          const decoded = await getAdminAuth().verifyIdToken(idToken);
          return {
            id: decoded.uid,
            email: decoded.email ?? null,
            name: decoded.name ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login/",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },
  trustHost: true,
});
