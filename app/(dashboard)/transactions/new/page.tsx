import React from "react";
import Link from "next/link";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import TransactionForm from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage() {
  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

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
          <p className="font-sans text-sm text-on-surface-variant mt-1">
            Record a new movement of capital.
          </p>
        </div>
      </div>

      <TransactionForm accounts={accounts} categories={categories} />
    </div>
  );
}
