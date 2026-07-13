import React from "react";
import { getBudgetsWithSpending } from "@/app/actions/budgets";
import { getCategories } from "@/app/actions/categories";
import BudgetManager from "@/components/budgets/BudgetManager";

export const dynamic = "force-dynamic";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const resolvedParams = await searchParams;
  const now = new Date();
  const currentMonthYear =
    resolvedParams.month ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [budgets, categories] = await Promise.all([
    getBudgetsWithSpending(currentMonthYear),
    getCategories(),
  ]);

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
