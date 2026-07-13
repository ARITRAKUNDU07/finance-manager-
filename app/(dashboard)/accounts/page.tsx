"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  getStoredAccountsWithBalances,
  saveStoredAccount,
  deleteStoredAccount,
  AccountWithBalance,
} from "@/lib/storage";

export default function AccountsPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const loadAccounts = () => {
    try {
      const data = getStoredAccountsWithBalances();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const startingBalanceStr = formData.get("startingBalance") as string;

    const startingBalanceVal = parseFloat(startingBalanceStr);
    if (isNaN(startingBalanceVal)) {
      setError("Please enter a valid starting balance.");
      setIsPending(false);
      return;
    }

    const startingBalance = Math.round(startingBalanceVal * 100);

    try {
      saveStoredAccount({
        name,
        type,
        startingBalance,
      });

      loadAccounts();
      setSuccess(true);
      formRef.current?.reset();
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this account? Associated transactions will remain but reference an unknown account."
      )
    ) {
      return;
    }
    
    try {
      deleteStoredAccount(id);
      loadAccounts();
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

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
    <div className="max-w-7xl mx-auto space-y-6 pt-6 font-sans">
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
            <div className="text-center py-12 text-on-surface-variant text-sm">
              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant text-sm">
              No accounts created yet. Use the form to add your first account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="glass-card rounded-xl p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
                      <span className="material-symbols-outlined">{getAccountIcon(acc.type)}</span>
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-on-surface text-sm truncate">
                        {acc.name}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        {acc.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-on-surface text-lg block">
                        {formatCurrency(acc.balance)}
                      </span>
                      {acc.balance !== acc.startingBalance && (
                        <span className="text-[9px] text-on-surface-variant/70 block">
                          Starts at {formatCurrency(acc.startingBalance)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all cursor-pointer"
                      title="Delete Account"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
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

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg text-sm text-[#ffb4ab]">
                {error}
              </div>
            )}

            {success && (
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
                placeholder="e.g. Chase Checking, Cash Wallet"
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
                <option value="card">Credit Card</option>
                <option value="cash">Cash Wallet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="startingBalance" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Starting Balance (₹)
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
