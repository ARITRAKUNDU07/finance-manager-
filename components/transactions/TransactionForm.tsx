"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveStoredTransaction } from "@/lib/storage";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
}

export default function TransactionForm({ accounts, categories }: TransactionFormProps) {
  const router = useRouter();

  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Set default date to today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [txnDate, setTxnDate] = useState(getTodayString());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get("amount") as string;
    const accountId = formData.get("accountId") as string;
    const categoryId = formData.get("categoryId") as string || null;
    const transferToAccountId = formData.get("transferToAccountId") as string || null;
    const note = formData.get("note") as string || null;
    const dateStr = formData.get("txnDate") as string;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      setIsPending(false);
      return;
    }

    const amountMinor = Math.round(amount * 100);

    if (!accountId) {
      setError("Please select an account.");
      setIsPending(false);
      return;
    }

    if (type === "transfer" && !transferToAccountId) {
      setError("Please select a destination account.");
      setIsPending(false);
      return;
    }

    if (type === "transfer" && accountId === transferToAccountId) {
      setError("Source and destination accounts must be different.");
      setIsPending(false);
      return;
    }

    if (type !== "transfer" && !categoryId) {
      setError("Please select a category.");
      setIsPending(false);
      return;
    }

    try {
      saveStoredTransaction({
        accountId,
        categoryId: type === "transfer" ? null : categoryId,
        type,
        amountMinor,
        transferToAccountId: type === "transfer" ? transferToAccountId : null,
        note,
        paymentMethod: type === "transfer" ? "bank" : paymentMethod,
        txnDate: new Date(dateStr).toISOString(),
      });
      router.push("/transactions");
    } catch (err: any) {
      setError(err?.message || "Failed to save transaction.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="glass-card w-full rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg text-sm text-[#ffb4ab]">
            {error}
          </div>
        )}

        {/* Type selector (Sliding Tab Switch) */}
        <div className="w-full max-w-md mx-auto">
          <input type="hidden" name="type" value={type} />
          <div className="relative flex p-1 bg-[#0f172a]/60 border border-[#334155] rounded-full overflow-hidden select-none">
            <div
              className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ${
                type === "expense"
                  ? "left-1 w-[31%] bg-[#f43f5e]"
                  : type === "income"
                  ? "left-[34.5%] w-[31%] bg-[#10b981]"
                  : "left-[68%] w-[31%] bg-[#c3c6d4]"
              }`}
            ></div>
            
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 relative z-10 py-2.5 text-center text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                type === "expense" ? "text-white" : "text-[#c6c6cc]"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 relative z-10 py-2.5 text-center text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                type === "income" ? "text-white" : "text-[#c6c6cc]"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={`flex-1 relative z-10 py-2.5 text-center text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                type === "transfer" ? "text-[#2c303b]" : "text-[#c6c6cc]"
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
              Amount (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                required
                className="input-dark w-full rounded-lg py-3 pl-12 pr-4 text-on-surface text-sm placeholder:text-on-surface-variant/40"
                placeholder="0.00"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                currency_rupee
              </span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="txnDate"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                required
                className="input-dark w-full rounded-lg py-3 pl-12 pr-4 text-on-surface text-sm appearance-none cursor-pointer"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                calendar_today
              </span>
            </div>
          </div>

          {/* Account Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
              {type === "transfer" ? "Source Account" : "Account"}
            </label>
            <div className="relative">
              <select
                name="accountId"
                defaultValue=""
                required
                className="input-dark w-full rounded-lg py-3 pl-12 pr-10 text-on-surface text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select Account
                </option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                account_balance_wallet
              </span>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Conditional Input (Category vs Destination Account) */}
          {type === "transfer" ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Destination Account
              </label>
              <div className="relative">
                <select
                  name="transferToAccountId"
                  defaultValue=""
                  required
                  className="input-dark w-full rounded-lg py-3 pl-12 pr-10 text-on-surface text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select Target Account
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type.toUpperCase()})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                  swap_horiz
                </span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Category
              </label>
              <div className="relative">
                <select
                  name="categoryId"
                  defaultValue=""
                  required
                  className="input-dark w-full rounded-lg py-3 pl-12 pr-10 text-on-surface text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                  category
                </span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector (Expense/Income only) */}
          {type !== "transfer" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["card", "bank", "cash"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      paymentMethod === method
                        ? "bg-[#1E293B] border-primary text-primary"
                        : "border-[#334155] text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
              Memo / Notes
            </label>
            <div className="relative">
              <input
                type="text"
                name="note"
                placeholder="What was this for?"
                className="input-dark w-full rounded-lg py-3 px-4 text-on-surface text-sm placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 mt-4 border-t border-[#334155]/30 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-[#334155] hover:bg-surface-container transition-colors text-sm text-on-surface cursor-pointer order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-lg bg-primary text-[#2c303b] font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(195,198,212,0.15)] order-1 sm:order-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            {isPending ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
