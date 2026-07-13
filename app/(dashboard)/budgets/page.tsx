"use client";

import React, { useEffect, useState, use } from "react";
import {
  getStoredBudgetsWithSpending,
  getStoredCategories,
  StoredCategory,
  BudgetWithSpending,
} from "@/lib/storage";
import BudgetManager from "@/components/budgets/BudgetManager";

interface BudgetsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const resolvedParams = use(searchParams);
  const [mounted, setMounted] = useState(false);
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [categories, setCategories] = useState<StoredCategory[]>([]);

  const now = new Date();
  const currentMonthYear =
    resolvedParams.month ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    setBudgets(getStoredBudgetsWithSpending(currentMonthYear));
    setCategories(getStoredCategories());
    setMounted(true);
  }, [currentMonthYear]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-12">
      <BudgetManager
        initialBudgets={budgets}
        categories={categories}
        currentMonthYear={currentMonthYear}
      />
    </div>
  );
}
