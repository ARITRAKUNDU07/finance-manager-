"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUp, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/login?signup=success");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#e5e2e2] font-sans flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e293b]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#c3c6d4]/5 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-[#c3c6d4]/10 flex items-center justify-center border border-[#c3c6d4]/20 mx-auto">
            <span className="material-symbols-outlined text-[#c3c6d4] font-bold text-2xl">
              account_balance
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight font-serif text-[#c3c6d4] mt-3">
            Create an Account
          </h1>
          <p className="text-sm text-[#c6c6cc]">
            Join Fortuna to track your assets and budgets
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-[#334155] rounded-2xl p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg text-sm text-[#ffb4ab]">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-[#c6c6cc] uppercase tracking-wider block"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-4 py-3 text-sm text-white placeholder-[#c6c6cc]/40 focus:outline-none focus:border-[#c3c6d4] focus:ring-1 focus:ring-[#c3c6d4] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-[#c6c6cc] uppercase tracking-wider block"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-4 py-3 text-sm text-white placeholder-[#c6c6cc]/40 focus:outline-none focus:border-[#c3c6d4] focus:ring-1 focus:ring-[#c3c6d4] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#c3c6d4] hover:bg-[#c3c6d4]/90 text-[#2c303b] font-semibold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,198,212,0.15)] disabled:opacity-50"
            >
              {isPending ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#c6c6cc] border-t border-[#334155]/30 pt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#c3c6d4] hover:underline font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
