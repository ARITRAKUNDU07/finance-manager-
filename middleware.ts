import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protecting dashboard, transactions, budgets, reports, and subroutes
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
