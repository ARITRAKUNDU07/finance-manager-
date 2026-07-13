import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { auth, signIn, signOut, handlers, signIn: authSignIn, signOut: authSignOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            
            const user = await prisma.user.findUnique({
              where: { email },
            });
            if (!user) {
              console.log("Authorize: User not found for email:", email);
              return null;
            }

            const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
            if (passwordsMatch) {
              console.log("Authorize: Success for email:", email);
              return {
                id: user.id,
                email: user.email,
              };
            } else {
              console.log("Authorize: Password mismatch for email:", email);
            }
          } else {
            console.log("Authorize: Credentials validation failed:", parsedCredentials.error.issues);
          }
          return null;
        } catch (err: any) {
          console.error("Authorize error caught:", err);
          try {
            const fs = require("fs");
            const path = require("path");
            fs.writeFileSync(
              path.resolve(process.cwd(), "authorize_error.log"),
              `Time: ${new Date().toISOString()}\nError: ${err?.message || err}\nStack: ${err?.stack || "No stack"}\n`
            );
          } catch (e) {}
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
