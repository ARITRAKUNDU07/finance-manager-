import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  callbacks: {
    authorized() {
      return true; // Bypass authentication redirect for local development
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
