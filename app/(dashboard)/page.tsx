import React from "react";
import Link from "next/link";
import { getAccountsWithBalances } from "@/app/actions/accounts";
import { getTransactions } from "@/app/actions/transactions";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";

export default async function DashboardPage() {
  const session = await auth();
  const accounts = await getAccountsWithBalances();
  
  // Calculate total balance
  const totalBalanceMinor = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Get current month start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Get recent 5 transactions
  const recentTransactions = await getTransactions({
    maxAmount: undefined,
    minAmount: undefined,
  });
  const displayedTransactions = recentTransactions.slice(0, 5);

  // Fetch monthly totals for Income vs Expense
  const monthlyTxns = await prisma.transaction.findMany({
    where: {
      userId: session?.user?.id,
      txnDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const monthlyIncome = monthlyTxns
    .filter((tx) => tx.type === "income")
    .reduce((acc, curr) => acc + curr.amountMinor, 0);

  const monthlyExpense = monthlyTxns
    .filter((tx) => tx.type === "expense")
    .reduce((acc, curr) => acc + curr.amountMinor, 0);

  // Calculate Category Breakdown
  const categorySpendingMap = new Map<string, { value: number; color: string }>();
  
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

  monthlyTxns
    .filter((tx) => tx.type === "expense" && tx.categoryId)
    .forEach((tx) => {
      // Find category name
      const categoryId = tx.categoryId!;
      // For simplicity, we can load categories or since we know they are in db, we fetch them
    });

  // Let's perform a direct aggregation of categories for correct display
  const categorySpendingAgg = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session?.user?.id,
      type: "expense",
      txnDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      categoryId: { not: null },
    },
    _sum: {
      amountMinor: true,
    },
  });

  // Fetch categories details for the grouped ids
  const categoriesList = await prisma.category.findMany({
    where: {
      id: { in: categorySpendingAgg.map((c) => c.categoryId!).filter(Boolean) },
    },
  });

  const pieChartData = categorySpendingAgg.map((agg) => {
    const cat = categoriesList.find((c) => c.id === agg.categoryId);
    const name = cat?.name || "Other";
    return {
      name,
      value: agg._sum.amountMinor || 0,
      color: categoryColorMap[name] || "#6b7280",
    };
  });

  // Category Icons Helper
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
              {/* Subtle ambient glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2 font-sans">
                  Total Balance
                </span>
                <h3 className="font-serif text-4xl lg:text-5xl font-semibold text-on-surface tracking-tight">
                  {formatCurrency(totalBalanceMinor)}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-[#334155]/40 pt-4 mt-6">
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
                    arrow_downward
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-semibold text-[#10B981] mb-1">
                  {formatCurrency(monthlyIncome)}
                </h4>
                {/* Visual feedback trend */}
                <div className="h-1 w-full bg-[#10B981]/10 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#10B981] w-[65%] rounded-full"></div>
                </div>
              </div>

              {/* Expenses */}
              <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase font-sans">
                    Monthly Expenses
                  </span>
                  <span className="material-symbols-outlined text-[#F43F5E] text-sm">
                    arrow_upward
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-semibold text-[#F43F5E] mb-1">
                  {formatCurrency(monthlyExpense)}
                </h4>
                <div className="h-1 w-full bg-[#F43F5E]/10 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#F43F5E] w-[45%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Spending & Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Spending Categories */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-6 animate-fade-in-up delay-300">
              <h3 className="font-serif text-lg font-semibold text-on-surface mb-6">
                Spending breakdown
              </h3>
              <CategoryPieChart data={pieChartData} />
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 animate-fade-in-up delay-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg font-semibold text-on-surface">
                  Recent Transactions
                </h3>
                <Link
                  className="text-xs font-sans text-primary hover:underline"
                  href="/transactions"
                >
                  View all
                </Link>
              </div>

              {displayedTransactions.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-on-surface-variant font-sans">
                  <span className="material-symbols-outlined text-4xl mb-2 text-[#334155]">
                    receipt_long
                  </span>
                  <p className="text-sm">No transactions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedTransactions.map((tx) => {
                    const isExpense = tx.type === "expense";
                    const isIncome = tx.type === "income";
                    const categoryName = tx.category?.name || "Other";
                    
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 hover:bg-secondary-container/10 rounded-xl transition-colors border-b border-[#334155]/30 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center border ${getCategoryColorClass(
                              categoryName
                            )}`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {tx.type === "transfer" ? "swap_horiz" : getCategoryIcon(categoryName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-sans text-sm font-semibold text-on-surface">
                              {tx.type === "transfer"
                                ? `Transfer to ${tx.transferToAccountId ? "another account" : "account"}`
                                : tx.note || categoryName}
                            </p>
                            <p className="font-sans text-[11px] text-on-surface-variant">
                              {new Date(tx.txnDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}{" "}
                              • {tx.paymentMethod || "Method"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-sans text-sm font-semibold ${
                            isExpense
                              ? "text-[#F43F5E]"
                              : isIncome
                              ? "text-[#10B981]"
                              : "text-primary-fixed-dim"
                          }`}
                        >
                          {isExpense ? "-" : isIncome ? "+" : ""}
                          {formatCurrency(tx.amountMinor)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
