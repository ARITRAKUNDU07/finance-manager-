export interface StoredAccount {
  id: string;
  name: string;
  type: string; // cash, bank, card
  startingBalance: number; // in minor units (e.g. cents)
  createdAt: string;
}

export interface StoredCategory {
  id: string;
  name: string;
  icon: string | null;
  isPreset: boolean;
}

export interface StoredTransaction {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: string; // income, expense, transfer
  amountMinor: number;
  transferToAccountId: string | null;
  note: string | null;
  paymentMethod: string | null;
  txnDate: string; // ISO String
  createdAt: string;
}

export interface StoredBudget {
  id: string;
  categoryId: string;
  monthYear: string; // e.g. "2026-07"
  limitMinor: number;
}

// Preset Categories
const PRESET_CATEGORIES: StoredCategory[] = [
  { id: "cat-food", name: "Food", icon: "restaurant", isPreset: true },
  { id: "cat-rent", name: "Rent", icon: "home", isPreset: true },
  { id: "cat-transport", name: "Transport", icon: "directions_car", isPreset: true },
  { id: "cat-subscriptions", name: "Subscriptions", icon: "movie", isPreset: true },
  { id: "cat-shopping", name: "Shopping", icon: "shopping_bag", isPreset: true },
  { id: "cat-bills", name: "Bills", icon: "payments", isPreset: true },
  { id: "cat-other", name: "Other", icon: "category", isPreset: true },
];

// Helper to check browser environment
const isBrowser = () => typeof window !== "undefined";

// Safe localStorage access
const getLocalItem = (key: string) => {
  if (!isBrowser()) return null;
  return localStorage.getItem(key);
};

const setLocalItem = (key: string, value: string) => {
  if (!isBrowser()) return;
  localStorage.setItem(key, value);
};

