"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { deleteStoredTransaction } from "@/lib/storage";

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

interface Transaction {
  id: string;
  type: string;
  amountMinor: number;
  note: string | null;
  paymentMethod: string | null;
  txnDate: string | Date;
  account: Account;
  category: Category | null;
  transferToAccountId?: string | null;
  accountId?: string;
}

interface TransactionListProps {
  initialTransactions: any[];
  accounts: Account[];
  categories: Category[];
}

export default function TransactionList({
  initialTransactions,
  accounts,
  categories,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isPending, startTransition] = useTransition();

  // Filter states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      deleteStoredTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err) {
      alert("Failed to delete transaction.");
    }
  };

  // Perform client-side filtering
  const filteredTransactions = transactions.filter((tx) => {
    // Search filter
    if (search) {
      const query = search.toLowerCase();
      const noteMatch = tx.note?.toLowerCase().includes(query);
      const categoryMatch = tx.category?.name?.toLowerCase().includes(query);
      const accountMatch = tx.account.name.toLowerCase().includes(query);
      if (!noteMatch && !categoryMatch && !accountMatch) return false;
    }

    // Category filter
    if (categoryFilter && tx.category?.id !== categoryFilter && tx.category?.name !== categoryFilter) {
      return false;
    }

    // Account filter
    if (accountFilter && tx.account.id !== accountFilter) return false;

    // Date range filter
    const txDate = new Date(tx.txnDate);
    if (startDate) {
      const start = new Date(startDate);
      if (txDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (txDate > end) return false;
    }

    // Amount filter (minor units conversion for check)
    const amountMajor = tx.amountMinor / 100;
    if (minAmount && amountMajor < parseFloat(minAmount)) return false;
    if (maxAmount && amountMajor > parseFloat(maxAmount)) return false;

    return true;
  });

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      Food: "restaurant",
      Rent: "home",
      Transport: "directions_car",
      Subscriptions: "movie",
      Shopping: "shopping_bag",
      Bills: "payments",
      Other: "category",
    };
    return icons[name] || "category";
  };

  const getCategoryColorClass = (name: string) => {
    const bgColors: Record<string, string> = {
      Food: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      Rent: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      Transport: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Subscriptions: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      Shopping: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Bills: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return bgColors[name] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setAccountFilter("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-semibold">
            Transactions
          </h2>
          <p className="text-sm text-on-surface-variant">
            Analyze and filter your capital movements.
          </p>
        </div>
        <Link href="/transactions/new">
          <button className="bg-primary hover:bg-primary/90 text-[#2c303b] font-semibold text-sm px-6 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(195,198,212,0.15)] cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Transaction
          </button>
        </Link>
      </div>

      {/* Filter Bento Box */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Filter Transactions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary transition-all"
              placeholder="Search by note, category..."
              type="text"
            />
          </div>

          {/* Account selector */}
          <div className="relative">
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category selector */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all [color-scheme:dark]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all [color-scheme:dark]"
            />
          </div>

          {/* Min Amount */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              Min Amount (₹)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Max Amount */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              Max Amount (₹)
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleClearFilters}
            className="text-xs text-primary hover:underline font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-2xl p-6">
        {filteredTransactions.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#334155]">
              receipt_long
            </span>
            <p className="text-sm">No transactions match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#334155]/40 text-xs text-on-surface-variant uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Category / Note</th>
                  <th className="pb-3 font-semibold">Account</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/20">
                {filteredTransactions.map((tx) => {
                  const isExpense = tx.type === "expense";
                  const isIncome = tx.type === "income";
                  const categoryName = tx.category?.name || "Other";

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-secondary-container/5 transition-colors group"
                    >
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center border ${getCategoryColorClass(
                              categoryName
                            )}`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {tx.type === "transfer" ? "swap_horiz" : getCategoryIcon(categoryName)}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-on-surface block">
                              {tx.type === "transfer"
                                ? `Transfer to ${tx.transferToAccountId ? "another account" : "account"}`
                                : tx.note || categoryName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant font-sans">
                        {tx.account.name}
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant font-sans capitalize">
                        {tx.paymentMethod || "—"}
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant font-sans">
                        {new Date(tx.txnDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className={`py-4 text-sm font-semibold text-right font-sans ${
                          isExpense
                            ? "text-[#F43F5E]"
                            : isIncome
                            ? "text-[#10B981]"
                            : "text-[#c3c6d4]"
                        }`}
                      >
                        {isExpense ? "-" : isIncome ? "+" : ""}
                        {formatCurrency(tx.amountMinor)}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer p-1"
                          title="Delete Transaction"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
