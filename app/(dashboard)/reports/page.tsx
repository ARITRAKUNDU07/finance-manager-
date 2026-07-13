"use client";

import React, { useEffect, useState } from "react";
import {
  getStoredTransactions,
  getStoredAccounts,
  getStoredCategories,
  StoredTransaction,
  StoredAccount,
  StoredCategory,
} from "@/lib/storage";
import ReportsView from "@/components/reports/ReportsView";

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [categories, setCategories] = useState<StoredCategory[]>([]);

  useEffect(() => {
    setTransactions(getStoredTransactions());
    setAccounts(getStoredAccounts());
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

  const populatedTransactions = transactions.map((tx) => {
    const account = accounts.find((a) => a.id === tx.accountId) || {
      id: tx.accountId,
      name: "Unknown",
      type: "bank",
    };
    const category = categories.find((c) => c.id === tx.categoryId) || null;
    return {
      ...tx,
      account,
      category,
    };
  });

  return (
    <div className="pt-6 pb-12">
      <ReportsView transactions={populatedTransactions} />
    </div>
  );
}