// Initial Seed Data setup
export const initializeStorage = () => {
  if (!isBrowser()) return;

  // Check if categories are seeded
  if (!localStorage.getItem("fortuna_categories")) {
    setLocalItem("fortuna_categories", JSON.stringify(PRESET_CATEGORIES));
  }

  // Check if accounts are seeded
  if (!localStorage.getItem("fortuna_accounts")) {
    const seedAccounts: StoredAccount[] = [
      {
        id: "acc-checking",
        name: "Chase Checking",
        type: "bank",
        startingBalance: 524000, // $5,240.00
        createdAt: new Date().toISOString(),
      },
      {
        id: "acc-savings",
        name: "High-Yield Savings",
        type: "bank",
        startingBalance: 1250000, // $12,500.00
        createdAt: new Date().toISOString(),
      },
      {
        id: "acc-cash",
        name: "Cash Wallet",
        type: "cash",
        startingBalance: 35000, // $350.00
        createdAt: new Date().toISOString(),
      },
      {
        id: "acc-credit",
        name: "Amex Gold",
        type: "card",
        startingBalance: -45000, // -$450.00
        createdAt: new Date().toISOString(),
      },
    ];
    setLocalItem("fortuna_accounts", JSON.stringify(seedAccounts));
  }

  // Check if budgets are seeded
  if (!localStorage.getItem("fortuna_budgets")) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const seedBudgets: StoredBudget[] = [
      {
        id: "bud-food",
        categoryId: "cat-food",
        monthYear: currentMonth,
        limitMinor: 60000, // $600.00
      },
      {
        id: "bud-transport",
        categoryId: "cat-transport",
        monthYear: currentMonth,
        limitMinor: 20000, // $200.00
      },
      {
        id: "bud-shopping",
        categoryId: "cat-shopping",
        monthYear: currentMonth,
        limitMinor: 40000, // $400.00
      },
      {
        id: "bud-subscriptions",
        categoryId: "cat-subscriptions",
        monthYear: currentMonth,
        limitMinor: 5000, // $50.00
      },
    ];
    setLocalItem("fortuna_budgets", JSON.stringify(seedBudgets));
  }

  // Check if transactions are seeded
  if (!localStorage.getItem("fortuna_transactions")) {
    const now = new Date();
    const getPastDate = (daysAgo: number) => {
      const date = new Date(now);
      date.setDate(now.getDate() - daysAgo);
      return date.toISOString();
    };

    const seedTransactions: StoredTransaction[] = [
      {
        id: "txn-1",
        accountId: "acc-checking",
        categoryId: null,
        type: "income",
        amountMinor: 450000, // $4,500.00
        transferToAccountId: null,
        note: "Monthly Salary Payroll",
        paymentMethod: "bank",
        txnDate: getPastDate(12),
        createdAt: getPastDate(12),
      },
      {
        id: "txn-2",
        accountId: "acc-checking",
        categoryId: "cat-rent",
        type: "expense",
        amountMinor: 150000, // $1,500.00
        transferToAccountId: null,
        note: "July Apartment Rent",
        paymentMethod: "bank",
        txnDate: getPastDate(10),
        createdAt: getPastDate(10),
      },
      {
        id: "txn-3",
        accountId: "acc-credit",
        categoryId: "cat-food",
        type: "expense",
        amountMinor: 12450, // $124.50
        transferToAccountId: null,
        note: "Whole Foods Groceries",
        paymentMethod: "card",
        txnDate: getPastDate(8),
        createdAt: getPastDate(8),
      },
      {
        id: "txn-4",
        accountId: "acc-cash",
        categoryId: "cat-food",
        type: "expense",
        amountMinor: 1850, // $18.50
        transferToAccountId: null,
        note: "Lunch Salad & Drink",
        paymentMethod: "cash",
        txnDate: getPastDate(7),
        createdAt: getPastDate(7),
      },
      {
        id: "txn-5",
        accountId: "acc-checking",
        categoryId: null,
        type: "transfer",
        amountMinor: 50000, // $500.00
        transferToAccountId: "acc-savings",
        note: "Monthly Savings Contribution",
        paymentMethod: "bank",
        txnDate: getPastDate(5),
        createdAt: getPastDate(5),
      },
      {
        id: "txn-6",
        accountId: "acc-credit",
        categoryId: "cat-transport",
        type: "expense",
        amountMinor: 3240, // $32.40
        transferToAccountId: null,
        note: "Uber ride to office",
        paymentMethod: "card",
        txnDate: getPastDate(4),
        createdAt: getPastDate(4),
      },
      {
        id: "txn-7",
        accountId: "acc-credit",
        categoryId: "cat-shopping",
        type: "expense",
        amountMinor: 21500, // $215.00
        transferToAccountId: null,
        note: "Ergonomic Office Chair",
        paymentMethod: "card",
        txnDate: getPastDate(3),
        createdAt: getPastDate(3),
      },
      {
        id: "txn-8",
        accountId: "acc-credit",
        categoryId: "cat-subscriptions",
        type: "expense",
        amountMinor: 1549, // $15.49
        transferToAccountId: null,
        note: "Netflix Premium Subscription",
        paymentMethod: "card",
        txnDate: getPastDate(2),
        createdAt: getPastDate(2),
      },
      {
        id: "txn-9",
        accountId: "acc-checking",
        categoryId: "cat-bills",
        type: "expense",
        amountMinor: 8520, // $85.20
        transferToAccountId: null,
        note: "Electricity Utility Bill",
        paymentMethod: "bank",
        txnDate: getPastDate(1),
        createdAt: getPastDate(1),
      },
      {
        id: "txn-10",
        accountId: "acc-credit",
        categoryId: "cat-food",
        type: "expense",
        amountMinor: 7500, // $75.00
        transferToAccountId: null,
        note: "Dinner with Friends",
        paymentMethod: "card",
        txnDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    setLocalItem("fortuna_transactions", JSON.stringify(seedTransactions));
  }
};

// CRUD - Categories
export const getStoredCategories = (): StoredCategory[] => {
  initializeStorage();
  const data = getLocalItem("fortuna_categories");
  return data ? JSON.parse(data) : PRESET_CATEGORIES;
};

export const saveStoredCategory = (cat: Omit<StoredCategory, "id">): StoredCategory => {
  const categories = getStoredCategories();
  const newCategory: StoredCategory = {
    ...cat,
    id: `cat-${Date.now()}`,
  };
  categories.push(newCategory);
  setLocalItem("fortuna_categories", JSON.stringify(categories));
  return newCategory;
};

// CRUD - Accounts
export const getStoredAccounts = (): StoredAccount[] => {
  initializeStorage();
  const data = getLocalItem("fortuna_accounts");
  return data ? JSON.parse(data) : [];
};

export const saveStoredAccount = (acc: Omit<StoredAccount, "id" | "createdAt">): StoredAccount => {
  const accounts = getStoredAccounts();
  const newAccount: StoredAccount = {
    ...acc,
    id: `acc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  accounts.push(newAccount);
  setLocalItem("fortuna_accounts", JSON.stringify(accounts));
  return newAccount;
};

export const deleteStoredAccount = (id: string) => {
  const accounts = getStoredAccounts().filter(a => a.id !== id);
  setLocalItem("fortuna_accounts", JSON.stringify(accounts));
};

// CRUD - Transactions
export const getStoredTransactions = (): StoredTransaction[] => {
  initializeStorage();
  const data = getLocalItem("fortuna_transactions");
  return data ? JSON.parse(data) : [];
};

export const saveStoredTransaction = (txn: Omit<StoredTransaction, "id" | "createdAt">): StoredTransaction => {
  const transactions = getStoredTransactions();
  const newTxn: StoredTransaction = {
    ...txn,
    id: `txn-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTxn);
  setLocalItem("fortuna_transactions", JSON.stringify(transactions));
  return newTxn;
};

export const deleteStoredTransaction = (id: string) => {
  const transactions = getStoredTransactions().filter(t => t.id !== id);
  setLocalItem("fortuna_transactions", JSON.stringify(transactions));
};

// CRUD - Budgets
export const getStoredBudgets = (): StoredBudget[] => {
  initializeStorage();
  const data = getLocalItem("fortuna_budgets");
  return data ? JSON.parse(data) : [];
};

export const saveStoredBudget = (bud: Omit<StoredBudget, "id">): StoredBudget => {
  const budgets = getStoredBudgets();
  // If budget already exists for this category + month, update it instead
  const existingIdx = budgets.findIndex(
    b => b.categoryId === bud.categoryId && b.monthYear === bud.monthYear
  );

  if (existingIdx > -1) {
    budgets[existingIdx].limitMinor = bud.limitMinor;
    setLocalItem("fortuna_budgets", JSON.stringify(budgets));
    return budgets[existingIdx];
  } else {
    const newBudget: StoredBudget = {
      ...bud,
      id: `bud-${Date.now()}`,
    };
    budgets.push(newBudget);
    setLocalItem("fortuna_budgets", JSON.stringify(budgets));
    return newBudget;
  }
};

export const deleteStoredBudget = (id: string) => {
  const budgets = getStoredBudgets().filter(b => b.id !== id);
  setLocalItem("fortuna_budgets", JSON.stringify(budgets));
};

// --- Aggregate Calculations ---

// Accounts with Balances calculated dynamically
export interface AccountWithBalance extends StoredAccount {
  balance: number;
}

export const getStoredAccountsWithBalances = (): AccountWithBalance[] => {
  const accounts = getStoredAccounts();
  const transactions = getStoredTransactions();

  return accounts.map(acc => {
    let balance = acc.startingBalance;
    transactions.forEach(t => {
      if (t.accountId === acc.id) {
        if (t.type === "expense") balance -= t.amountMinor;
        if (t.type === "income") balance += t.amountMinor;
        if (t.type === "transfer") balance -= t.amountMinor;
      }
      if (t.transferToAccountId === acc.id && t.type === "transfer") {
        balance += t.amountMinor;
      }
    });

    return {
      ...acc,
      balance,
    };
  });
};

// Budgets with spending calculated dynamically
export interface BudgetWithSpending {
  id: string;
  categoryId: string;
  monthYear: string;
  limitMinor: number;
  spentMinor: number;
  percentUsed: number;
  category: StoredCategory;
}

export const getStoredBudgetsWithSpending = (monthYear: string): BudgetWithSpending[] => {
  const budgets = getStoredBudgets().filter(b => b.monthYear === monthYear);
  const transactions = getStoredTransactions();
  const categories = getStoredCategories();

  return budgets.map(b => {
    const category = categories.find(c => c.id === b.categoryId) || {
      id: b.categoryId,
      name: "Unknown",
      icon: "category",
      isPreset: false,
    };

    // Calculate total spent in this category and month
    const spentMinor = transactions
      .filter(t => {
        if (t.categoryId !== b.categoryId || t.type !== "expense") return false;
        const tMonthYear = t.txnDate.substring(0, 7); // "YYYY-MM"
        return tMonthYear === monthYear;
      })
      .reduce((sum, t) => sum + t.amountMinor, 0);

    const percentUsed = b.limitMinor > 0 ? (spentMinor / b.limitMinor) * 100 : 0;

    return {
      id: b.id,
      categoryId: b.categoryId,
      monthYear: b.monthYear,
      limitMinor: b.limitMinor,
      spentMinor,
      percentUsed,
      category,
    };
  });
};
