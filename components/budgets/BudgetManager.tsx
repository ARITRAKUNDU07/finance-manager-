"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { saveStoredBudget, getStoredBudgetsWithSpending } from "@/lib/storage";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  monthYear: string;
  limitMinor: number;
  spentMinor: number;
  percentUsed: number;
  category: Category;
}

interface BudgetManagerProps {
  initialBudgets: BudgetItem[];
  categories: Category[];
  currentMonthYear: string; // e.g. "2026-07"
}

export default function BudgetManager({
  initialBudgets,
  categories,
  currentMonthYear,
}: BudgetManagerProps) {
  const router = useRouter();
  const [monthYear, setMonthYear] = useState(currentMonthYear);
  const [budgets, setBudgets] = useState<BudgetItem[]>(initialBudgets);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Trigger reload/update when month selection changes
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    setMonthYear(newMonth);
    router.push(`/budgets?month=${newMonth}`);
  };

  useEffect(() => {
    setBudgets(initialBudgets);
  }, [initialBudgets]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const categoryId = formData.get("categoryId") as string;
    const limitStr = formData.get("limit") as string;

    const limit = parseFloat(limitStr);
    if (isNaN(limit) || limit < 0) {
      setError("Please enter a valid budget limit.");
      setIsPending(false);
      return;
    }

    const limitMinor = Math.round(limit * 100);

    try {
      saveStoredBudget({
        categoryId,
        monthYear,
        limitMinor,
      });

      // Update local state directly
      const updated = getStoredBudgetsWithSpending(monthYear);
      setBudgets(updated);
      setSuccess(true);
      
      // Reset limit input
      const limitInput = document.getElementById("limit") as HTMLInputElement;
      if (limitInput) limitInput.value = "";
    } catch (err: any) {
      setError(err?.message || "Failed to configure budget.");
    } finally {
      setIsPending(false);
    }
  };

  // Generates month selections (last 6 months and next 3 months)
  const getMonthOptions = () => {
    const options = [];
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    
    for (let i = 0; i < 10; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const label = date.toLocaleString("en-US", { month: "long", year: "numeric" });
      const value = `${year}-${month}`;
      options.push({ label, value });
      date.setMonth(date.getMonth() + 1);
    }
    return options;
  };

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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-semibold">
            Budgets
          </h2>
          <p className="text-sm text-on-surface-variant">
            Set and track limits per spending category.
          </p>
        </div>

        {/* Month Picker */}
        <div className="relative">
          <select
            value={monthYear}
            onChange={handleMonthChange}
            className="bg-[#1e293b]/40 border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all cursor-pointer font-semibold appearance-none pr-10"
          >
            {getMonthOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Budgets Listing */}
        <div className="lg:col-span-8 space-y-4">
          {budgets.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant font-sans text-sm">
              No budgets configured for this month. Set a limit on the right panel to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((b) => {
                const isOverBudget = b.percentUsed >= 100;
                const isWarningThreshold = b.percentUsed >= 80;
                
                return (
                  <div
                    key={b.id}
                    className={`glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
                      isWarningThreshold ? "warning-glow border-[#93000a]" : "border-[#334155]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border ${getCategoryColorClass(
                            b.category.name
                          )}`}
                        >
                          <span className="material-symbols-outlined">
                            {getCategoryIcon(b.category.name)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-on-surface text-sm">
                            {b.category.name}
                          </h4>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-sans">
                            {b.monthYear}
                          </span>
                        </div>
                      </div>
                      {/* Warning badges */}
                      {isOverBudget ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] font-sans">
                          Limit Exceeded
                        </span>
                      ) : isWarningThreshold ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-500 font-sans">
                          &gt; 80% Spent
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-on-surface-variant font-sans">Spent</span>
                        <span className="font-sans font-semibold text-on-surface">
                          {formatCurrency(b.spentMinor)}
                          <span className="text-on-surface-variant/60 font-normal text-xs ml-1">
                            of {formatCurrency(b.limitMinor)}
                          </span>
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 w-full progress-bar-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWarningThreshold ? "bg-[#f43f5e]" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-on-surface-variant/60 font-sans">
                        <span>{b.percentUsed.toFixed(0)}% used</span>
                        <span>{formatCurrency(Math.max(b.limitMinor - b.spentMinor, 0))} remaining</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Configure Budget Panel */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <h3 className="font-serif text-lg font-semibold text-on-surface mb-6">
            Configure Budget
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg text-sm text-[#ffb4ab]">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-[#10b981]/20 border border-[#10b981]/30 rounded-lg text-sm text-[#10b981]">
                Budget updated successfully!
              </div>
            )}

            <input type="hidden" name="monthYear" value={monthYear} />

            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Category
              </label>
              <div className="relative">
                <select
                  id="categoryId"
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

            <div className="space-y-2">
              <label htmlFor="limit" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Monthly Limit ($)
              </label>
              <input
                id="limit"
                name="limit"
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
              {isPending ? "Configuring..." : "Configure Budget"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
