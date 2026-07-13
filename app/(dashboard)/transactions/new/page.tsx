"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredAccounts, getStoredCategories, StoredAccount, StoredCategory } from "@/lib/storage";
import TransactionForm from "@/components/transactions/TransactionForm";

export default function NewTransactionPage() {
  const [mounted, setMounted] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [categories, setCategories] = useState<StoredCategory[]>([]);

  useEffect(() => {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-6 pb-12">
      {/* Header */}
      <div className="w-full mb-8 text-center md:text-left flex items-center gap-4">
        <Link
          href="/transactions"
          className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary inline-flex"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="font-serif text-3xl text-on-surface font-semibold">
            New Transaction
          </h2>
          <p className="font-sans text-sm text-on-surface-variant">
            Record a new transaction to your ledger.
          </p>
        </div>
      </div>

      <TransactionForm accounts={accounts} categories={categories} />
    </div>
  );
}
