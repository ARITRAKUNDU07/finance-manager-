import React from "react";
import { getTransactions } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import TransactionList from "@/components/transactions/TransactionList";

export default async function TransactionsPage() {
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="pt-6 pb-12">
      <TransactionList
        initialTransactions={transactions}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
