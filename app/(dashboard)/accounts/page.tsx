"use client";

import React, { useActionState, useEffect, useRef } from "react";
import { createAccount } from "@/app/actions/accounts";
import { formatCurrency } from "@/lib/utils";

// Custom type for Account from our DB
interface AccountItem {
  id: string;
  name: string;
  type: string;
  startingBalance: number;
}

export default function AccountsPage() {
  const [state, formAction, isPending] = useActionState(createAccount, null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // We can fetch accounts using a client-side fetch or just pass it down. But wait!
  // To keep it simple and load instantly, we can use a server component or fetch dynamically.
  // Let's fetch the accounts dynamically from the client since it's an interactive page!
  const [accounts, setAccounts] = React.useState<AccountItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (state?.success) {
      fetchAccounts();
      formRef.current?.reset();
    }
  }, [state]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return "account_balance";
      case "card":
        return "credit_card";
      default:
        return "payments";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6">
      <header className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-semibold">
          Accounts
        </h2>
        <p className="font-sans text-sm text-on-surface-variant">
          Create and manage your financial accounts.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Accounts List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-serif text-lg font-semibold text-on-surface">
            Your Accounts
          </h3>

          {loading ? (
            <div className="text-center py-12 text-on-surface-variant font-sans text-sm">
              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant font-sans text-sm">
              No accounts created yet. Use the form to add your first account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="glass-card rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                      <span className="material-symbols-outlined">{getAccountIcon(acc.type)}</span>
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-on-surface text-sm">
                        {acc.name}
                      </h4>
                      <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">
                        {acc.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-bold text-on-surface text-lg">
                      {formatCurrency(acc.startingBalance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Account Form */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <h3 className="font-serif text-lg font-semibold text-on-surface mb-6">
            Create Account
          </h3>

          <form ref={formRef} action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg text-sm text-[#ffb4ab]">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="p-3 bg-[#10b981]/20 border border-[#10b981]/30 rounded-lg text-sm text-[#10b981]">
                Account created successfully!
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Account Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. HDFC Bank, Cash Wallet"
                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-4 py-3 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Account Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                <option value="bank">Bank Account</option>
                <option value="card">Credit/Debit Card</option>
                <option value="cash">Cash Wallet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="startingBalance" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Starting Balance ($)
              </label>
              <input
                id="startingBalance"
                name="startingBalance"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-4 py-3 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-[#2c303b] font-semibold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,198,212,0.15)] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
