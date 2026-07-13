import React from "react";
import { getTransactions } from "@/app/actions/transactions";
import ReportsView from "@/components/reports/ReportsView";

export default async function ReportsPage() {
  const transactions = await getTransactions({
    maxAmount: undefined,
    minAmount: undefined,
  });

  return (
    <div className="pt-6 pb-12">
      <ReportsView transactions={transactions} />
    </div>
  );
}
