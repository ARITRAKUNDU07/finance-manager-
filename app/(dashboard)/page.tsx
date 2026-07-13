"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  getStoredAccountsWithBalances,
  getStoredTransactions,
  getStoredCategories,
  AccountWithBalance,
  StoredTransaction,
  StoredCategory,
} from "@/lib/storage";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [categories, setCategories] = useState<StoredCategory[]>([]);

  useEffect(() => {
    setAccounts(getStoredAccountsWithBalances());
    setTransactions(getStoredTransactions());
    setCategories(getStoredCategories());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate total balance
  const totalBalanceMinor = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Get current month start and end dates
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Filter transactions for this month
  const monthlyTxns = transactions.filter(t => t.txnDate.startsWith(currentMonthYear));

  // Get recent 5 transactions
  const displayedTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime())
    .slice(0, 5);

  const monthlyIncome = monthlyTxns
    .filter((tx) => tx.type === "income")
    .reduce((acc, curr) => acc + curr.amountMinor, 0);

  const monthlyExpense = monthlyTxns
    .filter((tx) => tx.type === "expense")
    .reduce((acc, curr) => acc + curr.amountMinor, 0);

  // Calculate Category Breakdown
  const categorySpendingMap = new Map<string, number>();
  monthlyTxns
    .filter((tx) => tx.type === "expense" && tx.categoryId)
    .forEach((tx) => {
      const catId = tx.categoryId!;
      categorySpendingMap.set(catId, (categorySpendingMap.get(catId) || 0) + tx.amountMinor);
    });

  // Curated color map for preset categories
  const categoryColorMap: Record<string, string> = {
    Food: "#f59e0b",         // Amber
    Rent: "#14b8a6",         // Teal
    Transport: "#a855f7",    // Purple
    Subscriptions: "#f43f5e", // Rose
    Shopping: "#3b82f6",     // Blue
    Bills: "#eab308",        // Yellow
    Other: "#6b7280",        // Gray
  };

  const pieChartData: { name: string; value: number; color: string }[] = [];
  categorySpendingMap.forEach((value, catId) => {
    const cat = categories.find((c) => c.id === catId);
    const name = cat?.name || "Other";
    pieChartData.push({
      name,
      value,
      color: categoryColorMap[name] || "#6b7280",
    });
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6">
      <header className="mb-8 animate-fade-in-up">
        <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-semibold">
          Overview
        </h2>
        <p className="font-sans text-sm text-on-surface-variant">
          Here is your financial summary for{" "}
          {now.toLocaleString("en-US", { month: "long", year: "numeric" })}.
        </p>
      </header>

      {accounts.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary/70">
            account_balance_wallet
          </span>
          <h3 className="font-serif text-xl font-medium text-on-surface">
            Get Started with Fortuna
          </h3>
          <p className="text-sm text-on-surface-variant font-sans">
            Create your first account (e.g. Bank Account, Cash, or Credit Card) to begin tracking your expenses.
          </p>
          <Link href="/accounts" className="inline-block pt-2">
            <button className="bg-primary text-on-primary hover:bg-primary/90 font-sans font-semibold text-sm px-6 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(195,198,212,0.15)] cursor-pointer">
              Create Account
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Top Row: Balance & Income/Expense */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Balance Summary Card */}
            <div className="lg:col-span-8 glass-card rounded-2xl p-8 relative overflow-hidden animate-fade-in-up delay-100 flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2 font-sans">
                  Total Balance
                </span>
                <h3 className="font-serif text-4xl lg:text-5xl font-semibold text-on-surface tracking-tight">
                  {formatCurrency(totalBalanceMinor)}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#334155]/40 pt-4 mt-6">
                {accounts.map((acc) => (
                  <div key={acc.id} className="truncate">
                    <span className="text-[10px] text-on-surface-variant uppercase block font-sans">
                      {acc.name}
                    </span>
                    <span className="text-sm font-semibold text-on-surface font-sans">
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income vs Expense Stack */}
            <div className="lg:col-span-4 flex flex-col gap-6 animate-fade-in-up delay-200">
              {/* Income */}
              <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase font-sans">
                    Monthly Income
                  </span>
                  <span className="material-symbols-outlined text-[#10B981] text-sm">
                    arrow_upward
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-semibold text-[#10B981] tracking-tight">
                  {formatCurrency(monthlyIncome)}
                </h4>
              </div>

              {/* Expense */}
              <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase font-sans">
                    Monthly Expenses
                  </span>
                  <span className="material-symbols-outlined text-error text-sm">
                    arrow_downward
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-semibold text-error tracking-tight">
                  {formatCurrency(monthlyExpense)}
                </h4>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Transactions & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Transactions List */}
            <div className="lg:col-span-8 glass-card rounded-2xl p-6 animate-fade-in-up delay-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg font-semibold text-on-surface">
                  Recent Transactions
                </h3>
                <Link href="/transactions" className="text-xs text-primary hover:underline font-sans">
                  View All
                </Link>
              </div>

              {displayedTransactions.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-12 font-sans">
                  No transactions added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {displayedTransactions.map((tx) => {
                    const matchedAccount = accounts.find((a) => a.id === tx.accountId);
                    const matchedCategory = categories.find((c) => c.id === tx.categoryId);
                    const categoryName = matchedCategory?.name || "Other";
                    
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center border shrink-0 ${getCategoryColorClass(
                              categoryName
                            )}`}
                          >
                            <span className="material-symbols-outlined">
                              {getCategoryIcon(categoryName)}
                            </span>
                          </div>
                          <div className="truncate">
                            <span className="text-sm font-semibold text-on-surface block font-sans truncate">
                              {tx.note || (tx.type === "transfer" ? "Transfer" : categoryName)}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-sans">
                              {matchedAccount?.name} • {new Date(tx.txnDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-sm font-semibold font-sans block ${
                              tx.type === "income"
                                ? "text-[#10B981]"
                                : tx.type === "transfer"
                                ? "text-on-surface-variant"
                                : "text-error"
                            }`}
                          >
                            {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"}
                            {formatCurrency(tx.amountMinor)}
                          </span>
                          <span className="text-[9px] text-on-surface-variant/70 font-sans block mt-0.5">
                            {tx.paymentMethod ? tx.paymentMethod.toUpperCase() : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Breakdown (Pie Chart) */}
            <div className="lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col animate-fade-in-up delay-300">
              <h3 className="font-serif text-lg font-semibold text-on-surface mb-6">
                Category Spending
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center">
                {pieChartData.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-12 font-sans">
                    No expense data for this month.
                  </p>
                ) : (
                  <>
                    <div className="w-full">
                      <CategoryPieChart data={pieChartData} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
