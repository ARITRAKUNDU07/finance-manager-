"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryData {
  name: string;
  value: number; // minor units
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col justify-center items-center text-on-surface-variant font-sans">
        <span className="material-symbols-outlined text-4xl mb-2 text-[#334155]">
          pie_chart
        </span>
        <p className="text-sm">No expenses recorded this month.</p>
      </div>
    );
  }

  // Curated premium HSL-tailored colors
  const COLORS = ["#f59e0b", "#14b8a6", "#a855f7", "#f43f5e", "#c3c6d4", "#e5e7eb"];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={88}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
                borderWidth: "3px",
                borderRadius: "0px",
                color: "var(--foreground)",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                boxShadow: "3px 3px 0px 0px var(--shadow-color)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-4 rounded-full bg-[var(--card-bg)] border-3 border-[var(--border-color)] flex flex-col items-center justify-center shadow-inner">
          <span className="font-serif text-xl font-semibold text-on-surface">
            {formatCurrency(total)}
          </span>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-sans mt-0.5">
            Total Spent
          </span>
        </div>
      </div>

      <div className="w-full space-y-3">
        {data.map((item, index) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-sans text-xs text-on-surface-variant">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-[#e5e2e2] font-medium">
                  {formatCurrency(item.value)}
                </span>
                <span className="font-sans text-[10px] text-on-surface-variant/70">
                  ({percent}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
