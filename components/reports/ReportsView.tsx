"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amountMinor: number;
  note: string | null;
  paymentMethod: string | null;
  txnDate: string | Date;
  account: { name: string };
  category: { name: string } | null;
}

interface ReportsViewProps {
  transactions: Transaction[];
}

export default function ReportsView({ transactions }: ReportsViewProps) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  // Filter transactions within range
  const filteredTxns = transactions.filter((tx) => {
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
    return true;
  });

  // Calculate Metrics
  const expenses = filteredTxns.filter((tx) => tx.type === "expense");
  const incomes = filteredTxns.filter((tx) => tx.type === "income");

  const totalExpenseMinor = expenses.reduce((acc, curr) => acc + curr.amountMinor, 0);
  const totalIncomeMinor = incomes.reduce((acc, curr) => acc + curr.amountMinor, 0);

  const averageExpenseMinor = expenses.length > 0 ? Math.round(totalExpenseMinor / expenses.length) : 0;

  // Savings Rate = ((Income - Expense) / Income) * 100
  const savingsRate =
    totalIncomeMinor > 0 ? Math.max(((totalIncomeMinor - totalExpenseMinor) / totalIncomeMinor) * 100, 0) : 0;

  // Adaptive chart data preparation
  const getChartData = () => {
    const dataMap = new Map<string, number>();

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      // Group by Month
      filteredTxns
        .filter((tx) => tx.type === "expense")
        .forEach((tx) => {
          const d = new Date(tx.txnDate);
          const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
          dataMap.set(label, (dataMap.get(label) || 0) + tx.amountMinor / 100);
        });
    } else {
      // Group by Day (fill in empty days for cleanliness)
      const current = new Date(start);
      while (current <= end) {
        const label = current.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dataMap.set(label, 0);
        current.setDate(current.getDate() + 1);
      }

      filteredTxns
        .filter((tx) => tx.type === "expense")
        .forEach((tx) => {
          const label = new Date(tx.txnDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          if (dataMap.has(label)) {
            dataMap.set(label, (dataMap.get(label) || 0) + tx.amountMinor / 100);
          }
        });
    }

    return Array.from(dataMap.entries()).map(([name, amount]) => ({
      name,
      amount: parseFloat(amount.toFixed(2)),
    }));
  };

  const chartData = getChartData();

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Account", "Method", "Note", "Amount ($)"];
    const rows = filteredTxns.map((tx) => [
      new Date(tx.txnDate).toLocaleDateString(),
      tx.type,
      tx.category?.name || "Other",
      tx.account.name,
      tx.paymentMethod || "",
      tx.note || "",
      (tx.amountMinor / 100).toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join(
        "\n"
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fortuna_Financial_Report_${startDate || "start"}_to_${endDate || "end"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-semibold">
            Reports
          </h2>
          <p className="text-sm text-on-surface-variant">
            Insights on your historical wealth distributions.
          </p>
        </div>

        {/* Date Filter & Export Row */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#1e293b]/40 border border-[#334155] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#1e293b]/40 border border-[#334155] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary [color-scheme:dark]"
              />
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-primary hover:bg-primary/90 text-[#2c303b] font-semibold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(195,198,212,0.15)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spend */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Total Spend
          </span>
          <h3 className="font-serif text-3xl font-semibold text-on-surface">
            {formatCurrency(totalExpenseMinor)}
          </h3>
          <p className="text-xs text-on-surface-variant/80 mt-2">
            Across {expenses.length} transaction records
          </p>
        </div>

        {/* Average Transaction */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Average Expense
          </span>
          <h3 className="font-serif text-3xl font-semibold text-on-surface">
            {formatCurrency(averageExpenseMinor)}
          </h3>
          <p className="text-xs text-on-surface-variant/80 mt-2">
            Per swipe/invoice item
          </p>
        </div>

        {/* Savings Rate */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
            Savings Rate
          </span>
          <h3 className="font-serif text-3xl font-semibold text-[#10B981]">
            {savingsRate.toFixed(1)}%
          </h3>
          <p className="text-xs text-on-surface-variant/80 mt-2">
            Income kept after expenses
          </p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-serif text-lg font-semibold text-on-surface mb-6">
          Expense Trends
        </h3>
        
        {expenses.length === 0 ? (
          <div className="h-72 flex flex-col justify-center items-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#334155]">
              analytics
            </span>
            <p className="text-sm">No spend data in the chosen range.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#c6c6cc"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#c6c6cc"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, "Spent"]}
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.9)",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#e5e2e2",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#c3c6d4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
